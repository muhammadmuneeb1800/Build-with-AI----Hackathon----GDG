/**
 * Toast Notification Provider and Hooks
 * 
 * Provides a global notification system using React Context and react-toastify.
 * All API responses, errors, and system events trigger notifications.
 */

import React, { createContext, useContext, useCallback} from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import type { NotificationCenterProps, NotificationConfig, NotificationContextType } from '../types/types'



const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

/**
 * ToastProvider Component
 * Wraps the application and provides notification functionality
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const showNotification = useCallback((config: NotificationConfig) => {
    const { type, title, message, duration = 4000 } = config
    
    const fullMessage = title ? `${title}: ${message}` : message
    
    const toastConfig = {
      position: 'top-right' as const,
      autoClose: duration,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    }

    switch (type) {
      case 'success':
        toast.success(fullMessage, toastConfig)
        break
      case 'error':
        toast.error(fullMessage, toastConfig)
        break
      case 'warning':
        toast.warning(fullMessage, toastConfig)
        break
      case 'info':
        toast.info(fullMessage, toastConfig)
        break
    }
  }, [])

  const showSuccess = useCallback((title: string, message: string) => {
    showNotification({ type: 'success', title, message })
  }, [showNotification])

  const showError = useCallback((title: string, message: string) => {
    showNotification({ type: 'error', title, message })
  }, [showNotification])

  const showWarning = useCallback((title: string, message: string) => {
    showNotification({ type: 'warning', title, message })
  }, [showNotification])

  const showInfo = useCallback((title: string, message: string) => {
    showNotification({ type: 'info', title, message })
  }, [showNotification])

  const value: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </NotificationContext.Provider>
  )
}

/**
 * useNotification Hook
 * Use this hook anywhere in your component tree to access notification methods
 * 
 * Example:
 * const { showSuccess, showError } = useNotification()
 * 
 * showSuccess("Success!", "Commitment created successfully")
 * showError("Error!", "Failed to create commitment")
 */
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a ToastProvider')
  }
  return context
}

/**
 * NotificationCenter Component
 * Displays a list of recent notifications from the backend
 */


export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkRead,
  onDelete,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
        return 'ⓘ'
      default:
        return '•'
    }
  }

  const getColorClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-500 text-green-900'
      case 'error':
        return 'bg-red-100 border-red-500 text-red-900'
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900'
      case 'info':
        return 'bg-blue-100 border-blue-500 text-blue-900'
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900'
    }
  }

  return (
    <div className="space-y-2">
      {notifications.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          No notifications yet
        </div>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification.id}
            className={`border-l-4 p-4 rounded ${getColorClass(
              notification.type
            )} ${notification.is_read ? 'opacity-75' : 'opacity-100'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <span className="text-xl font-bold">{getIcon(notification.type)}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{notification.title}</h3>
                  <p className="text-sm mt-1">{notification.message}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {notification.channel && (
                      <span className="text-xs bg-opacity-50 bg-gray-400 px-2 py-1 rounded">
                        {notification.channel}
                      </span>
                    )}
                    <span className="text-xs text-gray-600">
                      {new Date(notification.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {!notification.is_read && (
                  <button
                    onClick={() => onMarkRead(notification.id)}
                    className="text-xs px-2 py-1 hover:bg-gray-300 rounded"
                  >
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => onDelete(notification.id)}
                  className="text-xs px-2 py-1 hover:bg-gray-300 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
