import { Box, Heading, Text, VStack, HStack, SimpleGrid, Circle, Icon, Button, Badge, Flex } from '@chakra-ui/react';
import { LuZap, LuBrainCircuit, LuNetwork, LuDatabase, LuPlay, LuSave, LuActivity } from 'react-icons/lu';
import { useState } from 'react';

export const MLPipeline = () => {
    const [selectedModel, setSelectedModel] = useState<string | null>(null);

    const mlModels = [
        { id: 'link_prediction', name: 'Link Prediction', desc: 'Predict potential relationships between nodes based on topological features.', type: 'GDS', status: 'Ready' },
        { id: 'node_classification', name: 'Node Classification', desc: 'Identify labels for nodes based on neighbor properties and graph patterns.', type: 'ML', status: 'Ready' },
        { id: 'fast_rp', name: 'FastRP Embeddings', desc: 'High-speed random projection for generating node vectors.', type: 'Embedding', status: 'Deployed' },
        { id: 'node2vec', name: 'Node2Vec', desc: 'Random walk-based embeddings for context-aware similarity.', type: 'Embedding', status: 'Deployed' },
        { id: 'jaccard', name: 'Jaccard Similarity', desc: 'Calculate similarity based on common neighbor sets.', type: 'Similarity', status: 'Ready' },
    ];

    const borderColor = "border.subtle";

    return (
        <Box h="full" overflowY="auto" p={8} maxW="1600px" mx="auto" className="custom-scrollbar">
            <VStack align="start" gap={8} w="full">
                {/* Header */}
                <Flex justifyContent="space-between" align="end" w="full">
                    <VStack align="start" gap={1}>
                        <HStack gap={3}>
                            <Circle size="10" bg="purple.500/10" color="purple.500">
                                <LuBrainCircuit size="20px" />
                            </Circle>
                            <VStack align="start" gap={0}>
                                <Text fontSize="10px" fontWeight="black" color="purple.500" letterSpacing="widest">PILLAR 06: MACHINE LEARNING</Text>
                                <Heading size="xl" fontWeight="black" letterSpacing="tight">ML Pipeline</Heading>
                            </VStack>
                        </HStack>
                        <Text color="fg.muted" fontSize="sm" maxW="600px">
                            Train and manage graph-based machine learning models. 
                            From topological embeddings to predictive relationship analysis.
                        </Text>
                    </VStack>
                    <HStack gap={4}>
                        <Button variant="outline" rounded="xl"><LuDatabase style={{ marginRight: '8px' }} /> Model Catalog</Button>
                        <Button bg="purple.500" color="white" rounded="xl"><LuZap style={{ marginRight: '8px' }} /> New Experiment</Button>
                    </HStack>
                </Flex>

                {/* Model Grid */}
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={6} w="full">
                    {mlModels.map((model) => (
                        <Box
                            key={model.id}
                            p={6}
                            bg="bg.surface"
                            rounded="3xl"
                            border="1px solid"
                            borderColor={selectedModel === model.id ? "purple.500" : borderColor}
                            cursor="pointer"
                            transition="all 0.3s"
                            _hover={{ transform: "translateY(-4px)", shadow: "premium" }}
                            onClick={() => setSelectedModel(model.id)}
                        >
                            <VStack align="stretch" gap={4}>
                                <HStack justifyContent="space-between">
                                    <Badge variant="subtle" colorPalette="purple" rounded="md">{model.type}</Badge>
                                    <Badge colorPalette={model.status === 'Deployed' ? 'green' : 'blue'} variant="surface">{model.status}</Badge>
                                </HStack>
                                <VStack align="start" gap={1}>
                                    <Heading size="md" fontWeight="black">{model.name}</Heading>
                                    <Text fontSize="xs" color="fg.muted" lineHeight="tall">{model.desc}</Text>
                                </VStack>
                                <HStack pt={4} borderTop="1px solid" borderColor="border.muted" justifyContent="space-between">
                                    <HStack gap={2}>
                                        <LuActivity size="12px" color="var(--chakra-colors-fg-muted)" />
                                        <Text fontSize="10px" fontWeight="black" color="fg.muted">TOPOLOGY CORE</Text>
                                    </HStack>
                                    <Button size="xs" colorPalette="purple" rounded="lg">Configure <LuPlay style={{ marginLeft: '4px' }} /></Button>
                                </HStack>
                            </VStack>
                        </Box>
                    ))}
                </SimpleGrid>

                {/* Training Console Placeholder */}
                <Box w="full" bg="bg.surface" rounded="4xl" border="1px solid" borderColor={borderColor} p={10} minH="400px">
                    <VStack h="full" justify="center" gap={6} py={10}>
                        <Circle size="20" bg="purple.500/5" border="1px solid" borderColor="purple.500/20">
                            <LuNetwork size="32px" color="var(--chakra-colors-purple-500)" />
                        </Circle>
                        <VStack gap={2}>
                            <Heading size="md" fontWeight="black">Pipeline Performance Studio</Heading>
                            <Text color="fg.muted" fontSize="sm" textAlign="center" maxW="400px">
                                Select a model from the canvas above to begin training or to view prediction benchmarks.
                            </Text>
                        </VStack>
                        <HStack gap={4}>
                            <Button variant="ghost" rounded="xl"><LuSave style={{ marginRight: '8px' }} /> Save Config</Button>
                            <Button bg="purple.500" color="white" rounded="xl" px={8} disabled={!selectedModel}>Initialize Training</Button>
                        </HStack>
                    </VStack>
                </Box>

            </VStack>
        </Box>
    );
};
