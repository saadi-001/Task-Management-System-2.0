import { Platform } from 'react-native';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { syncSystemNotifications } from '../services/systemNotificationService';

export const NOTIFICATION_SYNC_TASK = 'tms-notification-sync';

if (Platform.OS !== 'web' && !TaskManager.isTaskDefined(NOTIFICATION_SYNC_TASK)) {
  TaskManager.defineTask(NOTIFICATION_SYNC_TASK, async () => {
    try {
      await syncSystemNotifications(true);
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch (error) {
      console.log('Notification sync task failed', error);
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}

export async function registerNotificationSyncTask() {
  if (Platform.OS === 'web') return;

  const status = await BackgroundTask.getStatusAsync();
  if (status !== BackgroundTask.BackgroundTaskStatus.Available) return;

  const registered = await TaskManager.isTaskRegisteredAsync(NOTIFICATION_SYNC_TASK);
  if (registered) return;

  await BackgroundTask.registerTaskAsync(NOTIFICATION_SYNC_TASK, {
    minimumInterval: 15,
  });
}

export async function unregisterNotificationSyncTask() {
  if (Platform.OS === 'web') return;

  const registered = await TaskManager.isTaskRegisteredAsync(NOTIFICATION_SYNC_TASK);
  if (!registered) return;
  await BackgroundTask.unregisterTaskAsync(NOTIFICATION_SYNC_TASK);
}
