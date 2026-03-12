import { useEffect, useState } from 'react'
import { Box, Heading } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Shell } from '@/components/layout/Shell'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Library } from '@/pages/Library'
import { Discovery } from '@/pages/Discovery'
import { Chat } from '@/pages/Chat'
import { DataUpload } from '@/pages/DataUpload'
import { nexusApi } from '@/services/api'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('nexus_token'));
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('nexus_user') || '');

  const handleLogin = (email: string) => {
    localStorage.setItem('nexus_user', email)
    setIsLoggedIn(true)
    setUserEmail(email)
  }

  const handleLogout = () => {
    nexusApi.logout()
    localStorage.removeItem('nexus_user')
    setIsLoggedIn(false)
    setUserEmail('')
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Router>
      <Shell userEmail={userEmail}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/library" element={<Library />} />
          <Route path="/upload" element={<DataUpload />} />
          <Route path="/discovery" element={<Discovery layoutMode="network" />} />
          <Route path="/discovery/tree" element={<Discovery layoutMode="tree" />} />
          <Route path="/discovery/radial" element={<Discovery layoutMode="radial" />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/algorithms" element={<Box p={8}><Heading>Algorithms Coming Soon</Heading></Box>} />
          <Route path="/profile" element={<Box p={8}><Heading>Profile Management Coming Soon</Heading></Box>} />
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
