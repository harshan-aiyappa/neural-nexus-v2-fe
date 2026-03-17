import { Box, Heading, Text, VStack, HStack, Circle, Flex, Input, Button, Badge, IconButton as ChakraIconButton } from '@chakra-ui/react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNexusStore } from '@/store/NexusStore';
import { NexusGraph2D } from '@/components/graph/2d/NexusGraph2D';
import { EntityInfoPanel } from '@/components/graph/EntityInfoPanel';
import { SunburstChart } from '@/components/graph/SunburstChart';
import { NodeListView } from '@/components/graph/NodeListView';
import { DiscoveryAnalytics } from '@/components/graph/DiscoveryAnalytics';
import { nexusApi } from '@/services/api';
import { LuSearch as LuScanSearch, LuInfinity, LuFilter, LuLayers, LuMaximize2, LuDownload, LuNetwork, LuCircleDot, LuLayoutList, LuChartPie } from 'react-icons/lu';
import gsap from 'gsap';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { getEntityColor, toSentenceCase } from '@/utils/graphColors';

const LabelText = ({ label }: { label: string }) => {
    return <Text fontSize="10px" fontWeight="black" color="fg">{label}</Text>;
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
    const [currentView, setCurrentView] = useState<'network' | 'sunburst' | 'list' | 'analytics'>('network');

    // Progressive Expansion State
    const [localNodes, setLocalNodes] = useState<any[]>([]);
    const [localLinks, setLocalLinks] = useState<any[]>([]);
    const [isExpanding, setIsExpanding] = useState(false);

    // TanStack Query for Folders
    const { data: folders = [] } = useQuery({
        queryKey: ['folders'],
        queryFn: nexusApi.getFolders,
    });

    const borderColor = "border.subtle";

    // Sync search param / path param with store
    useEffect(() => {
        if (folders.length === 0) return;

        const urlSlug = pathSlug || searchParams.get('folder');
        
        if (urlSlug && urlSlug !== selectedFolderSlug) {
            setSelectedFolderSlug(urlSlug);
        } else if (!urlSlug && !selectedFolderSlug && folders[0]) {
            setSelectedFolderSlug(folders[0].slug);
        }

        const highlightParam = searchParams.get('highlight');
        if (highlightParam && highlightParam !== searchTerm) {
            setSearchTerm(highlightParam);
        }
    }, [pathSlug, searchParams, folders.length, selectedFolderSlug]); // Stabilized folders dependency

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

    // Sync graph data to local state on initial load or folder change
    useEffect(() => {
        if (!graphData || !graphData.nodes) return;
        
        const isNewFolder = selectedFolderSlug !== lastLoadedSlug.current;
        const isEmptyAndDataArrived = localNodes.length === 0 && graphData.nodes.length > 0;

        if (isNewFolder || isEmptyAndDataArrived) {
            setLocalNodes(graphData.nodes);
            setLocalLinks(graphData.links);
            lastLoadedSlug.current = selectedFolderSlug;
            
            // Auto-activate all labels/types on fresh load
            const labels = Array.from(new Set(graphData.nodes.map((n: any) => n.neo4jLabel || 'ENTITY'))) as string[];
            const relTypes = Array.from(new Set(graphData.links.map((l: any) => l.type || 'RELATIONSHIP'))) as string[];
            setActiveLabels(labels);
            setActiveRelTypes(relTypes);
        }
    }, [graphData, selectedFolderSlug]); // Removed localNodes.length to stop the loop

    const lastLoadedSlug = useRef<string | null>(null);

    const handleNodeExpand = async (node: any) => {
        if (!node || isExpanding) return;
        
        setIsExpanding(true);
        try {
            console.log(`Expansion triggered for node: ${node.id}`);
            const data = await nexusApi.getNeighbors(node.id, selectedFolderSlug || undefined);
            
            setLocalNodes(prev => {
                const existingIds = new Set(prev.map(n => n.id));
                const newNodes = data.nodes
                    .filter((n: any) => !existingIds.has(n.id))
                    .map((n: any) => ({
                        id: n.id,
                        name: n.name,
                        neo4jLabel: n.label,
                        val: 1,
                        properties: n.properties
                    }));
                return [...prev, ...newNodes];
            });

            setLocalLinks(prev => {
                // Use a composite key for edges to check existence: source-target-type
                const existingKeys = new Set(prev.map(l => {
                    const s = typeof l.source === 'object' ? l.source.id : l.source;
                    const t = typeof l.target === 'object' ? l.target.id : l.target;
                    return `${s}-${t}-${l.type}`;
                }));

                const newLinks = data.relationships
                    .filter((r: any) => {
                        const key = `${r.source}-${r.target}-${r.type}`;
                        return !existingKeys.has(key);
                    })
                    .map((r: any) => ({
                        source: r.source,
                        target: r.target,
                        type: r.type,
                        isSymmetric: r.isSymmetric
                    }));
                return [...prev, ...newLinks];
            });
        } catch (err) {
            console.error("Failed to expand node:", err);
        } finally {
            setIsExpanding(false);
        }
    };

    // Update active filters when local graph data changes
    useEffect(() => {
        if (localNodes.length > 0) {
            const labels = Array.from(new Set(localNodes.map((n: any) => n.neo4jLabel || 'ENTITY'))) as string[];
            const relTypes = Array.from(new Set(localLinks.map((l: any) => l.type || 'RELATIONSHIP'))) as string[];
            setActiveLabels(prev => Array.from(new Set([...prev, ...labels])));
            setActiveRelTypes(prev => Array.from(new Set([...prev, ...relTypes])));
        }
    }, [localNodes, localLinks]);

    // Refs
    const containerRef = useRef(null);
    const headerRef = useRef(null);
    const legendRef = useRef(null);

    const handleFolderChange = (slug: string) => {
        navigate(`/discovery/${slug}`);
    };

    // Filter Logic
    const filteredNodes = useMemo(() => {
        return localNodes.filter((n: any) => {
            const highlightParam = searchParams.get('highlight');
            if (highlightParam && n.id === highlightParam) return true;

            const matchesSearch = (n.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (n.id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (n.neo4jLabel?.toLowerCase() || "").includes(searchTerm.toLowerCase());
            const matchesLabel = activeLabels.includes(n.neo4jLabel || 'ENTITY');
            return matchesSearch && matchesLabel;
        });
    }, [localNodes, searchTerm, activeLabels]);

    const displayData = useMemo(() => ({
        nodes: filteredNodes,
        links: localLinks.filter((l: any) => {
            const matchesRelType = activeRelTypes.includes(l.type);
            const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
            const targetId = typeof l.target === 'object' ? l.target.id : l.target;
            const nodesExist = filteredNodes.some((n: any) => n.id === sourceId) && filteredNodes.some((n: any) => n.id === targetId);
            return matchesRelType && nodesExist;
        })
    }), [filteredNodes, localLinks, activeRelTypes]);

    const nodeCounts = useMemo(() => {
        return localNodes.reduce((acc: any, n: any) => {
            const label = n.neo4jLabel || 'ENTITY';
            acc[label] = (acc[label] || 0) + 1;
            return acc;
        }, {});
    }, [localNodes]);

    const relCounts = useMemo(() => {
        return localLinks.reduce((acc: any, l: any) => {
            acc[l.type] = (acc[l.type] || 0) + 1;
            return acc;
        }, {});
    }, [localLinks]);

    // Neighborhood Context for Selected Entity
    const neighborhood = useMemo(() => {
        if (!selectedEntity) return { nodes: [], links: [] };
        const isNode = !selectedEntity.type && !selectedEntity.source;
        if (!isNode) return { nodes: [selectedEntity], links: [] };

        const links = localLinks.filter((l: any) => {
            const s = typeof l.source === 'object' ? l.source.id : l.source;
            const t = typeof l.target === 'object' ? l.target.id : l.target;
            return s === selectedEntity.id || t === selectedEntity.id;
        });

        const neighborIds = new Set([selectedEntity.id, ...links.flatMap((l: any) => [
            typeof l.source === 'object' ? l.source.id : l.source,
            typeof l.target === 'object' ? l.target.id : l.target
        ])]);

        const nodes = localNodes.filter((n: any) => neighborIds.has(n.id));
        return { nodes, links };
    }, [selectedEntity, localNodes, localLinks]);

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
                    <Box maxH="280px" overflowY="auto" pr={2} className="custom-scrollbar">
                            <VStack align="stretch" gap={1.5}>
                                {Object.keys(nodeCounts).sort().map((label) => {
                                    const isActive = activeLabels.includes(label);
                                    const color = getEntityColor(label);
                                    return (
                                        <Box
                                            key={label}
                                            as="button"
                                            w="full"
                                            p={3}
                                            rounded="2xl"
                                            bg={isActive ? "bg.muted" : "transparent"}
                                            border="1.5px solid"
                                            borderColor={isActive ? color + "44" : "transparent"}
                                            _hover={{ bg: "bg.muted", borderColor: color + "33", transform: "translateX(3px)" }}
                                            cursor="pointer"
                                            onClick={() => toggleLabel(label)}
                                            transition="all 0.25s cubic-bezier(0.19, 1, 0.22, 1)"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="space-between"
                                            style={{ boxShadow: isActive ? `0 0 12px ${color}18` : "none" }}
                                        >
                                            <HStack gap={3}>
                                                <Circle 
                                                    size="6" 
                                                    style={{ background: isActive ? color + "22" : "transparent", border: `2px solid ${color}${isActive ? "aa" : "44"}`, transition: "all 0.25s" }}
                                                >
                                                    <Circle size="2" style={{ background: color, opacity: isActive ? 1 : 0.35 }} />
                                                </Circle>
                                                <VStack align="start" gap={0}>
                                                    <Text fontSize="xs" fontWeight="black" color={isActive ? "fg" : "fg.muted"} transition="color 0.2s">{toSentenceCase(label)}</Text>
                                                </VStack>
                                            </HStack>
                                            <HStack gap={2}>
                                                <Badge 
                                                    variant="solid"
                                                    size="sm"
                                                    rounded="full"
                                                    px={2}
                                                    fontSize="10px"
                                                    fontWeight="black"
                                                    style={{ background: isActive ? color + "33" : "transparent", color: isActive ? color : "var(--chakra-colors-fg-muted)", border: `1px solid ${isActive ? color + "44" : "transparent"}` }}
                                                >
                                                    {nodeCounts[label]}
                                                </Badge>
                                                {isActive && (
                                                    <Circle 
                                                        size="2" 
                                                        style={{ background: color }}
                                                        className="animate-pulse"
                                                    />
                                                )}
                                            </HStack>
                                        </Box>
                                    );
                                })}
                            </VStack>
                        </Box>
                    </VStack>

                    <VStack align="stretch" gap={4}>
                        <HStack justifyContent="space-between">
                            <Text fontSize="10px" fontWeight="black" color="turf-green">RELATIONSHIP MODELS</Text>
                        </HStack>
                        <Box maxH="320px" overflowY="auto" pr={2} className="custom-scrollbar">
                            <VStack align="stretch" gap={1.5}>
                                {Object.keys(relCounts).sort().map(type => {
                                    const isActive = activeRelTypes.includes(type);
                                    return (
                                        <Box
                                            key={type}
                                            as="button"
                                            w="full"
                                            p={3}
                                            rounded="2xl"
                                            bg={isActive ? "turf-green/8" : "transparent"}
                                            border="1.5px solid"
                                            borderColor={isActive ? "turf-green/30" : "transparent"}
                                            _hover={{ bg: "bg.muted", borderColor: "turf-green/15", transform: "translateX(3px)" }}
                                            cursor="pointer"
                                            onClick={() => toggleRelType(type)}
                                            transition="all 0.25s cubic-bezier(0.19, 1, 0.22, 1)"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="space-between"
                                            style={{ boxShadow: isActive ? "0 0 12px rgba(16,123,65,0.12)" : "none" }}
                                        >
                                            <HStack gap={3}>
                                                <Box 
                                                    w="20px" h="20px" 
                                                    display="flex" alignItems="center" justifyContent="center"
                                                    rounded="md"
                                                    style={{ background: isActive ? "rgba(16,123,65,0.2)" : "transparent", transition: "all 0.25s" }}
                                                >
                                                    <Box 
                                                        w="10px" h="2px" 
                                                        rounded="full" 
                                                        style={{ background: isActive ? "var(--chakra-colors-turf-green)" : "rgba(255,255,255,0.2)", transition: "all 0.25s" }}
                                                    />
                                                </Box>
                                                <Text fontSize="xs" fontWeight="black" color={isActive ? "fg" : "fg.muted"} transition="color 0.2s">
                                                    {toSentenceCase(type)}
                                                </Text>
                                            </HStack>
                                            <HStack gap={2}>
                                                <Badge
                                                    variant="solid"
                                                    size="sm"
                                                    rounded="full"
                                                    px={2}
                                                    fontSize="10px"
                                                    fontWeight="black"
                                                    style={{ 
                                                        background: isActive ? "rgba(16,123,65,0.25)" : "transparent", 
                                                        color: isActive ? "var(--chakra-colors-turf-green)" : "var(--chakra-colors-fg-muted)", 
                                                        border: `1px solid ${isActive ? "rgba(16,123,65,0.4)" : "transparent"}` 
                                                    }}
                                                >
                                                    {relCounts[type]}
                                                </Badge>
                                            </HStack>
                                        </Box>
                                    );
                                })}
                            </VStack>
                        </Box>
                    </VStack>
                </VStack>
            </Box>

            {/* Content Area */}
            <Box flex={1} h="full" position="relative" bg="bg.canvas">
                {/* Loader Overlay */}
                {(_isGraphLoading || isExpanding) && (
                    <Flex 
                        position="absolute" 
                        top={0} left={0} right={0} bottom={0} 
                        bg="bg.canvas/40" 
                        backdropFilter="blur(4px)" 
                        zIndex={50} 
                        align="center" 
                        justify="center"
                    >
                        <VStack gap={4}>
                            <Box className="saving-spinner" boxSize="60px" border="4px solid" borderColor="turf-green/20" borderTopColor="turf-green" rounded="full" />
                            <Text fontSize="xs" fontWeight="black" color="turf-green" letterSpacing="widest">
                                {_isGraphLoading ? "INITIALIZING TOPOLOGY..." : "EXPANDING KNOWLEDGE..."}
                            </Text>
                        </VStack>
                    </Flex>
                )}

                {currentView === 'network' && (
                    <NexusGraph2D 
                        data={displayData} 
                        layoutMode={layoutMode} 
                        onNodeClick={(node: any) => {
                            setSelectedEntity(node);
                            handleNodeExpand(node);
                        }}
                        onLinkClick={(link: any) => setSelectedEntity(link)}
                    />
                )}
                {currentView === 'sunburst' && <SunburstChart data={displayData} />}
                {currentView === 'list' && <NodeListView data={displayData} onNodeClick={(node: any) => setSelectedEntity(node)} />}
                {currentView === 'analytics' && <DiscoveryAnalytics data={displayData} />}

                <EntityInfoPanel 
                    entity={selectedEntity} 
                    neighborhood={neighborhood}
                    onClose={() => setSelectedEntity(null)} 
                />

                {!showFilters && currentView === 'network' && (
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
                        <HStack bg="bg.muted" p={1} rounded="xl" gap={1} mr={4}>
                            <IconButton 
                                aria-label="Network" size="xs" variant={currentView === 'network' ? 'solid' : 'ghost'} 
                                bg={currentView === 'network' ? 'turf-green' : 'transparent'}
                                color={currentView === 'network' ? 'white' : 'fg.muted'}
                                onClick={() => setCurrentView('network')} rounded="lg"
                            ><LuNetwork size="14px" /></IconButton>
                            <IconButton 
                                aria-label="Sunburst" size="xs" variant={currentView === 'sunburst' ? 'solid' : 'ghost'} 
                                bg={currentView === 'sunburst' ? 'turf-green' : 'transparent'}
                                color={currentView === 'sunburst' ? 'white' : 'fg.muted'}
                                onClick={() => setCurrentView('sunburst')} rounded="lg"
                            ><LuCircleDot size="14px" /></IconButton>
                            <IconButton 
                                aria-label="List" size="xs" variant={currentView === 'list' ? 'solid' : 'ghost'} 
                                bg={currentView === 'list' ? 'turf-green' : 'transparent'}
                                color={currentView === 'list' ? 'white' : 'fg.muted'}
                                onClick={() => setCurrentView('list')} rounded="lg"
                            ><LuLayoutList size="14px" /></IconButton>
                            <IconButton 
                                aria-label="Analytics" size="xs" variant={currentView === 'analytics' ? 'solid' : 'ghost'} 
                                bg={currentView === 'analytics' ? 'turf-green' : 'transparent'}
                                color={currentView === 'analytics' ? 'white' : 'fg.muted'}
                                onClick={() => setCurrentView('analytics')} rounded="lg"
                            ><LuChartPie size="14px" /></IconButton>

                        </HStack>
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
                        {activeLabels.slice(0, 6).map((label) => (
                            <HStack key={label} gap={2.5}>
                                <Circle size="2" bg={getEntityColor(label)} shadow="glow" />
                                <LabelText label={label} />
                            </HStack>
                        ))}
                        {activeLabels.length > 6 && <Text fontSize="9px" color="fg.muted" fontWeight="black">+{activeLabels.length - 6} OTHER CLASSES</Text>}
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
