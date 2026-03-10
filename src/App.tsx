import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Shell } from '@/components/layout/Shell'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Library } from '@/pages/Library'
import { Discovery } from '@/pages/Discovery'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const savedEmail = localStorage.getItem('nexus_user')
    if (savedEmail) {
      setIsLoggedIn(true)
      setUserEmail(savedEmail)
    }
  }, [])

  const handleLogin = (email: string) => {
    localStorage.setItem('nexus_user', email)
    setIsLoggedIn(true)
    setUserEmail(email)
  }

  const handleLogout = () => {
    localStorage.removeItem('nexus_user')
    setIsLoggedIn(false)
    setUserEmail('')
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Router>
      <Shell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/library" element={<Library />} />
          <Route path="/discovery" element={<Discovery />} />
          <Route path="/logout" element={<LogoutRedirect onLogout={handleLogout} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </Router>
  )
}

const LogoutRedirect = ({ onLogout }: { onLogout: () => void }) => {
  useEffect(() => {
    onLogout()
  }, [onLogout])
  return <Navigate to="/" replace />
}

export default App
