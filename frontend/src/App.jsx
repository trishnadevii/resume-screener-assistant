
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import NewScreening from './pages/NewScreening'
import History from './pages/History'
import ReportDetail from './pages/ReportDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />

          <Route
            path="/new-screening"
            element={<NewScreening />}
          />

          <Route
            path="/history"
            element={<History />}
          />

          <Route
            path="/history/:id"
            element={<ReportDetail />}
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
