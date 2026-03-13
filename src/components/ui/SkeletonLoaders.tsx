import { Box, SimpleGrid, VStack, HStack, Skeleton } from '@chakra-ui/react';

export const DashboardSkeleton = () => (
    <VStack align="start" spaceY={10} w="full" p={0}>
        <HStack justifyContent="space-between" w="full">
            <VStack align="start" spaceY={2}>
                <Skeleton h="40px" w="300px" rounded="lg" />
                <Skeleton h="20px" w="200px" rounded="md" />
            </VStack>
            <HStack spaceX={3}>
                <Skeleton h="40px" w="100px" rounded="xl" />
                <Skeleton h="40px" w="100px" rounded="xl" />
                <Skeleton h="56px" w="180px" rounded="2xl" />
            </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} w="full">
            {[1, 2, 3].map(i => (
                <Box key={i} p={8} bg="bg.surface" rounded="3xl" border="1px solid" borderColor="border.subtle">
                    <VStack align="start" spaceY={4}>
                        <Skeleton h="12px" w="100px" />
                        <Skeleton h="64px" w="160px" />
                        <Skeleton h="16px" w="200px" />
                    </VStack>
                </Box>
            ))}
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8} w="full">
            <VStack align="stretch" spaceY={4}>
                <Skeleton h="20px" w="150px" />
                {[1, 2, 3, 4].map(i => (
                    <Box key={i} p={4} bg="bg.surface" rounded="2xl" border="1px solid" borderColor="border.subtle">
                        <HStack spaceX={4}>
                            <Skeleton h="40px" w="40px" rounded="full" />
                            <VStack align="start" spaceY={2} flex={1}>
                                <Skeleton h="14px" w="70%" />
                                <Skeleton h="10px" w="40%" />
                            </VStack>
                        </HStack>
                    </Box>
                ))}
            </VStack>
            <VStack align="stretch" spaceY={4} gridColumn={{ lg: 'span 2' }}>
                <Skeleton h="20px" w="150px" />
                <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <Box key={i} p={5} bg="bg.surface" rounded="2xl" border="1px solid" borderColor="border.subtle">
                            <Skeleton h="10px" w="50px" mb={2} />
                            <Skeleton h="32px" w="80px" />
                        </Box>
                    ))}
                </SimpleGrid>
            </VStack>
        </SimpleGrid>
    </VStack>
);

export const LibrarySkeleton = () => (
    <VStack align="start" spaceY={8} w="full">
        <HStack w="full" spaceX={4}>
            <Skeleton h="56px" flex={1} rounded="2xl" />
            <Skeleton h="56px" w="100px" rounded="2xl" />
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} w="full">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <Box key={i} p={6} bg="bg.surface" rounded="3xl" border="1px solid" borderColor="border.subtle">
                    <VStack align="stretch" spaceY={4}>
                        <HStack justifyContent="space-between">
                            <Skeleton h="48px" w="48px" rounded="full" />
                            <Skeleton h="24px" w="24px" />
                        </HStack>
                        <VStack align="start" spaceY={2}>
                            <Skeleton h="24px" w="80%" />
                            <Skeleton h="14px" w="100%" />
                        </VStack>
                        <Box pt={4} borderTop="1px solid" borderColor="border.muted">
                            <SimpleGrid columns={2} gap={4}>
                                <VStack align="start" spaceY={2}>
                                    <Skeleton h="10px" w="30px" />
                                    <Skeleton h="20px" w="40px" />
                                </VStack>
                                <VStack align="start" spaceY={2}>
                                    <Skeleton h="10px" w="30px" />
                                    <Skeleton h="20px" w="40px" />
                                </VStack>
                            </SimpleGrid>
                        </Box>
                    </VStack>
                </Box>
            ))}
        </SimpleGrid>
    </VStack>
);
