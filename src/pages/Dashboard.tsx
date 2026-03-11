import { Box, Heading, Text, VStack, SimpleGrid, Stat, HStack, Icon, Button, Badge, Circle } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';
import { LuZap, LuActivity, LuNetwork, LuPlus, LuSearch } from 'react-icons/lu';

export const Dashboard = () => {
    const cardBg = useColorModeValue('white', 'bg.surface');
    const borderColor = useColorModeValue('gray.100', 'border.subtle');

    const activity = [
        { type: 'Extraction', title: 'Molecular Bindings PDF', result: '32 Nodes', date: '5m ago', color: 'jungle-teal' },
        { type: 'Discovery', title: 'Symmetry Check: Herb-A', result: 'Verified', date: '1h ago', color: 'turf-green' },
        { type: 'Ingestion', title: 'Folder: Clinical Data', result: '12 Files', date: '2h ago', color: 'turf-green-3' },
    ];

    return (
        <Box px={8} py={10}>
            <VStack align="start" spaceY={10} w="full">
                {/* Header Section */}
                <HStack justifyContent="space-between" w="full">
                    <VStack align="start" spaceY={1}>
                        <Heading size="2xl" fontWeight="black" letterSpacing="tight">Command Center</Heading>
                        <Text color="slate.500">Global Knowledge Graph Overview</Text>
                    </VStack>
                    <HStack spaceX={3}>
                        <Button variant="ghost" size="sm" color="slate.500"><LuSearch /> Search Graph</Button>
                        <Button bg="jungle-teal" color="white" rounded="xl" shadow="lg" p={6} _hover={{ bg: 'turf-green', transform: 'translateY(-2px)' }} transition="all 0.2s">
                            <LuPlus /> New Extraction
                        </Button>
                    </HStack>
                </HStack>

                {/* Primary Stats */}
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} w="full">
                    <Box p={8} bg={cardBg} rounded="3xl" border="1px solid" borderColor={borderColor} shadow="xl" position="relative" overflow="hidden">
                        <Circle size="60px" bg="jungle-teal" opacity="0.03" position="absolute" top="-10px" right="-10px" />
                        <Stat.Root>
                            <Stat.Label color="slate.500" fontWeight="bold" fontSize="xs" letterSpacing="widest" textTransform="uppercase">Knowledge Nodes</Stat.Label>
                            <Stat.ValueText fontSize="5xl" fontWeight="black" color="jungle-teal" my={2}>1,284</Stat.ValueText>
                            <Stat.HelpText>
                                <Stat.UpIndicator color="turf-green" />
                                <Text as="span" fontWeight="bold" color="turf-green">23%</Text> expansion vs LW
                            </Stat.HelpText>
                        </Stat.Root>
                    </Box>

                    <Box p={8} bg={cardBg} rounded="3xl" border="1px solid" borderColor={borderColor} shadow="xl" position="relative" overflow="hidden">
                        <Circle size="60px" bg="turf-green" opacity="0.03" position="absolute" top="-10px" right="-10px" />
                        <Stat.Root>
                            <Stat.Label color="slate.500" fontWeight="bold" fontSize="xs" letterSpacing="widest" textTransform="uppercase">AI Extractions</Stat.Label>
                            <Stat.ValueText fontSize="5xl" fontWeight="black" color="turf-green" my={2}>412</Stat.ValueText>
                            <Stat.HelpText>
                                <Stat.UpIndicator color="turf-green" />
                                <Text as="span" fontWeight="bold" color="turf-green">12</Text> processed today
                            </Stat.HelpText>
                        </Stat.Root>
                    </Box>

                    <Box p={8} bg={cardBg} rounded="3xl" border="1px solid" borderColor={borderColor} shadow="xl" position="relative" overflow="hidden">
                        <Circle size="60px" bg="turf-green-3" opacity="0.03" position="absolute" top="-10px" right="-10px" />
                        <Stat.Root>
                            <Stat.Label color="slate.500" fontWeight="bold" fontSize="xs" letterSpacing="widest" textTransform="uppercase">Symmetry Integrity</Stat.Label>
                            <Stat.ValueText fontSize="5xl" fontWeight="black" color="turf-green-2" my={2}>99.8%</Stat.ValueText>
                            <Stat.HelpText>
                                <Badge colorPalette="green" variant="subtle" rounded="md" fontSize="10px">Guardian Active</Badge>
                            </Stat.HelpText>
                        </Stat.Root>
                    </Box>
                </SimpleGrid>

                {/* Main Content Grid */}
                <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8} w="full">
                    {/* Activity Log */}
                    <VStack align="stretch" spaceY={4} gridColumn={{ lg: 'span 1' }}>
                        <HStack justifyContent="space-between">
                            <Heading size="xs" textTransform="uppercase" color="slate.500" letterSpacing="widest">Recent Activity</Heading>
                            <Button variant="plain" size="xs" color="jungle-teal">View Logs</Button>
                        </HStack>
                        <VStack align="stretch" spaceY={3}>
                            {activity.map((item, i) => (
                                <HStack key={i} p={4} bg={cardBg} rounded="2xl" border="1px solid" borderColor={borderColor} justifyContent="space-between" transition="all 0.2s" _hover={{ transform: 'translateX(5px)', borderColor: 'jungle-teal/30' }}>
                                    <HStack spaceX={4}>
                                        <Circle size="10" bg={`${item.color}/10`} color={item.color}>
                                            <LuActivity size="16px" />
                                        </Circle>
                                        <VStack align="start" spaceY={0}>
                                            <Text fontWeight="bold" fontSize="sm">{item.title}</Text>
                                            <Text fontSize="xs" color="slate.500">{item.type} • {item.result}</Text>
                                        </VStack>
                                    </HStack>
                                    <Text fontSize="10px" color="slate.600">{item.date}</Text>
                                </HStack>
                            ))}
                        </VStack>
                    </VStack>

                    {/* Graph Insight Preview */}
                    <Box gridColumn={{ lg: 'span 2' }} p={8} bg={cardBg} rounded="4xl" border="1px solid" borderColor={borderColor} shadow="2xl" position="relative" overflow="hidden">
                        <Box position="absolute" top={0} left={0} w="full" h="full" bgGradient="to-br" gradientFrom="jungle-teal/5" gradientTo="transparent" pointerEvents="none" />
                        <VStack align="start" spaceY={6} h="full">
                            <HStack w="full" justifyContent="space-between">
                                <HStack spaceX={3}>
                                    <Icon as={LuNetwork} color="jungle-teal" w={6} h={6} />
                                    <VStack align="start" spaceY={0}>
                                        <Heading size="md">Graph Intelligence</Heading>
                                        <Text fontSize="xs" color="slate.500">Live preview of knowledge clusters</Text>
                                    </VStack>
                                </HStack>
                                <Button size="sm" variant="outline" rounded="xl" color="jungle-teal">Open Discoverer</Button>
                            </HStack>

                            <Box w="full" flex={1} bg="black/5" rounded="3xl" border="1px dashed" borderColor="slate.800" display="flex" alignItems="center" justifyContent="center">
                                <VStack spaceY={2}>
                                    <LuZap size="24px" className="text-jungle-teal opacity-30" />
                                    <Text color="slate.600" fontSize="xs" fontFamily="mono">INITIALIZING NEURAL VISUALIZER...</Text>
                                </VStack>
                            </Box>
                        </VStack>
                    </Box>
                </SimpleGrid>
            </VStack>
        </Box>
    );
};
