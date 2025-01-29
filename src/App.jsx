import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CheckIn from './pages/CheckIn'
import CheckOut from './pages/CheckOut'
import VisitorReport from './pages/VisitorReport'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="pl-64 pt-16">
        {children}
      </main>
    </div>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/check-in"
            element={
              <PrivateRoute>
                <AppLayout>
                  <CheckIn />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/check-out"
            element={
              <PrivateRoute>
                <AppLayout>
                  <CheckOut />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <AppLayout>
                  <VisitorReport />
                </AppLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
