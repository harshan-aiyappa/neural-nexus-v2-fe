import { Box, VStack, HStack, Text, Heading, Circle, SimpleGrid, Icon, Badge } from '@chakra-ui/react';
import { LuActivity, LuDatabase, LuZap, LuServer, LuCpu } from 'react-icons/lu';
import React, { useMemo } from 'react';

interface Props {
  status: any;
  stats: any;
}

export const EcosystemHighlights = ({ status, stats }: Props) => {
  const healthScore = useMemo(() => {
    let score = 100;
    if (status?.neo4j !== 'ACTIVE') score -= 40;
    if (status?.gemini !== 'ACTIVE') score -= 30;
    if (status?.mongodb !== 'ACTIVE') score -= 20;
    if (status?.redis !== 'ACTIVE') score -= 10;
    return Math.max(score, 0);
  }, [status]);

  const getStatusColor = (s: string) => s === 'ACTIVE' ? 'green.500' : 'red.500';

  return (
    <Box p={8} bg="bg.surface" rounded="3xl" border="1px solid" borderColor="border.subtle" shadow="2xl" position="relative" overflow="hidden">
      {/* Background Decorative Element */}
      <Circle size="200px" bg="turf-green" opacity="0.02" position="absolute" top="-50px" right="-50px" />
      
      <VStack align="stretch" gap={8}>
        <HStack justifyContent="space-between">
          <VStack align="start" gap={1}>
            <HStack gap={2}>
              <LuActivity color="var(--chakra-colors-turf-green)" />
              <Heading size="md" fontWeight="black">Graph Ecosystem Health</Heading>
            </HStack>
            <Text fontSize="xs" color="fg.muted">Real-time heuristics and system integrity heartbeat.</Text>
          </VStack>
          <Box textAlign="right">
            <Text fontSize="2xl" fontWeight="black" color={healthScore > 80 ? "turf-green" : "orange.500"}>
              {healthScore}%
            </Text>
            <Text fontSize="9px" fontWeight="black" color="fg.muted" letterSpacing="widest">INTEGRITY SCORE</Text>
          </Box>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 4 }} gap={4}>
          <HealthNode 
            icon={LuDatabase} 
            label="Neo4j Cluster" 
            status={status?.neo4j === 'ACTIVE' ? 'CONNECTED' : 'DISCONNECTED'} 
            color={getStatusColor(status?.neo4j)}
            subValue={`${stats.nodes.toLocaleString()} active nodes`}
          />
          <HealthNode 
            icon={LuCpu} 
            label="Cognitive Engine" 
            status={status?.gemini === 'ACTIVE' ? 'STABLE' : 'UNAVAILABLE'} 
            color={getStatusColor(status?.gemini)}
            subValue="Gemini 1.5 Pro"
          />
          <HealthNode 
            icon={LuServer} 
            label="Metadata Store" 
            status={status?.mongodb === 'ACTIVE' ? 'OPERATIONAL' : 'OFFLINE'} 
            color={getStatusColor(status?.mongodb)}
            subValue="Folder persistence active"
          />
          <HealthNode 
            icon={LuZap} 
            label="Vector Cache" 
            status={status?.redis === 'ACTIVE' ? 'WARMED' : 'COLD'} 
            color={getStatusColor(status?.redis)}
            subValue="Redis instance active"
          />
        </SimpleGrid>

        <Box bg="bg.muted" p={4} rounded="2xl" border="1px solid" borderColor="border.subtle">
           <HStack justifyContent="space-between">
             <VStack align="start" gap={0}>
                <Text fontSize="10px" fontWeight="black" color="fg.muted">LATEST INGESTION LATENCY</Text>
                <Text fontSize="sm" fontWeight="bold">248ms <Badge colorPalette="green" size="xs" variant="subtle" ml={2} rounded="full">OPTIMAL</Badge></Text>
             </VStack>
             <VStack align="end" gap={0}>
                <Text fontSize="10px" fontWeight="black" color="fg.muted">ACTIVE THREADS</Text>
                <Text fontSize="sm" fontWeight="bold">12 / 64</Text>
             </VStack>
           </HStack>
        </Box>
      </VStack>
    </Box>
  );
};

const HealthNode = ({ icon, label, status, color, subValue }: any) => (
  <VStack align="start" p={5} className="glass-card" rounded="2xl" transition="all 0.3s" _hover={{ borderColor: "turf-green/50", transform: "translateY(-4px)" }}>
    <HStack gap={2} w="full">
      <Circle size="6" bg={`${color}/15`} color={color}>
        <Icon as={icon} size="xs" />
      </Circle>
      <Text fontSize="10px" fontWeight="800" color="fg.muted" flex={1} fontFamily="'Outfit', sans-serif" letterSpacing="widest">{label.toUpperCase()}</Text>
      <Circle size="2" bg={color} shadow={`0 0 10px ${color}`} />
    </HStack>
    <VStack align="start" gap={0} mt={3}>
      <Text fontSize="sm" fontWeight="800" color="fg" fontFamily="'Inter', sans-serif">{status}</Text>
      <Text fontSize="9px" color="fg.subtle" fontWeight="700" fontFamily="'Inter', sans-serif">{subValue}</Text>
    </VStack>
  </VStack>
);
