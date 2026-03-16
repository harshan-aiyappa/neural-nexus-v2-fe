import { useEffect, useState, lazy, Suspense } from 'react'
import { Box, Heading, VStack, Text, HStack, Icon, Flex, Spinner } from '@chakra-ui/react'
import { LuCpu, LuUser } from 'react-icons/lu'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Shell } from '@/components/layout/Shell'
import { nexusApi } from '@/services/api'

// Lazy load pages for performance optimization
const Landing = lazy(() => import('@/pages/Landing').then(m => ({ default: m.Landing })));
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Library = lazy(() => import('@/pages/Library').then(m => ({ default: m.Library })));
const Discovery = lazy(() => import('@/pages/Discovery').then(m => ({ default: m.Discovery })));
const Chat = lazy(() => import('@/pages/Chat').then(m => ({ default: m.Chat })));
const AuditLog = lazy(() => import('@/pages/AuditLog').then(m => ({ default: m.AuditLog })));
const AnalyticsGallery = lazy(() => import('@/pages/AnalyticsGallery').then(m => ({ default: m.AnalyticsGallery })));
const Logout = lazy(() => import('@/pages/Logout').then(m => ({ default: m.Logout })));
const DataUpload = lazy(() => import('@/pages/DataUpload').then(m => ({ default: m.DataUpload })));
const Settings = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })));

// Loading component for Suspense
const PageLoader = () => (
  <Flex h="100vh" w="100vw" align="center" justify="center" bg="bg.canvas">
    <Spinner size="xl" color="jungle-teal" />
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
                    <Route path="/library" element={<Library />} />
                    <Route path="/library/:slug" element={<Library />} />
                    <Route path="/upload" element={<DataUpload />} />
                    <Route path="/discovery" element={<Discovery layoutMode="network" />} />
                    <Route path="/discovery/:slug" element={<Discovery layoutMode="network" />} />
                    <Route path="/discovery/tree/:slug" element={<Discovery layoutMode="tree" />} />
                    <Route path="/discovery/radial/:slug" element={<Discovery layoutMode="radial" />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/dashboard/audit" element={<AuditLog />} />
                    <Route path="/analytics" element={<AnalyticsGallery />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/algorithms" element={
                      <Box p={8} h="full">
                        <VStack align="start" gap={4}>
                          <HStack gap={3}>
                            <Icon as={LuCpu} size="xl" color="jungle-teal" />
                            <Heading size="3xl" fontWeight="black" color="fg">Algorithms</Heading>
                          </HStack>
                          <Text color="jungle-teal" fontWeight="black" letterSpacing="widest">INTELLIGENCE ENGINE COMING SOON</Text>
                        </VStack>
                      </Box>
                    } />
                    <Route path="/profile" element={
                      <Box p={8} h="full">
                        <VStack align="start" gap={4}>
                          <HStack gap={3}>
                            <Icon as={LuUser} size="xl" color="jungle-teal" />
                            <Heading size="3xl" fontWeight="black" color="fg">Researcher Profile</Heading>
                          </HStack>
                          <Text color="jungle-teal" fontWeight="black" letterSpacing="widest">IDENTITY MANAGEMENT COMING SOON</Text>
                        </VStack>
                      </Box>
                    } />
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
