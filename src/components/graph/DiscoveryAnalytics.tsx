import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { SimpleGrid, Box, Heading, Text, VStack, HStack, Circle } from '@chakra-ui/react';
import { LuChartBar } from 'react-icons/lu';

interface Props {
  data: {
    nodes: any[];
    links: any[];
  };
}

export const DiscoveryAnalytics: React.FC<Props> = ({ data }) => {
  const labelCounts = useMemo(() => {
    const counts: any = {};
    data.nodes.forEach(n => {
      const l = n.neo4jLabel || 'ENTITY';
      counts[l] = (counts[l] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data.nodes]);

  const pieOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    legend: { show: false },
    series: [
      {
        name: 'Distribution',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: '14', fontWeight: 'bold' } },
        labelLine: { show: false },
        data: labelCounts
      }
    ]
  };

  const barOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { opacity: 0.1 } } },
    yAxis: { type: 'category', data: labelCounts.map(d => d.name), axisLine: { show: false } },
    series: [
      {
        name: 'Count',
        type: 'bar',
        data: labelCounts.map(d => d.value),
        itemStyle: { color: '#10B981', borderRadius: [0, 10, 10, 0] }
      }
    ]
  };

  return (
    <Box w="full" h="full" p={8} bg="bg.canvas" overflowY="auto" className="custom-scrollbar">
      <VStack align="start" gap={10}>
        <HStack gap={3}>
           <Circle size="10" bg="turf-green/10" color="turf-green"><LuChartBar /></Circle>
           <VStack align="start" gap={0}>
              <Heading size="md" fontWeight="black">Component Distribution</Heading>
              <Text fontSize="xs" color="fg.muted">Statistical breakdown of entities by classification.</Text>
           </VStack>
        </HStack>
        
        <SimpleGrid columns={{ base: 1, xl: 2 }} gap={10} w="full">
            <Box bg="bg.surface" p={10} rounded="4xl" border="1px solid" borderColor="border.subtle" shadow="premium" h="450px">
                <Heading size="xs" mb={8} color="fg.muted" letterSpacing="widest">ENTITY DENSITY (PIE)</Heading>
                <ReactECharts option={pieOption} style={{ height: '300px' }} />
            </Box>
            <Box bg="bg.surface" p={10} rounded="4xl" border="1px solid" borderColor="border.subtle" shadow="premium" h="450px">
                <Heading size="xs" mb={8} color="fg.muted" letterSpacing="widest">ENTITY VOLUME (BAR)</Heading>
                <ReactECharts option={barOption} style={{ height: '300px' }} />
            </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};
