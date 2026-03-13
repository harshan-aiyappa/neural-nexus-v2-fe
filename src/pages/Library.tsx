import { Box, Heading, Text, VStack, Button, SimpleGrid, Badge, HStack, Circle, Flex, Input } from '@chakra-ui/react';
import { LuFolder, LuSearch, LuZap, LuNetwork, LuClock, LuPlus, LuExternalLink, LuSearchCode, LuArrowLeft } from 'react-icons/lu';
import { useState, useEffect, useMemo } from 'react';
import { nexusApi, Node } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { LibrarySkeleton } from '@/components/ui/SkeletonLoaders';
import gsap from 'gsap';

export const Library = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [folders, setFolders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Browse Data State
    const [isBrowsing, setIsBrowsing] = useState(false);
    const [browseFolder, setBrowseFolder] = useState<string>('');
    const [browseData, setBrowseData] = useState<{ nodes: Node[] }>({ nodes: [] });
    const [activeLabel, setActiveLabel] = useState<string>('All');
    const [browseSearch, setBrowseSearch] = useState('');
    const [visibleLimit, setVisibleLimit] = useState(50);
    const [isFetchingNodes, setIsFetchingNodes] = useState(false);

    const fetchFolders = async () => {
        try {
            const data = await nexusApi.getFolders();
            setFolders(data);
        } catch (e) {
            console.error("Failed to fetch folders:", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchBrowseData = async (slug: string) => {
        if (!slug) return;
        setIsFetchingNodes(true);
        try {
            const data = await nexusApi.getGraph(slug);
            setBrowseData({ nodes: data.nodes });
        } catch (e) {
            console.error("Failed to fetch browse data:", e);
        } finally {
            setIsFetchingNodes(false);
        }
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    useEffect(() => {
        if (isBrowsing && browseFolder) {
            fetchBrowseData(browseFolder);
            setActiveLabel('All');
            setBrowseSearch('');
            setVisibleLimit(50);
        }
    }, [isBrowsing, browseFolder]);

    // Entrance Animation for Folder Grid
    useEffect(() => {
        if (!loading && !isBrowsing) {
            gsap.fromTo(".library-folder-card", 
                { scale: 0.9, opacity: 0, y: 20 },
                { 
                    scale: 1, 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.6, 
                    stagger: 0.08, 
                    ease: "back.out(1.4)",
                    clearProps: "all" 
                }
            );
        }
    }, [loading, isBrowsing]);

    const handleCreateFolder = async () => {
        const name = prompt("Enter Topic Name:");
        if (!name) return;
        try {
            await nexusApi.createFolder(name);
            fetchFolders();
        } catch (e) {
            alert("Failed to create topic");
        }
    };

    const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const nodeCountsByLabel = useMemo(() => {
        return browseData.nodes.reduce((acc: any, n: any) => {
            acc[n.label || 'Entity'] = (acc[n.label || 'Entity'] || 0) + 1;
            return acc;
        }, {});
    }, [browseData.nodes]);

    const filteredNodes = useMemo(() => {
        return browseData.nodes.filter((n: any) => {
            const label = n.label || 'Entity';
            const name = n.name || n.id || '';
            const matchesLabel = activeLabel === 'All' || label === activeLabel;
            const matchesSearch = name.toLowerCase().includes(browseSearch.toLowerCase()) ||
                label.toLowerCase().includes(browseSearch.toLowerCase());
            return matchesLabel && matchesSearch;
        });
    }, [browseData.nodes, activeLabel, browseSearch]);

    const paginatedNodes = useMemo(() => {
        return filteredNodes.slice(0, visibleLimit);
    }, [filteredNodes, visibleLimit]);

    const renderFoldersGrid = () => (
        <VStack align="start" spaceY={8} w="full">
            <HStack w="full" spaceX={4} className="library-header">
                <Flex flex={1} position="relative">
                    <Box position="absolute" left={4} top="50%" transform="translateY(-50%)" color="fg.muted" zIndex={2}>
                        <LuSearch />
                    </Box>
                    <Input
                        placeholder="Search topics or knowledge clusters..."
                        pl={12} h="56px" bg="bg.surface" rounded="2xl" border="1px solid" borderColor="border.subtle"
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} color="fg" fontWeight="medium"
                        _focus={{ borderColor: "brand-emerald", shadow: "0 0 15px rgba(16, 185, 129, 0.2)" }}
                    />
                </Flex>
                <Button variant="outline" h="56px" px={6} rounded="2xl" color="fg.muted" borderColor="border.subtle" _hover={{ bg: "bg.muted" }}>
                    Filter
                </Button>
            </HStack>

            {loading ? (
                <LibrarySkeleton />
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} w="full">
                    {filteredFolders.map(folder => (
                        <Box
                            key={folder.id} p={6} bg="bg.surface" rounded="3xl" border="1px solid" borderColor="border.subtle"
                            position="relative" cursor="pointer" transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                            className="library-folder-card"
                            _hover={{ transform: 'translateY(-6px)', borderColor: 'brand-emerald/40', shadow: ' premium' }}
                            onClick={() => { setBrowseFolder(folder.slug); setIsBrowsing(true); }}
                        >
                            <VStack align="stretch" spaceY={4}>
                                <HStack justifyContent="space-between">
                                    <Circle size="12" bg="brand-emerald/10" color="brand-emerald" shadow="inner">
                                        <LuFolder size="22px" />
                                    </Circle>
                                    <Badge variant="subtle" colorPalette="teal" rounded="full" px={3} fontSize="9px" fontWeight="black">SYNCED</Badge>
                                </HStack>
                                <VStack align="start" spaceY={1}>
                                    <Heading size="md" fontWeight="black" color="fg">{folder.name}</Heading>
                                    <Text fontSize="xs" color="fg.muted" truncate maxW="full" fontWeight="medium">{folder.description || 'No description provided'}</Text>
                                </VStack>
                                <Box pt={4} borderTop="1px solid" borderColor="border.muted">
                                    <SimpleGrid columns={2} gap={4}>
                                        <VStack align="start" spaceY={0}>
                                            <HStack spaceX={1} color="fg.subtle">
                                                <LuZap size="12px" />
                                                <Text fontSize="10px" fontWeight="black" letterSpacing="widest">FILES</Text>
                                            </HStack>
                                            <Text fontWeight="black" fontSize="md" color="fg">{folder.file_count || 0}</Text>
                                        </VStack>
                                        <VStack align="start" spaceY={0}>
                                            <HStack spaceX={1} color="brand-emerald">
                                                <LuNetwork size="12px" />
                                                <Text fontSize="10px" fontWeight="black" letterSpacing="widest">NODES</Text>
                                            </HStack>
                                            <Text fontWeight="black" fontSize="md" color="fg">{folder.node_count || 0}</Text>
                                        </VStack>
                                    </SimpleGrid>
                                </Box>
                                <HStack justifyContent="space-between" pt={2}>
                                    <HStack spaceX={2}>
                                        <LuClock size="12px" color="fg.subtle" />
                                        <Text fontSize="10px" color="fg.muted" fontWeight="bold">Updated {folder.updated_at || 'Recently'}</Text>
                                    </HStack>
                                </HStack>
                            </VStack>
                        </Box>
                    ))}
                    <Box
                        p={6} bg="brand-emerald/5" rounded="3xl" border="2px dashed" borderColor="brand-emerald/20"
                        display="flex" flexDirection="column" alignItems="center" justifyContent="center"
                        cursor="pointer" _hover={{ bg: 'brand-emerald/10', borderColor: 'brand-emerald', transform: 'scale(0.98)' }}
                        transition="all 0.3s" onClick={handleCreateFolder} className="library-folder-card"
                    >
                        <LuPlus size="32px" color="var(--chakra-colors-brand-emerald)" />
                        <Text fontWeight="black" fontSize="sm" color="brand-emerald" mt={3} letterSpacing="wider">CREATE TOPIC</Text>
                    </Box>
                </SimpleGrid>
            )}
        </VStack>
    );

    const renderBrowseView = () => (
        <VStack align="start" spaceY={6} w="full">
            <HStack spaceX={4} pt={2}>
                <Button variant="ghost" rounded="full" onClick={() => { setIsBrowsing(false); setVisibleLimit(50); }} color="fg.muted" _hover={{ bg: "bg.muted" }}>
                    <LuArrowLeft /> <Text ml={2} fontSize="sm" fontWeight="black">Back to Topics</Text>
                </Button>
            </HStack>

            <VStack align="start" spaceY={4} w="full" p={6} bg="bg.surface" rounded="3xl" border="1px solid" borderColor="border.subtle" shadow=" premium">
                <HStack w="full" justifyContent="space-between" flexWrap="wrap" gap={4}>
                    <HStack spaceX={3}>
                        <Circle size="8" bg="brand-emerald/10" color="brand-emerald"><LuFolder /></Circle>
                        <select
                            value={browseFolder}
                            onChange={(e) => { setBrowseFolder(e.target.value); setVisibleLimit(50); }}
                            style={{ background: 'transparent', color: 'var(--chakra-colors-fg)', fontSize: '15px', fontWeight: '900', outline: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            {folders.map(f => (
                                <option key={f.id} value={f.slug} style={{ background: 'var(--chakra-colors-bg-surface)', color: 'var(--chakra-colors-fg)' }}>{f.name.toUpperCase()}</option>
                            ))}
                        </select>
                    </HStack>
                    <HStack spaceX={2} flexWrap="wrap">
                        <Button size="sm" rounded="full" variant={activeLabel === 'All' ? 'solid' : 'ghost'} bg={activeLabel === 'All' ? 'brand-emerald' : 'transparent'} color={activeLabel === 'All' ? 'white' : 'fg.muted'} onClick={() => { setActiveLabel('All'); setVisibleLimit(50); }} fontWeight="black" fontSize="10px">
                            ALL {browseData.nodes.length}
                        </Button>
                        {Object.keys(nodeCountsByLabel).sort().map(label => (
                            <Button key={label} size="sm" rounded="full" variant={activeLabel === label ? 'solid' : 'ghost'} bg={activeLabel === label ? 'brand-emerald' : 'transparent'} color={activeLabel === label ? 'white' : 'fg.muted'} onClick={() => { setActiveLabel(label); setVisibleLimit(50); }} fontWeight="black" fontSize="10px">
                                {label.toUpperCase()} {nodeCountsByLabel[label]}
                            </Button>
                        ))}
                    </HStack>
                </HStack>

                <Flex w="full" position="relative">
                    <Box position="absolute" left={4} top="50%" transform="translateY(-50%)" color="fg.muted" zIndex={2}>
                        <LuSearch />
                    </Box>
                    <Input
                        placeholder={`Find entities in ${activeLabel}...`} pl={12} h="56px" bg="bg.muted" rounded="xl" border="1px solid"
                        borderColor="border.subtle" value={browseSearch} onChange={(e) => { setBrowseSearch(e.target.value); setVisibleLimit(50); }}
                        color="fg" fontWeight="bold" _focus={{ borderColor: "brand-emerald" }}
                    />
                </Flex>
            </VStack>

            <Box w="full" bg="bg.surface" rounded="3xl" border="1px solid" borderColor="border.subtle" overflow="hidden" shadow="xl">
                <VStack align="stretch" spaceY={0} maxH="600px" overflowY="auto" onScroll={(e: any) => {
                    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                    if (scrollHeight - scrollTop <= clientHeight + 100 && paginatedNodes.length < filteredNodes.length) {
                        setVisibleLimit(prev => prev + 50);
                    }
                }}>
                    {isFetchingNodes ? (
                       <Flex p={20} justify="center" align="center" direction="column">
                           <Box className="shimmer" w="full" h="400px" rounded="2xl" />
                       </Flex>
                    ) : paginatedNodes.length === 0 ? (
                        <Flex p={20} justify="center" align="center" direction="column">
                            <LuSearchCode size="48px" color="var(--chakra-colors-fg-muted)" opacity={0.3} />
                            <Text color="fg.muted" fontSize="sm" mt={6} fontWeight="black">No entities match your filtering criteria.</Text>
                        </Flex>
                    ) : (
                        paginatedNodes.map((node: any) => (
                            <HStack key={node.id} p={5} borderBottom="1px solid" borderColor="border.muted" _hover={{ bg: "bg.muted" }} transition="all 0.2s">
                                <HStack flex={1} spaceX={4}>
                                    <Circle size="2" bg="brand-emerald" shadow="glow" />
                                    <Text fontWeight="black" color="fg" fontSize="sm">{node.name || node.id}</Text>
                                </HStack>
                                <Badge w="160px" variant="subtle" bg="brand-emerald/5" color="brand-emerald" size="sm" fontWeight="black" fontSize="9px" rounded="md" textAlign="center">{node.label?.toUpperCase() || 'ENTITY'}</Badge>
                                <Box w="100px" textAlign="right">
                                    <Button size="xs" variant="ghost" color="brand-emerald" onClick={() => navigate(`/discovery?folder=${browseFolder}&highlight=${node.id}`)} _hover={{ bg: "brand-emerald/10" }}>
                                        <LuExternalLink />
                                    </Button>
                                </Box>
                            </HStack>
                        ))
                    )}
                </VStack>
            </Box>
        </VStack>
    );

    return (
        <Box p={8} w="full">
            <VStack align="start" spaceY={8} w="full">
                <VStack align="start" spaceY={2} w="full">
                    <HStack justifyContent="space-between" w="full">
                        <VStack align="start" spaceY={1}>
                            <Heading size="3xl" fontWeight="black" color="fg" letterSpacing="tighter">Knowledge Library</Heading>
                            <Text color="fg.muted" fontSize="sm" fontWeight="medium">Manage your scientific topics and explore entities contextually.</Text>
                        </VStack>
                        {!isBrowsing && (
                            <Button bg="brand-emerald" color="white" h="60px" px={8} rounded="2xl" shadow="premium" onClick={handleCreateFolder} _hover={{ bg: "jungle-teal", transform: "translateY(-2px)" }}>
                                <LuPlus /> New Topic
                            </Button>
                        )}
                    </HStack>
                </VStack>
                <Box w="full">{!isBrowsing ? renderFoldersGrid() : renderBrowseView()}</Box>
            </VStack>
        </Box>
    );
};
