import { useEffect, useState, lazy, Suspense } from 'react'
import { Flex, Spinner, VStack, Text } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Shell } from '@/components/layout/Shell'
import { nexusApi } from '@/services/api'

// Lazy load pages for performance optimization
const Landing = lazy(() => import('@/pages/Landing').then(m => ({ default: m.Landing })));
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard }))); // Overview
const Discovery = lazy(() => import('@/pages/Discovery').then(m => ({ default: m.Discovery }))); // Visualizations
const AnalyticsGallery = lazy(() => import('@/pages/AnalyticsGallery').then(m => ({ default: m.AnalyticsGallery }))); // Analytics
const Library = lazy(() => import('@/pages/Library').then(m => ({ default: m.Library }))); // Library
const Chat = lazy(() => import('@/pages/Chat').then(m => ({ default: m.Chat }))); // Intelligence
const MLPipeline = lazy(() => import('@/pages/MLPipeline').then(m => ({ default: m.MLPipeline }))); // ML Pipeline
const Settings = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings }))); // Settings
const Logout = lazy(() => import('@/pages/Logout').then(m => ({ default: m.Logout })));
const DataUpload = lazy(() => import('@/pages/DataUpload').then(m => ({ default: m.DataUpload })));
const AuditLog = lazy(() => import('@/pages/AuditLog').then(m => ({ default: m.AuditLog })));


// Loading component for Suspense
const PageLoader = () => (
    <Flex h="100vh" w="100vw" align="center" justify="center" bg="bg.canvas">
        <VStack gap={4}>
            <Spinner size="xl" color="jungle-teal" borderWidth="4px" />
            <Text fontSize="xs" fontWeight="black" color="jungle-teal" letterSpacing="widest">INITIALIZING ENGINE...</Text>
        </VStack>
    </Flex>
);

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

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          {!isLoggedIn && (
            <>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}

          {/* Protected Routes */}
          {isLoggedIn && (
            <Route path="/*" element={
              <Shell userEmail={userEmail}>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/audit" element={<AuditLog />} />
                    
                    <Route path="/discovery" element={<Discovery layoutMode="network" />} />
                    <Route path="/discovery/:slug" element={<Discovery layoutMode="network" />} />
                    
                    <Route path="/analytics" element={<AnalyticsGallery />} />
                    
                    <Route path="/library" element={<Library />} />
                    <Route path="/library/:slug" element={<Library />} />
                    
                    <Route path="/chat" element={<Chat />} />
                    
                    <Route path="/ml-pipeline" element={<MLPipeline />} />
                    
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/upload" element={<DataUpload />} />
                    <Route path="/logout" element={<LogoutWrapper onLogout={handleLogout} />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Suspense>
              </Shell>
            } />
          )}
        </Routes>
      </Suspense>
    </Router>
  )
}

const LogoutWrapper = ({ onLogout }: { onLogout: () => void }) => {
  useEffect(() => {
    onLogout()
  }, [onLogout])
  return <Logout />
}

export default App
