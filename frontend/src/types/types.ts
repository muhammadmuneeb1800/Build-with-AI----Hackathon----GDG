export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface NotificationConfig {
  type: NotificationType
  title: string
  message: string
  duration?: number
  commitmentId?: string
}

export interface NotificationContextType {
  showNotification: (config: NotificationConfig) => void
  showSuccess: (title: string, message: string) => void
  showError: (title: string, message: string) => void
  showWarning: (title: string, message: string) => void
  showInfo: (title: string, message: string) => void
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  channel?: string
  is_read: boolean
  created_at: string
  related_commitment_id?: string
}

export interface NotificationCenterProps {
  notifications: Notification[]
  onMarkRead: (notificationId: string) => void
  onDelete: (notificationId: string) => void
}