import { Box, Heading, Text, VStack, Button, SimpleGrid, Badge, HStack, Circle, Flex, Input, Spinner, Table, IconButton } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';
import { LuFilePlus, LuFolder, LuSearch, LuZap, LuLayoutGrid, LuNetwork, LuClock, LuPlus, LuExternalLink, LuSearchCode, LuArrowLeft } from 'react-icons/lu';
import { useState, useEffect, useMemo } from 'react';
import { nexusApi, Node } from '@/services/api';
import { useNavigate } from 'react-router-dom';

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

    const cardBg = useColorModeValue('white', 'bg.surface');
    const borderColor = useColorModeValue('gray.100', 'white/10');
    const hoverBg = useColorModeValue('gray.50', 'white/5');

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
        try {
            const data = await nexusApi.getGraph(slug);
            setBrowseData({ nodes: data.nodes });
        } catch (e) {
            console.error("Failed to fetch browse data:", e);
        }
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    useEffect(() => {
        if (isBrowsing && browseFolder) {
            fetchBrowseData(browseFolder);
            setActiveLabel('All'); // Reset label filter on folder change
            setBrowseSearch('');
        }
    }, [isBrowsing, browseFolder]);

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

    // Browse Filters
    const nodeCountsByLabel = useMemo(() => {
        return browseData.nodes.reduce((acc: any, n) => {
            acc[n.label] = (acc[n.label] || 0) + 1;
            return acc;
        }, {});
    }, [browseData.nodes]);

    const filteredNodes = useMemo(() => {
        return browseData.nodes.filter(n => {
            const matchesLabel = activeLabel === 'All' || n.label === activeLabel;
            const matchesSearch = n.name?.toLowerCase().includes(browseSearch.toLowerCase()) ||
                n.label.toLowerCase().includes(browseSearch.toLowerCase());
            return matchesLabel && matchesSearch;
        });
    }, [browseData.nodes, activeLabel, browseSearch]);

    const renderFoldersGrid = () => (
        <VStack align="start" spaceY={8} w="full">
            {/* Search Bar */}
            <HStack w="full" spaceX={4}>
                <Flex flex={1} position="relative">
                    <Box position="absolute" left={4} top="50%" transform="translateY(-50%)" color="gray.400" zIndex={2}>
                        <LuSearch />
                    </Box>
                    <Input
                        placeholder="Search topics or knowledge clusters..."
                        pl={12}
                        h="56px"
                        bg={cardBg}
                        rounded="2xl"
                        border="1px solid"
                        borderColor={borderColor}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Flex>
                <Button variant="outline" h="56px" px={6} rounded="2xl" color="gray.500" borderColor={borderColor}>
                    Filter
                </Button>
            </HStack>

            {loading ? (
                <Flex w="full" h="300px" align="center" justify="center">
                    <Spinner color="jungle-teal" size="xl" />
                </Flex>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} w="full">
                    {filteredFolders.map(folder => (
                        <Box
                            key={folder.id}
                            p={6}
                            bg={cardBg}
                            rounded="3xl"
                            border="1px solid"
                            borderColor={borderColor}
                            position="relative"
                            cursor="pointer"
                            transition="all 0.3s"
                            _hover={{ transform: 'translateY(-5px)', borderColor: 'jungle-teal/50', shadow: '2xl' }}
                            onClick={() => {
                                setBrowseFolder(folder.slug);
                                setIsBrowsing(true);
                            }}
                        >
                            <VStack align="stretch" spaceY={4}>
                                <HStack justifyContent="space-between">
                                    <Circle size="12" bg="jungle-teal/10" color="jungle-teal">
                                        <LuFolder size="22px" />
                                    </Circle>
                                    <Button variant="plain" size="xs" color="gray.400">
                                        <LuLayoutGrid />
                                    </Button>
                                </HStack>

                                <VStack align="start" spaceY={1}>
                                    <Heading size="md" fontWeight="black">{folder.name}</Heading>
                                    <Text fontSize="xs" color="gray.400" truncate maxW="full">{folder.description}</Text>
                                </VStack>

                                <Box pt={4} borderTop="1px solid" borderColor={borderColor}>
                                    <SimpleGrid columns={2} gap={4}>
                                        <VStack align="start" spaceY={0}>
                                            <HStack spaceX={1} color="gray.400">
                                                <LuZap size="12px" />
                                                <Text fontSize="10px" fontWeight="bold" letterSpacing="widest">FILES</Text>
                                            </HStack>
                                            <Text fontWeight="black" fontSize="sm">{folder.file_count || 0}</Text>
                                        </VStack>
                                        <VStack align="start" spaceY={0}>
                                            <HStack spaceX={1} color="jungle-teal">
                                                <LuNetwork size="12px" />
                                                <Text fontSize="10px" fontWeight="bold" letterSpacing="widest">NODES</Text>
                                            </HStack>
                                            <Text fontWeight="black" fontSize="sm">{folder.node_count || 0}</Text>
                                        </VStack>
                                    </SimpleGrid>
                                </Box>

                                <HStack justifyContent="space-between" pt={2}>
                                    <HStack spaceX={2}>
                                        <LuClock size="12px" color="gray.400" />
                                        <Text fontSize="xs" color="gray.400">Updated {folder.updated_at || 'Recently'}</Text>
                                    </HStack>
                                    <Badge colorPalette="green" variant="subtle" rounded="md" fontSize="9px">SYNCED</Badge>
                                </HStack>
                            </VStack>
                        </Box>
                    ))}

                    <Box
                        p={6}
                        bg="jungle-teal/5"
                        rounded="3xl"
                        border="2px dashed"
                        borderColor="jungle-teal/20"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        cursor="pointer"
                        _hover={{ bg: 'jungle-teal/10', borderColor: 'jungle-teal' }}
                        transition="all 0.2s"
                        onClick={handleCreateFolder}
                    >
                        <LuPlus size="32px" color="#518E6D" />
                        <Text fontWeight="bold" fontSize="sm" color="jungle-teal" mt={3}>Create New Topic</Text>
                        <Text fontSize="10px" color="jungle-teal/60" textAlign="center" mt={1}>Start a new knowledge cluster</Text>
                    </Box>
                </SimpleGrid>
            )}
        </VStack>
    );

    const renderBrowseView = () => (
        <VStack align="start" spaceY={6} w="full">
            {/* Header / Back Action */}
            <HStack spaceX={4} pt={2}>
                <Button variant="ghost" rounded="full" onClick={() => setIsBrowsing(false)} _hover={{ bg: 'white/5' }}>
                    <LuArrowLeft /> <Text ml={2} fontSize="sm" fontWeight="bold">Back to Topics</Text>
                </Button>
            </HStack>

            {/* Folder & Label Filters */}
            <VStack align="start" spaceY={4} w="full" p={6} bg={cardBg} rounded="3xl" border="1px solid" borderColor={borderColor}>
                <HStack w="full" justifyContent="space-between" flexWrap="wrap">
                    <HStack spaceX={3}>
                        <LuFolder color="gray" />
                        <select
                            value={browseFolder}
                            onChange={(e) => setBrowseFolder(e.target.value)}
                            style={{ background: 'transparent', color: useColorModeValue('gray.800', 'gray'), fontSize: '14px', fontWeight: 'bold', outline: 'none' }}
                        >
                            {folders.map(f => (
                                <option key={f.id} value={f.slug} style={{ background: useColorModeValue('white', '#1a1a1a'), color: useColorModeValue('gray.800', 'gray') }}>{f.name.toUpperCase()}</option>
                            ))}
                        </select>
                    </HStack>
                    <HStack spaceX={2} flexWrap="wrap" mt={{ base: 4, md: 0 }}>
                        <Button
                            size="sm"
                            rounded="full"
                            variant={activeLabel === 'All' ? 'solid' : 'ghost'}
                            colorPalette={activeLabel === 'All' ? 'teal' : 'gray'}
                            onClick={() => setActiveLabel('All')}
                        >
                            All {browseData.nodes.length}
                        </Button>
                        {Object.keys(nodeCountsByLabel).sort().map(label => (
                            <Button
                                key={label}
                                size="sm"
                                rounded="full"
                                variant={activeLabel === label ? 'solid' : 'ghost'}
                                colorPalette={activeLabel === label ? 'teal' : 'gray'}
                                onClick={() => setActiveLabel(label)}
                            >
                                {label} {nodeCountsByLabel[label]}
                            </Button>
                        ))}
                    </HStack>
                </HStack>

                <Flex w="full" position="relative">
                    <Box position="absolute" left={4} top="50%" transform="translateY(-50%)" color="gray.400" zIndex={2}>
                        <LuSearch />
                    </Box>
                    <Input
                        placeholder={`Search ${activeLabel}...`}
                        pl={12}
                        h="48px"
                        bg={useColorModeValue('gray.100', 'black/5')}
                        rounded="xl"
                        border="1px solid"
                        borderColor={borderColor}
                        value={browseSearch}
                        onChange={(e) => setBrowseSearch(e.target.value)}
                    />
                </Flex>
            </VStack>

            {/* Entity List */}
            <Box w="full" bg={cardBg} rounded="3xl" border="1px solid" borderColor={borderColor} overflow="hidden">
                <Box p={4} borderBottom="1px solid" borderColor={borderColor} bg="black/5">
                    <HStack color="gray.400" fontSize="10px" fontWeight="black" letterSpacing="widest">
                        <Text flex={1}>NAME</Text>
                        <Text w="150px">LABEL</Text>
                        <Text w="100px" textAlign="right">ACTION</Text>
                    </HStack>
                </Box>
                <VStack align="stretch" spaceY={0} maxH="500px" overflowY="auto">
                    {filteredNodes.length === 0 ? (
                        <Flex p={10} justify="center" align="center" direction="column" spaceY={4}>
                            <LuSearchCode size="32px" color="gray" opacity={0.3} />
                            <Text color="gray.400" fontSize="sm">No entities found in this scope.</Text>
                        </Flex>
                    ) : (
                        filteredNodes.map((node) => (
                            <HStack
                                key={node.id}
                                p={4}
                                borderBottom="1px solid"
                                borderColor={borderColor}
                                _hover={{ bg: hoverBg }}
                                transition="all 0.2s"
                            >
                                <HStack flex={1} spaceX={4}>
                                    <Circle size="2" bg="jungle-teal" />
                                    <Text fontWeight="bold" color="jungle-teal">{node.name || node.id}</Text>
                                </HStack>
                                <Badge w="150px" variant="subtle" colorPalette="teal" size="xs">{node.label}</Badge>
                                <Box w="100px" textAlign="right">
                                    <Button
                                        size="xs"
                                        variant="ghost"
                                        colorPalette="teal"
                                        onClick={() => navigate(`/discovery?folder=${browseFolder}&highlight=${node.id}`)}
                                        _hover={{ bg: 'jungle-teal/10' }}
                                    >
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
                {/* Header Section */}
                <VStack align="start" spaceY={2} w="full">
                    <HStack justifyContent="space-between" w="full">
                        <VStack align="start" spaceY={1}>
                            <Heading size="2xl" fontWeight="black" letterSpacing="tight">Knowledge Library</Heading>
                            <Text color="gray.400">Manage your scientific topics and explore entities contextually.</Text>
                        </VStack>
                        {!isBrowsing && (
                            <Button bg="jungle-teal" color="white" rounded="xl" shadow="lg" p={6} _hover={{ bg: 'turf-green' }} onClick={handleCreateFolder}>
                                <LuFilePlus /> New Topic
                            </Button>
                        )}
                    </HStack>
                </VStack>

                {/* Content */}
                <Box w="full">
                    {!isBrowsing ? renderFoldersGrid() : renderBrowseView()}
                </Box>
            </VStack>
        </Box>
    );
};
