import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated, Dimensions, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeContext } from '../../context/ThemeContext';
import { AppTheme } from '../../constants/theme';
import AppButton from '../common/AppButton';

interface User {
  UserID: number;
  Name: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (status: string, assigneeId: number | null) => void;
  currentStatus: string;
  currentAssignee: number | null;
  users: User[];
  loading?: boolean;
}

const STATUS_OPTIONS = ['Open', 'In Progress', 'Review', 'Done'];

export default function UpdateTicketModal({ visible, onClose, onSave, currentStatus, currentAssignee, users, loading }: Props) {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || 'Open');
  const [selectedAssignee, setSelectedAssignee] = useState<number | null>(currentAssignee);

  useEffect(() => {
    if (visible) {
      setSelectedStatus(currentStatus || 'Open');
      setSelectedAssignee(currentAssignee);
    }
  }, [visible, currentStatus, currentAssignee]);

  const handleSave = () => {
    onSave(selectedStatus, selectedAssignee);
  };

  const getStatusColor = (status: string, isSelected: boolean) => {
    if (!isSelected) return theme.colors.textSecondary;
    switch(status?.toLowerCase()) {
      case 'done': return theme.colors.success;
      case 'in progress': return theme.colors.stats.blue.color;
      case 'review': return theme.colors.stats.purple.color;
      default: return theme.colors.textPrimary;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />
          
          <View style={styles.header}>
            <Text style={styles.title}>Update Task Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            
            <Text style={styles.sectionLabel}>Status</Text>
            <View style={styles.statusGrid}>
              {STATUS_OPTIONS.map((status) => {
                const isSelected = selectedStatus === status;
                return (
                  <TouchableOpacity
                    key={status}
                    style={[styles.statusPill, isSelected && styles.statusPillSelected]}
                    onPress={() => setSelectedStatus(status)}
                    activeOpacity={0.7}
                  >
                    {isSelected && status === 'In Progress' && <Feather name="refresh-cw" size={14} color={getStatusColor(status, true)} style={{ marginRight: 6 }} />}
                    <Text style={[styles.statusText, { color: getStatusColor(status, isSelected) }]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>Assignee</Text>
            <View style={styles.assigneeList}>
              <TouchableOpacity
                  style={[styles.assigneeRow, selectedAssignee === null && styles.assigneeRowSelected]}
                  onPress={() => setSelectedAssignee(null)}
                  activeOpacity={0.7}
              >
                <View style={styles.assigneeAvatarEmpty}>
                  <Feather name="user-x" size={14} color={theme.colors.textSecondary} />
                </View>
                <Text style={styles.assigneeName}>Unassigned</Text>
                {selectedAssignee === null && <Feather name="check-circle" size={18} color={theme.colors.primary} />}
              </TouchableOpacity>
              
              {users.map(user => {
                const isSelected = selectedAssignee === user.UserID;
                return (
                  <TouchableOpacity
                    key={user.UserID}
                    style={[styles.assigneeRow, isSelected && styles.assigneeRowSelected]}
                    onPress={() => setSelectedAssignee(user.UserID)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.assigneeAvatar}>
                      <Text style={styles.assigneeInitial}>{user.Name.charAt(0)}</Text>
                    </View>
                    <Text style={[styles.assigneeName, isSelected && { fontWeight: '600' }]}>{user.Name}</Text>
                    {isSelected ? (
                      <Feather name="check-circle" size={18} color={theme.colors.primary} />
                    ) : (
                      <Feather name="circle" size={18} color={theme.colors.border} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={styles.footer}>
            <AppButton title="SAVE CHANGES" onPress={handleSave} loading={loading} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    minHeight: '60%',
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    ...theme.shadows.glass,
  },
  dragHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginTop: 12, marginBottom: 8,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  title: { ...theme.typography.h2, fontSize: 20, color: theme.colors.textPrimary },
  closeBtn: { padding: 8, backgroundColor: theme.colors.iconBg, borderRadius: 20 },
  
  content: { padding: theme.spacing.lg },
  sectionLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: 12, letterSpacing: 0.5 },
  
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  statusPillSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryGlow,
  },
  statusText: { fontSize: 14, fontWeight: '500' },
  
  assigneeList: { marginBottom: 20 },
  assigneeRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: theme.radius.md,
    marginBottom: 8,
    borderWidth: 1, borderColor: 'transparent',
  },
  assigneeRowSelected: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderHighlight,
    ...theme.shadows.neon, shadowOpacity: 0.1,
  },
  assigneeAvatarEmpty: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: theme.colors.iconBg,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  assigneeAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  assigneeInitial: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  assigneeName: { flex: 1, ...theme.typography.body, color: theme.colors.textPrimary },
  
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1, borderTopColor: theme.colors.border,
  }
});
