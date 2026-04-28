import { createContext } from 'react'

import type { NotificationContextType } from '../types/types'

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined)