import { AuthProvider } from './auth/AuthProvider'
import { ToastProvider } from './components/toast/ToastProvider'
import { useAuth } from './auth/useAuth'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'

function Routes() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <DashboardPage /> : <AuthPage />
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
