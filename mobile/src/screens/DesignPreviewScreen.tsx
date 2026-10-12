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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { notificationService } from '../services/notificationService';
import { AppTheme } from '../constants/theme';
import { Ticket } from '../services/ticketService';
import { Project } from '../services/projectService';
import { Organization } from '../services/organizationService';

type FilterTab = 'my' | 'in_progress' | 'high_priority' | 'all';

export default function DesignPreviewScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useThemeContext();
  const { user, roles } = useAuth();
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

  // Local state
  const [activeTab, setActiveTab] = useState<FilterTab>('my');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [searchTaskQuery, setSearchTaskQuery] = useState('');
  const [searchOrgQuery, setSearchOrgQuery] = useState('');
  const [isWorkspaceDrawerOpen, setIsWorkspaceDrawerOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 8, useNativeDriver: true }),
    ]).start();

    // Fetch actual unread notification count
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
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Metrics: accurate, verifiable calculations directly from backend data
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

  // Filtered tasks based on activeTab, project filter, and in-feed search query
  const displayedTickets = useMemo(() => {
    let list = activeTickets;

    // Filter by project if selected
    if (selectedProjectId !== null) {
      list = list.filter((t) => t.ProjectID === selectedProjectId);
    }

    // Filter by tab
    switch (activeTab) {
      case 'my':
        list = user ? list.filter((t) => t.AssignedTo === user.UserID) : list;
        break;
      case 'in_progress':
        list = list.filter((t) => {
          const s = t.Status?.toLowerCase();
          return s === 'in progress' || s === 'testing' || s === 'review';
        });
        break;
      case 'high_priority':
        list = list.filter((t) => {
          const p = t.Priority?.toLowerCase();
          return p === 'high' || p === 'urgent';
        });
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
  }, [activeTickets, activeTab, selectedProjectId, searchTaskQuery, user]);

  // Filtered organizations for the switcher drawer
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
    setSelectedProjectId(null); // Reset project filter when org changes
    setIsWorkspaceDrawerOpen(false);
  };

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
          <Text style={styles.toolbarBackText} numberOfLines={1}>Current Design</Text>
        </TouchableOpacity>

        {/* Center: Preview status pill */}
        <View style={styles.toolbarCenterPill}>
          <View style={styles.toolbarPulsingDot} />
          <Text style={styles.toolbarCenterText} numberOfLines={1}>PREVIEW MODE</Text>
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
          <Text style={styles.toolbarApplyText} numberOfLines={1}>Use Design</Text>
        </TouchableOpacity>
      </View>

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
          
          {/* =========================================================================
              2. PERSONAL CONTEXT HEADER
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

            {/* =========================================================================
                3. SMART WORKSPACE SELECTOR (CORE ARCHITECTURE)
               ========================================================================= */}
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
              4. ACTIONABLE METRICS GRID (ACCURATE & VERIFIABLE)
             ========================================================================= */}
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeadingText}>WORKSPACE OVERVIEW</Text>
            <Text style={styles.sectionHeadingHint}>Tap metric to filter tasks</Text>
          </View>

          <View style={styles.metricsGrid}>
            {/* Metric 1: Active Tasks (Total) */}
            <TouchableOpacity
              style={[styles.metricCard, activeTab === 'all' && styles.metricCardActive]}
              activeOpacity={0.7}
              onPress={() => setActiveTab('all')}
            >
              <View style={styles.metricCardHeader}>
                <Feather name="layers" size={16} color={theme.colors.textPrimary} />
                <Text style={styles.metricValText}>{metrics.total}</Text>
              </View>
              <Text style={styles.metricLabelText}>Total Tasks</Text>
              <Text style={styles.metricSubLabel}>In workspace</Text>
            </TouchableOpacity>

            {/* Metric 2: Assigned to Me */}
            <TouchableOpacity
              style={[styles.metricCard, activeTab === 'my' && styles.metricCardActive]}
              activeOpacity={0.7}
              onPress={() => setActiveTab('my')}
            >
              <View style={styles.metricCardHeader}>
                <Feather name="user-check" size={16} color={theme.colors.primary} />
                <Text style={[styles.metricValText, { color: theme.colors.primary }]}>{metrics.myCount}</Text>
              </View>
              <Text style={styles.metricLabelText}>My Tasks</Text>
              <Text style={styles.metricSubLabel}>Assigned to me</Text>
            </TouchableOpacity>

            {/* Metric 3: In Progress */}
            <TouchableOpacity
              style={[styles.metricCard, activeTab === 'in_progress' && styles.metricCardActive]}
              activeOpacity={0.7}
              onPress={() => setActiveTab('in_progress')}
            >
              <View style={styles.metricCardHeader}>
                <Feather name="activity" size={16} color={theme.colors.stats.blue.color} />
                <Text style={[styles.metricValText, { color: theme.colors.stats.blue.color }]}>{metrics.inProgress}</Text>
              </View>
              <Text style={styles.metricLabelText}>In Progress</Text>
              <Text style={styles.metricSubLabel}>Active execution</Text>
            </TouchableOpacity>

            {/* Metric 4: High Priority / Urgent */}
            <TouchableOpacity
              style={[styles.metricCard, activeTab === 'high_priority' && styles.metricCardActive]}
              activeOpacity={0.7}
              onPress={() => setActiveTab('high_priority')}
            >
              <View style={styles.metricCardHeader}>
                <Feather name="alert-circle" size={16} color={theme.colors.error} />
                <Text style={[styles.metricValText, { color: theme.colors.error }]}>{metrics.high}</Text>
              </View>
              <Text style={styles.metricLabelText}>Urgent</Text>
              <Text style={styles.metricSubLabel}>Requires attention</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Completion Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeaderRow}>
              <Text style={styles.progressLabel}>Completion Progress</Text>
              <Text style={styles.progressPercentText}>
                {metrics.done} of {metrics.total} ({metrics.completionRate}%)
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${Math.min(metrics.completionRate, 100)}%` }]} />
            </View>
          </View>

          {/* =========================================================================
              5. QUICK ACTIONS (RESPONSIVE 2x2 ERGONOMIC GRID)
             ========================================================================= */}
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
              onPress={() => navigation.navigate('Users')}
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

          {/* =========================================================================
              6. ACCESSIBLE PROJECTS (HORIZONTAL CAROUSEL & 1-TAP FILTER)
             ========================================================================= */}
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>ACCESSIBLE PROJECTS</Text>
              <Text style={styles.sectionSubtitle}>
                {selectedOrg ? `Projects in ${selectedOrg.Name}` : 'All authorized workspace projects'}
              </Text>
            </View>

            {selectedProjectId !== null && (
              <TouchableOpacity
                onPress={() => setSelectedProjectId(null)}
                style={styles.clearFilterChip}
              >
                <Text style={styles.clearFilterChipText}>Clear Filter ✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.projectsCarousel}
          >
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
                      // Toggle project filter
                      if (isSelected) {
                        setSelectedProjectId(null);
                      } else {
                        setSelectedProjectId(p.ProjectID);
                      }
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

          {/* =========================================================================
              7. WORKSPACE FOCUS FEED (SEARCHABLE, FILTERABLE WORK HUB)
             ========================================================================= */}
          <View style={styles.feedHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>WORKSPACE FOCUS FEED</Text>
              <Text style={styles.sectionSubtitle}>
                {selectedProjectObj ? `Filtered by ${selectedProjectObj.Name}` : 'Prioritized work items'}
              </Text>
            </View>
            <Text style={styles.feedCountText}>{displayedTickets.length} tasks</Text>
          </View>

          {/* Filter Tabs */}
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'my' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('my')}
            >
              <Text style={[styles.segmentText, activeTab === 'my' && styles.segmentTextActive]}>
                My Tasks ({metrics.myCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'in_progress' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('in_progress')}
            >
              <Text style={[styles.segmentText, activeTab === 'in_progress' && styles.segmentTextActive]}>
                In Progress ({metrics.inProgress})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'high_priority' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('high_priority')}
            >
              <Text style={[styles.segmentText, activeTab === 'high_priority' && styles.segmentTextActive]}>
                Urgent ({metrics.high})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'all' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.segmentText, activeTab === 'all' && styles.segmentTextActive]}>
                All ({metrics.total})
              </Text>
            </TouchableOpacity>
          </View>

          {/* In-Feed Search Input */}
          <View style={styles.taskSearchBox}>
            <Feather name="search" size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.taskSearchInput}
              placeholder="Search tasks by title or TM-ID..."
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

          {/* Task Items List */}
          <View style={styles.taskListContainer}>
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
                    accessibilityLabel={`Task ${task.Title}`}
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
                        <Text style={[styles.statusBadgeText, { color: status.color }]}>
                          {status.label}
                        </Text>
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
                    : activeTab === 'my'
                    ? 'You have completed all assigned tasks in this workspace.'
                    : 'No tasks currently match this filter criteria.'}
                </Text>
                {searchTaskQuery.trim() !== '' && (
                  <TouchableOpacity
                    style={styles.emptyResetBtn}
                    onPress={() => setSearchTaskQuery('')}
                  >
                    <Text style={styles.emptyResetBtnText}>Clear Search Filter</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Bottom Navigation Hint to full Task List */}
          <TouchableOpacity
            style={styles.viewAllTasksBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Tickets')}
          >
            <Text style={styles.viewAllTasksText}>View All Tasks in Task Manager →</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>

      {/* =========================================================================
          8. SMART WORKSPACE SWITCHER DRAWER (MODAL)
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
          9. SAFE-MODE CONFIRMATION DIALOG (SECTION 16)
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

            <Text style={styles.dialogTitle}>Safe Mode Preview Active</Text>
            <Text style={styles.dialogMessage}>
              You are exploring the proposed Smart Workspace 2.0 interface.
              {'\n\n'}
              In strict accordance with project safety rules, your original mobile app design remains 100% active, default, and protected throughout this session.
              {'\n\n'}
              Once approved by your team, this design can be permanently integrated into the core dashboard.
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
      paddingBottom: 50,
    },

    // 2. Personal Context Header
    headerCard: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 18,
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
      marginBottom: 14,
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

    // Section Headings
    sectionHeadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      marginTop: 20,
      marginBottom: 10,
    },
    sectionHeadingText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.colors.textSecondary,
      letterSpacing: 0.8,
    },
    sectionHeadingHint: {
      fontSize: 11,
      color: theme.colors.textMuted,
    },

    // 4. Actionable Metrics Grid
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginHorizontal: 16,
    },
    metricCard: {
      width: '48.5%',
      padding: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 10,
    },
    metricCardActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.isDark ? 'rgba(45, 212, 191, 0.08)' : 'rgba(13, 148, 136, 0.08)',
    },
    metricCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    metricValText: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    metricLabelText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginTop: 2,
    },
    metricSubLabel: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      marginTop: 1,
    },

    // Progress Bar
    progressContainer: {
      marginHorizontal: 16,
      padding: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 6,
    },
    progressHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    progressLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    progressPercentText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    progressBarTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.iconBg,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 3,
    },

    // 5. Quick Actions 2x2 Grid
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

    // 6. Accessible Projects
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      marginTop: 16,
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

    // 7. Workspace Focus Feed
    feedHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      marginTop: 20,
      marginBottom: 10,
    },
    feedCountText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
    },
    segmentedControl: {
      flexDirection: 'row',
      marginHorizontal: 16,
      padding: 3,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 10,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: 7,
      alignItems: 'center',
      borderRadius: theme.radius.sm - 2,
    },
    segmentBtnActive: {
      backgroundColor: theme.colors.primary,
    },
    segmentText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    segmentTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
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
    emptyResetBtn: {
      marginTop: 10,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.iconBg,
    },
    emptyResetBtnText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.primary,
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

    // 8. Drawer Modal
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

    // 9. Safe-Mode Dialog
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
