import { Box, Heading, Text, VStack, SimpleGrid, Stat, HStack, Button, Badge, Circle, useDisclosure } from '@chakra-ui/react';
import { LuZap, LuActivity, LuPlus, LuSearch, LuSettings, LuFolder, LuArrowRight } from 'react-icons/lu';
import { useState, useEffect, useRef } from 'react';
import { nexusApi } from '@/services/api';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoaders';
import { EcosystemHighlights } from '@/components/dashboard/EcosystemHighlights';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { toSentenceCase } from '@/utils/graphColors';

export const Dashboard = () => {
    const navigate = useNavigate();
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
    const [status, setStatus] = useState<any>(null);
    const [folders, setFolders] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, activityData, statusData, foldersData] = await Promise.all([
                    nexusApi.getStats(),
                    nexusApi.getActivity(),
                    nexusApi.getSystemStatus(),
                    nexusApi.getFolders()
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
                setStatus(statusData);
                setFolders(foldersData || []);
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
                    stagger: 0.05, 
                    ease: "power3.out",
                    clearProps: "all" 
                }
            );
        }
    }, [loading]);

    if (loading) return <Box p={8}><DashboardSkeleton /></Box>;

    return (
        <Box h="full" overflowY="auto" px={8} py={10} ref={containerRef} className="custom-scrollbar">
            <VStack align="start" gap={12} w="full">
                {/* Header Section */}
                <HStack justifyContent="space-between" w="full" className="dash-card">
                    <VStack align="start" gap={1}>
                        <Text fontSize="10px" fontWeight="black" color="jungle-teal" letterSpacing="widest">PILLAR 01: SYSTEM STATUS</Text>
                        <Heading size="3xl" fontWeight="black" letterSpacing="tight" color="fg">Overview</Heading>
                    </VStack>
                    <HStack gap={3}>
                        <Button variant="ghost" size="sm" color="fg.muted" onClick={onOpen} _hover={{ bg: "bg.muted" }}>
                            <LuSettings /> Settings
                        </Button>
                        <Button variant="ghost" size="sm" color="fg.muted" onClick={() => navigate('/discovery')} _hover={{ bg: "brand.subtle" }}>
                            <LuSearch /> Search Graph
                        </Button>
                        <Button 
                            bg="turf-green" 
                            color="white" 
                            rounded="xl" 
                            shadow="premium" 
                            px={6} h="56px" 
                            onClick={() => navigate('/data-upload')}
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

                {/* Ecosystem Highlights */}
                <Box w="full" className="dash-card">
                    <EcosystemHighlights status={status} stats={stats} />
                </Box>

                {/* Recent Folders */}
                <VStack align="stretch" gap={6} w="full" className="dash-card">
                    <HStack justifyContent="space-between">
                        <VStack align="start" gap={1}>
                            <Heading size="md" fontWeight="black">Recent Folders</Heading>
                            <Text fontSize="xs" color="fg.muted">Quick access to your modular knowledge silos.</Text>
                        </VStack>
                        <Button variant="ghost" size="sm" p={0} color="jungle-teal" fontWeight="black" fontSize="xs" onClick={() => navigate('/library')}>
                            VIEW ALL LIBRARY <LuArrowRight style={{ marginLeft: '4px' }} />
                        </Button>
                    </HStack>
                    
                    <SimpleGrid columns={{ base: 1, md: 3, lg: 4 }} gap={4}>
                        {folders.slice(0, 4).map((folder) => (
                            <Box 
                                key={folder.id} p={5} bg="bg.surface" rounded="2xl" border="1px solid" borderColor="border.subtle" shadow="sm" 
                                cursor="pointer" transition="all 0.3s" _hover={{ borderColor: "jungle-teal/40", transform: "translateY(-4px)", bg: "bg.muted" }}
                                onClick={() => navigate(`/discovery?folder=${folder.slug || folder.id}`)}
                            >
                                <HStack gap={3} mb={3}>
                                    <Circle size="8" bg="jungle-teal/10" color="jungle-teal">
                                        <LuFolder size="14px" />
                                    </Circle>
                                    <Text fontWeight="black" fontSize="sm" lineClamp={1}>{folder.name}</Text>
                                </HStack>
                                <Text fontSize="10px" color="fg.muted" lineClamp={2}>{folder.description}</Text>
                                <HStack mt={4} justifyContent="space-between" color="fg.subtle">
                                    <Text fontSize="9px" fontWeight="bold">MODIFIED {new Date(folder.updated_at || Date.now()).toLocaleDateString()}</Text>
                                    <LuArrowRight size="10px" />
                                </HStack>
                            </Box>
                        ))}
                    </SimpleGrid>
                </VStack>

                {/* Main Content Grid */}
                <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8} w="full">
                    {/* Activity Log */}
                    <VStack align="stretch" gap={4} className="dash-card">
                        <Heading size="xs" textTransform="uppercase" color="fg.muted" letterSpacing="widest" fontWeight="black">Recent Activity</Heading>
                        <VStack align="stretch" gap={3}>
                            {activity.length > 0 ? activity.map((item, i) => (
                                <HStack key={i} p={4} bg="bg.surface" rounded="2xl" border="1px solid" borderColor="border.subtle" justifyContent="space-between" transition="all 0.3s" _hover={{ transform: 'translateX(4px)', borderColor: 'turf-green/30', bg: "bg.muted" }}>
                                    <HStack gap={4}>
                                        <Circle size="10" bg="turf-green/5" color="turf-green">
                                            <LuActivity size="16px" />
                                        </Circle>
                                        <VStack align="start" gap={0}>
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
                    <VStack align="stretch" gap={4} gridColumn={{ lg: 'span 2' }} className="dash-card">
                        <Heading size="xs" textTransform="uppercase" color="fg.muted" letterSpacing="widest" fontWeight="black">Knowledge Breakdown</Heading>
                        <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} gap={4}>
                            {Object.entries(stats.label_counts)
                                .filter(([label]) => !label.startsWith('Folder_'))
                                .map(([label, count]) => (
                                    <Box key={label} p={5} bg="bg.surface" rounded="2xl" border="1px solid" borderColor="border.subtle" shadow="sm" transition="all 0.3s" _hover={{ borderColor: "turf-green/40", transform: "translateY(-2px)" }}>
                                        <Text fontSize="10px" fontWeight="black" color="turf-green" letterSpacing="widest">{toSentenceCase(label).toUpperCase()}</Text>
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
