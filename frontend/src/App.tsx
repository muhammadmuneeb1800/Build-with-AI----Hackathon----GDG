import { Navigate, Route, Routes } from 'react-router-dom'

import { ToastProvider } from './providers/NotificationProvider'
import { appRoutes } from './navigation/route'
import { AddCommitmentPage, DashboardPage, IntegrationsPage, NotFoundPage, ProfilePage } from './pages'

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Navigate to={appRoutes.dashboard} replace />} />
        <Route path={appRoutes.dashboard} element={<DashboardPage />} />
        <Route path={appRoutes.add} element={<AddCommitmentPage />} />
        <Route path={appRoutes.integrations} element={<IntegrationsPage />} />
        <Route path={appRoutes.profile} element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ToastProvider>
  )
}

export default App
