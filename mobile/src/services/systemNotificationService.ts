import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import type * as NotificationsType from 'expo-notifications';
import { Notification, notificationService } from './notificationService';

export const TASK_CHANNEL_ID = 'task-updates';

const SEEN_KEY = 'tms.systemNotification.seenIds';
const RECENT_WINDOW_MS = 2 * 60 * 1000;

type SeenState = { seeded: boolean; ids: number[] };

let notificationsModule: typeof NotificationsType | null = null;
let handlerReady = false;
let permissionRequested = false;
let activePushToken: string | null = null;
let writeChain: Promise<void> = Promise.resolve();

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

function loadNotifications() {
  if (notificationsModule || Platform.OS === 'web') return notificationsModule;

  try {
    notificationsModule = require('expo-notifications');
    if (!handlerReady && notificationsModule) {
      notificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          priority: notificationsModule?.AndroidNotificationPriority.MAX,
        }),
      });
      handlerReady = true;
    }
  } catch (error) {
    console.log('expo-notifications unavailable', error);
  }

  return notificationsModule;
}

loadNotifications();

export function getActivePushToken() {
  return activePushToken;
}

export function canUseRemotePush() {
  return Platform.OS !== 'web' && !isExpoGo && Device.isDevice && !!loadNotifications();
}

export async function ensureAndroidChannel() {
  const Notifications = loadNotifications();
  if (!Notifications || Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(TASK_CHANNEL_ID, {
    name: 'Task updates',
    description: 'Assignments, status changes, and other task alerts',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#5B5BF7',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
  });
}

export async function ensureNotificationPermission() {
  const Notifications = loadNotifications();
  if (!Notifications) return false;

  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return true;
  if (permissionRequested) return false;

  permissionRequested = true;
  const next = await Notifications.requestPermissionsAsync();
  return next.status === 'granted';
}

export async function registerExpoPushToken() {
  if (!canUseRemotePush()) return null;

  const Notifications = loadNotifications();
  if (!Notifications) return null;

  await ensureAndroidChannel();
  const granted = await ensureNotificationPermission();
  if (!granted) return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    activePushToken = token;
    return token;
  } catch (error) {
    console.log('Expo push token unavailable', error);
    activePushToken = null;
    return null;
  }
}

export async function clearPushRegistration() {
  const token = activePushToken;
  activePushToken = null;
  if (!token) return;
  await notificationService.unregisterToken(token).catch(() => undefined);
}

async function readSeen(): Promise<SeenState> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_KEY);
    if (!raw) return { seeded: false, ids: [] };
    const parsed = JSON.parse(raw) as SeenState;
    if (!parsed || !Array.isArray(parsed.ids)) return { seeded: false, ids: [] };
    return {
      seeded: parsed.seeded === true,
      ids: parsed.ids.filter((id) => Number.isFinite(id)),
    };
  } catch {
    return { seeded: false, ids: [] };
  }
}

async function writeSeen(state: SeenState) {
  const ids = Array.from(new Set(state.ids.filter((id) => Number.isFinite(id)))).slice(-400);
  await AsyncStorage.setItem(SEEN_KEY, JSON.stringify({ seeded: state.seeded, ids }));
}

function enqueue(work: () => Promise<void>) {
  const run = writeChain.then(work, work);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function rememberNotification(id: number) {
  if (!Number.isFinite(id)) return Promise.resolve();
  return enqueue(async () => {
    const seen = await readSeen();
    if (seen.ids.includes(id)) return;
    await writeSeen({ seeded: seen.seeded, ids: [...seen.ids, id] });
  });
}

async function presentSystemNotification(item: Notification) {
  const Notifications = loadNotifications();
  if (!Notifications) return;

  await Notifications.scheduleNotificationAsync({
    identifier: `tms-${item.NotificationID}`,
    content: {
      title: item.Title,
      body: item.Body,
      sound: 'default',
      color: '#5B5BF7',
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: {
        notificationId: String(item.NotificationID),
        type: item.Type,
        entityType: item.EntityType ?? '',
        entityId: item.EntityID != null ? String(item.EntityID) : '',
      },
    },
    trigger: Platform.OS === 'android' ? { channelId: TASK_CHANNEL_ID } : null,
  });
}

async function doSync(present: boolean) {
  const Notifications = loadNotifications();
  if (!Notifications || Platform.OS === 'web') return;

  let response: { success: boolean; data: Notification[] };
  try {
    response = await notificationService.getNotifications();
  } catch (error) {
    console.log('System notification sync failed', error);
    return;
  }

  const items = Array.isArray(response?.data) ? response.data : [];
  const seen = await readSeen();
  const unread = items.filter((item) => !item.IsRead);

  if (!seen.seeded) {
    const cutoff = Date.now() - RECENT_WINDOW_MS;
    const recent = present
      ? unread.filter((item) => {
          const created = new Date(item.CreatedAt).getTime();
          return Number.isFinite(created) && created >= cutoff;
        })
      : [];

    if (recent.length > 0) {
      const allowed = await ensureNotificationPermission();
      if (allowed) {
        await ensureAndroidChannel();
        for (const item of recent) {
          await presentSystemNotification(item);
        }
      }
    }

    await writeSeen({ seeded: true, ids: items.map((item) => item.NotificationID) });
    return;
  }

  if (!present) return;

  const fresh = unread.filter((item) => !seen.ids.includes(item.NotificationID));
  if (fresh.length === 0) return;

  const allowed = await ensureNotificationPermission();
  if (!allowed) return;

  await ensureAndroidChannel();
  const presented: number[] = [];
  for (const item of fresh) {
    try {
      await presentSystemNotification(item);
      presented.push(item.NotificationID);
    } catch (error) {
      console.log('Failed to present system notification', error);
    }
  }

  if (presented.length === 0) return;
  await writeSeen({ seeded: true, ids: [...seen.ids, ...presented] });
}

export function syncSystemNotifications(present: boolean) {
  return enqueue(() => doSync(present));
}
