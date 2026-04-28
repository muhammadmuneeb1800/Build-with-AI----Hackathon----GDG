/**
 * Integration configurations for all supported platforms
 * Define connection fields, icons, and display information
 */

import type { IntegrationConfig, IntegrationType } from '../types/types'

const integrationConfigs: Record<IntegrationType, IntegrationConfig> = {
  whatsapp: {
    type: 'whatsapp',
    displayName: 'WhatsApp',
    description: 'Connect WhatsApp using QR onboarding or API credentials',
    icon: '💬',
    color: '#25D366',
    isConfigurable: true,
    configFields: [
      {
        id: 'qr_placeholder',
        label: 'QR Connect (Placeholder)',
        type: 'qrcode',
        required: false,
        helpText: 'Use this placeholder until web QR session onboarding is enabled on backend.',
      },
      {
        id: 'whatsapp_api_key',
        label: 'WhatsApp API Key',
        type: 'password',
        placeholder: 'Enter your provider API key',
        required: true,
        helpText: 'Used when you connect via provider API credentials.',
      },
      {
        id: 'phone_number',
        label: 'Business Phone Number',
        type: 'phone',
        placeholder: '+1234567890',
        required: true,
        helpText: 'Include country code if using API based setup.',
      },
    ],
  },

  email: {
    type: 'email',
    displayName: 'Email (Gmail/SMTP)',
    description: 'Connect with OAuth2 flow or app-password based SMTP',
    icon: '📧',
    color: '#EA4335',
    isConfigurable: true,
    configFields: [
      {
        id: 'user_email',
        label: 'Gmail Address',
        type: 'email',
        placeholder: 'your.email@gmail.com',
        required: true,
        helpText: 'Your Gmail account email',
      },
      {
        id: 'app_password',
        label: 'App Password / OAuth Token',
        type: 'password',
        placeholder: 'Paste app password or access token',
        required: true,
        helpText: 'For Gmail use app password; for OAuth2 use short-lived access token.',
      },
    ],
  },

  notion: {
    type: 'notion',
    displayName: 'Notion',
    description: 'Sync tasks and commitments to your Notion workspace',
    icon: '🗂️',
    color: '#000000',
    isConfigurable: true,
    configFields: [
      {
        id: 'notion_api_key',
        label: 'Notion Internal Integration Token',
        type: 'password',
        placeholder: 'secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        required: true,
        helpText: 'Create an integration in Notion settings',
      },
      {
        id: 'notion_database_id',
        label: 'Notion Database ID',
        type: 'text',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        required: true,
        helpText: 'The ID of your tasks database',
      },
    ],
  },

  clickup: {
    type: 'clickup',
    displayName: 'ClickUp',
    description: 'Manage tasks in ClickUp and keep them synced',
    icon: '✓',
    color: '#7B68EE',
    isConfigurable: true,
    configFields: [
      {
        id: 'clickup_api_key',
        label: 'ClickUp API Key',
        type: 'password',
        placeholder: 'pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        required: true,
        helpText: 'Generate from ClickUp settings',
      },
      {
        id: 'clickup_list_id',
        label: 'ClickUp List ID',
        type: 'text',
        placeholder: 'xxxxxxx',
        required: true,
        helpText: 'The list where tasks will be created',
      },
      {
        id: 'clickup_team_id',
        label: 'ClickUp Team ID',
        type: 'text',
        placeholder: 'xxxxxxx',
        required: true,
        helpText: 'Your ClickUp team ID',
      },
    ],
  },

  calendar: {
    type: 'calendar',
    displayName: 'Google Calendar',
    description: 'Automatically create calendar events from deadlines',
    icon: '📅',
    color: '#4285F4',
    isConfigurable: true,
    configFields: [
      {
        id: 'calendar_api_key',
        label: 'Google Calendar API Key',
        type: 'password',
        placeholder: 'Enter your API key',
        required: true,
        helpText: 'Generate from Google Cloud Console',
      },
      {
        id: 'user_email',
        label: 'Google Account Email',
        type: 'email',
        placeholder: 'your.email@gmail.com',
        required: true,
        helpText: 'Your Google account email',
      },
      {
        id: 'auto_create_events',
        label: 'Auto-create Events from Commitments',
        type: 'toggle',
        required: false,
        helpText: 'Automatically add extracted commitments to calendar',
      },
    ],
  },

}

export default integrationConfigs

/**
 * Get configuration for a specific integration type
 */
export function getIntegrationConfig(type: IntegrationType): IntegrationConfig {
  return integrationConfigs[type]
}

/**
 * Get all integration configurations
 */
export function getAllIntegrationConfigs(): IntegrationConfig[] {
  return Object.values(integrationConfigs)
}

/**
 * Validate credentials against field requirements
 */
export function validateCredentials(
  type: IntegrationType,
  credentials: Record<string, string>
): { valid: boolean; errors: Record<string, string> } {
  const config = integrationConfigs[type]
  const errors: Record<string, string> = {}

  for (const field of config.configFields) {
    if (field.required && !credentials[field.id]) {
      errors[field.id] = `${field.label} is required`
    }

    if (credentials[field.id] && field.validation) {
      if (!field.validation(credentials[field.id])) {
        errors[field.id] = `Invalid format for ${field.label}`
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Get field metadata for rendering
 */
export function getFieldMetadata(type: IntegrationType, fieldId: string) {
  const config = integrationConfigs[type]
  return config.configFields.find((field) => field.id === fieldId)
}
