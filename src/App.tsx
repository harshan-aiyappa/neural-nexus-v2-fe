import { useEffect, useRef, useState } from 'react'
import {
  Box, Container, Heading, Text, VStack, HStack, Circle,
  Flex, Input, Button, Textarea, Spinner, useToast
} from '@chakra-ui/react'
import { ColorModeButton, useColorModeValue } from '@/components/ui/provider' // Wait, check path
import { nexusApi } from '@/services/api'
import { NexusGraph } from '@/components/graph/3d/ForceGraph3D'
import gsap from 'gsap'

// Correction for provider/color-mode exports in Chakra v3
// If the previous file was src/components/ui/color-mode.tsx
import { useColorMode } from '@/components/ui/color-mode'

function App() {
  const headerRef = useRef(null)
  const [query, setQuery] = useState('')
  const [chatHistory, setChatHistory] = useState<{ role: string, text: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [graphData, setGraphData] = useState({
    nodes: [
      { id: 'Herb_A', label: 'Herb' },
      { id: 'Disease_X', label: 'Disease' },
      { id: 'Chemical_B', label: 'Chemical' }
    ],
    links: [
      { source: 'Herb_A', target: 'Disease_X', type: 'TREATS', isSymmetric: false },
      { source: 'Herb_A', target: 'Chemical_B', type: 'CONTAINS', isSymmetric: false },
      { source: 'Chemical_B', target: 'Herb_A', type: 'ASSOCIATED_WITH', isSymmetric: true }
    ]
  })

  useEffect(() => {
    gsap.from(headerRef.current, {
      y: -20,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    })
  }, [])

  const handleChat = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await nexusApi.chat(query);
      setChatHistory([...chatHistory, { role: 'user', text: query }, { role: 'ai', text: res.reply }]);
      setQuery('');
      // Optionally update graph with discovery context
      if (res.discovery_context && res.discovery_context.length > 0) {
        // Logic to merge new discovery paths into graphData could go here
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('white', 'slate.950')} color={useColorModeValue('slate.900', 'white')}>
      {/* Header / Brand Bar */}
      <Flex p={4} borderBottom="1px" borderColor="jungle-teal/20" justifyContent="space-between" alignItems="center">
        <HStack spaceX={3}>
          <Box
            w="40px" h="40px"
            bgGradient="to-br" gradientFrom="jungle-teal" gradientTo="turf-green"
            rounded="lg"
            display="flex" alignItems="center" justifyContent="center"
            shadow="lg"
          >
            {/* Nesso Logo Symbol Approximation */}
            <Box w="20px" h="20px" border="2px solid white" rounded="full" opacity="0.8" />
          </Box>
          <Heading size="md" letterSpacing="tight">Neural Nexus <Text as="span" color="turf-green">V2</Text></Heading>
        </HStack>
        <HStack spaceX={4}>
          <ColorModeButton />
        </HStack>
      </Flex>

      <Flex h="calc(100vh - 73px)" overflow="hidden">
        {/* Left Panel: Controls & Chat */}
        <VStack w="400px" borderRight="1px" borderColor="jungle-teal/10" p={6} spaceY={8} align="stretch" bg="black/5">
          <Box>
            <Heading size="xs" textTransform="uppercase" color="slate.500" mb={4}>Master Extraction</Heading>
            <VStack align="stretch" spaceY={3}>
              <Textarea placeholder="Paste scientific text here..." size="sm" rounded="xl" bg="white/5" borderColor="jungle-teal/20" />
              <Button colorScheme="green" bg="jungle-teal" size="sm" rounded="lg">Process with Gemini</Button>
            </VStack>
          </Box>

          <Box flex={1} display="flex" flexDirection="column">
            <Heading size="xs" textTransform="uppercase" color="slate.500" mb={4}>Discovery Chat</Heading>
            <Box flex={1} overflowY="auto" mb={4} spaceY={4} pr={2}>
              {chatHistory.map((chat, i) => (
                <Box key={i} p={3} rounded="2xl" bg={chat.role === 'user' ? 'jungle-teal/10' : 'white/5'}>
                  <Text fontSize="xs" fontWeight="bold" color={chat.role === 'user' ? 'jungle-teal' : 'turf-green'} mb={1}>
                    {chat.role === 'user' ? 'USER' : 'GEMINI 2.5'}
                  </Text>
                  <Text fontSize="sm">{chat.text}</Text>
                </Box>
              ))}
              {loading && <Flex justify="center"><Spinner size="sm" color="jungle-teal" /></Flex>}
            </Box>
            <HStack>
              <Input
                placeholder="Ask biological questions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                rounded="xl" size="sm"
                bg="white/5"
                borderColor="jungle-teal/20"
              />
              <Button size="sm" variant="ghost" color="jungle-teal" onClick={handleChat}>Send</Button>
            </HStack>
          </Box>
        </VStack>

        {/* Right Panel: The Graph */}
        <Box flex={1} position="relative" bg="slate.950">
          <Box position="absolute" top={6} left={6} zIndex={10} ref={headerRef}>
            <VStack align="start" spaceY={1}>
              <Heading size="lg" fontWeight="black" bgClip="text" bgGradient="to-r" gradientFrom="jungle-teal" gradientTo="turf-green">
                Interactive Knowledge Web
              </Heading>
              <Text fontSize="xs" color="slate.500" fontFamily="mono">BI-DIRECTIONAL DISCOVERY ENGINE</Text>
            </VStack>
          </Box>

          <Box w="full" h="full">
            <NexusGraph data={graphData} />
          </Box>

          {/* Legend Overlay */}
          <Box position="absolute" bottom={6} right={6} p={4} bg="black/40" backdropBlur="md" rounded="2xl" border="1px solid white/10">
            <VStack align="start" spaceY={2}>
              <HStack spaceX={2}>
                <Circle size="2" bg="jungle-teal" />
                <Text fontSize="2xs">Directed Relationship</Text>
              </HStack>
              <HStack spaceX={2}>
                <Box w="10px" h="1px" bg="white/30" />
                <Text fontSize="2xs">Symmetric Association</Text>
              </HStack>
            </VStack>
          </Box>
        </Box>
      </Flex>
    </Box>
  )
}

export default App
