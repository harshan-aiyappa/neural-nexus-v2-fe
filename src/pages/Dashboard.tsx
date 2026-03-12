import { Box, Heading, Text, VStack, SimpleGrid, Stat, HStack, Button, Badge, Circle } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';
import { LuZap, LuActivity, LuPlus, LuSearch } from 'react-icons/lu';

import { useState, useEffect } from 'react';
import { nexusApi } from '@/services/api';

export const Dashboard = () => {
    const cardBg = useColorModeValue('white', 'bg.surface');
    const borderColor = useColorModeValue('gray.100', 'border.subtle');
    const [stats, setStats] = useState({
        nodes: 0,
        extractions: 0,
        folders: 0,
        integrity: 99.8,
        growth: 0,
        label_counts: {} as Record<string, number>
    });

    const [activity, setActivity] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, activityData] = await Promise.all([
                    nexusApi.getStats(),
                    nexusApi.getActivity()
                ]);

                setStats({
                    nodes: statsData.nodes || 0,
                    extractions: statsData.documents || 0,
                    folders: statsData.folders || 0,
                    integrity: statsData.integrity || 99.8,
                    growth: statsData.growth || 0,
                    label_counts: statsData.label_counts || {}
                });

                setActivity(activityData);
            } catch (error) {
                console.error("Dashboard data fetch error:", error);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 30000); // 30s auto-refresh
        return () => clearInterval(interval);
    }, []);

    return (
        <Box px={8} py={10}>
            <VStack align="start" spaceY={10} w="full">
                {/* Header Section */}
                <HStack justifyContent="space-between" w="full">
                    <VStack align="start" spaceY={1}>
                        <Heading size="2xl" fontWeight="black" letterSpacing="tight">Command Center</Heading>
                        <Text color="gray.500">Global Knowledge Graph Overview</Text>
                    </VStack>
                    <HStack spaceX={3}>
                        <Button variant="ghost" size="sm" color="gray.500"><LuSearch /> Search Graph</Button>
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
                            <Stat.Label color="gray.500" fontWeight="bold" fontSize="xs" letterSpacing="widest" textTransform="uppercase">Knowledge Nodes</Stat.Label>
                            <Stat.ValueText fontSize="5xl" fontWeight="black" color="jungle-teal" my={2}>{stats.nodes.toLocaleString()}</Stat.ValueText>
                            <Stat.HelpText>
                                <Stat.UpIndicator color="turf-green" />
                                <Text as="span" fontWeight="bold" color="turf-green">{stats.growth}%</Text> expansion vs LW
                            </Stat.HelpText>
                        </Stat.Root>
                    </Box>

                    <Box p={8} bg={cardBg} rounded="3xl" border="1px solid" borderColor={borderColor} shadow="xl" position="relative" overflow="hidden">
                        <Circle size="60px" bg="turf-green" opacity="0.03" position="absolute" top="-10px" right="-10px" />
                        <Stat.Root>
                            <Stat.Label color="gray.500" fontWeight="bold" fontSize="xs" letterSpacing="widest" textTransform="uppercase">AI Extractions</Stat.Label>
                            <Stat.ValueText fontSize="5xl" fontWeight="black" color="turf-green" my={2}>{stats.extractions.toLocaleString()}</Stat.ValueText>
                            <Stat.HelpText>
                                <Stat.UpIndicator color="turf-green" />
                                <Text as="span" fontWeight="bold" color="turf-green">{stats.folders}</Text> active research folders
                            </Stat.HelpText>
                        </Stat.Root>
                    </Box>

                    <Box p={8} bg={cardBg} rounded="3xl" border="1px solid" borderColor={borderColor} shadow="xl" position="relative" overflow="hidden">
                        <Circle size="60px" bg="turf-green-3" opacity="0.03" position="absolute" top="-10px" right="-10px" />
                        <Stat.Root>
                            <Stat.Label color="gray.500" fontWeight="bold" fontSize="xs" letterSpacing="widest" textTransform="uppercase">Symmetry Integrity</Stat.Label>
                            <Stat.ValueText fontSize="5xl" fontWeight="black" color="turf-green-2" my={2}>{stats.integrity}%</Stat.ValueText>
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
                            <Heading size="xs" textTransform="uppercase" color="gray.500" letterSpacing="widest">Recent Activity</Heading>
                            <Button variant="plain" size="xs" color="jungle-teal">View Logs</Button>
                        </HStack>
                        <VStack align="stretch" spaceY={3}>
                            {activity.length > 0 ? activity.map((item, i) => (
                                <HStack key={i} p={4} bg={cardBg} rounded="2xl" border="1px solid" borderColor={borderColor} justifyContent="space-between" transition="all 0.2s" _hover={{ transform: 'translateX(5px)', borderColor: 'jungle-teal/30' }}>
                                    <HStack spaceX={4}>
                                        <Circle size="10" bg={`${item.color}/10`} color={item.color}>
                                            <LuActivity size="16px" />
                                        </Circle>
                                        <VStack align="start" spaceY={0}>
                                            <Text fontWeight="bold" fontSize="sm">{item.title}</Text>
                                            <Text fontSize="xs" color="gray.500">{item.type} • {item.result}</Text>
                                        </VStack>
                                    </HStack>
                                    <Text fontSize="10px" color="gray.600">{item.date}</Text>
                                </HStack>
                            )) : (
                                <Box p={6} textAlign="center" border="1px dashed" borderColor={borderColor} rounded="2xl" color="gray.400" fontSize="sm">
                                    No recent research activity detected
                                </Box>
                            )}
                        </VStack>
                    </VStack>

                    {/* Node Breakdown */}
                    <VStack align="stretch" spaceY={4} gridColumn={{ lg: 'span 2' }}>
                        <Heading size="xs" textTransform="uppercase" color="gray.500" letterSpacing="widest">Knowledge Breakdown</Heading>
                        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                            {Object.entries(stats.label_counts)
                                .filter(([label]) => !label.startsWith('Folder_'))
                                .map(([label, count]) => (
                                    <Box key={label} p={5} bg={cardBg} rounded="2xl" border="1px solid" borderColor={borderColor} shadow="sm">
                                        <Text fontSize="10px" fontWeight="black" color="jungle-teal" opacity={0.7} textTransform="uppercase">{label}</Text>
                                        <Text fontSize="2xl" fontWeight="black" mt={1}>{count}</Text>
                                    </Box>
                                ))}
                        </SimpleGrid>
                        {Object.keys(stats.label_counts).length === 0 && (
                            <Box p={10} textAlign="center" bg={cardBg} rounded="2xl" border="1px solid" borderColor={borderColor}>
                                < LuZap size="24px" color="gray" style={{ margin: '0 auto' }} />
                                <Text mt={2} color="gray.500" fontSize="sm">Awaiting graph data extraction...</Text>
                            </Box>
                        )}
                    </VStack>

                </SimpleGrid>
            </VStack>
        </Box>
    );
};
