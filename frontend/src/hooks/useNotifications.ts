/**
 * useNotifications Hook
 * Manages fetching and updating notifications from the backend
 */

import { useEffect, useState, useCallback } from 'react'

import { useNotification } from '../providers/NotificationProvider'
import { axiosInstance } from '../utils/axiosInstance'

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  channel?: string
  is_read: boolean
  created_at: string
  updated_at: string
  related_commitment_id?: string
}

export const useNotifications = (pollInterval: number = 5000) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showError } = useNotification()

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axiosInstance.get('/notifications', {
        params: { unread_only: true, limit: 10 }
      })
      setNotifications(response.data)
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to fetch notifications'
      setError(message)
      showError('Error', message)
    } finally {
      setLoading(false)
    }
  }, [showError])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await axiosInstance.patch(`/notifications/${notificationId}`, {
        is_read: true
      })
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to mark notification as read'
      showError('Error', message)
    }
  }, [showError])

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await axiosInstance.post('/notifications/mark-all-read')
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      )
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to mark all as read'
      showError('Error', message)
    }
  }, [showError])

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`)
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      )
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to delete notification'
      showError('Error', message)
    }
  }, [showError])

  // Poll for new notifications
  useEffect(() => {
    fetchNotifications()

    const interval = setInterval(fetchNotifications, pollInterval)
    return () => clearInterval(interval)
  }, [fetchNotifications, pollInterval])

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount: notifications.filter((n) => !n.is_read).length
  }
}

/**
 * useNotificationHandler Hook
 * Utility hook for handling API responses and triggering notifications
 * 
 * Example:
 * const { handleSuccess, handleError } = useNotificationHandler()
 * 
 * try {
 *   const response = await api.post('/commitment/add', data)
 *   handleSuccess('Success', 'Commitment created')
 * } catch (error) {
 *   handleError('Error', error)
 * }
 */
export const useNotificationHandler = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotification()

  const handleSuccess = useCallback(
    (title: string, message: string) => {
      showSuccess(title, message)
    },
    [showSuccess]
  )

  const handleError = useCallback(
    (title: string, error: any) => {
      let message = 'An unknown error occurred'
      
      if (typeof error === 'string') {
        message = error
      } else if (error?.response?.data?.detail) {
        message = error.response.data.detail
      } else if (error?.message) {
        message = error.message
      }

      showError(title, message)
    },
    [showError]
  )

  const handleWarning = useCallback(
    (title: string, message: string) => {
      showWarning(title, message)
    },
    [showWarning]
  )

  const handleInfo = useCallback(
    (title: string, message: string) => {
      showInfo(title, message)
    },
    [showInfo]
  )

  return {
    handleSuccess,
    handleError,
    handleWarning,
    handleInfo
  }
}


