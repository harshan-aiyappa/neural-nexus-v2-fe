import { Box, Heading, Text, VStack, HStack, Circle, Flex, Input, Button, Badge } from '@chakra-ui/react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { LuSearch as LuScanSearch, LuInfinity, LuFilter, LuLayers, LuMaximize2, LuDownload } from 'react-icons/lu';
import { useQuery } from '@tanstack/react-query';
import { useNexusStore } from '@/store/nexusStore';
import { NexusGraph2D } from '@/components/graph/2d/NexusGraph2D';
import { EntityInfoPanel } from '@/components/graph/EntityInfoPanel';
import { nexusApi } from '@/services/api';
import gsap from 'gsap';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';

const LabelText = ({ label }: { label: string }) => {
    return <Text fontSize="10px" fontWeight="black" color="fg">{label.toUpperCase()}</Text>;
};
export const Discovery = ({ layoutMode = 'network' }: { layoutMode?: 'network' | 'tree' | 'radial' }) => {
    const { slug: pathSlug } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isSidebarCollapsed: _isSidebarCollapsed, selectedFolderSlug, setSelectedFolderSlug } = useNexusStore();
    
    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [activeLabels, setActiveLabels] = useState<string[]>([]);
    const [activeRelTypes, setActiveRelTypes] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(true);
    const [selectedEntity, setSelectedEntity] = useState<any>(null);

    // TanStack Query for Folders
    const { data: folders = [] } = useQuery({
        queryKey: ['folders'],
        queryFn: nexusApi.getFolders,
    });

    const borderColor = "border.subtle";

    // Sync search param / path param with store
    useEffect(() => {
        // Only run logic if we have folders loaded
        if (folders.length === 0) return;

        const urlSlug = pathSlug || searchParams.get('folder');
        
        if (urlSlug) {
            // If URL has a slug and it's different from the store, update store
            if (urlSlug !== selectedFolderSlug) {
                setSelectedFolderSlug(urlSlug);
            }
        } else if (!selectedFolderSlug) {
            // If no slug in URL and none in store, default to first folder
            const defaultSlug = folders[0].slug;
            setSelectedFolderSlug(defaultSlug);
            // Don't navigate here immediately to avoid loop, let the store update settle
        }

        const highlightParam = searchParams.get('highlight');
        if (highlightParam && highlightParam !== searchTerm) {
            setSearchTerm(highlightParam);
        }
    }, [pathSlug, searchParams, folders, selectedFolderSlug]); // Removed 'navigate' and stabilized conditions

    // TanStack Query for Graph Data
    const { data: graphData = { nodes: [], links: [] }, isLoading: _isGraphLoading } = useQuery({
        queryKey: ['graph', selectedFolderSlug],
        queryFn: async () => {
            if (!selectedFolderSlug) return { nodes: [], links: [] };
            const data = await nexusApi.getGraph(selectedFolderSlug);
            const nodes = data.nodes.map((n: any) => ({
                id: n.id,
                name: n.name,
                neo4jLabel: n.label, // Renamed to avoid ECharts collision
                val: 1,
                properties: n.properties
            }));
            const links = data.relationships.map((r: any) => ({
                source: r.source,
                target: r.target,
                type: r.type,
                isSymmetric: r.isSymmetric
            }));
            return { nodes, links };
        },
        enabled: !!selectedFolderSlug,
    });

    // Update active filters when graph data changes
    useEffect(() => {
        if (graphData.nodes.length > 0) {
            const labels = Array.from(new Set(graphData.nodes.map((n: any) => n.neo4jLabel))) as string[];
            const relTypes = Array.from(new Set(graphData.links.map((l: any) => l.type))) as string[];
            setActiveLabels(labels);
            setActiveRelTypes(relTypes);
        }
    }, [graphData]);

    // Refs
    const containerRef = useRef(null);
    const headerRef = useRef(null);
    const legendRef = useRef(null);

    const handleFolderChange = (slug: string) => {
        navigate(`/discovery/${slug}`);
    };

    // Filter Logic
    const filteredNodes = useMemo(() => {
        return graphData.nodes.filter((n: any) => {
            const highlightParam = searchParams.get('highlight');
            if (highlightParam && n.id === highlightParam) return true;

            const matchesSearch = (n.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (n.id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (n.label?.toLowerCase() || "").includes(searchTerm.toLowerCase());
            const matchesLabel = activeLabels.includes(n.label);
            return matchesSearch && matchesLabel;
        });
    }, [graphData.nodes, searchTerm, activeLabels, searchParams]);

    const displayData = useMemo(() => ({
        nodes: filteredNodes,
        links: graphData.links.filter((l: any) => {
            const matchesRelType = activeRelTypes.includes(l.type);
            const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
            const targetId = typeof l.target === 'object' ? l.target.id : l.target;
            const nodesExist = filteredNodes.some((n: any) => n.id === sourceId) && filteredNodes.some((n: any) => n.id === targetId);
            return matchesRelType && nodesExist;
        })
    }), [filteredNodes, graphData.links, activeRelTypes]);

    const nodeCounts = useMemo(() => {
        return graphData.nodes.reduce((acc: any, n: any) => {
            acc[n.label] = (acc[n.label] || 0) + 1;
            return acc;
        }, {});
    }, [graphData.nodes]);

    const relCounts = useMemo(() => {
        return graphData.links.reduce((acc: any, l: any) => {
            acc[l.type] = (acc[l.type] || 0) + 1;
            return acc;
        }, {});
    }, [graphData.links]);

    // Neighborhood Context for Selected Entity
    const neighborhood = useMemo(() => {
        if (!selectedEntity) return { nodes: [], links: [] };
        const isNode = !selectedEntity.type && !selectedEntity.source;
        if (!isNode) return { nodes: [selectedEntity], links: [] };

        const links = graphData.links.filter((l: any) => {
            const s = typeof l.source === 'object' ? l.source.id : l.source;
            const t = typeof l.target === 'object' ? l.target.id : l.target;
            return s === selectedEntity.id || t === selectedEntity.id;
        });

        const neighborIds = new Set([selectedEntity.id, ...links.flatMap((l: any) => [
            typeof l.source === 'object' ? l.source.id : l.source,
            typeof l.target === 'object' ? l.target.id : l.target
        ])]);

        const nodes = graphData.nodes.filter((n: any) => neighborIds.has(n.id));
        return { nodes, links };
    }, [selectedEntity, graphData.nodes, graphData.links]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (headerRef.current) {
                gsap.fromTo(headerRef.current,
                    { opacity: 0, y: -30 },
                    { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', clearProps: "all" }
                );
            }
            if (legendRef.current) {
                gsap.fromTo(legendRef.current,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 1.2, delay: 0.4, ease: 'expo.out', clearProps: "all" }
                );
            }
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const toggleLabel = (label: string) => {
        setActiveLabels(prev =>
            prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
        );
    };

    const toggleRelType = (type: string) => {
        setActiveRelTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const selectedFolderName = folders.find((f: any) => f.slug === selectedFolderSlug)?.name || 'NONE';

    return (
        <Flex ref={containerRef} h="100%" w="full" bg="bg.canvas" position="relative" overflow="hidden">
            {/* Filter Sidebar - Glassmorphism */}
            <Box
                w={showFilters ? { base: "full", md: "340px" } : "0px"}
                h="full"
                bg="bg.surface"
                borderRight="1px solid"
                borderColor={borderColor}
                transition="all 0.5s cubic-bezier(0.19, 1, 0.22, 1)"
                overflow="hidden"
                zIndex={30}
                position={{ base: "absolute", md: "relative" }}
                className="glass-card"
            >
                <VStack align="stretch" p={6} gap={8} h="full">
                    <HStack justifyContent="space-between">
                        <HStack gap={2}>
                            <Circle size="8" bg="turf-green/10" color="turf-green">
                                <LuFilter size="14px" />
                            </Circle>
                            <Heading size="xs" color="fg.muted" letterSpacing="2px" fontWeight="black">ENGINE FILTERS</Heading>
                        </HStack>
                        <Button variant="ghost" size="xs" onClick={() => setShowFilters(false)} color="fg.muted" rounded="full">✕</Button>
                    </HStack>

                    <Box position="relative">
                        <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="turf-green" zIndex={2}>
                            <LuScanSearch size="14px" />
                        </Box>
                        <Input
                            bg="bg.muted"
                            color="fg"
                            border="1px solid"
                            borderColor="border.subtle"
                            rounded="xl"
                            pl={10}
                            h="44px"
                            placeholder="Find local entities..."
                            fontSize="xs"
                            fontWeight="bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            _focus={{ borderColor: "turf-green" }}
                        />
                    </Box>

                    <VStack align="stretch" gap={4}>
                        <HStack justifyContent="space-between">
                            <Text fontSize="10px" fontWeight="black" color="turf-green">ENTITY CLASSES</Text>
                            <HStack gap={2}>
                                <Text cursor="pointer" fontSize="9px" color="fg.muted" fontWeight="bold" onClick={() => setActiveLabels(Object.keys(nodeCounts))}>ALL</Text>
                                <Text cursor="pointer" fontSize="9px" color="fg.muted" fontWeight="bold" onClick={() => setActiveLabels([])}>NONE</Text>
                            </HStack>
                        </HStack>
                        <Box maxH="220px" overflowY="auto" pr={2}>
                            <VStack align="stretch" gap={1.5}>
                                {Object.keys(nodeCounts).sort().map((label, idx) => (
                                    <HStack
                                        key={label}
                                        p={3}
                                        rounded="xl"
                                        bg={activeLabels.includes(label) ? "turf-green/5" : "transparent"}
                                        border="1px solid"
                                        borderColor={activeLabels.includes(label) ? "turf-green/20" : "transparent"}
                                        _hover={{ bg: "bg.muted" }}
                                        cursor="pointer"
                                        onClick={() => toggleLabel(label)}
                                        justifyContent="space-between"
                                        transition="all 0.2s"
                                    >
                                        <HStack gap={3}>
                                            <Circle size="2" bg={activeLabels.includes(label) ? (idx % 2 === 0 ? "turf-green" : "jungle-teal") : "fg.muted"} shadow={activeLabels.includes(label) ? "glow" : "none"} />
                                            <Text fontSize="xs" fontWeight="black" color={activeLabels.includes(label) ? "fg" : "fg.muted"}>{String(label).toUpperCase()}</Text>
                                        </HStack>
                                        <Badge variant="subtle" size="sm" rounded="md" bg="bg.muted">{nodeCounts[label]}</Badge>
                                    </HStack>
                                ))}
                            </VStack>
                        </Box>
                    </VStack>

                    <VStack align="stretch" gap={4}>
                        <HStack justifyContent="space-between">
                            <Text fontSize="10px" fontWeight="black" color="turf-green">RELATIONSHIP MODELS</Text>
                        </HStack>
                        <Box maxH="220px" overflowY="auto" pr={2}>
                            <VStack align="stretch" gap={1.5}>
                                {Object.keys(relCounts).sort().map(type => (
                                    <HStack
                                        key={type}
                                        p={3}
                                        rounded="xl"
                                        bg={activeRelTypes.includes(type) ? "turf-green/5" : "transparent"}
                                        border="1px solid"
                                        borderColor={activeRelTypes.includes(type) ? "turf-green/20" : "transparent"}
                                        _hover={{ bg: "bg.muted" }}
                                        cursor="pointer"
                                        onClick={() => toggleRelType(type)}
                                        justifyContent="space-between"
                                        transition="all 0.2s"
                                    >
                                        <HStack gap={3}>
                                            <Box w="3px" h="10px" bg={activeRelTypes.includes(type) ? "turf-green" : "border.subtle"} rounded="full" />
                                            <Text fontSize="xs" fontWeight="black" color={activeRelTypes.includes(type) ? "fg" : "fg.muted"}>{type.toUpperCase()}</Text>
                                        </HStack>
                                        <Badge variant="subtle" size="sm" rounded="md" bg="bg.muted">{relCounts[type]}</Badge>
                                    </HStack>
                                ))}
                            </VStack>
                        </Box>
                    </VStack>
                </VStack>
            </Box>

            {/* 3D Canvas Area */}
            <Box flex={1} h="full" position="relative" bg="bg.canvas">
                <NexusGraph2D 
                    data={displayData} 
                    layoutMode={layoutMode} 
                    onNodeClick={(node: any) => setSelectedEntity(node)}
                    onLinkClick={(link: any) => setSelectedEntity(link)}
                />

                <EntityInfoPanel 
                    entity={selectedEntity} 
                    neighborhood={neighborhood}
                    onClose={() => setSelectedEntity(null)} 
                />

                {!showFilters && (
                    <IconButton
                        aria-label="Filters"
                        position="absolute"
                        top={8}
                        left={8}
                        zIndex={40}
                        onClick={() => setShowFilters(true)}
                        bg="bg.surface"
                        rounded="2xl"
                        border="1px solid"
                        borderColor={borderColor}
                        size="lg"
                        shadow="premium"
                        _hover={{ bg: "turf-green", color: "white" }}
                    >
                        <LuFilter />
                    </IconButton>
                )}
            </Box>

            {/* Premium Floated Command Top Bar */}
            <Box
                position="absolute"
                top={8}
                left={showFilters ? "calc(50% + 170px)" : "50%"}
                transform="translateX(-50%)"
                zIndex={20}
                w={showFilters ? "calc(94% - 340px)" : "94%"}
                maxW="1400px"
                ref={headerRef}
                transition="all 0.5s cubic-bezier(0.19, 1, 0.22, 1)"
            >
                <HStack
                    bg="bg.surface/80"
                    backdropFilter="blur(32px)"
                    p={4}
                    px={8}
                    rounded="full"
                    border="1px solid"
                    borderColor="border.subtle"
                    shadow="premium"
                    gap={6}
                    justifyContent="space-between"
                >
                    <HStack gap={6}>
                        <VStack align="start" gap={0}>
                            <HStack gap={2}>
                                <Badge colorPalette="teal" variant="solid" bg="turf-green" rounded="md" fontSize="8px" px={2} fontWeight="black">
                                    CLUSTER: {selectedFolderName.toUpperCase()}
                                </Badge>
                                <Circle size="1.5" bg="turf-green" className="animate-pulse" shadow="glow" />
                            </HStack>
                            <Heading size="sm" fontWeight="black" letterSpacing="tight" color="fg">
                                Knowledge Discovery Engine
                            </Heading>
                        </VStack>
                        <Box h="30px" w="1px" bg="border.muted" />
                        <HStack gap={2}>
                            <LuLayers size="14px" color="var(--chakra-colors-turf-green)" />
                            <select
                                style={{
                                    background: 'transparent',
                                    color: 'var(--chakra-colors-fg)',
                                    fontSize: '11px',
                                    fontWeight: '900',
                                    border: 'none',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                                value={selectedFolderSlug || ''}
                                onChange={(e) => handleFolderChange(e.target.value)}
                            >
                                {folders.map((f: any) => (
                                    <option key={f.slug} value={f.slug} style={{ background: 'var(--chakra-colors-bg-surface)', color: 'var(--chakra-colors-fg)' }}>{f.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </HStack>
                    </HStack>

                    <HStack gap={2}>
                        <IconButton aria-label="Export" variant="ghost" rounded="full" color="fg.muted" _hover={{ bg: "bg.muted", color: "turf-green" }}><LuDownload size="18px" /></IconButton>
                        <IconButton aria-label="Expand" variant="ghost" rounded="full" color="fg.muted" _hover={{ bg: "bg.muted", color: "turf-green" }}><LuMaximize2 size="18px" /></IconButton>
                    </HStack>
                </HStack>
            </Box>

            {/* Node Legend (Bottom Center) */}
            <Box
                position="absolute"
                bottom={10}
                left={showFilters ? "calc(50% + 170px)" : "50%"}
                transform="translateX(-50%)"
                transition="all 0.5s cubic-bezier(0.19, 1, 0.22, 1)"
                zIndex={20}
                ref={legendRef}
            >
                <HStack
                    bg="bg.surface/70"
                    backdropFilter="blur(24px)"
                    p={3}
                    px={10}
                    rounded="full"
                    border="1px solid"
                    borderColor="border.subtle"
                    shadow="premium"
                    gap={10}
                >
                    <Text fontSize="9px" fontWeight="black" color="turf-green" letterSpacing="3px">KNOWLEDGE ATLAS</Text>
                    <HStack gap={8}>
                        {activeLabels.slice(0, 4).map((label, idx) => (
                            <HStack key={label} gap={2.5}>
                                <Circle size="2" bg={idx % 2 === 0 ? 'turf-green' : 'jungle-teal'} shadow="glow" />
                                <LabelText label={label} />
                            </HStack>
                        ))}
                        {activeLabels.length > 4 && <Text fontSize="9px" color="fg.muted" fontWeight="black">+{activeLabels.length - 4} OTHER CLASSES</Text>}
                    </HStack>
                </HStack>
            </Box>

            {/* Metrics Badge */}
            <Box position="absolute" bottom={10} right={10} zIndex={10}>
                <Badge bg="bg.surface/80" backdropFilter="blur(16px)" color="turf-green" variant="outline" p={4} px={7} rounded="2xl" border="1px solid" borderColor="turf-green/30" shadow="premium">
                    <HStack gap={4}>
                        <LuInfinity size="20px" />
                        <VStack align="start" gap={0}>
                            <Text fontSize="14px" fontWeight="black">{displayData.nodes.length}</Text>
                            <Text fontSize="8px" fontWeight="black" letterSpacing="widest" color="fg.muted">NODES IN VIEW</Text>
                        </VStack>
                    </HStack>
                </Badge>
            </Box>
        </Flex>
    );
};

const IconButton = ({ children, ...props }: any) => (
    <Button p={0} minW="40px" h="40px" {...props}>{children}</Button>
);
