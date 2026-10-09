# Master Notification System Architecture

This document summarizes the enterprise-grade notification system implemented natively within Task Management System 2.0.

## 1. Database & Architecture (Prisma/MySQL)
The backend natively supported `devicetoken` and `notification` entities. These models were securely integrated:
- **DeviceToken**: Tracks user tokens, platform, and active status.
- **Notification**: Stores the event type, title, body, entity details, and read status.
- **NotificationService**: Centralized backend controller handling logic (via `expo-server-sdk`) to chunk and securely push notifications.

## 2. Notification Triggers (Existing Logic)
Notifications are hooked strictly into EXISTING actions. No phantom systems were created.
1. **Ticket Assignment**: `ticketService.js` detects when `AssignedTo` is changed and sends `TICKET_ASSIGNED`.
2. **Ticket Status**: `ticketService.js` detects state changes (e.g. In Progress, Done) and sends `TICKET_STATUS_CHANGED`.

## 3. Expo Push Integration (Mobile)
- **AuthContext**: Upon successful login, the app requests OS-level Push permissions, retrieves the unique Expo Push Token, and syncs it with the backend via `notificationService.registerToken`.
- **Global Listener**: `AppNavigator.tsx` listens for notification taps. If the app is in the background, tapping the push notification instantly deep links to the corresponding screen using `entityType` and `entityId` (e.g., `TicketDetailsScreen`).
- **Foreground Handling**: `Notifications.setNotificationHandler` is configured to show heads-up alerts even if the user is currently using the app.

## 4. UI/UX Pro Max (Notification Center)
- **Dashboard Bell**: The `DashboardHeader` now features a notification bell with a dynamic unread badge count (e.g., `3`). It refetches automatically on focus.
- **Notifications Screen**: A premium, mobile-native screen `NotificationsScreen.tsx` built with Neural Core glassmorphism.
  - Groups notifications neatly.
  - Dynamic UI icons based on the event type (`folder`, `activity`, `user-plus`).
  - One-tap "Mark all as read".
  - Empty state illustrations.
  - Pull-to-refresh logic.

## 5. End-to-End Demo
**Device A (Admin):**
1. Admin logs in.
2. Modifies Ticket #25 (Assigns to User B or changes status).

**Device B (User B):**
1. Receives real push notification via Expo (e.g., "Ticket Assigned: You have been assigned Ticket #25").
2. User taps the push notification from lock screen.
3. App automatically opens `TicketDetailsScreen` specifically for Ticket #25.
