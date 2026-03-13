import { Box, Heading, Text, VStack, SimpleGrid, Stat, HStack, Button, Badge, Circle, useDisclosure } from '@chakra-ui/react';
import { LuZap, LuActivity, LuPlus, LuSearch, LuSettings } from 'react-icons/lu';
import { useState, useEffect, useRef } from 'react';
import { nexusApi } from '@/services/api';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoaders';
import gsap from 'gsap';

export const Dashboard = () => {
    const { open, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

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

                setActivity(activityData || []);
            } catch (error) {
                console.error("Dashboard data fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Entrance Animation when loading finishes
    useEffect(() => {
        if (!loading && containerRef.current) {
            gsap.fromTo(".dash-card", 
                { y: 30, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 0.8, 
                    stagger: 0.1, 
                    ease: "power3.out",
                    clearProps: "all" 
                }
            );
        }
    }, [loading]);

    if (loading) return <Box p={8}><DashboardSkeleton /></Box>;

    return (
        <Box px={8} py={10} ref={containerRef}>
            <VStack align="start" spaceY={10} w="full">
                {/* Header Section */}
                <HStack justifyContent="space-between" w="full" className="dash-card">
                    <VStack align="start" spaceY={1}>
                        <Heading size="2xl" fontWeight="black" letterSpacing="tight" color="fg">Command Center</Heading>
                        <Text color="fg.muted" fontSize="sm">Global Knowledge Graph Overview</Text>
                    </VStack>
                    <HStack spaceX={3}>
                        <Button variant="ghost" size="sm" color="fg.muted" onClick={onOpen} _hover={{ bg: "bg.muted" }}>
                            <LuSettings /> Settings
                        </Button>
                        <Button variant="ghost" size="sm" color="fg.muted" _hover={{ bg: "brand.subtle" }}>
                            <LuSearch /> Search Graph
                        </Button>
                        <Button 
                            bg="turf-green" 
                            color="white" 
                            rounded="xl" 
                            shadow="premium" 
                            px={6} h="56px" 
                            _hover={{ bg: 'brand.turf-2', transform: 'translateY(-2px)' }} 
                            transition="all 0.2s"
                        >
                            <LuPlus /> New Extraction
                        </Button>
                    </HStack>
                </HStack>
                
                <SettingsModal isOpen={open} onClose={onClose} />

                {/* Primary Stats */}
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} w="full">
                    <Box p={8} bg="bg.surface" rounded="3xl" border="1px solid" borderColor="border.subtle" shadow="xl" position="relative" overflow="hidden" className="dash-card">
                        <Circle size="100px" bg="turf-green" opacity="0.03" position="absolute" top="-20px" right="-20px" />
                        <Stat.Root>
                            <Stat.Label color="fg.muted" fontWeight="black" fontSize="10px" letterSpacing="widest" textTransform="uppercase">Knowledge Nodes</Stat.Label>
                            <Stat.ValueText fontSize="5xl" fontWeight="black" color="turf-green" my={2}>{stats.nodes.toLocaleString()}</Stat.ValueText>
                            <Stat.HelpText>
                                <Stat.UpIndicator color="turf-green" />
                                <Text as="span" fontWeight="bold" color="turf-green">{stats.growth}%</Text> expansion vs LW
                            </Stat.HelpText>
                        </Stat.Root>
                    </Box>

                    <Box p={8} bg="bg.surface" rounded="3xl" border="1px solid" borderColor="border.subtle" shadow="xl" position="relative" overflow="hidden" className="dash-card">
                        <Circle size="100px" bg="jungle-teal" opacity="0.03" position="absolute" top="-20px" right="-20px" />
                        <Stat.Root>
                            <Stat.Label color="fg.muted" fontWeight="black" fontSize="10px" letterSpacing="widest" textTransform="uppercase">AI Extractions</Stat.Label>
                            <Stat.ValueText fontSize="5xl" fontWeight="black" color="jungle-teal" my={2}>{stats.extractions.toLocaleString()}</Stat.ValueText>
                            <Stat.HelpText>
                                <Stat.UpIndicator color="turf-green" />
                                <Text as="span" fontWeight="bold" color="turf-green">{stats.folders}</Text> active research folders
                            </Stat.HelpText>
                        </Stat.Root>
                    </Box>

                    <Box p={8} bg="bg.surface" rounded="3xl" border="1px solid" borderColor="border.subtle" shadow="xl" position="relative" overflow="hidden" className="dash-card">
                        <Circle size="100px" bg="brand.turf-3" opacity="0.03" position="absolute" top="-20px" right="-20px" />
                        <Stat.Root>
                            <Stat.Label color="fg.muted" fontWeight="black" fontSize="10px" letterSpacing="widest" textTransform="uppercase">Symmetry Integrity</Stat.Label>
                            <Stat.ValueText fontSize="5xl" fontWeight="black" color="brand.turf-2" my={2}>{stats.integrity}%</Stat.ValueText>
                            <Stat.HelpText>
                                <Badge colorPalette="green" bg="turf-green/10" color="turf-green" variant="subtle" rounded="md" fontSize="9px" fontWeight="black">GUARDIAN ACTIVE</Badge>
                            </Stat.HelpText>
                        </Stat.Root>
                    </Box>
                </SimpleGrid>

                {/* Main Content Grid */}
                <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8} w="full">
                    {/* Activity Log */}
                    <VStack align="stretch" spaceY={4} className="dash-card">
                        <Heading size="xs" textTransform="uppercase" color="fg.muted" letterSpacing="widest" fontWeight="black">Recent Activity</Heading>
                        <VStack align="stretch" spaceY={3}>
                            {activity.length > 0 ? activity.map((item, i) => (
                                <HStack key={i} p={4} bg="bg.surface" rounded="2xl" border="1px solid" borderColor="border.subtle" justifyContent="space-between" transition="all 0.3s" _hover={{ transform: 'translateX(4px)', borderColor: 'turf-green/30', bg: "bg.muted" }}>
                                    <HStack spaceX={4}>
                                        <Circle size="10" bg="turf-green/5" color="turf-green">
                                            <LuActivity size="16px" />
                                        </Circle>
                                        <VStack align="start" spaceY={0}>
                                            <Text fontWeight="black" fontSize="sm" color="fg">{item.title}</Text>
                                            <Text fontSize="10px" color="fg.muted" fontWeight="bold">{item.type} • {item.result}</Text>
                                        </VStack>
                                    </HStack>
                                    <Text fontSize="10px" color="fg.subtle" fontWeight="black">{item.date}</Text>
                                </HStack>
                            )) : (
                                <Box p={10} textAlign="center" border="2px dashed" borderColor="border.subtle" rounded="2xl" color="fg.muted" fontSize="sm" fontWeight="bold">
                                    No recent research activity detected
                                </Box>
                            )}
                        </VStack>
                    </VStack>

                    {/* Node Breakdown */}
                    <VStack align="stretch" spaceY={4} gridColumn={{ lg: 'span 2' }} className="dash-card">
                        <Heading size="xs" textTransform="uppercase" color="fg.muted" letterSpacing="widest" fontWeight="black">Knowledge Breakdown</Heading>
                        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                            {Object.entries(stats.label_counts)
                                .filter(([label]) => !label.startsWith('Folder_'))
                                .map(([label, count]) => (
                                    <Box key={label} p={5} bg="bg.surface" rounded="2xl" border="1px solid" borderColor="border.subtle" shadow="sm" transition="all 0.3s" _hover={{ borderColor: "turf-green/40", transform: "translateY(-2px)" }}>
                                        <Text fontSize="10px" fontWeight="black" color="turf-green" textTransform="uppercase" letterSpacing="widest">{label}</Text>
                                        <Text fontSize="3xl" fontWeight="black" mt={1} color="fg">{count}</Text>
                                    </Box>
                                ))}
                        </SimpleGrid>
                        {Object.keys(stats.label_counts).length === 0 && (
                            <Box p={12} textAlign="center" bg="bg.surface" rounded="3xl" border="1px solid" borderColor="border.subtle">
                                <LuZap size="32px" color="var(--chakra-colors-bg-muted)" style={{ margin: '0 auto' }} />
                                <Text mt={4} color="fg.muted" fontSize="sm" fontWeight="black">Awaiting graph data extraction...</Text>
                            </Box>
                        )}
                    </VStack>
                </SimpleGrid>
            </VStack>
        </Box>
    );
};
