import { Navigate, Route, Routes } from 'react-router-dom'

import { appRoutes } from './navigation/route'
import { AddCommitmentPage, DashboardPage, NotFoundPage } from './pages'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={appRoutes.dashboard} replace />} />
      <Route path={appRoutes.dashboard} element={<DashboardPage />} />
      <Route path={appRoutes.add} element={<AddCommitmentPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
