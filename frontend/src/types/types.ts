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

/**
 * Integration Types
 */

export type IntegrationType = 'whatsapp' | 'email' | 'notion' | 'clickup' | 'calendar'

export interface ConfigField {
  id: string
  label: string
  type: 'text' | 'password' | 'email' | 'phone' | 'qrcode' | 'toggle'
  placeholder?: string
  required: boolean
  validation?: (value: string) => boolean
  helpText?: string
}

export interface IntegrationConfig {
  type: IntegrationType
  displayName: string
  description: string
  icon: string
  color: string
  isConfigurable: boolean
  configFields: ConfigField[]
}

export interface Integration {
  id: string
  userId: string
  type: IntegrationType
  displayName: string
  isConnected: boolean
  credentials?: Record<string, unknown>
  lastSynced?: string
  createdAt: string
  updatedAt: string
  config?: Record<string, unknown>
  syncFrequency?: 'manual' | 'hourly' | 'daily' | 'weekly'
  autoSync?: boolean
}

export interface IntegrationStatus {
  type: IntegrationType
  isConnected: boolean
  lastSynced?: string
  error?: string
  isTesting?: boolean
}

export interface ConnectionTestRequest {
  type: IntegrationType
  credentials: Record<string, string>
}

export interface ConnectionTestResponse {
  success: boolean
  message: string
  error?: string
  data?: {
    accountName?: string
    email?: string
    workspace?: string
  }
}

export interface UserPreferences {
  id: string
  userId: string
  notificationThreshold: 'all' | 'high' | 'critical'
  autoCreateCalendarEvents: boolean
  autoSyncInterval: number
  enableEmailNotifications: boolean
  enablePushNotifications: boolean
  timezone: string
  createdAt: string
  updatedAt: string
}

export interface IntegrationCardProps {
  integration: Integration
  config: IntegrationConfig
  onConnect: () => void
  onConfigure: () => void
  onDisconnect: () => void
  isLoading?: boolean
}

export interface ConnectionModalProps {
  integration: IntegrationConfig
  isOpen: boolean
  isLoading: boolean
  onConnect: (credentials: Record<string, string>) => Promise<void>
  onCancel: () => void
  initialCredentials?: Record<string, string>
}

export interface UseIntegrationsReturn {
  integrations: Integration[]
  integrationConfigs: Record<IntegrationType, IntegrationConfig>
  connectionStatuses: Record<IntegrationType, IntegrationStatus>
  isLoading: boolean
  error: string | null
  
  connectIntegration: (type: IntegrationType, credentials: Record<string, string>) => Promise<void>
  disconnectIntegration: (type: IntegrationType) => Promise<void>
  testConnection: (type: IntegrationType, credentials: Record<string, string>) => Promise<boolean>
  updateIntegration: (type: IntegrationType, config: Record<string, unknown>) => Promise<void>
  syncNow: (type: IntegrationType) => Promise<void>
  fetchIntegrations: () => Promise<void>
}

export interface AIPreferences {
  commitmentExtractionMode: 'aggressive' | 'moderate' | 'conservative'
  riskDetectionLevel: 'high' | 'medium' | 'low'
  dailyBriefTime: string
  priorityThreshold: 'all' | 'high' | 'medium' | 'low'
  autoReplyEnabled: boolean
  autoReplyTemplate?: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  timezone: string
  aiPreferences: AIPreferences
  integrations: Integration[]
  preferences: UserPreferences
  createdAt: string
  updatedAt: string
}