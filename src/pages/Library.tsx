import { Box, Heading, Text, VStack, Button, Textarea, SimpleGrid, Icon, Badge, HStack, Circle } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';
import { LuFilePlus, LuFolder, LuSearch, LuZap } from 'react-icons/lu';

export const Library = () => {
    const cardBg = useColorModeValue('white', 'slate.900');
    const borderColor = useColorModeValue('jungle-teal/10', 'jungle-teal/20');

    const folders = [
        { name: 'Herbal Mechanisms', count: 12, date: 'Mar 10, 2026' },
        { name: 'Disease Interactions', count: 8, date: 'Mar 08, 2026' },
        { name: 'Chemical Biotics', count: 5, date: 'Mar 05, 2026' },
    ];

    return (
        <Box p={8}>
            <VStack align="start" spaceY={10} w="full">
                <HStack justifyContent="space-between" w="full">
                    <VStack align="start" spaceY={1}>
                        <Heading size="xl" fontWeight="black">Knowledge Library</Heading>
                        <Text color="slate.500">Manage your scientific folders and document extractions.</Text>
                    </VStack>
                    <HStack spaceX={3}>
                        <Button variant="ghost" leftIcon={<LuSearch />} size="sm">Search</Button>
                        <Button bg="jungle-teal" color="white" rounded="xl" leftIcon={<LuFilePlus />} _hover={{ bg: 'turf-green' }}>New Folder</Button>
                    </HStack>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} w="full">
                    {/* Extraction Engine Card */}
                    <Box p={8} bg={cardBg} rounded="3xl" border="1px solid" borderColor="jungle-teal/30" shadow="2xl" position="relative" overflow="hidden">
                        <Circle size="100px" bg="jungle-teal" opacity="0.05" blur="40px" position="absolute" top="-20px" right="-20px" />
                        <VStack align="start" spaceY={6} position="relative">
                            <HStack spaceX={3}>
                                <Icon as={LuZap} color="jungle-teal" />
                                <Heading size="md" color="jungle-teal">Gemini Master Extraction</Heading>
                            </HStack>
                            <Text fontSize="sm" color="slate.400">
                                Paste raw scientific text or research snippets to extract nodes and bi-directional relationships directly into the graph.
                            </Text>
                            <Textarea
                                placeholder="Paste research text here..."
                                size="sm"
                                rounded="2xl"
                                bg="black/5"
                                borderColor="jungle-teal/10"
                                h="150px"
                                _focus={{ borderColor: 'jungle-teal' }}
                            />
                            <Button w="full" bgGradient="to-r" gradientFrom="jungle-teal" gradientTo="turf-green" color="white" rounded="xl" shadow="lg" _hover={{ shadow: 'xl', transform: 'translateY(-2px)' }}>
                                Start Extraction
                            </Button>
                        </VStack>
                    </Box>

                    {/* Folder Management */}
                    <VStack align="stretch" spaceY={4}>
                        <Heading size="xs" textTransform="uppercase" color="slate.500" tracking="widest">Your Folders</Heading>
                        <VStack align="stretch" spaceY={3}>
                            {folders.map(folder => (
                                <HStack
                                    key={folder.name}
                                    p={4}
                                    bg={cardBg}
                                    rounded="2xl"
                                    border="1px solid"
                                    borderColor={borderColor}
                                    justifyContent="space-between"
                                    cursor="pointer"
                                    _hover={{ borderColor: 'jungle-teal/50', transform: 'translateX(5px)' }}
                                    transition="all 0.2s"
                                >
                                    <HStack spaceX={4}>
                                        <Circle size="10" bg="jungle-teal/10" color="jungle-teal">
                                            <LuFolder size="18px" />
                                        </Circle>
                                        <VStack align="start" spaceY={0}>
                                            <Text fontWeight="bold" fontSize="sm">{folder.name}</Text>
                                            <Text fontSize="xs" color="slate.500">{folder.count} Nodes indexed</Text>
                                        </VStack>
                                    </HStack>
                                    <VStack align="end" spaceY={0}>
                                        <Badge variant="subtle" colorScheme="green" fontSize="10px" rounded="md">SYNCED</Badge>
                                        <Text fontSize="10px" color="slate.600" mt={1}>{folder.date}</Text>
                                    </VStack>
                                </HStack>
                            ))}
                        </VStack>
                        <Button variant="link" color="jungle-teal" alignSelf="start" size="xs">View all folders</Button>
                    </VStack>
                </SimpleGrid>
            </VStack>
        </Box>
    );
};
