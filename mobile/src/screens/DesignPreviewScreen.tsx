import React, { useState, useMemo, useRef, useEffect } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
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
  const [isWorkspaceDrawerOpen, setIsWorkspaceDrawerOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Filtered tasks based on activeTab and optional selectedProjectId
  const displayedTickets = useMemo(() => {
    let list = activeTickets;

    // Filter by project if one is selected in the carousel
    if (selectedProjectId !== null) {
      list = list.filter((t) => t.ProjectID === selectedProjectId);
    }

    switch (activeTab) {
      case 'my':
        return user ? list.filter((t) => t.AssignedTo === user.UserID) : list;
      case 'in_progress':
        return list.filter((t) => {
          const s = t.Status?.toLowerCase();
          return s === 'in progress' || s === 'testing' || s === 'review';
        });
      case 'high_priority':
        return list.filter((t) => {
          const p = t.Priority?.toLowerCase();
          return p === 'high' || p === 'urgent';
        });
      case 'all':
      default:
        return list;
    }
  }, [activeTickets, activeTab, selectedProjectId, user]);

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = activeTickets.length;
    const done = activeTickets.filter((t) => t.Status?.toLowerCase() === 'done').length;
    const inProgress = activeTickets.filter((t) => {
      const s = t.Status?.toLowerCase();
      return s === 'in progress' || s === 'testing';
    }).length;
    const high = activeTickets.filter((t) => {
      const p = t.Priority?.toLowerCase();
      return p === 'high' || p === 'urgent';
    }).length;
    const velocity = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, done, inProgress, high, velocity };
  }, [activeTickets]);

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
        return { color: theme.colors.textSecondary, bg: theme.colors.iconBg, label: status || 'Pending' };
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

      {/* 1. TOP PREVIEW CONTROL BANNER (SAFE MODE) */}
      <View style={styles.previewControlBar}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={16} color={theme.colors.textPrimary} />
          <Text style={styles.backButtonText}>Current Design</Text>
        </TouchableOpacity>

        <View style={styles.previewTagContainer}>
          <View style={styles.pulsingDot} />
          <Text style={styles.previewTagText}>SMART WORKSPACE PREVIEW</Text>
        </View>

        <TouchableOpacity
          style={styles.applyButton}
          activeOpacity={0.7}
          onPress={() => setIsApplyModalOpen(true)}
        >
          <Feather name="check" size={14} color="#FFFFFF" />
          <Text style={styles.applyButtonText}>Use This</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
          
          {/* 2. PERSONALIZED WORKSPACE HEADER */}
          <View style={styles.headerCard}>
            <LinearGradient
              colors={[theme.colors.primaryGlow, 'transparent']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />

            <View style={styles.headerTopRow}>
              <View style={styles.userInfo}>
                <Text style={styles.greetingText}>{getGreeting()}</Text>
                <Text style={styles.userNameText} numberOfLines={1}>
                  {user?.Name || 'Workspace Member'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.notificationBtn}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Feather name="bell" size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* SMART WORKSPACE SELECTOR PILL */}
            <TouchableOpacity
              style={styles.workspacePill}
              activeOpacity={0.8}
              onPress={() => setIsWorkspaceDrawerOpen(true)}
            >
              <View style={styles.workspacePillLeft}>
                <View style={styles.orgAvatarMini}>
                  <Text style={styles.orgAvatarText}>
                    {selectedOrg ? selectedOrg.Name.charAt(0).toUpperCase() : '🌐'}
                  </Text>
                </View>
                <View style={styles.workspaceTextCol}>
                  <Text style={styles.workspaceLabel}>ACTIVE WORKSPACE</Text>
                  <Text style={styles.workspaceName} numberOfLines={1}>
                    {selectedOrg ? selectedOrg.Name : 'All Workspaces (Unified)'}
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

          {/* 3. WORKSPACE VELOCITY & PROGRESS STRIP */}
          <View style={styles.statsStrip}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{metrics.total}</Text>
              <Text style={styles.statLabel}>Active Tasks</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.stats.blue.color }]}>
                {metrics.inProgress}
              </Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {metrics.done}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {metrics.velocity}%
              </Text>
              <Text style={styles.statLabel}>Velocity</Text>
            </View>
          </View>

          {/* Progress Bar Track */}
          <View style={styles.progressTrackWrapper}>
            <View style={[styles.progressTrackFill, { width: `${Math.min(metrics.velocity, 100)}%` }]} />
          </View>

          {/* 4. FAST ACTIONS ROW */}
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.actionChip}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CreateTicket')}
            >
              <Feather name="plus" size={16} color={theme.colors.primary} />
              <Text style={styles.actionChipText}>New Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionChip}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CreateProject', { initialOrgId: selectedOrgId || undefined })}
            >
              <Feather name="folder-plus" size={16} color={theme.colors.stats.blue.color} />
              <Text style={styles.actionChipText}>New Project</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionChip}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Organizations')}
            >
              <Feather name="briefcase" size={16} color={theme.colors.stats.purple.color} />
              <Text style={styles.actionChipText}>Workspaces</Text>
            </TouchableOpacity>
          </View>

          {/* 5. RELEVANT PROJECTS CAROUSEL */}
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>ACCESSIBLE PROJECTS</Text>
              <Text style={styles.sectionSubtitle}>
                {selectedOrg ? `Projects in ${selectedOrg.Name}` : 'All active projects'}
              </Text>
            </View>
            {selectedProjectId !== null && (
              <TouchableOpacity
                onPress={() => setSelectedProjectId(null)}
                style={styles.clearFilterBadge}
              >
                <Text style={styles.clearFilterText}>Clear Filter ✕</Text>
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
                      if (isSelected) {
                        navigation.navigate('ProjectDetails', { projectId: p.ProjectID });
                      } else {
                        setSelectedProjectId(p.ProjectID);
                      }
                    }}
                  >
                    <View style={styles.projectCardTop}>
                      <View style={[styles.projectIconWrap, isSelected && styles.projectIconWrapActive]}>
                        <Feather name="folder" size={18} color={isSelected ? '#FFFFFF' : theme.colors.primary} />
                      </View>
                      <View style={styles.projectBadge}>
                        <Text style={styles.projectBadgeText}>{projectTaskCount} Tasks</Text>
                      </View>
                    </View>

                    <Text style={styles.projectCardName} numberOfLines={1}>
                      {p.Name}
                    </Text>
                    <Text style={styles.projectCardDesc} numberOfLines={2}>
                      {p.Description || 'Active workspace project'}
                    </Text>

                    <View style={styles.projectCardFooter}>
                      <Text style={styles.projectActionHint}>
                        {isSelected ? 'Open Details →' : 'Filter Tasks'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyProjectsCard}>
                <Feather name="folder" size={24} color={theme.colors.textMuted} />
                <Text style={styles.emptyProjectsText}>No projects in this workspace</Text>
                <TouchableOpacity
                  style={styles.emptyCreateBtn}
                  onPress={() => navigation.navigate('CreateProject', { initialOrgId: selectedOrgId || undefined })}
                >
                  <Text style={styles.emptyCreateBtnText}>+ Create Project</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* 6. INTELLIGENT WORK FEED ("MY ATTENTION NEEDED") */}
          <View style={styles.feedHeaderRow}>
            <Text style={styles.sectionTitle}>WORKSPACE FOCUS FEED</Text>
            <Text style={styles.feedCountText}>{displayedTickets.length} items</Text>
          </View>

          {/* Segmented Filter Control */}
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'my' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('my')}
            >
              <Text style={[styles.segmentText, activeTab === 'my' && styles.segmentTextActive]}>
                My Tasks ({myTickets.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'in_progress' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('in_progress')}
            >
              <Text style={[styles.segmentText, activeTab === 'in_progress' && styles.segmentTextActive]}>
                In Progress
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
                All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tasks List */}
          <View style={styles.taskListContainer}>
            {displayedTickets.length > 0 ? (
              displayedTickets.map((task) => {
                const status = getStatusBadge(task.Status);
                const priority = getPriorityBadge(task.Priority);
                const project = activeProjects.find((p) => p.ProjectID === task.ProjectID);

                return (
                  <TouchableOpacity
                    key={task.TaskID}
                    style={styles.taskItem}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('TicketDetails', { ticketId: task.TaskID })}
                  >
                    <View style={styles.taskItemLeft}>
                      <View style={[styles.priorityPill, { backgroundColor: priority.bg }]}>
                        <Feather name={priority.icon} size={12} color={priority.color} />
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
                        <Text style={styles.taskTitle} numberOfLines={1}>
                          {task.Title}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.taskItemRight}>
                      <View style={[styles.statusTag, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusTagText, { color: status.color }]}>
                          {status.label}
                        </Text>
                      </View>
                      <Feather name="chevron-right" size={16} color={theme.colors.textMuted} />
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyTasksBox}>
                <Feather name="check-circle" size={32} color={theme.colors.primary} style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTasksTitle}>No tasks require attention</Text>
                <Text style={styles.emptyTasksDesc}>
                  {activeTab === 'my'
                    ? 'You have completed all assigned tasks in this workspace.'
                    : 'No tasks currently match this filter criteria.'}
                </Text>
              </View>
            )}
          </View>

        </Animated.View>
      </ScrollView>

      {/* 7. SMART WORKSPACE SWITCHER DRAWER (MODAL) */}
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
                  Select an organization to filter your projects and tasks
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsWorkspaceDrawerOpen(false)}
                style={styles.drawerCloseBtn}
              >
                <Feather name="x" size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

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
                  <Text style={styles.orgItemDesc}>View all authorized projects and tasks</Text>
                </View>
                {selectedOrgId === null && (
                  <Feather name="check-circle" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>

              <View style={styles.drawerDivider} />

              {/* List of actual user organizations from backend */}
              {organizations.map((org) => {
                const isSelected = selectedOrgId === org.OrganizationID;
                const orgProjectsCount = activeProjects.filter((p) => p.OrganizationID === org.OrganizationID).length;

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
                      <Text style={styles.orgItemDesc}>ID: ORG-{org.OrganizationID}</Text>
                    </View>
                    {isSelected && (
                      <Feather name="check-circle" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
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

      {/* 8. SAFE-MODE CONFIRMATION DIALOG (SECTION 22) */}
      <Modal
        visible={isApplyModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsApplyModalOpen(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogCard}>
            <View style={styles.dialogIconWrap}>
              <Feather name="compass" size={28} color={theme.colors.primary} />
            </View>

            <Text style={styles.dialogTitle}>Safe Mode Preview Active</Text>
            <Text style={styles.dialogMessage}>
              You are exploring the proposed Smart Workspace 2.0 interface.
              {'\n\n'}
              In accordance with project safety guidelines, your original mobile app remains 100% untouched and default throughout this preview.
              {'\n\n'}
              Once approved by your team, this design will be permanently integrated.
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
    // Top Safe-Mode Preview Control Bar
    previewControlBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingTop: Platform.OS === 'ios' ? 50 : 36,
      paddingBottom: 10,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      zIndex: 10,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.iconBg,
    },
    backButtonText: {
      ...theme.typography.caption,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginLeft: 6,
    },
    previewTagContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: theme.colors.primaryGlow,
    },
    pulsingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
      marginRight: 6,
    },
    previewTagText: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.8,
      color: theme.colors.primary,
    },
    applyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.primary,
    },
    applyButtonText: {
      ...theme.typography.caption,
      fontWeight: '700',
      color: '#FFFFFF',
      marginLeft: 4,
    },

    scrollContent: {
      paddingBottom: 60,
    },

    // Header Card
    headerCard: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
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
      marginBottom: theme.spacing.md,
    },
    userInfo: {
      flex: 1,
    },
    greetingText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    userNameText: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      marginTop: 2,
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
    },

    // Workspace Selector Pill
    workspacePill: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      borderWidth: 1,
      borderColor: theme.colors.borderHighlight,
    },
    workspacePillLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    orgAvatarMini: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    orgAvatarText: {
      color: '#FFFFFF',
      fontWeight: '700',
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
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginTop: 1,
    },
    workspacePillRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    projectCountBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      backgroundColor: theme.colors.iconBg,
      marginRight: 6,
    },
    projectCountText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },

    // Stats Strip
    statsStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      marginTop: theme.spacing.md,
      marginHorizontal: theme.spacing.lg,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statBox: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    statLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    statDivider: {
      width: 1,
      height: 24,
      backgroundColor: theme.colors.border,
    },
    progressTrackWrapper: {
      height: 4,
      backgroundColor: theme.colors.iconBg,
      marginHorizontal: theme.spacing.lg,
      marginTop: 6,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressTrackFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
    },

    // Quick Actions
    quickActionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.md,
    },
    actionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flex: 1,
      marginHorizontal: 4,
      justifyContent: 'center',
    },
    actionChipText: {
      ...theme.typography.caption,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginLeft: 6,
    },

    // Projects Section
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.lg,
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      letterSpacing: 0.8,
    },
    sectionSubtitle: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    clearFilterBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: theme.colors.errorBg,
    },
    clearFilterText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.error,
    },
    projectsCarousel: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: 8,
    },
    projectCard: {
      width: 170,
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
      marginBottom: 10,
    },
    projectIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.colors.iconBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    projectIconWrapActive: {
      backgroundColor: theme.colors.primary,
    },
    projectBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      backgroundColor: theme.colors.iconBg,
    },
    projectBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    projectCardName: {
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    projectCardDesc: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      height: 32,
    },
    projectCardFooter: {
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 8,
    },
    projectActionHint: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.primary,
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
      width: 240,
    },
    emptyProjectsText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 8,
      marginBottom: 12,
    },
    emptyCreateBtn: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.primary,
    },
    emptyCreateBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    // Feed Section
    feedHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.lg,
      marginBottom: 10,
    },
    feedCountText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
    },
    segmentedControl: {
      flexDirection: 'row',
      marginHorizontal: theme.spacing.lg,
      padding: 4,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 12,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: theme.radius.sm,
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

    // Task List
    taskListContainer: {
      marginHorizontal: theme.spacing.lg,
    },
    taskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 8,
    },
    taskItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 10,
    },
    priorityPill: {
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
    },
    taskTitle: {
      ...theme.typography.body,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    taskItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusTag: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      marginRight: 6,
    },
    statusTagText: {
      fontSize: 10,
      fontWeight: '700',
    },
    emptyTasksBox: {
      padding: 32,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTasksTitle: {
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    emptyTasksDesc: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },

    // Workspace Drawer Modal
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
      paddingHorizontal: theme.spacing.lg,
      marginBottom: 12,
    },
    drawerTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
    },
    drawerSubtitle: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    drawerCloseBtn: {
      padding: 6,
      borderRadius: 16,
      backgroundColor: theme.colors.iconBg,
    },
    drawerList: {
      paddingHorizontal: theme.spacing.lg,
    },
    drawerDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 8,
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
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    orgAvatarLetter: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    orgItemContent: {
      flex: 1,
    },
    orgItemName: {
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    orgItemDesc: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 1,
    },
    drawerFooter: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: 12,
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
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.primary,
      marginLeft: 8,
    },

    // Safe-Mode Dialog
    dialogOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    dialogCard: {
      width: '100%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.xl,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.borderHighlight,
      ...theme.shadows.glass,
    },
    dialogIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primaryGlow,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    dialogTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: 10,
    },
    dialogMessage: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 20,
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
      marginRight: 8,
    },
    dialogBtnSecondaryText: {
      ...theme.typography.caption,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    dialogBtnPrimary: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      marginLeft: 8,
    },
    dialogBtnPrimaryText: {
      ...theme.typography.caption,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
