/**
 * ConnectionModal Component
 * Modal for connecting integrations and entering credentials
 */

import React, { useState } from 'react'
import type { ConnectionModalProps } from '../types/types'
import { validateCredentials } from '../config/integrations'

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  integration,
  isOpen,
  isLoading,
  onConnect,
  onCancel,
  initialCredentials,
}) => {
  const [credentials, setCredentials] = useState<Record<string, string>>(initialCredentials || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleChange = (fieldId: string, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [fieldId]: value,
    }))

    if (touched[fieldId]) {
      validateField(fieldId, value)
    }
  }

  const handleBlur = (fieldId: string) => {
    setTouched((prev) => ({
      ...prev,
      [fieldId]: true,
    }))
    validateField(fieldId, credentials[fieldId] || '')
  }

  const validateField = (fieldId: string, value: string) => {
    const field = integration.configFields.find((f) => f.id === fieldId)
    if (!field) return

    let error = ''
    if (field.required && !value) {
      error = `${field.label} is required`
    } else if (value && field.validation && !field.validation(value)) {
      error = `Invalid format for ${field.label}`
    } else if (field.type === 'email' && value && !value.includes('@')) {
      error = 'Invalid email format'
    } else if (field.type === 'phone' && value && !value.match(/^\+?[\d\s\-()]+$/)) {
      error = 'Invalid phone format'
    }

    setErrors((prev) => ({
      ...prev,
      [fieldId]: error,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const validation = validateCredentials(integration.type, credentials)
    if (!validation.valid) {
      setErrors(validation.errors)
      setTouched(
        Object.keys(validation.errors).reduce((acc, key) => {
          acc[key] = true
          return acc
        }, {} as Record<string, boolean>)
      )
      return
    }

    try {
      await onConnect(credentials)
    } catch (error) {
      console.error('Connection failed:', error)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/45 z-40"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl shadow-[var(--shadow-lg)] max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-surface)]">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{integration.icon}</span>
              <div>
                <h2 className="text-xl font-semibold">{integration.displayName}</h2>
                <p className="text-sm text-[var(--text-muted)]">{integration.description}</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-50"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {integration.configFields.map((field) => (
              <div key={field.id}>
                {/* Label */}
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>

                {/* Field */}
                {field.type === 'qrcode' ? (
                  <div className="rounded-md border border-dashed border-[var(--border-strong)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-muted)]">
                    QR onboarding placeholder: scanner integration will be enabled in a backend-ready follow-up.
                  </div>
                ) : field.type === 'toggle' ? (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={credentials[field.id] === 'true'}
                      onChange={(e) =>
                        handleChange(field.id, e.target.checked ? 'true' : 'false')
                      }
                      disabled={isLoading}
                      className="w-4 h-4 rounded border-[var(--border-strong)]"
                    />
                    <span className="text-sm text-[var(--text-secondary)]">{field.helpText}</span>
                  </label>
                ) : (
                  <input
                    type={field.type === 'phone' ? 'tel' : field.type}
                    placeholder={field.placeholder}
                    value={credentials[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    onBlur={() => handleBlur(field.id)}
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border rounded-md bg-[var(--bg-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50 ${
                      errors[field.id]
                        ? 'border-[var(--danger)]'
                        : 'border-[var(--border-strong)]'
                    }`}
                  />
                )}

                {/* Help Text */}
                {field.helpText && !errors[field.id] && (
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{field.helpText}</p>
                )}

                {/* Error Message */}
                {errors[field.id] && touched[field.id] && (
                  <p className="mt-1 text-xs text-[var(--danger)]">{errors[field.id]}</p>
                )}
              </div>
            ))}

            {/* Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="button button-ghost flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="button button-primary flex-1"
              >
                {isLoading ? 'Testing...' : 'Test & Connect'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default ConnectionModal
