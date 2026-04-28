/**
 * useNotifications Hook
 * Manages fetching and updating notifications from the backend
 */

import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { useNotification } from './useNotification'
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

const NOTIFICATIONS_QUERY_KEY = ['notifications']

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = error as { response?: { data?: { detail?: string } } }
    return response.response?.data?.detail || fallback
  }

  return fallback
}

export const useNotifications = (pollInterval: number = 5000) => {
  const queryClient = useQueryClient()
  const { showError } = useNotification()

  const notificationsQuery = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      const response = await axiosInstance.get<Notification[]>('/notifications', {
        params: { unread_only: true, limit: 10 },
      })
      return response.data
    },
    refetchInterval: pollInterval,
  })

  const notifications = notificationsQuery.data ?? []

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await axiosInstance.patch(`/notifications/${notificationId}`, {
        is_read: true,
      })
      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (previous) =>
        (previous ?? []).map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification,
        ),
      )
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to mark notification as read')
      showError('Error', message)
    }
  }, [queryClient, showError])

  const markAllAsRead = useCallback(async () => {
    try {
      await axiosInstance.post('/notifications/mark-all-read')
      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (previous) =>
        (previous ?? []).map((notification) => ({ ...notification, is_read: true })),
      )
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to mark all as read')
      showError('Error', message)
    }
  }, [queryClient, showError])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`)
      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (previous) =>
        (previous ?? []).filter((notification) => notification.id !== notificationId),
      )
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to delete notification')
      showError('Error', message)
    }
  }, [queryClient, showError])

  const fetchNotifications = useCallback(async () => {
    await notificationsQuery.refetch()
  }, [notificationsQuery])

  return {
    notifications,
    loading: notificationsQuery.isLoading || notificationsQuery.isFetching,
    error: notificationsQuery.error instanceof Error ? notificationsQuery.error.message : null,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount: notifications.filter((notification) => !notification.is_read).length,
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
    (title: string, error: unknown) => {
      let message = 'An unknown error occurred'
      
      if (typeof error === 'string') {
        message = error
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = error as { response?: { data?: { detail?: string } } }
        message = response.response?.data?.detail || message
      } else if (error instanceof Error) {
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


