import { Box, Container, Heading, Text, VStack, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';

export const Dashboard = () => {
    const cardBg = useColorModeValue('white', 'slate.900');
    const borderColor = useColorModeValue('jungle-teal/10', 'jungle-teal/20');

    return (
        <Container maxW="container.xl" py={10}>
            <VStack align="start" spaceY={8} w="full">
                <VStack align="start" spaceY={1}>
                    <Heading size="2xl" fontWeight="black" letterSpacing="tight">Dashboard</Heading>
                    <Text color="slate.500">Welcome back to Neural Nexus V2. System is nominal.</Text>
                </VStack>

                <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} w="full">
                    <Box p={6} bg={cardBg} rounded="3xl" border="1px solid" borderColor={borderColor} shadow="xl">
                        <Stat.Root>
                            <StatLabel color="slate.500">Total Knowledge Nodes</StatLabel>
                            <StatNumber fontSize="4xl" fontWeight="black" color="jungle-teal">1,284</StatNumber>
                            <StatHelpText>
                                <StatArrow type="increase" />
                                23% from last week
                            </StatHelpText>
                        </Stat.Root>
                    </Box>

                    <Box p={6} bg={cardBg} rounded="3xl" border="1px solid" borderColor={borderColor} shadow="xl">
                        <Stat.Root>
                            <StatLabel color="slate.500">AI Extractions</StatLabel>
                            <StatNumber fontSize="4xl" fontWeight="black" color="turf-green">412</StatNumber>
                            <StatHelpText>
                                <StatArrow type="increase" />
                                12 today
                            </StatHelpText>
                        </Stat.Root>
                    </Box>

                    <Box p={6} bg={cardBg} rounded="3xl" border="1px solid" borderColor={borderColor} shadow="xl">
                        <Stat.Root>
                            <StatLabel color="slate.500">Symmetry Integrity</StatLabel>
                            <StatNumber fontSize="4xl" fontWeight="black" color="blue.400">99.8%</StatNumber>
                            <StatHelpText>Guardian ACTIVE</StatHelpText>
                        </Stat.Root>
                    </Box>
                </SimpleGrid>

                <Box w="full" p={10} bg={cardBg} rounded="4xl" border="1px solid" borderColor={borderColor} shadow="2xl">
                    <VStack align="start" spaceY={4}>
                        <Heading size="md">Recent Discovery Activity</Heading>
                        <Text color="slate.400" fontSize="sm">Your latest bi-directional traversals and extraction completions.</Text>
                        {/* Activity List Placeholder */}
                        <Box w="full" h="200px" bg="black/5" rounded="2xl" border="1px dashed" borderColor="slate.800" display="flex" alignItems="center" justifyContent="center">
                            <Text color="slate.600" fontSize="xs" fontFamily="mono">NO RECENT EVENTS IN LOG</Text>
                        </Box>
                    </VStack>
                </Box>
            </VStack>
        </Container>
    );
};
