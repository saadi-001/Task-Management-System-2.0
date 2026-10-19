import React, { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import * as Device from 'expo-device';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import {
  clearPushRegistration,
  ensureAndroidChannel,
  ensureNotificationPermission,
  rememberNotification,
  registerExpoPushToken,
  syncSystemNotifications,
} from '../../services/systemNotificationService';
import {
  registerNotificationSyncTask,
  unregisterNotificationSyncTask,
} from '../../tasks/notificationSyncTask';
import { useNavigation } from '@react-navigation/native';
import type * as NotificationsType from 'expo-notifications';

let Notifications: typeof NotificationsType | null = null;

if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
  } catch {
    console.log('Failed to load expo-notifications');
  }
}

const openNotificationTarget = (
  navigation: any,
  data: Record<string, unknown> | undefined,
) => {
  const entityType = String(data?.entityType || '').toUpperCase();
  const entityId = Number(data?.entityId);

  if (entityType === 'TICKET' && entityId) {
    navigation.navigate('TicketDetails', { ticketId: entityId });
  } else if (entityType === 'PROJECT' && entityId) {
    navigation.navigate('ProjectDetails', { projectId: entityId });
  } else if (entityType === 'ORGANIZATION' && entityId) {
    navigation.navigate('OrganizationDetails', { organizationId: entityId });
  } else {
    navigation.navigate('Notifications');
  }
};

export default function NotificationManager() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const notificationListener = useRef<{ remove: () => void } | null>(null);
  const responseListener = useRef<{ remove: () => void } | null>(null);
  const pushReady = useRef(false);

  useEffect(() => {
    if (!user) {
      pushReady.current = false;
      unregisterNotificationSyncTask().catch(() => undefined);
      clearPushRegistration().catch(() => undefined);
      return;
    }

    let active = true;
    let interval: ReturnType<typeof setInterval> | undefined;

    const start = async () => {
      await ensureAndroidChannel();
      const granted = await ensureNotificationPermission();
      if (!active) return;

      const pushToken = await registerExpoPushToken();
      if (!active) {
        await clearPushRegistration();
        return;
      }

      pushReady.current = !!pushToken;

      if (pushToken) {
        await notificationService
          .registerToken(pushToken, Platform.OS, Device.modelName || 'unknown')
          .catch((error: unknown) => console.log('Failed to register push token:', error));
        await unregisterNotificationSyncTask().catch(() => undefined);
      } else if (granted) {
        await registerNotificationSyncTask().catch((error: unknown) =>
          console.log('Failed to register notification sync:', error),
        );
      }

      await syncSystemNotifications(!pushToken);

      if (!active || pushToken) return;
      interval = setInterval(() => {
        syncSystemNotifications(true).catch(() => undefined);
      }, 15000);
    };

    start().catch((error: unknown) => console.log('Notification setup failed:', error));

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && state !== 'background') return;
      syncSystemNotifications(!pushReady.current).catch(() => undefined);
    });

    return () => {
      active = false;
      if (interval) clearInterval(interval);
      appStateSub.remove();
    };
  }, [user]);

  useEffect(() => {
    if (!Notifications || !user) return;

    let active = true;

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!active || !response) return;
      openNotificationTarget(
        navigation,
        response.notification.request.content.data as Record<string, unknown>,
      );
    });

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data as Record<string, unknown>;
      const notificationId = Number(data?.notificationId);
      if (notificationId) {
        rememberNotification(notificationId).catch(() => undefined);
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown>;
      const notificationId = Number(data?.notificationId);

      if (notificationId) {
        rememberNotification(notificationId).catch(() => undefined);
        notificationService.markAsRead(notificationId).catch(() => undefined);
      }

      openNotificationTarget(navigation, data);
    });

    return () => {
      active = false;
      notificationListener.current?.remove?.();
      responseListener.current?.remove?.();
    };
  }, [user, navigation]);

  return null;
}
