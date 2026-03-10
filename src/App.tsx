```javascript
import { useEffect, useRef } from 'react'
import { Box, Container, Heading, Text, VStack, HStack, Circle } from '@chakra-ui/react'
import { ColorModeButton, useColorModeValue } from '@/components/ui/color-mode'
import { NexusGraph } from '@/components/graph/3d/ForceGraph3D'
import gsap from 'gsap'

function App() {
  const headerRef = useRef(null)
  const cardRef = useRef(null)
  const bgGradient = useColorModeValue(
    'radial-gradient(circle at 50% 50%, #f1f5f9 0%, #e2e8f0 100%)',
    'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)'
  )

  // Mock data to demonstrate bi-directional logic
  const mockGraphData = {
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
  }

  useEffect(() => {
    const tl = gsap.timeline()
    tl.from(headerRef.current, {
      y: -50,
      opacity: 0,
      duration: 1.2,
      ease: 'power4.out'
    })
      .from(cardRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.5)'
      }, '-=0.5')
  }, [])

  return (
    <Box
      minH="100vh"
      bg={bgGradient}
      display="flex"
      flexDirection="column"
      transition="background 0.5s ease"
    >
      <Box p={4} display="flex" justifyContent="flex-end">
        <ColorModeButton />
      </Box>

      <Container maxW="container.xl" py={10}>
        <VStack spaceY={12} ref={headerRef} textAlign="center" w="full">
          <Heading
            as="h1"
            size="4xl"
            fontWeight="black"
            letterSpacing="tighter"
            bgClip="text"
            bgGradient="to-r"
            gradientFrom="jungle-teal"
            gradientTo="turf-green"
          >
            Neural Nexus V2
          </Heading>

          <Text fontSize="2xl" color="slate.400" fontWeight="medium">
            Next-Generation Knowledge Graph Intelligence
          </Text>

          <HStack w="full" spaceX={8} alignItems="start">
             {/* Left: Info Card */}
             <Box
                ref={cardRef}
                p={8}
                bg={useColorModeValue('white', 'slate.950')}
                rounded="3xl"
                borderWidth="1px"
                borderColor={useColorModeValue('jungle-teal/30', 'turf-green-deep/30')}
                shadow="2xl"
                w="450px"
                flexShrink={0}
              >
                <VStack spaceY={6} align="start">
                  <HStack spaceX={3}>
                    <Circle size="3" bg="jungle-teal" />
                    <Circle size="3" bg="turf-green" />
                    <Text fontFamily="mono" fontSize="xs" color="slate.500">
                      v2.0-STABLE
                    </Text>
                  </HStack>

                  <Heading size="md" color="turf-green">Dynamic Visualization</Heading>
                  <Text fontSize="sm" color="slate.400">
                    The V2 visual engine uses **Conditional Arrows**. Notice how directed facts (TREATS) have pointers, while associations (SIMILAR_TO) are clean lines.
                  </Text>

                  <Box h="1px" w="full" bg="slate.800/50" />

                  <VStack align="start" spaceY={4} w="full">
                    <HStack justifyContent="space-between" w="full">
                      <Text fontSize="xs" fontWeight="bold">Symmetry Guardian</Text>
                      <Text fontSize="xs" color="emerald.400">ACTIVE</Text>
                    </HStack>
                    <HStack justifyContent="space-between" w="full">
                      <Text fontSize="xs" fontWeight="bold">Native Indexing</Text>
                      <Text fontSize="xs" color="emerald.400">LABEL-NATIVE</Text>
                    </HStack>
                  </VStack>
                </VStack>
              </Box>

              {/* Right: The 3D Graph */}
              <Box flex={1}>
                <NexusGraph data={mockGraphData} />
              </Box>
          </HStack>
        </VStack>
      </Container>
    </Box>
  )
}

export default App
