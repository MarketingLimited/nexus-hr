import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Sidebar from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import Index from './pages/Index'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import LeaveManagement from './pages/LeaveManagement'
import Payroll from './pages/Payroll'
import Performance from './pages/Performance'
import Onboarding from './pages/Onboarding'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex">
          <Sidebar />
          <div className="flex-1">
            <Header />
            <main className="p-6">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/employees" element={
                  <ProtectedRoute requiredPermission="employees.read">
                    <Employees />
                  </ProtectedRoute>
                } />
                <Route path="/attendance" element={
                  <ProtectedRoute requiredPermission="attendance.read">
                    <Attendance />
                  </ProtectedRoute>
                } />
                <Route path="/leave" element={
                  <ProtectedRoute requiredPermission="leave.read">
                    <LeaveManagement />
                  </ProtectedRoute>
                } />
                <Route path="/payroll" element={
                  <ProtectedRoute requiredPermission="payroll.read">
                    <Payroll />
                  </ProtectedRoute>
                } />
                <Route path="/performance" element={
                  <ProtectedRoute requiredPermission="performance.read">
                    <Performance />
                  </ProtectedRoute>
                } />
                <Route path="/onboarding" element={
                  <ProtectedRoute requiredPermission="onboarding.read">
                    <Onboarding />
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute requiredRole="Admin">
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute requiredPermission="settings.read">
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>
          </div>
          <Toaster />
        </div>
      </ProtectedRoute>
    </ThemeProvider>
  )
}

export default App
