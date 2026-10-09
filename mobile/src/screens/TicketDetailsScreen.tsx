import React, { useEffect, useState } from 'react';
import { useAlert } from '../context/AlertContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { ticketService, Ticket } from '../services/ticketService';
import { userService, User } from '../services/userService';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import LoadingScreen from '../components/common/LoadingScreen';
import AppButton from '../components/common/AppButton';
import ConfirmModal from '../components/common/ConfirmModal';
import UpdateTicketModal from '../components/ticket/UpdateTicketModal';

export default function TicketDetailsScreen() {
  const { showAlert } = useAlert();
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const ticketId = route.params?.ticketId;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [attToDelete, setAttToDelete] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [ticketId]);

  const loadData = async () => {
    if (!ticketId) return;
    try {
      setLoading(true); setError(null);
      const [ticketRes, usersRes, attachmentsRes] = await Promise.all([
        ticketService.getTicket(ticketId),
        userService.getUsers().catch(() => ({ data: [] })),
        // Attachments have their own protected endpoint. Do not rely on the
        // ticket response embedding them, because older deployed backends do
        // not include that relation.
        ticketService.getAttachments(ticketId).catch(() => ({ data: [] })),
      ]);
      setTicket(ticketRes.data);
      if (usersRes?.data) setUsers(usersRes.data);
      setAttachments(attachmentsRes?.data || ticketRes.data.Attachments || []);
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
      showAlert({ title: 'Success', message: 'Asset uploaded successfully', type: 'success', cancelText: null });
      loadData();
    } catch (err) {
      showAlert({ title: 'Upload Failed', message: 'System rejected the asset upload.', type: 'error', cancelText: null });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateSave = async (newStatus: string, newAssigneeId: number | null) => {
    try {
      setUpdating(true);
      let changed = false;

      // Update status if changed
      if (newStatus !== ticket?.Status) {
        await ticketService.updateTicket(ticketId, { Status: newStatus });
        changed = true;
      }

      // Update assignee if changed
      const currentAssigned = ticket?.AssignedTo || 0;
      const targetAssigned = newAssigneeId || 0;

      if (targetAssigned !== currentAssigned) {
        if (targetAssigned > 0) {
          try {
            await ticketService.assignTicket(ticketId, targetAssigned);
          } catch (assignErr) {
            // Fallback to updateTicket
            await ticketService.updateTicket(ticketId, { AssignedTo: targetAssigned } as any);
          }
        } else {
          // Unassigned
          await ticketService.updateTicket(ticketId, { AssignedTo: 0 } as any);
        }
        changed = true;
      }

      if (changed) {
        showAlert({ title: 'Success', message: 'Task updated successfully.', type: 'success', cancelText: null });
        await loadData();
      }
      setModalVisible(false);
    } catch (err: any) {
      showAlert({ title: 'Error', message: err?.message || 'Failed to update task.', type: 'error', cancelText: null });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTicket = async () => {
    try {
      setDeleteModalVisible(false);
      setTimeout(async () => {
        await ticketService.deleteTicket(ticketId);
        navigation.goBack();
      }, 350);
    } catch(e) {}
  };

  const [downloading, setDownloading] = useState<string | null>(null);

  const handleViewAttachment = async (fileName: string) => {
    try {
      setDownloading(fileName);
      const url = `${process.env.EXPO_PUBLIC_API_URL || 'https://20.6.104.150.sslip.io/api'}/tickets/${ticketId}/attachments/file/${encodeURIComponent(fileName)}`;
      const token = await SecureStore.getItemAsync('auth_token');
      
      const fileUri = FileSystem.documentDirectory + fileName;
      const downloadRes = await FileSystem.downloadAsync(url, fileUri, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (downloadRes.status === 200) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadRes.uri);
        } else {
          showAlert({ title: 'Error', message: 'Sharing not available on this device.', type: 'error', cancelText: null });
        }
      } else {
        showAlert({ title: 'Error', message: 'Failed to download attachment.', type: 'error', cancelText: null });
      }
    } catch (error) {
      showAlert({ title: 'Error', message: 'Something went wrong while opening the file.', type: 'error', cancelText: null });
    } finally {
      setDownloading(null);
    }
  };

  const handleDeleteAttachment = async () => {
    if (!attToDelete) return;
    try {
      await ticketService.deleteAttachment(ticketId, attToDelete);
      setAttToDelete(null);
      loadData();
    } catch(e) {}
  };

  if (loading) return <LoadingScreen message="Loading Task Details..." />;
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
          
          {attachments.length > 0 ? (
            attachments.map((att: any) => (
              <View key={att.AttachmentID || att.FileName} style={styles.attachmentRow}>
                <Feather name="file" size={16} color={theme.colors.textSecondary} />
                <TouchableOpacity onPress={() => handleViewAttachment(att.FileName)} style={{flex: 1, marginLeft: 8}}>
                    <Text style={[styles.attachmentName, { color: theme.colors.primary, textDecorationLine: 'underline' }]} numberOfLines={1}>
                      {downloading === att.FileName ? 'Downloading...' : (att.FileName || 'Attachment')}
                    </Text>
                  </TouchableOpacity>
                <TouchableOpacity onPress={() => setAttToDelete(att.AttachmentID)} style={styles.deleteAttBtn}>
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
        <AppButton title="DELETE TASK" variant="danger" onPress={() => setDeleteModalVisible(true)} />

      <ConfirmModal
        visible={deleteModalVisible}
        title="Delete Task?"
        message="This will permanently delete this task and all its attachments."
        onConfirm={handleDeleteTicket}
        onCancel={() => setDeleteModalVisible(false)}
      />

      <ConfirmModal
        visible={!!attToDelete}
        title="Delete Attachment?"
        message="This file will be permanently removed."
        onConfirm={handleDeleteAttachment}
        onCancel={() => setAttToDelete(null)}
      />
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
