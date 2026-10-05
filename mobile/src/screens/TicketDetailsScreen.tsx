import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { ticketService, Ticket } from '../services/ticketService';
import { userService, User } from '../services/userService';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import LoadingScreen from '../components/common/LoadingScreen';
import AppButton from '../components/common/AppButton';
import UpdateTicketModal from '../components/ticket/UpdateTicketModal';

export default function TicketDetailsScreen() {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const ticketId = route.params?.ticketId;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, [ticketId]);

  const loadData = async () => {
    if (!ticketId) return;
    try {
      setLoading(true); setError(null);
      const [ticketRes, usersRes] = await Promise.all([
        ticketService.getTicket(ticketId),
        userService.getUsers().catch(() => ({ data: [] }))
      ]);
      setTicket(ticketRes.data);
      if (usersRes?.data) setUsers(usersRes.data);
    } catch (err) {
      setError('Failed to load task data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (res.canceled) return;
      const file = res.assets[0];
      setUploading(true);
      await ticketService.uploadAttachment(ticketId, file.uri, file.name, file.mimeType || 'application/octet-stream');
      Alert.alert('Success', 'Asset uploaded successfully');
      loadData();
    } catch (err) {
      Alert.alert('Upload Failed', 'System rejected the asset upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateSave = async (newStatus: string, newAssigneeId: number | null) => {
    try {
      setUpdating(true);
      const promises = [];
      if (newStatus !== ticket?.Status) {
        promises.push(ticketService.updateTicket(ticketId, { Status: newStatus }));
      }
      if (newAssigneeId !== ticket?.AssignedTo) {
        if (newAssigneeId !== null) {
          promises.push(ticketService.assignTicket(ticketId, newAssigneeId));
        } else {
          promises.push(ticketService.updateTicket(ticketId, { AssignedTo: null } as any));
        }
      }
      if (promises.length > 0) {
        await Promise.all(promises);
        Alert.alert('Success', 'Task updated successfully.');
        await loadData();
      }
      setModalVisible(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to update task.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTicket = () => {
    Alert.alert('Confirm Deletion', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await ticketService.deleteTicket(ticketId);
          Alert.alert('Deleted', 'Task deleted successfully.');
          navigation.goBack();
        } catch (err) {
          Alert.alert('Error', 'Failed to delete task.');
        }
      }}
    ]);
  };

  const handleDeleteAttachment = (attachmentId: number) => {
    Alert.alert('Confirm Deletion', 'Remove this attachment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await ticketService.deleteAttachment(ticketId, attachmentId);
          loadData();
        } catch (err) {
          Alert.alert('Error', 'Failed to delete attachment.');
        }
      }}
    ]);
  };

  if (loading) return <LoadingScreen message="Decrypting Task Details..." />;
  if (error || !ticket) return (
    <View style={styles.centerContainer}>
      <Text style={styles.errorText}>{error || 'Task Not Found'}</Text>
      <AppButton title="GO BACK" onPress={() => navigation.goBack()} />
    </View>
  );

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'done': return theme.colors.success;
      case 'in progress': return theme.colors.stats.blue.color;
      case 'review': return theme.colors.stats.purple.color;
      default: return theme.colors.textSecondary;
    }
  };
  
  const getStatusBg = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'done': return theme.colors.successBg;
      case 'in progress': return theme.colors.stats.blue.bg;
      case 'review': return theme.colors.stats.purple.bg;
      default: return theme.colors.iconBg;
    }
  };

  const assignedUser = users.find(u => u.UserID === ticket.AssignedTo);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.editBtn}>
          <Feather name="edit-2" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.ticketTitle}>{ticket.Title}</Text>
          <Text style={styles.ticketId}>ID: TM-{ticket.TaskID}</Text>
        </View>

        <View style={styles.badgesContainer}>
          <View style={[styles.badge, { backgroundColor: getStatusBg(ticket.Status) }]}>
            <Text style={[styles.badgeText, { color: getStatusColor(ticket.Status) }]}>{ticket.Status}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={[styles.badgeText, { color: theme.colors.textPrimary }]}>{ticket.Priority}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{ticket.Description || 'No description provided.'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Assignee</Text>
          {assignedUser ? (
            <View style={styles.assigneeRow}>
              <View style={styles.assigneeAvatar}>
                <Text style={styles.assigneeInitials}>{assignedUser.Name.charAt(0)}</Text>
              </View>
              <Text style={styles.assigneeName}>{assignedUser.Name}</Text>
            </View>
          ) : (
            <Text style={styles.description}>Unassigned</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Attachments</Text>
            <TouchableOpacity onPress={handleUpload} disabled={uploading}>
              <Feather name="upload-cloud" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          {ticket.Attachments && ticket.Attachments.length > 0 ? (
            ticket.Attachments.map((att: any, idx: number) => (
              <View key={idx} style={styles.attachmentRow}>
                <Feather name="file" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.attachmentName} numberOfLines={1}>{att.FileName || 'Attachment'}</Text>
                <TouchableOpacity onPress={() => handleDeleteAttachment(att.AttachmentID)} style={styles.deleteAttBtn}>
                  <Feather name="trash-2" size={16} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.description}>No assets attached.</Text>
          )}
          
          {uploading && <Text style={[styles.description, { color: theme.colors.primary, marginTop: 8 }]}>Uploading...</Text>}
        </View>

        <View style={{ height: 40 }} />
        <AppButton title="DELETE TASK" variant="danger" onPress={handleDeleteTicket} />
      </ScrollView>

      <UpdateTicketModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleUpdateSave}
        currentStatus={ticket.Status}
        currentAssignee={ticket.AssignedTo || null}
        users={users}
        loading={updating}
      />
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  errorText: { color: theme.colors.error, marginBottom: 20 },
  
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20, paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  editBtn: { padding: 8, marginRight: -8, backgroundColor: theme.colors.primaryGlow, borderRadius: 20 },
  headerTitle: { ...theme.typography.h3, color: theme.colors.textPrimary },
  
  content: { padding: theme.spacing.lg, paddingBottom: 100 },
  
  titleSection: { marginBottom: 24 },
  ticketTitle: { ...theme.typography.h1, fontSize: 28, color: theme.colors.textPrimary, marginBottom: 8 },
  ticketId: { ...theme.typography.caption, color: theme.colors.textSecondary, letterSpacing: 1 },
  
  badgesContainer: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: theme.colors.iconBg },
  badgeText: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.textPrimary, marginBottom: 12 },
  description: { ...theme.typography.body, color: theme.colors.textSecondary },
  
  assigneeRow: { flexDirection: 'row', alignItems: 'center' },
  assigneeAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  assigneeInitials: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  assigneeName: { ...theme.typography.body, color: theme.colors.textPrimary, fontWeight: '500' },
  
  attachmentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  attachmentName: { ...theme.typography.body, color: theme.colors.textPrimary, marginLeft: 12, flex: 1 },
  deleteAttBtn: { padding: 4 },
});