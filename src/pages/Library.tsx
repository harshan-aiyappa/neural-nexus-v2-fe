import { Box, Heading, Text, VStack, Button, SimpleGrid, Badge, HStack, Circle, Flex, Input, Spinner } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';
import { LuFilePlus, LuFolder, LuSearch, LuZap, LuLayoutGrid, LuNetwork, LuClock, LuPlus } from 'react-icons/lu';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const Library = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [folders, setFolders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const cardBg = useColorModeValue('white', 'bg.surface');
    const borderColor = useColorModeValue('gray.100', 'border.subtle');

    const fetchFolders = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/folders`);
            setFolders(res.data);
        } catch (e) {
            console.error("Failed to fetch folders:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    const handleCreateFolder = async () => {
        const name = prompt("Enter Topic Name:");
        if (!name) return;
        try {
            await axios.post(`${API_BASE_URL}/folders`, { name, description: "New research topic" });
            fetchFolders();
        } catch (e) {
            alert("Failed to create topic");
        }
    };

    const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <Box p={8}>
            <VStack align="start" spaceY={10} w="full">
                {/* Header Section */}
                <VStack align="start" spaceY={6} w="full">
                    <HStack justifyContent="space-between" w="full">
                        <VStack align="start" spaceY={1}>
                            <Heading size="2xl" fontWeight="black" letterSpacing="tight">Knowledge Library</Heading>
                            <Text color={useColorModeValue('slate.600', 'slate.400')}>Manage your scientific topics and coordinate extractions.</Text>
                        </VStack>
                        <Button bg="jungle-teal" color="white" rounded="xl" shadow="lg" p={6} _hover={{ bg: 'turf-green' }} onClick={handleCreateFolder}>
                            <LuFilePlus /> New Topic
                        </Button>
                    </HStack>

                    {/* Search Bar */}
                    <HStack w="full" spaceX={4}>
                        <Flex flex={1} position="relative">
                            <Box position="absolute" left={4} top="50%" transform="translateY(-50%)" color={useColorModeValue('slate.400', 'slate.500')} zIndex={2}>
                                <LuSearch />
                            </Box>
                            <Input
                                placeholder="Search folders, documents, or knowledge clusters..."
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
                        <Button variant="outline" h="56px" px={6} rounded="2xl" color={useColorModeValue('slate.600', 'slate.500')} borderColor={borderColor}>
                            Filter
                        </Button>
                    </HStack>
                </VStack>

                {/* Topics Grid */}
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
                            >
                                <VStack align="stretch" spaceY={4}>
                                    <HStack justifyContent="space-between">
                                        <Circle size="12" bg="jungle-teal/10" color="jungle-teal">
                                            <LuFolder size="22px" />
                                        </Circle>
                                        <Button variant="plain" size="xs" color="slate.400">
                                            <LuLayoutGrid />
                                        </Button>
                                    </HStack>

                                    <VStack align="start" spaceY={1}>
                                        <Heading size="md" fontWeight="black">{folder.name}</Heading>
                                        <Text fontSize="xs" color={useColorModeValue('slate.600', 'slate.400')} truncate maxW="full">{folder.description}</Text>
                                    </VStack>

                                    <Box pt={4} borderTop="1px solid" borderColor={borderColor}>
                                        <SimpleGrid columns={2} gap={4}>
                                            <VStack align="start" spaceY={0}>
                                                <HStack spaceX={1} color="slate.400">
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
                                            <LuClock size="12px" color={useColorModeValue('#64748b', '#94a3b8')} />
                                            <Text fontSize="xs" color={useColorModeValue('slate.600', 'slate.400')}>Updated {folder.updated_at || 'Recently'}</Text>
                                        </HStack>
                                        <Badge colorPalette="green" variant="subtle" rounded="md" fontSize="9px">SYNCED</Badge>
                                    </HStack>
                                </VStack>
                            </Box>
                        ))}

                        {/* Quick Extraction Trigger */}
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
                        >
                            <LuPlus size="32px" color="#518E6D" />
                            <Text fontWeight="bold" fontSize="sm" color="jungle-teal" mt={3}>Direct Extraction</Text>
                            <Text fontSize="10px" color="jungle-teal/60" textAlign="center" mt={1}>Upload PDF or paste content</Text>
                        </Box>
                    </SimpleGrid>
                )}
            </VStack>
        </Box>
    );
};
