import { Box, Heading, Text, VStack, HStack, Circle, Flex, Input, Button, Badge, Icon } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';
import { useState, useRef, useEffect } from 'react';
import { LuSend, LuSearch as LuScanSearch, LuNetwork, LuInfinity, LuZap } from 'react-icons/lu';
import { NexusGraph } from '@/components/graph/3d/ForceGraph3D';
import gsap from 'gsap';

export const Discovery = () => {
    const [query, setQuery] = useState('');
    const headerRef = useRef(null);
    const chatRef = useRef(null);

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
        gsap.from(headerRef.current, { opacity: 0, x: -20, duration: 1, ease: 'power3.out' });
        gsap.from(chatRef.current, { opacity: 0, y: 20, duration: 1, delay: 0.5, ease: 'power3.out' });
    }, []);

    return (
        <Flex h="full" bg="bg.canvas" position="relative" overflow="hidden">
            {/* Graph Background */}
            <Box w="full" h="full" position="relative">
                <NexusGraph data={mockGraphData} />
                {/* Visual Overlay for Depth */}
                <Box position="absolute" top={0} left={0} w="full" h="full" bgGradient="radial" gradientFrom="transparent" gradientTo="black/40" pointerEvents="none" />
            </Box>

            {/* Floating UI: Header */}
            <Box position="absolute" top={10} left={10} zIndex={10} ref={headerRef}>
                <VStack align="start" spaceY={1}>
                    <HStack spaceX={3}>
                        <Box p={2} bg="jungle-teal" rounded="lg" shadow="xl">
                            <LuNetwork color="white" size="20px" />
                        </Box>
                        <VStack align="start" spaceY={0}>
                            <Heading size="lg" fontWeight="black" color={useColorModeValue('nesso-dark', 'white')} letterSpacing="tight">Graph Discovery</Heading>
                            <HStack spaceX={2}>
                                <Circle size="2" bg="turf-green" className="animate-pulse" />
                                <Text fontSize="10px" color="slate.500" fontWeight="black" letterSpacing="widest">BI-DIRECTIONAL TRAVERSAL ACTIVE</Text>
                            </HStack>
                        </VStack>
                    </HStack>
                </VStack>
            </Box>

            {/* Sidebar Controls (V1 Parity) */}
            <VStack position="absolute" top={10} right={10} spaceY={4} zIndex={10}>
                <VStack bg={useColorModeValue('white/80', 'black/40')} p={2} rounded="2xl" border="1px solid" borderColor="border.subtle" backdropBlur="md" spaceY={2}>
                    <Button variant="ghost" p={2} rounded="xl" h="10" w="10" color={useColorModeValue('nesso-dark', 'white')} _hover={{ bg: 'jungle-teal/20', color: 'jungle-teal' }}>
                        <LuInfinity />
                    </Button>
                    <Button variant="ghost" p={2} rounded="xl" h="10" w="10" color={useColorModeValue('nesso-dark', 'white')} _hover={{ bg: 'jungle-teal/20', color: 'jungle-teal' }}>
                        <LuZap />
                    </Button>
                </VStack>
            </VStack>

            {/* Discovery Chat Bot */}
            <VStack
                ref={chatRef}
                position="absolute"
                bottom={10}
                left={10}
                w="450px"
                p={8}
                bg={useColorModeValue('white/80', 'black/60')}
                backdropBlur="30px"
                rounded="4xl"
                border="1px solid"
                borderColor="border.subtle"
                shadow="2xl"
                align="stretch"
                spaceY={6}
            >
                <HStack justifyContent="space-between">
                    <HStack spaceX={3}>
                        <Icon as={LuScanSearch} color="turf-green" w={5} h={5} />
                        <VStack align="start" spaceY={0}>
                            <Text fontSize="xs" fontWeight="black" color="turf-green" letterSpacing="widest">AI DISCOVERY</Text>
                            <Text fontSize="10px" color="slate.500">Nesso Intelligence Model</Text>
                        </VStack>
                    </HStack>
                    <Badge colorPalette="green" variant="subtle" fontSize="9px" rounded="md">GEMINI 2.5</Badge>
                </HStack>

                <Box h="180px" overflowY="auto" pr={2} spaceY={4}>
                    <Box p={4} bg="white/5" rounded="2xl" border="1px solid" borderColor="white/5">
                        <Text fontSize="xs" color="slate.300" lineHeight="tall">
                            Global Master Standards initialized. Symmetry integrity verified.
                            <br /><br />
                            Try: "What chemicals in Herb-A are associated with Disease-X?"
                        </Text>
                    </Box>
                </Box>

                <HStack spaceX={3}>
                    <Input
                        placeholder="Establish traversal query..."
                        h="52px"
                        rounded="2xl"
                        bg="white/5"
                        border="1px solid"
                        borderColor="white/10"
                        _focus={{ borderColor: 'jungle-teal', bg: 'white/10' }}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        fontSize="sm"
                    />
                    <Button bg="jungle-teal" color="white" w="52px" h="52px" rounded="2xl" shadow="lg" _hover={{ bg: 'turf-green' }}>
                        <LuSend size="18px" />
                    </Button>
                </HStack>
            </VStack>

            {/* Legend & Stats Overlay */}
            <VStack position="absolute" bottom={10} right={10} align="end" spaceY={3}>
                <Box p={5} bg={useColorModeValue('white/80', 'black/40')} backdropBlur="xl" rounded="2xl" border="1px solid" borderColor="border.subtle">
                    <VStack align="start" spaceY={3}>
                        <HStack spaceX={3}>
                            <Circle size="2" bg="jungle-teal" />
                            <Text fontSize="10px" color={useColorModeValue('slate.700', 'slate.300')} fontWeight="bold" letterSpacing="wide">Directed Dependency</Text>
                        </HStack>
                        <HStack spaceX={3}>
                            <Box w="12px" h="1.5px" bg="turf-green" opacity="0.6" rounded="full" />
                            <Text fontSize="10px" color={useColorModeValue('slate.700', 'slate.300')} fontWeight="bold" letterSpacing="wide">Symmetric Association</Text>
                        </HStack>
                        <HStack spaceX={3}>
                            <Box w="12px" h="1.5px" bg="turf-green-3" rounded="full" />
                            <Text fontSize="10px" color={useColorModeValue('slate.700', 'slate.300')} fontWeight="bold" letterSpacing="wide">Scientific Label</Text>
                        </HStack>
                    </VStack>
                </Box>
            </VStack>
        </Flex>
    );
};
