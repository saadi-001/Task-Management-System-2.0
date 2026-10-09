import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { useNavigation } from '@react-navigation/native';
import type * as NotificationsType from 'expo-notifications';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const easProjectId = Constants.expoConfig?.extra?.eas?.projectId;

let Notifications: typeof NotificationsType | null = null;

if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Notifications?.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
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
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (isExpoGo || !Notifications || !user) {
      return;
    }

    let active = true;

    registerForPushNotificationsAsync().then((token) => {
      if (active && token) {
        notificationService
          .registerToken(token, Platform.OS, Device.modelName || 'unknown')
          .catch((error: unknown) =>
            console.log('Failed to register push token:', error),
          );
      }
    });

    // Covers tapping a notification when the app was terminated.
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (active && response) {
        openNotificationTarget(
          navigation,
          response.notification.request.content.data as Record<string, unknown>,
        );
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => console.log('Notification received:', notification.request.identifier),
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as Record<string, unknown>;
        const notificationId = Number(data?.notificationId);

        if (notificationId) {
          notificationService.markAsRead(notificationId).catch(() => undefined);
        }

        openNotificationTarget(navigation, data);
      },
    );

    return () => {
      active = false;
      notificationListener.current?.remove?.();
      responseListener.current?.remove?.();
    };
  }, [user, navigation]);

  return null;
}

async function registerForPushNotificationsAsync() {
  if (!Notifications || !Device.isDevice) return null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Task updates',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#5B5BF7',
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    const permission =
      existing.status === 'granted'
        ? existing
        : await Notifications.requestPermissionsAsync();

    if (permission.status !== 'granted') return null;

    return (
      await Notifications.getExpoPushTokenAsync(
        easProjectId ? { projectId: easProjectId } : undefined,
      )
    ).data;
  } catch (error) {
    console.log('Push notification registration failed:', error);
    return null;
  }
}
