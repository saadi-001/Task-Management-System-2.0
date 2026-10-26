import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
  RefreshControl,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { notificationService } from '../services/notificationService';
import { userService, User } from '../services/userService';
import { AppTheme } from '../constants/theme';
import { Ticket } from '../services/ticketService';
import { Project } from '../services/projectService';
import { Organization } from '../services/organizationService';

type HubTab = 'dashboard' | 'projects' | 'tasks' | 'team' | 'profile';
type TaskFilterTab = 'all' | 'my' | 'in_progress' | 'urgent' | 'done';

export default function DesignPreviewScreen() {
  const navigation = useNavigation<any>();
  const { theme, themeOption, setThemeOption } = useThemeContext();
  const { user, roles, permissions, can, logout } = useAuth();
  const {
    organizations,
    selectedOrgId,
    selectedOrg,
    activeProjects,
    activeTickets,
    myTickets,
    loading,
    refreshing,
    setSelectedOrgId,
    refreshWorkspace,
  } = useWorkspace();

  const styles = getStyles(theme);

  // Active Hub Tab inside the Preview
  const [activeHub, setActiveHub] = useState<HubTab>('dashboard');

  // Task filtering state
  const [taskFilter, setTaskFilter] = useState<TaskFilterTab>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [searchTaskQuery, setSearchTaskQuery] = useState('');

  // Project filtering state
  const [searchProjectQuery, setSearchProjectQuery] = useState('');

  // Team & Users state
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [searchTeamQuery, setSearchTeamQuery] = useState('');

  // Workspace Switcher Drawer state
  const [searchOrgQuery, setSearchOrgQuery] = useState('');
  const [isWorkspaceDrawerOpen, setIsWorkspaceDrawerOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Animations (Solar-inspired spring easing & continuous telemetry pulse)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();

    // Continuous smooth pulsing glow loop for preview beacon (Solar Voltix inspired)
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    // Fetch unread notification count
    const loadUnreadCount = async () => {
      try {
        const res = await notificationService.getNotifications();
        if (res && res.success && Array.isArray(res.data)) {
          const unread = res.data.filter((n: any) => !n.IsRead).length;
          setUnreadNotifications(unread);
        }
      } catch (e) {
        // silent fallback
      }
    };
    loadUnreadCount();

    return () => pulseLoop.stop();
  }, []);

  // Fetch team members when team hub is activated
  useEffect(() => {
    if (activeHub === 'team' && teamMembers.length === 0) {
      const loadTeam = async () => {
        setLoadingTeam(true);
        try {
          const res = await userService.getUsers();
          if (res && res.success && Array.isArray(res.data)) {
            setTeamMembers(res.data);
          }
        } catch (e) {
          // silent fallback
        } finally {
          setLoadingTeam(false);
        }
      };
      loadTeam();
    }
  }, [activeHub, teamMembers.length]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // =========================================================================
  // METRICS & TELEMETRY (CONSOLIDATED & VERIFIABLE)
  // =========================================================================
  const metrics = useMemo(() => {
    const total = activeTickets.length;
    const myCount = myTickets.length;
    const done = activeTickets.filter((t) => t.Status?.toLowerCase() === 'done').length;
    const inProgress = activeTickets.filter((t) => {
      const s = t.Status?.toLowerCase();
      return s === 'in progress' || s === 'testing' || s === 'review';
    }).length;
    const high = activeTickets.filter((t) => {
      const p = t.Priority?.toLowerCase();
      return p === 'high' || p === 'urgent';
    }).length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, myCount, done, inProgress, high, completionRate };
  }, [activeTickets, myTickets]);

  // =========================================================================
  // FILTERED TASKS
  // =========================================================================
  const displayedTickets = useMemo(() => {
    let list = activeTickets;

    // Filter by project if selected
    if (selectedProjectId !== null) {
      list = list.filter((t) => t.ProjectID === selectedProjectId);
    }

    // Filter by tab
    switch (taskFilter) {
      case 'my':
        list = user ? list.filter((t) => t.AssignedTo === user.UserID) : list;
        break;
      case 'in_progress':
        list = list.filter((t) => {
          const s = t.Status?.toLowerCase();
          return s === 'in progress' || s === 'testing' || s === 'review';
        });
        break;
      case 'urgent':
        list = list.filter((t) => {
          const p = t.Priority?.toLowerCase();
          return p === 'high' || p === 'urgent';
        });
        break;
      case 'done':
        list = list.filter((t) => t.Status?.toLowerCase() === 'done');
        break;
      case 'all':
      default:
        break;
    }

    // Filter by search query
    if (searchTaskQuery.trim() !== '') {
      const q = searchTaskQuery.toLowerCase().trim();
      list = list.filter((t) => {
        const matchesTitle = t.Title?.toLowerCase().includes(q);
        const matchesDesc = t.Description?.toLowerCase().includes(q);
        const matchesId = `tm-${t.TaskID}`.includes(q) || String(t.TaskID).includes(q);
        return matchesTitle || matchesDesc || matchesId;
      });
    }

    return list;
  }, [activeTickets, taskFilter, selectedProjectId, searchTaskQuery, user]);

  // Filtered projects
  const displayedProjects = useMemo(() => {
    if (!searchProjectQuery.trim()) return activeProjects;
    const q = searchProjectQuery.toLowerCase().trim();
    return activeProjects.filter(
      (p) => p.Name.toLowerCase().includes(q) || (p.Description && p.Description.toLowerCase().includes(q))
    );
  }, [activeProjects, searchProjectQuery]);

  // Filtered team members
  const displayedTeam = useMemo(() => {
    if (!searchTeamQuery.trim()) return teamMembers;
    const q = searchTeamQuery.toLowerCase().trim();
    return teamMembers.filter(
      (m) => m.Name?.toLowerCase().includes(q) || m.Email?.toLowerCase().includes(q)
    );
  }, [teamMembers, searchTeamQuery]);

  // Filtered organizations for drawer
  const filteredOrganizations = useMemo(() => {
    if (!searchOrgQuery.trim()) return organizations;
    const q = searchOrgQuery.toLowerCase().trim();
    return organizations.filter(
      (org) => org.Name.toLowerCase().includes(q) || String(org.OrganizationID).includes(q)
    );
  }, [organizations, searchOrgQuery]);

  const selectedProjectObj = useMemo(() => {
    if (!selectedProjectId) return null;
    return activeProjects.find((p) => p.ProjectID === selectedProjectId) || null;
  }, [selectedProjectId, activeProjects]);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'done':
        return { color: theme.colors.success, bg: theme.colors.successBg, label: 'Done' };
      case 'in progress':
        return { color: theme.colors.stats.blue.color, bg: theme.colors.stats.blue.bg, label: 'In Progress' };
      case 'review':
        return { color: theme.colors.stats.purple.color, bg: theme.colors.stats.purple.bg, label: 'In Review' };
      case 'testing':
        return { color: theme.colors.stats.orange.color, bg: theme.colors.stats.orange.bg, label: 'Testing' };
      default:
        return { color: theme.colors.textSecondary, bg: theme.colors.iconBg, label: status || 'Open' };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
      case 'high':
        return { color: theme.colors.error, bg: theme.colors.errorBg, icon: 'alert-circle' as const };
      case 'medium':
        return { color: theme.colors.stats.orange.color, bg: theme.colors.stats.orange.bg, icon: 'clock' as const };
      default:
        return { color: theme.colors.primary, bg: theme.colors.primaryGlow, icon: 'check-square' as const };
    }
  };

  const handleSelectOrg = async (orgId: number | null) => {
    await setSelectedOrgId(orgId);
    setSelectedProjectId(null);
    setIsWorkspaceDrawerOpen(false);
  };

  // =========================================================================
  // RENDER HUBS
  // =========================================================================

  // 1. DASHBOARD HUB (FOCUS VIEW)
  const renderDashboardHub = () => (
    <>
      {/* 1A. CONSOLIDATED WORKSPACE TELEMETRY CARD (ELIMINATES REDUNDANT STAT CARDS) */}
      <View style={styles.telemetryCard}>
        <LinearGradient
          colors={[theme.isDark ? 'rgba(45, 212, 191, 0.12)' : 'rgba(13, 148, 136, 0.08)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.telemetryTopRow}>
          <View style={styles.telemetryTitleCol}>
            <Text style={styles.telemetrySuperText}>WORKSPACE TELEMETRY</Text>
            <Text style={styles.telemetryHeadline}>
              {metrics.total} Active {metrics.total === 1 ? 'Task' : 'Tasks'}
            </Text>
          </View>
          <View style={styles.telemetryRateBadge}>
            <Text style={styles.telemetryRateNumber}>{metrics.completionRate}%</Text>
            <Text style={styles.telemetryRateLabel}>Completed</Text>
          </View>
        </View>

        {/* Unified Completion Progress Bar */}
        <View style={styles.telemetryProgressTrack}>
          <View style={[styles.telemetryProgressFill, { width: `${Math.min(metrics.completionRate, 100)}%` }]} />
        </View>
        <Text style={styles.telemetryProgressSubtext}>
          {metrics.done} resolved of {metrics.total} total items across {activeProjects.length} projects
        </Text>

        {/* Quick Filter Pills (Interactive, 1-tap filtering for Focus Feed) */}
        <View style={styles.telemetryPillsRow}>
          <TouchableOpacity
            style={[styles.telemetryPill, taskFilter === 'my' && styles.telemetryPillActive]}
            activeOpacity={0.7}
            onPress={() => setTaskFilter('my')}
          >
            <Feather
              name="user-check"
              size={13}
              color={taskFilter === 'my' ? '#FFFFFF' : theme.colors.primary}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.telemetryPillText, taskFilter === 'my' && styles.telemetryPillTextActive]}>
              My Tasks ({metrics.myCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.telemetryPill, taskFilter === 'in_progress' && styles.telemetryPillActive]}
            activeOpacity={0.7}
            onPress={() => setTaskFilter('in_progress')}
          >
            <Feather
              name="activity"
              size={13}
              color={taskFilter === 'in_progress' ? '#FFFFFF' : theme.colors.stats.blue.color}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.telemetryPillText, taskFilter === 'in_progress' && styles.telemetryPillTextActive]}>
              In Progress ({metrics.inProgress})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.telemetryPill, taskFilter === 'urgent' && styles.telemetryPillActive]}
            activeOpacity={0.7}
            onPress={() => setTaskFilter('urgent')}
          >
            <Feather
              name="alert-circle"
              size={13}
              color={taskFilter === 'urgent' ? '#FFFFFF' : theme.colors.error}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.telemetryPillText, taskFilter === 'urgent' && styles.telemetryPillTextActive]}>
              Urgent ({metrics.high})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.telemetryPill, taskFilter === 'all' && styles.telemetryPillActive]}
            activeOpacity={0.7}
            onPress={() => setTaskFilter('all')}
          >
            <Feather
              name="layers"
              size={13}
              color={taskFilter === 'all' ? '#FFFFFF' : theme.colors.textSecondary}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.telemetryPillText, taskFilter === 'all' && styles.telemetryPillTextActive]}>
              All ({metrics.total})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 1B. QUICK ACTIONS (2x2 ERGONOMIC GRID) */}
      <View style={styles.sectionHeadingRow}>
        <Text style={styles.sectionHeadingText}>QUICK ACTIONS</Text>
      </View>

      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.actionGridCard}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CreateTicket')}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: theme.colors.primaryGlow }]}>
            <Feather name="plus-circle" size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={styles.actionTitle}>New Task</Text>
            <Text style={styles.actionDesc}>Create & assign ticket</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionGridCard}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CreateProject', { initialOrgId: selectedOrgId || undefined })}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: theme.colors.stats.blue.bg }]}>
            <Feather name="folder-plus" size={18} color={theme.colors.stats.blue.color} />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={styles.actionTitle}>New Project</Text>
            <Text style={styles.actionDesc}>Deploy project unit</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionGridCard}
          activeOpacity={0.7}
          onPress={() => {
            setSearchOrgQuery('');
            setIsWorkspaceDrawerOpen(true);
          }}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: theme.colors.stats.purple.bg }]}>
            <Feather name="briefcase" size={18} color={theme.colors.stats.purple.color} />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={styles.actionTitle}>Workspaces</Text>
            <Text style={styles.actionDesc}>Switch organization</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionGridCard}
          activeOpacity={0.7}
          onPress={() => setActiveHub('team')}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: theme.colors.stats.orange.bg }]}>
            <Feather name="users" size={18} color={theme.colors.stats.orange.color} />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={styles.actionTitle}>Team Directory</Text>
            <Text style={styles.actionDesc}>View members & roles</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 1C. ACCESSIBLE PROJECTS (CAROUSEL & 1-TAP FILTER) */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>ACCESSIBLE PROJECTS</Text>
          <Text style={styles.sectionSubtitle}>
            {selectedOrg ? `Projects in ${selectedOrg.Name}` : 'All authorized workspace projects'}
          </Text>
        </View>

        {selectedProjectId !== null ? (
          <TouchableOpacity onPress={() => setSelectedProjectId(null)} style={styles.clearFilterChip}>
            <Text style={styles.clearFilterChipText}>Clear Filter ✕</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setActiveHub('projects')} style={styles.viewHubLink}>
            <Text style={styles.viewHubLinkText}>View All ({activeProjects.length}) →</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.projectsCarousel}>
        {activeProjects.length > 0 ? (
          activeProjects.map((p) => {
            const isSelected = selectedProjectId === p.ProjectID;
            const projectTaskCount = activeTickets.filter((t) => t.ProjectID === p.ProjectID).length;

            return (
              <TouchableOpacity
                key={p.ProjectID}
                style={[styles.projectCard, isSelected && styles.projectCardActive]}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedProjectId(isSelected ? null : p.ProjectID);
                }}
              >
                <View style={styles.projectCardTop}>
                  <View style={[styles.projectIconWrap, isSelected && styles.projectIconWrapActive]}>
                    <Feather name="folder" size={16} color={isSelected ? '#FFFFFF' : theme.colors.primary} />
                  </View>

                  <View style={[styles.projectCountTag, isSelected && styles.projectCountTagActive]}>
                    <Text style={[styles.projectCountTagText, isSelected && { color: theme.colors.primary }]}>
                      {projectTaskCount} Tasks
                    </Text>
                  </View>
                </View>

                <Text style={styles.projectCardName} numberOfLines={1}>
                  {p.Name}
                </Text>

                <Text style={styles.projectCardDesc} numberOfLines={2}>
                  {p.Description && p.Description.trim() ? p.Description : 'No description provided'}
                </Text>

                <View style={styles.projectCardFooter}>
                  <Text style={[styles.projectCardActionText, isSelected && { color: theme.colors.primary }]}>
                    {isSelected ? '✓ Filtering Feed' : 'Tap to Filter'}
                  </Text>

                  <TouchableOpacity
                    style={styles.projectDetailsLink}
                    onPress={(e) => {
                      e.stopPropagation();
                      navigation.navigate('ProjectDetails', { projectId: p.ProjectID });
                    }}
                  >
                    <Feather name="external-link" size={14} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyProjectsCard}>
            <Feather name="folder" size={24} color={theme.colors.textMuted} />
            <Text style={styles.emptyProjectsTitle}>No Projects Found</Text>
            <Text style={styles.emptyProjectsDesc}>
              {selectedOrg ? `No projects belong to ${selectedOrg.Name} yet.` : 'No accessible projects in system.'}
            </Text>
            <TouchableOpacity
              style={styles.emptyCreateProjectBtn}
              onPress={() => navigation.navigate('CreateProject', { initialOrgId: selectedOrgId || undefined })}
            >
              <Text style={styles.emptyCreateProjectText}>+ Create Project</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 1D. WORKSPACE FOCUS FEED */}
      <View style={styles.feedHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>WORKSPACE FOCUS FEED</Text>
          <Text style={styles.sectionSubtitle}>
            {selectedProjectObj ? `Filtered by ${selectedProjectObj.Name}` : 'Prioritized work items'}
          </Text>
        </View>
        <Text style={styles.feedCountText}>{displayedTickets.length} tasks</Text>
      </View>

      {/* In-Feed Search Input */}
      <View style={styles.taskSearchBox}>
        <Feather name="search" size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.taskSearchInput}
          placeholder="Search focus tasks by title or TM-ID..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchTaskQuery}
          onChangeText={setSearchTaskQuery}
          clearButtonMode="while-editing"
        />
        {searchTaskQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTaskQuery('')}>
            <Feather name="x" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Task List */}
      <View style={styles.taskListContainer}>
        {displayedTickets.length > 0 ? (
          displayedTickets.slice(0, 10).map((task) => {
            const status = getStatusBadge(task.Status);
            const priority = getPriorityBadge(task.Priority);
            const project = activeProjects.find((p) => p.ProjectID === task.ProjectID);

            return (
              <TouchableOpacity
                key={task.TaskID}
                style={styles.taskCardItem}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('TicketDetails', { ticketId: task.TaskID })}
              >
                <View style={styles.taskCardLeft}>
                  <View style={[styles.priorityIconBadge, { backgroundColor: priority.bg }]}>
                    <Feather name={priority.icon} size={14} color={priority.color} />
                  </View>

                  <View style={styles.taskTextCol}>
                    <View style={styles.taskMetaRow}>
                      <Text style={styles.taskCodeText}>TM-{task.TaskID}</Text>
                      {project && (
                        <Text style={styles.taskProjectTag} numberOfLines={1}>
                          • {project.Name}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.taskTitleText} numberOfLines={1}>
                      {task.Title}
                    </Text>
                  </View>
                </View>

                <View style={styles.taskCardRight}>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={theme.colors.textMuted} />
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyFeedCard}>
            <Feather name="check-circle" size={32} color={theme.colors.primary} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyFeedTitle}>No Tasks Found</Text>
            <Text style={styles.emptyFeedDesc}>
              {searchTaskQuery.trim() !== ''
                ? `No tasks match search query "${searchTaskQuery}".`
                : taskFilter === 'my'
                ? 'You have completed all assigned tasks in this workspace.'
                : 'No tasks currently match this filter criteria.'}
            </Text>
          </View>
        )}
      </View>

      {/* View All in Tasks Hub */}
      {displayedTickets.length > 10 && (
        <TouchableOpacity
          style={styles.viewAllTasksBtn}
          activeOpacity={0.7}
          onPress={() => setActiveHub('tasks')}
        >
          <Text style={styles.viewAllTasksText}>
            View All {displayedTickets.length} Tasks in Task Hub →
          </Text>
        </TouchableOpacity>
      )}
    </>
  );

  // 2. PROJECTS HUB
  const renderProjectsHub = () => (
    <View style={styles.hubContainer}>
      <View style={styles.hubHeaderRow}>
        <View>
          <Text style={styles.hubHeaderTitle}>Projects Manager</Text>
          <Text style={styles.hubHeaderSubtitle}>
            {selectedOrg ? `Projects in ${selectedOrg.Name}` : 'All authorized organization projects'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.hubCreateBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CreateProject', { initialOrgId: selectedOrgId || undefined })}
        >
          <Feather name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.hubCreateBtnText}>New Project</Text>
        </TouchableOpacity>
      </View>

      {/* Search Projects */}
      <View style={styles.hubSearchBox}>
        <Feather name="search" size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.taskSearchInput}
          placeholder="Search projects by title or description..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchProjectQuery}
          onChangeText={setSearchProjectQuery}
        />
        {searchProjectQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchProjectQuery('')}>
            <Feather name="x" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Projects List */}
      <View style={styles.hubList}>
        {displayedProjects.length > 0 ? (
          displayedProjects.map((p) => {
            const projectTaskCount = activeTickets.filter((t) => t.ProjectID === p.ProjectID).length;
            const completedCount = activeTickets.filter(
              (t) => t.ProjectID === p.ProjectID && t.Status?.toLowerCase() === 'done'
            ).length;
            const progress = projectTaskCount > 0 ? Math.round((completedCount / projectTaskCount) * 100) : 0;

            return (
              <TouchableOpacity
                key={p.ProjectID}
                style={styles.hubProjectCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ProjectDetails', { projectId: p.ProjectID })}
              >
                <View style={styles.hubProjectTop}>
                  <View style={styles.hubProjectIconWrap}>
                    <Feather name="folder" size={18} color={theme.colors.primary} />
                  </View>
                  <View style={styles.hubProjectMetaCol}>
                    <Text style={styles.hubProjectTitle} numberOfLines={1}>
                      {p.Name}
                    </Text>
                    <Text style={styles.hubProjectOrgTag} numberOfLines={1}>
                      ORG ID: {p.OrganizationID || 'General'}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={theme.colors.textMuted} />
                </View>

                <Text style={styles.hubProjectDesc} numberOfLines={2}>
                  {p.Description && p.Description.trim() ? p.Description : 'No description provided.'}
                </Text>

                <View style={styles.hubProjectFooter}>
                  <View style={styles.hubProjectStatsRow}>
                    <Text style={styles.hubProjectStatLabel}>
                      {completedCount}/{projectTaskCount} Done ({progress}%)
                    </Text>
                  </View>
                  <View style={styles.hubProjectProgressTrack}>
                    <View style={[styles.hubProjectProgressFill, { width: `${progress}%` }]} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyFeedCard}>
            <Feather name="folder" size={32} color={theme.colors.textMuted} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyFeedTitle}>No Projects Found</Text>
            <Text style={styles.emptyFeedDesc}>
              {searchProjectQuery.trim() !== ''
                ? `No projects match "${searchProjectQuery}".`
                : 'No projects created in this workspace yet.'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // 3. TASKS HUB
  const renderTasksHub = () => (
    <View style={styles.hubContainer}>
      <View style={styles.hubHeaderRow}>
        <View>
          <Text style={styles.hubHeaderTitle}>Task Manager</Text>
          <Text style={styles.hubHeaderSubtitle}>
            {selectedOrg ? `Tasks in ${selectedOrg.Name}` : 'All workspace tasks'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.hubCreateBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CreateTicket')}
        >
          <Feather name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.hubCreateBtnText}>New Task</Text>
        </TouchableOpacity>
      </View>

      {/* Task Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.taskFilterPillsScroll}>
        <TouchableOpacity
          style={[styles.taskFilterPill, taskFilter === 'all' && styles.taskFilterPillActive]}
          onPress={() => setTaskFilter('all')}
        >
          <Text style={[styles.taskFilterPillText, taskFilter === 'all' && styles.taskFilterPillTextActive]}>
            All ({metrics.total})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.taskFilterPill, taskFilter === 'my' && styles.taskFilterPillActive]}
          onPress={() => setTaskFilter('my')}
        >
          <Text style={[styles.taskFilterPillText, taskFilter === 'my' && styles.taskFilterPillTextActive]}>
            My Tasks ({metrics.myCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.taskFilterPill, taskFilter === 'in_progress' && styles.taskFilterPillActive]}
          onPress={() => setTaskFilter('in_progress')}
        >
          <Text style={[styles.taskFilterPillText, taskFilter === 'in_progress' && styles.taskFilterPillTextActive]}>
            In Progress ({metrics.inProgress})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.taskFilterPill, taskFilter === 'urgent' && styles.taskFilterPillActive]}
          onPress={() => setTaskFilter('urgent')}
        >
          <Text style={[styles.taskFilterPillText, taskFilter === 'urgent' && styles.taskFilterPillTextActive]}>
            Urgent ({metrics.high})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.taskFilterPill, taskFilter === 'done' && styles.taskFilterPillActive]}
          onPress={() => setTaskFilter('done')}
        >
          <Text style={[styles.taskFilterPillText, taskFilter === 'done' && styles.taskFilterPillTextActive]}>
            Done ({metrics.done})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Search Tasks */}
      <View style={styles.hubSearchBox}>
        <Feather name="search" size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.taskSearchInput}
          placeholder="Search by TM-ID, title, description..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchTaskQuery}
          onChangeText={setSearchTaskQuery}
        />
        {searchTaskQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTaskQuery('')}>
            <Feather name="x" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Full Task List */}
      <View style={styles.hubList}>
        {displayedTickets.length > 0 ? (
          displayedTickets.map((task) => {
            const status = getStatusBadge(task.Status);
            const priority = getPriorityBadge(task.Priority);
            const project = activeProjects.find((p) => p.ProjectID === task.ProjectID);

            return (
              <TouchableOpacity
                key={task.TaskID}
                style={styles.taskCardItem}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('TicketDetails', { ticketId: task.TaskID })}
              >
                <View style={styles.taskCardLeft}>
                  <View style={[styles.priorityIconBadge, { backgroundColor: priority.bg }]}>
                    <Feather name={priority.icon} size={14} color={priority.color} />
                  </View>

                  <View style={styles.taskTextCol}>
                    <View style={styles.taskMetaRow}>
                      <Text style={styles.taskCodeText}>TM-{task.TaskID}</Text>
                      {project && (
                        <Text style={styles.taskProjectTag} numberOfLines={1}>
                          • {project.Name}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.taskTitleText} numberOfLines={1}>
                      {task.Title}
                    </Text>
                    {task.Description ? (
                      <Text style={styles.taskDescSnippet} numberOfLines={1}>
                        {task.Description}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.taskCardRight}>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={theme.colors.textMuted} />
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyFeedCard}>
            <Feather name="check-circle" size={32} color={theme.colors.primary} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyFeedTitle}>No Tasks Found</Text>
            <Text style={styles.emptyFeedDesc}>No tasks match your selected criteria.</Text>
          </View>
        )}
      </View>
    </View>
  );

  // 4. TEAM & ADMIN HUB
  const renderTeamHub = () => (
    <View style={styles.hubContainer}>
      <View style={styles.hubHeaderRow}>
        <View>
          <Text style={styles.hubHeaderTitle}>Team & Directory</Text>
          <Text style={styles.hubHeaderSubtitle}>Authorized workspace members</Text>
        </View>

        {can('CREATE_USER') && (
          <TouchableOpacity
            style={styles.hubCreateBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Users')}
          >
            <Feather name="user-plus" size={15} color="#FFFFFF" />
            <Text style={styles.hubCreateBtnText}>Manage</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Admin Operations Section if User has Role / Perm Access */}
      {(roles.includes('admin') || can('VIEW_ROLE') || can('VIEW_PERMISSION')) && (
        <View style={styles.adminShortcutsRow}>
          <TouchableOpacity
            style={styles.adminShortcutCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Roles')}
          >
            <Feather name="shield" size={18} color={theme.colors.primary} />
            <Text style={styles.adminShortcutTitle}>Roles Manager</Text>
            <Text style={styles.adminShortcutSub}>Manage RBAC permissions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.adminShortcutCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Permissions')}
          >
            <Feather name="lock" size={18} color={theme.colors.stats.purple.color} />
            <Text style={styles.adminShortcutTitle}>Permissions</Text>
            <Text style={styles.adminShortcutSub}>System policy matrix</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Team */}
      <View style={styles.hubSearchBox}>
        <Feather name="search" size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.taskSearchInput}
          placeholder="Search team members by name or email..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchTeamQuery}
          onChangeText={setSearchTeamQuery}
        />
        {searchTeamQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTeamQuery('')}>
            <Feather name="x" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Team Member Cards */}
      <View style={styles.hubList}>
        {loadingTeam ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 20 }} />
        ) : displayedTeam.length > 0 ? (
          displayedTeam.map((member) => (
            <TouchableOpacity
              key={member.UserID}
              style={styles.teamMemberCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('UserDetails', { userId: member.UserID })}
            >
              <View style={styles.teamAvatar}>
                <Text style={styles.teamAvatarText}>
                  {member.Name ? member.Name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>

              <View style={styles.teamMemberInfoCol}>
                <Text style={styles.teamMemberName} numberOfLines={1}>
                  {member.Name || 'System User'}
                </Text>
                <Text style={styles.teamMemberEmail} numberOfLines={1}>
                  {member.Email}
                </Text>
              </View>

              <View style={styles.teamMemberBadge}>
                <Text style={styles.teamMemberBadgeText}>UID-{member.UserID}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.colors.textMuted} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyFeedCard}>
            <Feather name="users" size={32} color={theme.colors.textMuted} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyFeedTitle}>No Team Members Found</Text>
            <Text style={styles.emptyFeedDesc}>No users match the search filter.</Text>
          </View>
        )}
      </View>
    </View>
  );

  // 5. PROFILE & PREFERENCES HUB
  const renderProfileHub = () => (
    <View style={styles.hubContainer}>
      {/* Profile Card */}
      <View style={styles.profileHeroCard}>
        <View style={styles.profileAvatarBig}>
          <Text style={styles.profileAvatarBigText}>
            {user?.Name ? user.Name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>

        <Text style={styles.profileHeroName}>{user?.Name || 'Workspace User'}</Text>
        <Text style={styles.profileHeroEmail}>{user?.Email || 'user@workspace.io'}</Text>

        <View style={styles.profileRolePill}>
          <Text style={styles.profileRolePillText}>
            {roles?.[0]?.toUpperCase() || 'MEMBER'}
          </Text>
        </View>
      </View>

      {/* Active Workspace Info Card */}
      <View style={styles.profileSectionCard}>
        <Text style={styles.profileSectionTitle}>ACTIVE WORKSPACE CONTEXT</Text>
        <View style={styles.profileRowItem}>
          <Feather name="briefcase" size={16} color={theme.colors.primary} />
          <View style={styles.profileRowTextCol}>
            <Text style={styles.profileRowLabel}>Current Workspace</Text>
            <Text style={styles.profileRowValue}>
              {selectedOrg ? selectedOrg.Name : 'All Workspaces (Unified)'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setIsWorkspaceDrawerOpen(true)}>
            <Text style={styles.profileActionLink}>Switch</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Navigation Items */}
      <View style={styles.profileSectionCard}>
        <Text style={styles.profileSectionTitle}>APPLICATION SHORTCUTS</Text>

        <TouchableOpacity
          style={styles.profileRowItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Feather name="edit" size={16} color={theme.colors.textSecondary} />
          <View style={styles.profileRowTextCol}>
            <Text style={styles.profileRowLabel}>Edit Profile</Text>
            <Text style={styles.profileRowSub}>Update your personal credentials</Text>
          </View>
          <Feather name="chevron-right" size={16} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileRowItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Organizations')}
        >
          <Feather name="grid" size={16} color={theme.colors.textSecondary} />
          <View style={styles.profileRowTextCol}>
            <Text style={styles.profileRowLabel}>All Organizations</Text>
            <Text style={styles.profileRowSub}>Manage all registered workspaces</Text>
          </View>
          <Feather name="chevron-right" size={16} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileRowItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Feather name="bell" size={16} color={theme.colors.textSecondary} />
          <View style={styles.profileRowTextCol}>
            <Text style={styles.profileRowLabel}>Notifications</Text>
            <Text style={styles.profileRowSub}>Alerts & task updates</Text>
          </View>
          <Feather name="chevron-right" size={16} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Theme Preference */}
      <View style={styles.profileSectionCard}>
        <Text style={styles.profileSectionTitle}>APPEARANCE PREFERENCE</Text>
        <View style={styles.themeToggleRow}>
          <TouchableOpacity
            style={[styles.themeOptionBtn, themeOption === 'light' && styles.themeOptionBtnActive]}
            onPress={() => setThemeOption('light')}
          >
            <Feather
              name="sun"
              size={15}
              color={themeOption === 'light' ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text style={[styles.themeOptionText, themeOption === 'light' && styles.themeOptionTextActive]}>
              Light
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.themeOptionBtn, themeOption === 'dark' && styles.themeOptionBtnActive]}
            onPress={() => setThemeOption('dark')}
          >
            <Feather
              name="moon"
              size={15}
              color={themeOption === 'dark' ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text style={[styles.themeOptionText, themeOption === 'dark' && styles.themeOptionTextActive]}>
              Dark
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.themeOptionBtn, themeOption === 'system' && styles.themeOptionBtnActive]}
            onPress={() => setThemeOption('system')}
          >
            <Feather
              name="settings"
              size={15}
              color={themeOption === 'system' ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text style={[styles.themeOptionText, themeOption === 'system' && styles.themeOptionTextActive]}>
              System
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Safety Notice Card */}
      <View style={styles.safeNoticeCard}>
        <Feather name="compass" size={18} color={theme.colors.primary} style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.safeNoticeTitle}>Safe Mode Active</Text>
          <Text style={styles.safeNoticeDesc}>
            Your original design remains untouched and active as the default production layout.
          </Text>
        </View>
      </View>

      {/* Logout Action */}
      <TouchableOpacity
        style={styles.logoutBtn}
        activeOpacity={0.7}
        onPress={async () => {
          await logout();
        }}
      >
        <Feather name="log-out" size={16} color={theme.colors.error} />
        <Text style={styles.logoutBtnText}>Log Out of Session</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

      {/* =========================================================================
          1. SAFE-MODE PREVIEW TOOLBAR (COMPACT & RESPONSIVE ACROSS ALL DEVICES)
         ========================================================================= */}
      <View style={styles.previewToolbar}>
        {/* Left: Return to current working app */}
        <TouchableOpacity
          style={styles.toolbarBackBtn}
          activeOpacity={0.7}
          accessibilityLabel="Back to Current Design"
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={15} color={theme.colors.textPrimary} />
          <Text style={styles.toolbarBackText} numberOfLines={1}>
            Current Design
          </Text>
        </TouchableOpacity>

        {/* Center: Preview status pill */}
        <View style={styles.toolbarCenterPill}>
          <Animated.View
            style={[
              styles.toolbarPulsingDot,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.4],
                  outputRange: [1, 0.6],
                }),
              },
            ]}
          />
          <Text style={styles.toolbarCenterText} numberOfLines={1}>
            UNIFIED PREVIEW
          </Text>
        </View>

        {/* Right: Use design action */}
        <TouchableOpacity
          style={styles.toolbarApplyBtn}
          activeOpacity={0.7}
          accessibilityLabel="Use this design"
          accessibilityRole="button"
          onPress={() => setIsApplyModalOpen(true)}
        >
          <Feather name="check" size={14} color="#FFFFFF" />
          <Text style={styles.toolbarApplyText} numberOfLines={1}>
            Use Design
          </Text>
        </TouchableOpacity>
      </View>

      {/* =========================================================================
          2. PERSONAL CONTEXT HEADER & WORKSPACE SELECTOR
         ========================================================================= */}
      <View style={styles.headerCard}>
        <LinearGradient
          colors={[theme.colors.primaryGlow, 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        <View style={styles.headerTopRow}>
          <View style={styles.userInfoCol}>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <View style={styles.nameRow}>
              <Text style={styles.userNameText} numberOfLines={1}>
                {user?.Name || 'Workspace Member'}
              </Text>
              <View style={styles.rolePill}>
                <Text style={styles.rolePillText}>{(roles?.[0] || 'Member').toUpperCase()}</Text>
              </View>
            </View>
          </View>

          {/* Notification Button */}
          <TouchableOpacity
            style={styles.notificationBtn}
            activeOpacity={0.7}
            accessibilityLabel="Notifications"
            onPress={() => navigation.navigate('Notifications')}
          >
            <Feather name="bell" size={20} color={theme.colors.textPrimary} />
            {unreadNotifications > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Smart Workspace Selector Pill */}
        <TouchableOpacity
          style={styles.workspacePill}
          activeOpacity={0.8}
          accessibilityLabel="Switch active workspace"
          onPress={() => {
            setSearchOrgQuery('');
            setIsWorkspaceDrawerOpen(true);
          }}
        >
          <View style={styles.workspacePillLeft}>
            <View style={styles.orgAvatarBadge}>
              <Text style={styles.orgAvatarBadgeText}>
                {selectedOrg ? selectedOrg.Name.charAt(0).toUpperCase() : '🌐'}
              </Text>
            </View>
            <View style={styles.workspaceTextCol}>
              <Text style={styles.workspaceLabel}>ACTIVE WORKSPACE</Text>
              <Text style={styles.workspaceName} numberOfLines={1}>
                {selectedOrg ? selectedOrg.Name : 'All Workspaces (Unified)'}
              </Text>
              <Text style={styles.workspaceSubtext} numberOfLines={1}>
                {selectedOrg ? `ORG-${selectedOrg.OrganizationID}` : 'Aggregated Workspace Feed'}
              </Text>
            </View>
          </View>

          <View style={styles.workspacePillRight}>
            <View style={styles.projectCountBadge}>
              <Text style={styles.projectCountText}>{activeProjects.length} Proj</Text>
            </View>
            <Feather name="chevron-down" size={18} color={theme.colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* =========================================================================
          3. SCROLLABLE CONTENT BODY (RENDER ACTIVE HUB)
         ========================================================================= */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshWorkspace}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {activeHub === 'dashboard' && renderDashboardHub()}
          {activeHub === 'projects' && renderProjectsHub()}
          {activeHub === 'tasks' && renderTasksHub()}
          {activeHub === 'team' && renderTeamHub()}
          {activeHub === 'profile' && renderProfileHub()}
        </Animated.View>
      </ScrollView>

      {/* =========================================================================
          4. UNIFIED INTERNAL BOTTOM NAVIGATION BAR (IN-PREVIEW HUBS)
         ========================================================================= */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity
          style={styles.navBarItem}
          activeOpacity={0.7}
          onPress={() => setActiveHub('dashboard')}
        >
          <View style={[styles.navIconWrapper, activeHub === 'dashboard' && styles.navIconWrapperActive]}>
            <Feather
              name="home"
              size={20}
              color={activeHub === 'dashboard' ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
          <Text style={[styles.navBarLabel, activeHub === 'dashboard' && styles.navBarLabelActive]}>
            Focus
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBarItem}
          activeOpacity={0.7}
          onPress={() => setActiveHub('projects')}
        >
          <View style={[styles.navIconWrapper, activeHub === 'projects' && styles.navIconWrapperActive]}>
            <Feather
              name="folder"
              size={20}
              color={activeHub === 'projects' ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
          <Text style={[styles.navBarLabel, activeHub === 'projects' && styles.navBarLabelActive]}>
            Projects
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBarItem}
          activeOpacity={0.7}
          onPress={() => setActiveHub('tasks')}
        >
          <View style={[styles.navIconWrapper, activeHub === 'tasks' && styles.navIconWrapperActive]}>
            <Feather
              name="check-square"
              size={20}
              color={activeHub === 'tasks' ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
          <Text style={[styles.navBarLabel, activeHub === 'tasks' && styles.navBarLabelActive]}>
            Tasks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBarItem}
          activeOpacity={0.7}
          onPress={() => setActiveHub('team')}
        >
          <View style={[styles.navIconWrapper, activeHub === 'team' && styles.navIconWrapperActive]}>
            <Feather
              name="users"
              size={20}
              color={activeHub === 'team' ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
          <Text style={[styles.navBarLabel, activeHub === 'team' && styles.navBarLabelActive]}>
            Team
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBarItem}
          activeOpacity={0.7}
          onPress={() => setActiveHub('profile')}
        >
          <View style={[styles.navIconWrapper, activeHub === 'profile' && styles.navIconWrapperActive]}>
            <Feather
              name="user"
              size={20}
              color={activeHub === 'profile' ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
          <Text style={[styles.navBarLabel, activeHub === 'profile' && styles.navBarLabelActive]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* =========================================================================
          5. SMART WORKSPACE SWITCHER DRAWER (MODAL)
         ========================================================================= */}
      <Modal
        visible={isWorkspaceDrawerOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsWorkspaceDrawerOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsWorkspaceDrawerOpen(false)}
        >
          <View style={styles.drawerSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.drawerDragHandle} />

            <View style={styles.drawerHeader}>
              <View>
                <Text style={styles.drawerTitle}>Switch Workspace</Text>
                <Text style={styles.drawerSubtitle}>
                  Choose an organization to contextually filter work
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsWorkspaceDrawerOpen(false)}
                style={styles.drawerCloseBtn}
              >
                <Feather name="x" size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Search Organizations if multiple */}
            {organizations.length > 3 && (
              <View style={styles.drawerSearchBox}>
                <Feather name="search" size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.drawerSearchInput}
                  placeholder="Search organizations..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={searchOrgQuery}
                  onChangeText={setSearchOrgQuery}
                />
              </View>
            )}

            <ScrollView style={styles.drawerList} showsVerticalScrollIndicator={false}>
              {/* Option: All Workspaces (Unified) */}
              <TouchableOpacity
                style={[styles.orgItem, selectedOrgId === null && styles.orgItemActive]}
                activeOpacity={0.7}
                onPress={() => handleSelectOrg(null)}
              >
                <View style={[styles.orgAvatar, { backgroundColor: theme.colors.iconBg }]}>
                  <Text style={styles.orgAvatarLetter}>🌐</Text>
                </View>
                <View style={styles.orgItemContent}>
                  <Text style={styles.orgItemName}>All Workspaces (Unified)</Text>
                  <Text style={styles.orgItemDesc}>View all authorized projects & tasks across system</Text>
                </View>
                {selectedOrgId === null && (
                  <Feather name="check-circle" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>

              <View style={styles.drawerDivider} />

              {/* List of actual user organizations from backend */}
              {filteredOrganizations.map((org) => {
                const isSelected = selectedOrgId === org.OrganizationID;

                return (
                  <TouchableOpacity
                    key={org.OrganizationID}
                    style={[styles.orgItem, isSelected && styles.orgItemActive]}
                    activeOpacity={0.7}
                    onPress={() => handleSelectOrg(org.OrganizationID)}
                  >
                    <View style={styles.orgAvatar}>
                      <Text style={styles.orgAvatarLetter}>
                        {org.Name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.orgItemContent}>
                      <Text style={styles.orgItemName} numberOfLines={1}>{org.Name}</Text>
                      <Text style={styles.orgItemDesc}>Organization ID: ORG-{org.OrganizationID}</Text>
                    </View>
                    {isSelected && (
                      <Feather name="check-circle" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}

              {filteredOrganizations.length === 0 && searchOrgQuery.trim() !== '' && (
                <View style={styles.emptyOrgsBox}>
                  <Text style={styles.emptyOrgsText}>No organization matches "{searchOrgQuery}"</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.drawerFooter}>
              <TouchableOpacity
                style={styles.createOrgBtn}
                activeOpacity={0.7}
                onPress={() => {
                  setIsWorkspaceDrawerOpen(false);
                  navigation.navigate('CreateOrg');
                }}
              >
                <Feather name="plus-circle" size={18} color={theme.colors.primary} />
                <Text style={styles.createOrgBtnText}>Register New Organization</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* =========================================================================
          6. SAFE-MODE CONFIRMATION DIALOG (SECTION 16)
         ========================================================================= */}
      <Modal
        visible={isApplyModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsApplyModalOpen(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogCard}>
            <View style={styles.dialogIconWrap}>
              <Feather name="compass" size={26} color={theme.colors.primary} />
            </View>

            <Text style={styles.dialogTitle}>Unified Smart Workspace Ready</Text>
            <Text style={styles.dialogMessage}>
              You are exploring the complete Unified Smart Workspace 2.0 interface.
              {'\n\n'}
              In strict accordance with project safety rules, your original mobile app design remains 100% active, default, and protected throughout this session.
              {'\n\n'}
              Once approved by your Sir and team, this complete multi-hub architecture can be permanently integrated into the core dashboard.
            </Text>

            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.dialogBtnSecondary}
                activeOpacity={0.7}
                onPress={() => {
                  setIsApplyModalOpen(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.dialogBtnSecondaryText}>Return to Current</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dialogBtnPrimary}
                activeOpacity={0.7}
                onPress={() => setIsApplyModalOpen(false)}
              >
                <Text style={styles.dialogBtnPrimaryText}>Keep Exploring</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    // 1. Safe-Mode Preview Toolbar
    previewToolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 8 : 48,
      paddingBottom: 8,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      zIndex: 20,
    },
    toolbarBackBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.iconBg,
      maxWidth: 130,
    },
    toolbarBackText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginLeft: 4,
    },
    toolbarCenterPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: theme.colors.primaryGlow,
    },
    toolbarPulsingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
      marginRight: 5,
    },
    toolbarCenterText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
      color: theme.colors.primary,
    },
    toolbarApplyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.primary,
    },
    toolbarApplyText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
      marginLeft: 4,
    },

    scrollContent: {
      paddingBottom: 90,
    },

    // 2. Personal Context Header
    headerCard: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 16,
      borderBottomLeftRadius: theme.radius.lg,
      borderBottomRightRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    userInfoCol: {
      flex: 1,
      marginRight: 12,
    },
    greetingText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    userNameText: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      marginRight: 8,
      maxWidth: 180,
    },
    rolePill: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: theme.colors.iconBg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    rolePillText: {
      fontSize: 9,
      fontWeight: '700',
      color: theme.colors.primary,
      letterSpacing: 0.5,
    },
    notificationBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.iconBg,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      position: 'relative',
    },
    notifBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: theme.colors.error,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 3,
      borderWidth: 1.5,
      borderColor: theme.colors.surface,
    },
    notifBadgeText: {
      color: '#FFFFFF',
      fontSize: 9,
      fontWeight: '700',
    },

    // 3. Workspace Selector Pill
    workspacePill: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
      borderWidth: 1,
      borderColor: theme.colors.borderHighlight,
    },
    workspacePillLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 10,
    },
    orgAvatarBadge: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    orgAvatarBadgeText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 14,
    },
    workspaceTextCol: {
      flex: 1,
    },
    workspaceLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: theme.colors.primary,
      letterSpacing: 0.8,
    },
    workspaceName: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginTop: 1,
    },
    workspaceSubtext: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 1,
    },
    workspacePillRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    projectCountBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: theme.colors.iconBg,
      marginRight: 6,
    },
    projectCountText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },

    // 1A. CONSOLIDATED TELEMETRY CARD
    telemetryCard: {
      marginHorizontal: 16,
      marginTop: 16,
      padding: 16,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderHighlight,
      overflow: 'hidden',
    },
    telemetryTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    telemetryTitleCol: {
      flex: 1,
    },
    telemetrySuperText: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.colors.primary,
      letterSpacing: 0.8,
    },
    telemetryHeadline: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      marginTop: 2,
    },
    telemetryRateBadge: {
      alignItems: 'flex-end',
    },
    telemetryRateNumber: {
      fontSize: 22,
      fontWeight: '900',
      color: theme.colors.primary,
    },
    telemetryRateLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    telemetryProgressTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.iconBg,
      overflow: 'hidden',
      marginBottom: 6,
    },
    telemetryProgressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 4,
    },
    telemetryProgressSubtext: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginBottom: 14,
    },
    telemetryPillsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    telemetryPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 20,
      backgroundColor: theme.colors.iconBg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    telemetryPillActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    telemetryPillText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    telemetryPillTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },

    // Section Headings
    sectionHeadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      marginTop: 18,
      marginBottom: 10,
    },
    sectionHeadingText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.colors.textSecondary,
      letterSpacing: 0.8,
    },

    // 1B. Quick Actions Grid
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginHorizontal: 16,
    },
    actionGridCard: {
      width: '48.5%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 10,
    },
    actionIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    actionTextCol: {
      flex: 1,
    },
    actionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    actionDesc: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      marginTop: 1,
    },

    // 1C. Accessible Projects Carousel
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      marginTop: 14,
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.colors.textSecondary,
      letterSpacing: 0.8,
    },
    sectionSubtitle: {
      fontSize: 11,
      color: theme.colors.textMuted,
      marginTop: 1,
    },
    clearFilterChip: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: theme.colors.errorBg,
    },
    clearFilterChipText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.error,
    },
    viewHubLink: {
      paddingVertical: 2,
    },
    viewHubLinkText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    projectsCarousel: {
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
    projectCard: {
      width: 175,
      padding: 14,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: 12,
    },
    projectCardActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.isDark ? 'rgba(45, 212, 191, 0.08)' : 'rgba(13, 148, 136, 0.08)',
    },
    projectCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    projectIconWrap: {
      width: 30,
      height: 30,
      borderRadius: 8,
      backgroundColor: theme.colors.iconBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    projectIconWrapActive: {
      backgroundColor: theme.colors.primary,
    },
    projectCountTag: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: theme.colors.iconBg,
    },
    projectCountTagActive: {
      backgroundColor: theme.colors.primaryGlow,
    },
    projectCountTagText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    projectCardName: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 3,
    },
    projectCardDesc: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      height: 30,
      lineHeight: 15,
    },
    projectCardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 8,
    },
    projectCardActionText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    projectDetailsLink: {
      padding: 4,
    },
    emptyProjectsCard: {
      padding: 24,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      width: 250,
    },
    emptyProjectsTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginTop: 6,
    },
    emptyProjectsDesc: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 2,
      marginBottom: 10,
    },
    emptyCreateProjectBtn: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.primary,
    },
    emptyCreateProjectText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    // 1D. Workspace Focus Feed
    feedHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      marginTop: 18,
      marginBottom: 10,
    },
    feedCountText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
    },
    taskSearchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 10,
    },
    taskSearchInput: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.textPrimary,
      padding: 0,
    },
    taskListContainer: {
      marginHorizontal: 16,
    },
    taskCardItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 8,
    },
    taskCardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 10,
    },
    priorityIconBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    taskTextCol: {
      flex: 1,
    },
    taskMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
    },
    taskCodeText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    taskProjectTag: {
      fontSize: 11,
      color: theme.colors.textMuted,
      marginLeft: 4,
      maxWidth: 120,
    },
    taskTitleText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    taskDescSnippet: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    taskCardRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      marginRight: 6,
    },
    statusBadgeText: {
      fontSize: 10,
      fontWeight: '700',
    },
    emptyFeedCard: {
      padding: 28,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyFeedTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    emptyFeedDesc: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
      lineHeight: 18,
    },
    viewAllTasksBtn: {
      marginHorizontal: 16,
      marginTop: 6,
      paddingVertical: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewAllTasksText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.primary,
    },

    // HUBS SHARED STYLES
    hubContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    hubHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    hubHeaderTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    hubHeaderSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    hubCreateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.primary,
    },
    hubCreateBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
      marginLeft: 4,
    },
    hubSearchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 12,
    },
    hubList: {
      marginBottom: 16,
    },

    // PROJECTS HUB STYLES
    hubProjectCard: {
      padding: 14,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 10,
    },
    hubProjectTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    hubProjectIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 8,
      backgroundColor: theme.colors.iconBg,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    hubProjectMetaCol: {
      flex: 1,
    },
    hubProjectTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    hubProjectOrgTag: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginTop: 1,
    },
    hubProjectDesc: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 16,
      marginBottom: 10,
    },
    hubProjectFooter: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 8,
    },
    hubProjectStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    hubProjectStatLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    hubProjectProgressTrack: {
      height: 5,
      borderRadius: 2.5,
      backgroundColor: theme.colors.iconBg,
      overflow: 'hidden',
    },
    hubProjectProgressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 2.5,
    },

    // TASKS HUB STYLES
    taskFilterPillsScroll: {
      flexDirection: 'row',
      paddingBottom: 10,
      gap: 6,
    },
    taskFilterPill: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    taskFilterPillActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    taskFilterPillText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    taskFilterPillTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },

    // TEAM HUB STYLES
    adminShortcutsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    adminShortcutCard: {
      width: '48.5%',
      padding: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    adminShortcutTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginTop: 6,
    },
    adminShortcutSub: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    teamMemberCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 8,
    },
    teamAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    teamAvatarText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 15,
    },
    teamMemberInfoCol: {
      flex: 1,
    },
    teamMemberName: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    teamMemberEmail: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 1,
    },
    teamMemberBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: theme.colors.iconBg,
    },
    teamMemberBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },

    // PROFILE HUB STYLES
    profileHeroCard: {
      alignItems: 'center',
      padding: 20,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderHighlight,
      marginBottom: 12,
    },
    profileAvatarBig: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    profileAvatarBigText: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: '800',
    },
    profileHeroName: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    profileHeroEmail: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    profileRolePill: {
      marginTop: 8,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 12,
      backgroundColor: theme.colors.primaryGlow,
    },
    profileRolePillText: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.colors.primary,
      letterSpacing: 0.8,
    },
    profileSectionCard: {
      padding: 14,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 10,
    },
    profileSectionTitle: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.colors.textSecondary,
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    profileRowItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    profileRowTextCol: {
      flex: 1,
      marginLeft: 10,
    },
    profileRowLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    profileRowValue: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 1,
    },
    profileRowSub: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      marginTop: 1,
    },
    profileActionLink: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    themeToggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    themeOptionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '31%',
      paddingVertical: 8,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.iconBg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    themeOptionBtnActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryGlow,
    },
    themeOptionText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginLeft: 5,
    },
    themeOptionTextActive: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    safeNoticeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primaryGlow,
      borderWidth: 1,
      borderColor: theme.colors.borderHighlight,
      marginBottom: 12,
    },
    safeNoticeTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    safeNoticeDesc: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      marginTop: 1,
      lineHeight: 14,
    },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.errorBg,
      marginBottom: 20,
    },
    logoutBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.error,
      marginLeft: 6,
    },

    // 4. UNIFIED INTERNAL BOTTOM BAR
    bottomNavBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: Platform.OS === 'ios' ? 76 : 60,
      paddingBottom: Platform.OS === 'ios' ? 16 : 4,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 30,
    },
    navBarItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
    },
    navIconWrapper: {
      width: 34,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    navIconWrapperActive: {
      backgroundColor: theme.colors.primaryGlow,
    },
    navBarLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    navBarLabelActive: {
      color: theme.colors.primary,
      fontWeight: '800',
    },

    // 5. Drawer Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    drawerSheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 40 : 20,
      maxHeight: '75%',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    drawerDragHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.textMuted,
      alignSelf: 'center',
      marginBottom: 12,
    },
    drawerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: 16,
      marginBottom: 10,
    },
    drawerTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    drawerSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    drawerCloseBtn: {
      padding: 6,
      borderRadius: 16,
      backgroundColor: theme.colors.iconBg,
    },
    drawerSearchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.iconBg,
      marginBottom: 10,
    },
    drawerSearchInput: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.textPrimary,
      padding: 0,
    },
    drawerList: {
      paddingHorizontal: 16,
    },
    drawerDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 6,
    },
    orgItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: theme.radius.md,
      marginBottom: 6,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    orgItemActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryGlow,
    },
    orgAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    orgAvatarLetter: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    orgItemContent: {
      flex: 1,
    },
    orgItemName: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    orgItemDesc: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 1,
    },
    emptyOrgsBox: {
      padding: 20,
      alignItems: 'center',
    },
    emptyOrgsText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    drawerFooter: {
      paddingHorizontal: 16,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    createOrgBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.iconBg,
    },
    createOrgBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.primary,
      marginLeft: 6,
    },

    // 6. Safe-Mode Dialog
    dialogOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    dialogCard: {
      width: '100%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.borderHighlight,
    },
    dialogIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.primaryGlow,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
    },
    dialogTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: 8,
    },
    dialogMessage: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 18,
    },
    dialogActions: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
    },
    dialogBtnSecondary: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.iconBg,
      alignItems: 'center',
      marginRight: 6,
    },
    dialogBtnSecondaryText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    dialogBtnPrimary: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      marginLeft: 6,
    },
    dialogBtnPrimaryText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
