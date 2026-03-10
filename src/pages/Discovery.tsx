import { Box, Heading, Text, VStack, HStack, Circle, Flex, Input, Button, Spinner } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';
import { useState, useRef, useEffect } from 'react';
import { LuSend, LuScanSearch } from 'react-icons/lu';
import { NexusGraph } from '@/components/graph/3d/ForceGraph3D';
import gsap from 'gsap';

export const Discovery = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const headerRef = useRef(null);

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
    };

    useEffect(() => {
        gsap.from(headerRef.current, {
            opacity: 0,
            x: -20,
            duration: 1,
            ease: 'power3.out'
        });
    }, []);

    return (
        <Flex h="full" bg="slate.950" position="relative" overflow="hidden">
            {/* Graph Background */}
            <Box w="full" h="full">
                <NexusGraph data={mockGraphData} />
            </Box>

            {/* Float UI: Header */}
            <Box position="absolute" top={10} left={10} zIndex={10} ref={headerRef}>
                <VStack align="start" spaceY={1}>
                    <HStack spaceX={3}>
                        <Circle size="3" bg="jungle-teal" />
                        <Heading size="lg" fontWeight="black" color="white" letterSpacing="tight">Graph Discovery</Heading>
                    </HStack>
                    <Text fontSize="xs" color="slate.500" fontFamily="mono" tracking="widest">BI-DIRECTIONAL TRAVERSAL ENGINE</Text>
                </VStack>
            </Box>

            {/* Float UI: Discovery Chat Bot */}
            <VStack
                position="absolute"
                bottom={10}
                left={10}
                w="450px"
                p={6}
                bg="black/60"
                backdropBlur="xl"
                rounded="3xl"
                border="1px solid"
                borderColor="jungle-teal/20"
                shadow="2xl"
                align="stretch"
                spaceY={4}
            >
                <HStack justifyContent="space-between">
                    <HStack spaceX={2}>
                        <Icon as={LuScanSearch} color="turf-green" />
                        <Text fontSize="xs" fontWeight="bold" color="turf-green" tracking="widest">AI DISCOVERY</Text>
                    </HStack>
                    <Badge variant="outline" colorScheme="green" fontSize="9px">GEMINI 2.5</Badge>
                </HStack>

                <Box h="150px" overflowY="auto" pr={2} spaceY={3}>
                    <Box p={3} bg="white/5" rounded="2xl">
                        <Text fontSize="xs" color="slate.400">System initialized. Ready for undirected RAG traversal. Ask about hidden mechanism connections.</Text>
                    </Box>
                </Box>

                <HStack>
                    <Input
                        placeholder="Ask about relationships..."
                        size="sm"
                        rounded="xl"
                        bg="white/5"
                        border="none"
                        _focus={{ bg: 'white/10' }}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button bg="jungle-teal" color="white" size="sm" rounded="xl" shadow="lg">
                        <LuSend size="14px" />
                    </Button>
                </HStack>
            </VStack>

            {/* Legend Overlay */}
            <Box position="absolute" bottom={10} right={10} p={4} bg="black/40" backdropBlur="md" rounded="2xl" border="1px solid white/10">
                <VStack align="start" spaceY={2}>
                    <HStack spaceX={3}>
                        <Circle size="2" bg="jungle-teal" />
                        <Text fontSize="10px" color="slate.300" tracking="wide">Directed Dependency</Text>
                    </HStack>
                    <HStack spaceX={3}>
                        <Box w="12px" h="1px" bg="white/30" />
                        <Text fontSize="10px" color="slate.300" tracking="wide">Symmetric Association</Text>
                    </HStack>
                </VStack>
            </Box>
        </Flex>
    );
};
