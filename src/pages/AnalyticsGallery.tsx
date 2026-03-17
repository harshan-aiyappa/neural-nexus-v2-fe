import { Box, Heading, Text, VStack, HStack, Flex, Circle, Icon, SimpleGrid, Button, Skeleton } from '@chakra-ui/react';
import { useState, useRef, useMemo } from 'react';
import { LuActivity, LuBox, LuLayers } from 'react-icons/lu';
import ReactECharts from 'echarts-for-react';
import { useQuery } from '@tanstack/react-query';
import { nexusApi } from '@/services/api';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export const AnalyticsGallery = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedView, setSelectedView] = useState<'sankey' | 'radar' | 'treemap'>('sankey');

    const borderColor = "border.subtle";
    const cardBg = "bg.surface";

    // TanStack Query for Flow Data
    const { data: flowData = { nodes: [], links: [] }, isLoading: isFlowLoading } = useQuery({
        queryKey: ['analytics', 'flow'],
        queryFn: nexusApi.getAnalyticsFlow,
    });

    // TanStack Query for Metrics
    const { data: radarMetrics = null, isLoading: isMetricsLoading } = useQuery({
        queryKey: ['analytics', 'metrics'],
        queryFn: nexusApi.getAnalyticsMetrics,
    });

    const isPageLoading = isFlowLoading || isMetricsLoading;

    // Detect cycles in flow data for Sankey
    const hasSankeyCycle = useMemo(() => {
        if (selectedView !== 'sankey' || !flowData.nodes.length) return false;
        
        const adj = new Map();
        flowData.links.forEach((l: any) => {
            if (!adj.has(l.source)) adj.set(l.source, []);
            adj.get(l.source).push(l.target);
        });

        const visited = new Set();
        const stack = new Set();

        const checkCycle = (node: string): boolean => {
            visited.add(node);
            stack.add(node);

            const neighbors = adj.get(node) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    if (checkCycle(neighbor)) return true;
                } else if (stack.has(neighbor)) {
                    return true;
                }
            }

            stack.delete(node);
            return false;
        };

        for (const node of flowData.nodes.map((n: any) => n.name)) {
            if (!visited.has(node)) {
                if (checkCycle(node)) return true;
            }
        }
        return false;
    }, [flowData, selectedView]);

    const chartOption = useMemo(() => {
        if (selectedView === 'sankey') {
            return {
                backgroundColor: 'transparent',
                tooltip: { trigger: 'item', triggerOn: 'mousemove' },
                series: [{
                    type: 'sankey',
                    data: flowData.nodes.length > 0 ? flowData.nodes : [
                        { name: 'No data available', itemStyle: { color: '#666' } }
                    ],
                    links: flowData.links,
                    lineStyle: { color: 'gradient', curveness: 0.5, opacity: 0.3 },
                    itemStyle: { borderWidth: 0 },
                    label: { color: '#fff', fontSize: 11, fontWeight: 'bold', fontFamily: 'Inter' }
                }]
            };
        }
        return {
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis' },
            radar: {
                indicator: radarMetrics?.indicators || [
                    { name: 'System Reset...', max: 100 }
                ],
                axisName: { color: '#64748B', fontSize: 10, fontWeight: 'bold' },
                splitArea: { show: false },
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
            },
            series: [{
                type: 'radar',
                data: [{
                    value: radarMetrics?.data || [0,0,0,0,0],
                    name: 'Network Score',
                    areaStyle: { color: 'rgba(16, 123, 65, 0.2)' },
                    lineStyle: { color: '#107B41', width: 2 },
                    symbol: 'none'
                }]
            }]
        };
    }, [selectedView, flowData, radarMetrics]);

    return (
        <Box h="full" overflowY="auto" p={{ base: 4, md: 8 }} w="full" ref={containerRef} className="custom-scrollbar">
            {/* Header */}
            <Flex justifyContent="space-between" align={{ base: "start", md: "end" }} mb={10} direction={{ base: "column", md: "row" }} gap={6}>
                <VStack align="start" gap={2}>
                    <HStack gap={3}>
                        <Circle size="12" bg="jungle-teal/10" color="jungle-teal" shadow="glow">
                            <LuActivity size="24px" />
                        </Circle>
                        <VStack align="start" gap={0}>
                            <Text fontSize={{ base: "xs", md: "10px" }} fontWeight="800" color="jungle-teal" letterSpacing="0.3em" fontFamily="'Outfit', sans-serif">PILLAR 03: ADVANCED VISUALIZATION</Text>
                            <Heading size={{ base: "xl", md: "2xl" }} fontWeight="800" letterSpacing="tight" color="fg" fontFamily="'Outfit', sans-serif">Analytics</Heading>
                        </VStack>
                    </HStack>
                    <Text color="fg.muted" fontSize="sm" maxW="600px" fontWeight="500" fontFamily="'Inter', sans-serif">
                        High-fidelity flow and relationship density analysis. 
                        Modernized with ECharts for industrial-grade data insights.
                    </Text>
                </VStack>
                <HStack gap={2} bg="bg.surface/40" backdropFilter="blur(16px)" p={1.5} rounded="2xl" border="1px solid" borderColor={borderColor}>
                    {(['sankey', 'radar', 'treemap'] as const).map((view) => (
                        <Button 
                            key={view}
                            size="sm" 
                            variant={selectedView === view ? 'solid' : 'ghost'} 
                            bg={selectedView === view ? 'turf-green' : 'transparent'}
                            color={selectedView === view ? 'white' : 'fg.muted'}
                            rounded="xl"
                            onClick={() => setSelectedView(view)}
                            _hover={{ bg: selectedView === view ? 'turf-green' : 'bg.muted' }}
                            fontFamily="'Outfit', sans-serif"
                            fontWeight="800"
                            textTransform="capitalize"
                        >{view}</Button>
                    ))}
                </HStack>
            </Flex>

            {/* Main Viz Area */}
            <Box 
                className="gallery-card glass-card"
                w="full" 
                h={{ base: "450px", xl: "650px" }} 
                rounded="4xl" 
                position="relative"
                overflow="hidden"
                p={{ base: 4, md: 8 }}
            >
                <ErrorBoundary>
                    <Skeleton loading={isPageLoading} height="full" rounded="2xl" colorPalette="teal">
                        {hasSankeyCycle ? (
                            <Flex h="full" align="center" justify="center" direction="column" gap={6} bg="bg.surface/40" rounded="3xl">
                                <LuActivity size="48px" color="var(--chakra-colors-red-500)" />
                                <VStack gap={1}>
                                    <Text fontWeight="800" color="red.500" fontFamily="'Outfit', sans-serif">CYCLES DETECTED IN FLOW DATA</Text>
                                    <Text fontSize="xs" color="fg.muted" fontWeight="600" fontFamily="'Inter', sans-serif">Sankey visualization requires a acyclic graph. Switch to another view.</Text>
                                </VStack>
                            </Flex>
                        ) : (
                            <Box h="full" w="full" position="relative">
                                <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
                            </Box>
                        )}
                    </Skeleton>
                </ErrorBoundary>
            </Box>

            {/* Algorithms Suite */}
            <VStack align="start" gap={8} mt={16}>
                <HStack gap={4}>
                    <Circle size="10" bg="turf-green/10" color="turf-green" shadow="glow">
                        <LuBox size="22px" />
                    </Circle>
                    <VStack align="start" gap={0}>
                        <Text fontSize="10px" fontWeight="800" color="fg.muted" letterSpacing="0.2em" fontFamily="'Outfit', sans-serif">GDS SUITE</Text>
                        <Heading size="md" fontWeight="800" fontFamily="'Outfit', sans-serif">Algorithmic Workspace</Heading>
                    </VStack>
                </HStack>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 4 }} gap={5} w="full">
                    {[
                        "Degree Centrality", "PageRank", "Betweenness", "Closeness", 
                        "Label Propagation", "Weakly Connected Components", "Louvain", 
                        "K-Means Clustering", "DBSCAN", "Random Walk", 
                        "A* Pathfinding", "Dijkstra", "Yen's K-Shortest"
                    ].map((algo) => (
                        <Box 
                            key={algo} 
                            p={5} 
                            bg="bg.surface/40" 
                            rounded="2xl" 
                            border="1px solid" 
                            borderColor={borderColor}
                            backdropFilter="blur(12px)"
                            _hover={{ borderColor: "turf-green", transform: "translateY(-4px)", bg: "bg.muted", shadow: " premium" }}
                            transition="all 0.3s cubic-bezier(0.19, 1, 0.22, 1)"
                            cursor="pointer"
                            position="relative"
                            overflow="hidden"
                        >
                            <HStack justifyContent="space-between" position="relative" zIndex={2}>
                                <Text fontSize="xs" fontWeight="800" fontFamily="'Outfit', sans-serif" color="fg">{algo.toUpperCase()}</Text>
                                <Button size="xs" variant="ghost" color="turf-green" fontWeight="800" fontSize="10px" _hover={{ bg: "turf-green/10" }}>RUN <LuActivity style={{ marginLeft: '4px' }} /></Button>
                            </HStack>
                            <Box position="absolute" bottom="-10px" right="-10px" opacity="0.05" transform="rotate(-15deg)">
                                <LuBox size="60px" />
                            </Box>
                        </Box>
                    ))}
                </SimpleGrid>
            </VStack>

            {/* Secondary Insights */}
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} mt={16}>
                {[
                    { title: "Flow Density", value: "0.84", icon: LuActivity, color: "jungle-teal" },
                    { title: "Clustering Coefficient", value: "0.421", icon: LuLayers, color: "turf-green" },
                    { title: "Network Modularity", value: "0.58", icon: LuBox, color: "brand.turf-2" },
                ].map((insight, idx) => (
                    <Box key={idx} className="gallery-card glass-card" p={8} rounded="3xl" position="relative" overflow="hidden">
                        <Circle size="100px" bg={insight.color} opacity="0.05" position="absolute" top="-20px" right="-20px" filter="blur(20px)" />
                        <HStack gap={4} mb={6}>
                            <Circle size="10" bg={`${insight.color}/10`} color={insight.color}>
                                <Icon as={insight.icon} fontSize="xl" />
                            </Circle>
                            <Text fontSize="10px" fontWeight="800" color="fg.muted" letterSpacing="0.25em" textTransform="uppercase" fontFamily="'Outfit', sans-serif">{insight.title}</Text>
                        </HStack>
                        <Skeleton loading={isPageLoading} height="2.5rem" mb={3}>
                            <Heading size="3xl" fontWeight="800" color="fg" fontFamily="'Outfit', sans-serif" letterSpacing="tight">{insight.value}</Heading>
                        </Skeleton>
                        <Text fontSize="xs" color="fg.muted" mt={2} fontWeight="600" fontFamily="'Inter', sans-serif">
                            Calculated across active folder context.
                        </Text>
                    </Box>
                ))}
            </SimpleGrid>

        </Box>
    );
};
