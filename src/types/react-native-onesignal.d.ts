declare module 'react-native-onesignal' {
  export enum LogLevel {
    None = 0,
    Fatal = 1,
    Error = 2,
    Warn = 3,
    Info = 4,
    Debug = 5,
    Verbose = 6
  }

  export interface OSNotification {
    notificationId: string;
    content: {
      title: string;
      body: string;
      additionalData?: Record<string, any>;
    };
    display(): void;
  }

  export interface NotificationClickEvent {
    notification: OSNotification;
    result: {
      actionId?: string;
    };
  }

  export interface NotificationWillDisplayEvent {
    preventDefault: () => void;
    getNotification: () => OSNotification;
    notification: OSNotification;
  }

  export interface DebugStatic {
    setLogLevel(level: LogLevel): void;
  }

  export interface NotificationsStatic {
    addEventListener<T extends keyof NotificationEventMap>(
      type: T,
      listener: (event: NotificationEventMap[T]) => void
    ): void;
    removeEventListener<T extends keyof NotificationEventMap>(
      type: T,
      listener: (event: NotificationEventMap[T]) => void
    ): void;
  }

  export interface UserStatic {
    getPushSubscription(): Promise<{ id: string }>;
  }

  export interface NotificationEventMap {
    click: NotificationClickEvent;
    foregroundWillDisplay: NotificationWillDisplayEvent;
  }

  const OneSignal: {
    Debug: DebugStatic;
    Notifications: NotificationsStatic;
    User: UserStatic;
    initialize(appId: string): void;
    login(externalId: string): void;
    logout(): void;
  };

  export default OneSignal;
}
