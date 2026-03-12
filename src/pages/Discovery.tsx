import { Box, Heading, Text, VStack, HStack, Circle, Flex, Input, Button, Badge } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';
import { useState, useRef, useEffect } from 'react';
import { LuSearch as LuScanSearch, LuInfinity } from 'react-icons/lu';
import { NexusGraph } from '@/components/graph/3d/ForceGraph3D';
import { nexusApi } from '@/services/api';
import gsap from 'gsap';
import { useSearchParams } from 'react-router-dom';

const LabelText = ({ label }: { label: string }) => {
    const textColor = useColorModeValue('gray.700', 'white');
    return <Text fontSize="10px" fontWeight="black" color={textColor}>{label.toUpperCase()}</Text>;
};

export const Discovery = ({ layoutMode = 'network' }: { layoutMode?: 'network' | 'tree' | 'radial' }) => {
    const [searchParams] = useSearchParams();
    const cardBg = useColorModeValue('white', 'black/60');
    const headerBg = useColorModeValue('white/80', 'black/60');
    const borderColor = useColorModeValue('gray.200', 'white/10');
    const headerTextColor = useColorModeValue('gray.800', 'white');
    const selectBg = useColorModeValue('gray.100', 'white/5');
    const selectColor = useColorModeValue('gray.800', 'white');
    const optionBg = useColorModeValue('white', '#1a1a1a');

    // Graph State
    const [graphData, setGraphData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });
    const [folders, setFolders] = useState<any[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeLabels, setActiveLabels] = useState<string[]>([]);
    const [activeRelTypes, setActiveRelTypes] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(true);

    // Refs
    const headerRef = useRef(null);
    const legendRef = useRef(null);

    // Initial Data Fetch
    useEffect(() => {
        const init = async () => {
            try {
                const folderData = await nexusApi.getFolders();
                setFolders(folderData);

                // Deep Link Logic
                const folderParam = searchParams.get('folder');
                const highlightParam = searchParams.get('highlight');

                if (folderParam) {
                    setSelectedFolder(folderParam);
                    fetchGraph(folderParam);
                } else if (folderData.length > 0) {
                    const firstSlug = folderData[0].slug;
                    setSelectedFolder(firstSlug);
                    fetchGraph(firstSlug);
                }

                if (highlightParam) {
                    setSearchTerm(highlightParam);
                }
            } catch (error) {
                console.error("Init discovery failed:", error);
            }
        };
        init();
    }, [searchParams]);

    const fetchGraph = async (slug: string) => {
        try {
            const data = await nexusApi.getGraph(slug);
            const nodes = data.nodes.map((n: any) => ({
                id: n.id,
                name: n.name,
                label: n.label,
                val: 1,
                properties: n.properties
            }));
            const links = data.relationships.map((r: any) => ({
                source: r.source,
                target: r.target,
                type: r.type
            }));

            setGraphData({ nodes, links });

            // Extract unique labels and relationship types
            const labels = Array.from(new Set(nodes.map((n: any) => n.label))) as string[];
            const relTypes = Array.from(new Set(links.map((l: any) => l.type))) as string[];

            setActiveLabels(labels);
            setActiveRelTypes(relTypes);
        } catch (error) {
            console.error("Fetch graph failed:", error);
        }
    };

    const handleFolderChange = (slug: string) => {
        setSelectedFolder(slug);
        fetchGraph(slug);
    };

    // Filter Logic
    const filteredNodes = graphData.nodes.filter(n => {
        // If searching specifically for an ID (deep link), prioritize that
        const highlightParam = searchParams.get('highlight');
        if (highlightParam && n.id === highlightParam) return true;

        const matchesSearch = n.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.label.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLabel = activeLabels.includes(n.label);
        return matchesSearch && matchesLabel;
    });

    const displayData = {
        nodes: filteredNodes,
        links: graphData.links.filter(l => {
            const matchesRelType = activeRelTypes.includes(l.type);
            const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
            const targetId = typeof l.target === 'object' ? l.target.id : l.target;
            const nodesExist = filteredNodes.some(n => n.id === sourceId) && filteredNodes.some(n => n.id === targetId);
            return matchesRelType && nodesExist;
        })
    };

    const nodeCounts = graphData.nodes.reduce((acc: any, n: any) => {
        acc[n.label] = (acc[n.label] || 0) + 1;
        return acc;
    }, {});

    const relCounts = graphData.links.reduce((acc: any, l: any) => {
        acc[l.type] = (acc[l.type] || 0) + 1;
        return acc;
    }, {});

    useEffect(() => {
        if (headerRef.current) gsap.from(headerRef.current, { opacity: 0, y: -20, duration: 1, ease: 'power3.out' });
        if (legendRef.current) gsap.from(legendRef.current, { opacity: 0, y: 20, duration: 1, delay: 0.3, ease: 'power3.out' });
    }, []);

    const cardShadow = useColorModeValue('md', 'none');

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

    const selectedFolderName = folders.find(f => f.slug === selectedFolder)?.name || 'NONE';

    return (
        <Flex h="full" w="full" bg="bg.canvas" position="relative" overflow="hidden">
            {/* Filter Sidebar (Bloom Style) */}
            <Box
                w={showFilters ? "320px" : "0px"}
                h="full"
                bg={cardBg}
                backdropBlur="md"
                borderRight="1px solid"
                borderColor={borderColor}
                transition="all 0.3s ease"
                overflow="hidden"
                zIndex={30}
                position="relative"
                shadow={cardShadow}
            >
                <VStack align="stretch" p={5} spaceY={6} h="full">
                    <HStack justifyContent="space-between">
                        <Heading size="xs" color="gray.500" letterSpacing="widest">FILTERS</Heading>
                        <Button variant="ghost" size="xs" onClick={() => setShowFilters(false)}>✕</Button>
                    </HStack>

                    {/* Sidebar Search */}
                    <HStack bg={selectBg} px={3} py={2} rounded="xl" border="1px solid" borderColor={borderColor}>
                        <LuScanSearch size="14px" color="gray" />
                        <Input
                            variant="subtle"
                            bg="transparent"
                            border="none"
                            placeholder="Search nodes..."
                            fontSize="xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </HStack>

                    {/* Node Types */}
                    <VStack align="stretch" spaceY={3}>
                        <HStack justifyContent="space-between">
                            <Text fontSize="10px" fontWeight="black" color="jungle-teal">NODE TYPES</Text>
                            <HStack spaceX={2}>
                                <Text cursor="pointer" fontSize="9px" onClick={() => setActiveLabels(Array.from(new Set(graphData.nodes.map(n => n.label))))}>Select All</Text>
                                <Text cursor="pointer" fontSize="9px" onClick={() => setActiveLabels([])}>Deselect All</Text>
                            </HStack>
                        </HStack>
                        <Box maxH="200px" overflowY="auto">
                            <VStack align="stretch" spaceY={1}>
                                {Object.keys(nodeCounts).sort().map((label, idx) => (
                                    <HStack
                                        key={label}
                                        p={2}
                                        rounded="md"
                                        bg={activeLabels.includes(label) ? "jungle-teal/10" : "transparent"}
                                        _hover={{ bg: "white/5" }}
                                        cursor="pointer"
                                        onClick={() => toggleLabel(label)}
                                        justifyContent="space-between"
                                    >
                                        <HStack spaceX={3}>
                                            <Circle size="2" bg={idx % 3 === 0 ? "jungle-teal" : (idx % 3 === 1 ? "turf-green" : "gold")} opacity={activeLabels.includes(label) ? 1 : 0.3} />
                                            <Text fontSize="xs" fontWeight={activeLabels.includes(label) ? "bold" : "normal"}>{label}</Text>
                                        </HStack>
                                        <Badge variant="subtle" size="xs" rounded="full">{nodeCounts[label]}</Badge>
                                    </HStack>
                                ))}
                            </VStack>
                        </Box>
                    </VStack>

                    {/* Relationship Types */}
                    <VStack align="stretch" spaceY={3}>
                        <HStack justifyContent="space-between">
                            <Text fontSize="10px" fontWeight="black" color="jungle-teal">RELATIONSHIP TYPES</Text>
                            <HStack spaceX={2}>
                                <Text cursor="pointer" fontSize="9px" onClick={() => setActiveRelTypes(Array.from(new Set(graphData.links.map(l => l.type))))}>Select All</Text>
                                <Text cursor="pointer" fontSize="9px" onClick={() => setActiveRelTypes([])}>Deselect All</Text>
                            </HStack>
                        </HStack>
                        <Box maxH="200px" overflowY="auto">
                            <VStack align="stretch" spaceY={1}>
                                {Object.keys(relCounts).sort().map(type => (
                                    <HStack
                                        key={type}
                                        p={2}
                                        rounded="md"
                                        bg={activeRelTypes.includes(type) ? "white/10" : "transparent"}
                                        _hover={{ bg: "white/5" }}
                                        cursor="pointer"
                                        onClick={() => toggleRelType(type)}
                                        justifyContent="space-between"
                                    >
                                        <HStack spaceX={3}>
                                            <Box w="2px" h="10px" bg="gray.500" opacity={activeRelTypes.includes(type) ? 1 : 0.3} />
                                            <Text fontSize="xs" fontWeight={activeRelTypes.includes(type) ? "bold" : "normal"}>{type}</Text>
                                        </HStack>
                                        <Badge variant="subtle" size="xs" rounded="full">{relCounts[type]}</Badge>
                                    </HStack>
                                ))}
                            </VStack>
                        </Box>
                    </VStack>

                    <Box pt={4} borderTop="1px solid" borderColor="white/10">
                        <Text fontSize="10px" fontWeight="black" color="gray.500">MINIMUM CONNECTIONS</Text>
                        <HStack mt={2}>
                            <Box flex={1} h="2px" bg="white/10" position="relative">
                                <Box position="absolute" left="0" top="-4px" w="10px" h="10px" bg="jungle-teal" rounded="full" cursor="pointer" />
                            </Box>
                        </HStack>
                    </Box>
                </VStack>
            </Box>

            {/* Edge-to-Edge Graph Background */}
            <Box flex={1} h="full" position="relative">
                <NexusGraph data={displayData} layoutMode={layoutMode} />
                <Box position="absolute" top={0} left={0} w="full" h="full" bgGradient="radial" gradientFrom="transparent" gradientTo="black/20" pointerEvents="none" />

                {/* Toggle Filter Button */}
                {!showFilters && (
                    <Button
                        position="absolute"
                        top={6}
                        left={6}
                        zIndex={40}
                        onClick={() => setShowFilters(true)}
                        bg={cardBg}
                        backdropBlur="md"
                        rounded="xl"
                        border="1px solid"
                        borderColor={borderColor}
                        size="sm"
                    >
                        <LuScanSearch size="16px" />
                    </Button>
                )}
            </Box>

            {/* Bloom-Style Top Bar */}
            <Box
                position="absolute"
                top={6}
                left={showFilters ? "calc(50% + 160px)" : "50%"}
                transform="translateX(-50%)"
                zIndex={20}
                w={showFilters ? "calc(90% - 320px)" : "90%"}
                maxW="1400px"
                ref={headerRef}
                transition="all 0.3s ease"
            >
                <HStack
                    bg={headerBg}
                    backdropBlur="20px"
                    p={3}
                    px={6}
                    rounded="full"
                    border="1px solid"
                    borderColor={borderColor}
                    shadow="2xl"
                    justifyContent="space-between"
                >
                    <HStack spaceX={4}>
                        <VStack align="start" spaceY={0}>
                            <HStack spaceX={2}>
                                <Badge colorPalette="teal" variant="outline" rounded="md" fontSize="8px" px={2} fontWeight="black">
                                    FOLDER: {selectedFolderName.toUpperCase()}
                                </Badge>
                                <Circle size="1.5" bg="turf-green" className="animate-pulse" />
                            </HStack>
                            <Heading size="xs" fontWeight="black" letterSpacing="tight" color={headerTextColor}>
                                {layoutMode === 'tree' ? 'Hierarchy Tree' : layoutMode === 'radial' ? 'Radial Burst' : 'Discovery Network'}
                            </Heading>
                        </VStack>
                    </HStack>

                    <HStack spaceX={3}>
                        <select
                            style={{
                                background: selectBg,
                                color: selectColor,
                                fontSize: '10px',
                                fontWeight: 'black',
                                padding: '6px 12px',
                                borderRadius: '10px',
                                border: `1px solid ${borderColor}`,
                                cursor: 'pointer'
                            }}
                            value={selectedFolder}
                            onChange={(e) => handleFolderChange(e.target.value)}
                        >
            {folders.map(f => (
                                <option key={f.id} value={f.slug} style={{ background: optionBg, color: selectColor }}>{f.name.toUpperCase()}</option>
                            ))}
                        </select>
                        <Button variant="ghost" rounded="xl" h="8" w="8" _hover={{ bg: 'white/10' }}>
                            <LuInfinity size="16px" />
                        </Button>
                    </HStack>
                </HStack>
            </Box>

            {/* Dynamic Node Legend (Bottom Center) */}
            <Box
                position="absolute"
                bottom={10}
                left={showFilters ? "calc(50% + 160px)" : "50%"}
                transform="translateX(-50%)"
                transition="all 0.3s ease"
                zIndex={20}
                ref={legendRef}
            >
                <HStack
                    bg={headerBg}
                    backdropBlur="20px"
                    p={3}
                    px={8}
                    rounded="full"
                    border="1px solid"
                    borderColor={borderColor}
                    shadow="2xl"
                    spaceX={8}
                >
                    <Text fontSize="9px" fontWeight="black" color="jungle-teal" letterSpacing="2px">LEGEND</Text>
                    <HStack spaceX={6}>
                        {activeLabels.slice(0, 5).map((label, idx) => (
                            <HStack key={label} spaceX={2}>
                                <Circle size="2" bg={idx % 3 === 0 ? 'jungle-teal' : (idx % 3 === 1 ? 'turf-green' : 'gold')} />
                                <LabelText label={label} />
                            </HStack>
                        ))}
                        {activeLabels.length > 5 && <Text fontSize="9px" color={headerTextColor}>+{activeLabels.length - 5} MORE</Text>}
                    </HStack>
                </HStack>
            </Box>

            {/* Right Bottom Metrics */}
            <Box position="absolute" bottom={10} right={10} zIndex={10}>
                <Badge bg="jungle-teal/20" color="jungle-teal" variant="subtle" p={3} px={5} rounded="2xl" border="1px solid" borderColor="jungle-teal/30">
                    <HStack spaceX={3}>
                        <LuInfinity />
                        <Text fontSize="xs" fontWeight="black">{displayData.nodes.length} NODES</Text>
                    </HStack>
                </Badge>
            </Box>
        </Flex>
    );
};
