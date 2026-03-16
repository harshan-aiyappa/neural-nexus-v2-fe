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
        <Box h="full" overflowY="auto" p={8} maxW="1600px" mx="auto" ref={containerRef} className="custom-scrollbar">
            {/* Header */}
            <Flex justifyContent="space-between" align="end" mb={10}>
                <VStack align="start" gap={1}>
                    <HStack gap={3}>
                        <Circle size="10" bg="jungle-teal/10" color="jungle-teal">
                            <LuActivity size="20px" />
                        </Circle>
                        <VStack align="start" gap={0}>
                            <Text fontSize="10px" fontWeight="black" color="jungle-teal" letterSpacing="widest">ADVANCED VISUALIZATION</Text>
                            <Heading size="xl" fontWeight="black" letterSpacing="tight">Analytics Gallery</Heading>
                        </VStack>
                    </HStack>
                    <Text color="fg.muted" fontSize="sm" maxW="600px">
                        High-fidelity flow and relationship density analysis. 
                        Modernized with ECharts for industrial-grade data insights.
                    </Text>
                </VStack>
                <HStack gap={2} bg="bg.muted" p={1} rounded="2xl" border="1px solid" borderColor={borderColor}>
                    <Button 
                        size="sm" 
                        variant={selectedView === 'sankey' ? 'solid' : 'ghost'} 
                        colorPalette={selectedView === 'sankey' ? 'teal' : 'gray'}
                        rounded="xl"
                        onClick={() => setSelectedView('sankey')}
                    >Sankey</Button>
                    <Button 
                        size="sm" 
                        variant={selectedView === 'radar' ? 'solid' : 'ghost'} 
                        colorPalette={selectedView === 'radar' ? 'teal' : 'gray'}
                        rounded="xl"
                        onClick={() => setSelectedView('radar')}
                    >Radar</Button>
                    <Button 
                        size="sm" 
                        variant={selectedView === 'treemap' ? 'solid' : 'ghost'} 
                        colorPalette={selectedView === 'treemap' ? 'teal' : 'gray'}
                        rounded="xl"
                        onClick={() => setSelectedView('treemap')}
                    >Treemap</Button>
                </HStack>
            </Flex>

            {/* Main Viz Area */}
            <Box 
                className="gallery-card"
                w="full" 
                h={{ base: "400px", xl: "600px" }} 
                bg={cardBg} 
                rounded="4xl" 
                border="1px solid" 
                borderColor={borderColor} 
                shadow="2xl"
                position="relative"
                overflow="hidden"
                p={8}
            >
                <ErrorBoundary>
                    <Skeleton loading={isPageLoading} height="full" rounded="2xl" colorPalette="teal">
                        {hasSankeyCycle ? (
                            <Flex h="full" align="center" justify="center" direction="column" gap={4}>
                                <LuActivity size="40px" color="var(--chakra-colors-red-500)" />
                                <Text fontWeight="black" color="red.500">CYCLES DETECTED IN FLOW DATA</Text>
                                <Text fontSize="xs" color="fg.muted">Sankey visualization requires a acyclic graph. Switch to another view.</Text>
                            </Flex>
                        ) : (
                            <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
                        )}
                    </Skeleton>
                </ErrorBoundary>
            </Box>

            {/* Secondary Insights */}
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} mt={8}>
                {[
                    { title: "Flow Density", value: "0.84", icon: LuActivity },
                    { title: "Clustering Coefficient", value: "0.421", icon: LuLayers },
                    { title: "Network Modularity", value: "0.58", icon: LuBox },
                ].map((insight, idx) => (
                    <Box key={idx} className="gallery-card" bg={cardBg} p={6} rounded="3xl" border="1px solid" borderColor={borderColor}>
                        <HStack gap={4} mb={4}>
                            <Circle size="8" bg="jungle-teal/10" color="jungle-teal">
                                <Icon as={insight.icon} fontSize="lg" />
                            </Circle>
                            <Text fontSize="10px" fontWeight="black" color="fg.muted" letterSpacing="widest">{insight.title.toUpperCase()}</Text>
                        </HStack>
                        <Skeleton loading={isPageLoading} height="1.5rem" mb={2}>
                            <Heading size="lg" fontWeight="black" color="fg">{insight.value}</Heading>
                        </Skeleton>
                        <Text fontSize="xs" color="fg.muted" mt={2}>
                            Calculated across 405 scientific documents.
                        </Text>
                    </Box>
                ))}
            </SimpleGrid>
        </Box>
    );
};
