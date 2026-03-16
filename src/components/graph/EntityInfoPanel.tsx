import { useEffect, useRef, useState } from 'react';
import { Box, VStack, HStack, Text, Heading, IconButton, Badge, Circle, Icon, Flex, Button, Spinner } from '@chakra-ui/react';
import { LuX, LuInfo, LuExternalLink, LuDatabase, LuActivity, LuBrainCircuit } from 'react-icons/lu';
import gsap from 'gsap';
import { NexusGraph2D } from './2d/NexusGraph2D';
import { nexusApi } from '@/services/api';
import { toSentenceCase } from '@/utils/graphColors';

interface EntityInfo {
    id: string;
    label: string;
    neo4jLabel?: string; // Internal property from NexusGraph2D
    name?: string;
    properties?: Record<string, any>;
    type?: string; // For relationships
    source?: string;
    target?: string;
}

export const EntityInfoPanel = ({ 
    entity, 
    neighborhood,
    onClose 
}: { 
    entity: EntityInfo | null, 
    neighborhood: { nodes: any[], links: any[] },
    onClose: () => void 
}) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [vizMode, setVizMode] = useState<'network' | 'radial'>('network');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisReport, setAnalysisReport] = useState<string | null>(null);

    useEffect(() => {
        if (entity) {
            setAnalysisReport(null);
            setIsAnalyzing(false);
            gsap.fromTo(panelRef.current, 
                { x: 400, opacity: 0 }, 
                { x: 0, opacity: 1, duration: 0.5, ease: "expo.out" }
            );
        }
    }, [entity?.id]);

    const handleDeepAnalyze = async () => {
        if (!entity || isAnalyzing) return;
        setIsAnalyzing(true);
        try {
            // Extract folder slug from URL if possible, otherwise rely on backend resolution
            const folderSlug = window.location.pathname.split('/').pop();
            const res = await nexusApi.deepAnalyze(
                entity.id, 
                folderSlug, 
                entity.name || entity.id,
                entity.neo4jLabel || entity.label
            );
            setAnalysisReport(res.report);
            
            // Auto-scroll to report
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
                }
            }, 100);
        } catch (e) {
            console.error("Deep analysis failed:", e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (!entity) return null;

    const isNode = !entity.type && !entity.source;
    const displayLabel = entity.neo4jLabel || entity.label || entity.type;

    return (
        <Box
            ref={panelRef}
            position="absolute"
            top={6}
            right={6}
            bottom={6}
            w="350px"
            bg="bg.surface/80"
            backdropFilter="blur(24px)"
            border="1px solid"
            borderColor="border.subtle"
            rounded="3xl"
            shadow="2xl"
            zIndex={50}
            overflow="hidden"
            display="flex"
            flexDirection="column"
            maxH="calc(100vh - 48px)" // Fix for 768px screens
        >
            {/* Header */}
            <Box p={5} borderBottom="1px solid" borderColor="border.muted" bg="bg.surface/40">
                <HStack justifyContent="space-between" mb={2}>
                    <Badge colorPalette={isNode ? "teal" : "purple"} variant="solid" rounded="md" textTransform="uppercase" fontSize="10px">
                        {isNode ? "Entity Node" : "Relationship"}
                    </Badge>
                    <IconButton size="xs" aria-label="Close" variant="ghost" onClick={onClose} rounded="full" _hover={{ bg: "white/10" }}>
                        <LuX />
                    </IconButton>
                </HStack>
                <Heading size="md" fontWeight="black" letterSpacing="tight" color="fg" wordBreak="break-word">
                    {entity.name || entity.id || entity.type}
                </Heading>
                <VStack align="start" gap={0} mt={1}>
                    <Text fontSize="9px" fontWeight="black" color="jungle-teal" letterSpacing="widest">SYSTEM ID</Text>
                    <Text fontSize="9px" fontWeight="bold" color="fg.muted" wordBreak="break-all" opacity={0.6}>
                        {entity.id}
                    </Text>
                </VStack>
            </Box>

            {/* Content */}
            <VStack ref={scrollRef} align="stretch" p={5} spaceY={6} flex={1} overflowY="auto" className="custom-scrollbar">
                {/* Local Neighborhood Preview */}
                <Box position="relative" h="200px" w="full" bg="bg.muted/50" rounded="2xl" border="1px solid" borderColor="border.subtle" overflow="hidden">
                    <Flex position="absolute" top={3} left={3} right={3} zIndex={1} justifyContent="space-between" align="start">
                        <VStack align="start" spaceY={0}>
                            <Text fontSize="9px" fontWeight="black" color="jungle-teal" letterSpacing="widest">RELATIONSHIP VIEW</Text>
                            <Text fontSize="8px" fontWeight="bold" color="fg.muted">{neighborhood?.links.length || 0} ACTIVE LINKS</Text>
                        </VStack>
                        <HStack bg="bg.surface/60" p={1} rounded="lg" backdropFilter="blur(8px)" border="1px solid" borderColor="border.subtle">
                            <Button 
                                size="xs" 
                                h="20px" 
                                fontSize="8px" 
                                variant={vizMode === 'network' ? 'solid' : 'ghost'} 
                                colorPalette="teal" 
                                onClick={() => setVizMode('network')}
                                rounded="md"
                            >NETWORK</Button>
                            <Button 
                                size="xs" 
                                h="20px" 
                                fontSize="8px" 
                                variant={vizMode === 'radial' ? 'solid' : 'ghost'} 
                                colorPalette="teal" 
                                onClick={() => setVizMode('radial')}
                                rounded="md"
                            >RADIAL</Button>
                        </HStack>
                    </Flex>
                    <NexusGraph2D 
                        data={neighborhood || { nodes: [entity], links: [] }} 
                        layoutMode={vizMode} 
                    />
                </Box>

                {/* Connection Analysis */}
                {isNode && neighborhood && neighborhood.links.length > 0 && (
                    <VStack align="stretch" spaceY={2} p={4} bg="bg.muted/30" rounded="2xl" border="1px solid" borderColor="border.muted">
                        <Text fontSize="10px" fontWeight="black" color="jungle-teal" letterSpacing="widest">SOCIAL CONTEXT</Text>
                        <HStack spaceX={4}>
                            <VStack align="start" spaceY={0}>
                                <Text fontSize="14px" fontWeight="black" color="fg">{neighborhood.nodes.length - 1}</Text>
                                <Text fontSize="8px" fontWeight="black" color="fg.muted">PEERS</Text>
                            </VStack>
                            <Box w="1px" h="20px" bg="border.muted" />
                            <VStack align="start" spaceY={0}>
                                <Text fontSize="14px" fontWeight="black" color="fg">{neighborhood.links.length}</Text>
                                <Text fontSize="8px" fontWeight="black" color="fg.muted">RELATIONS</Text>
                            </VStack>
                        </HStack>
                    </VStack>
                )}

                {/* Visual Identity */}
                <HStack gap={4} p={4} bg="bg.muted/50" rounded="2xl" border="1px solid" borderColor="border.subtle">
                    <Circle size="10" bg={isNode ? "jungle-teal" : "purple.500"} shadow="lg">
                        <Icon as={isNode ? LuInfo : LuActivity} color="white" />
                    </Circle>
                    <VStack align="start" gap={0}>
                        <Text fontSize="xs" fontWeight="black" color="fg.muted">TYPE</Text>
                        <Text fontSize="sm" fontWeight="black" color="fg">{toSentenceCase(displayLabel || 'Entity')}</Text>
                    </VStack>
                </HStack>

                {/* Primary Attributes */}
                <VStack align="stretch" spaceY={4}>
                    <HStack justifyContent="space-between" align="center">
                        <Text fontSize="10px" fontWeight="black" color="jungle-teal" letterSpacing="widest">INTELLIGENCE REPORT</Text>
                        <Badge variant="subtle" colorPalette="teal" size="sm">V2 ENHANCED</Badge>
                    </HStack>
                    
                    {isNode && (
                        <Box p={4} bg="bg.muted/30" rounded="2xl" border="1px dashed" borderColor="border.subtle">
                            <Text fontSize="10px" fontWeight="black" color="fg.muted" mb={2}>DISCOVERY CONFIDENCE</Text>
                            <Box w="full" h="1.5" bg="white/5" rounded="full" overflow="hidden">
                                <Box w="75%" h="full" bgGradient="to-r" gradientFrom="turf-green" gradientTo="jungle-teal" />
                            </Box>
                        </Box>
                    )}

                    {!analysisReport ? (
                        <VStack align="stretch" gap={3}>
                            {entity.properties && Object.entries(entity.properties).map(([key, value]) => {
                                // Filter out noisy keys
                                if (['id', 'name', 'scientific_name', 'embedding'].includes(key.toLowerCase())) return null;
                                
                                return (
                                    <Box 
                                        key={key}
                                        p={4} 
                                        bg="bg.muted/40" 
                                        rounded="2xl" 
                                        border="1px solid" 
                                        borderColor="border.subtle"
                                        display="flex"
                                        flexDirection="column"
                                        gap={1}
                                    >
                                        <Text fontSize="9px" fontWeight="black" color="jungle-teal" letterSpacing="widest">{key.replace(/_/g, ' ').toUpperCase()}</Text>
                                        <Text fontSize="xs" fontWeight="bold" color="fg" lineHeight="tall">
                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                        </Text>
                                    </Box>
                                );
                            })}
                        </VStack>
                    ) : (
                        <VStack align="stretch" p={4} bg="turf-green/5" border="1px solid" borderColor="turf-green/20" rounded="2xl" spaceY={3}>
                            <HStack color="turf-green">
                                <LuBrainCircuit />
                                <Text fontSize="11px" fontWeight="black">DEEP REASONING OUTPUT</Text>
                            </HStack>
                            <Text fontSize="xs" color="fg" lineHeight="tall" whiteSpace="pre-wrap">
                                {analysisReport}
                            </Text>
                        </VStack>
                    )}

                    {(!analysisReport && (!entity.properties || Object.keys(entity.properties).length === 0)) && (
                        <Flex p={6} direction="column" align="center" justify="center" opacity={0.3}>
                            <Icon as={LuDatabase} size="lg" mb={2} />
                            <Text fontSize="xs" fontWeight="bold">No structured metadata</Text>
                        </Flex>
                    )}
                </VStack>

                {!isNode && !analysisReport && (
                    <VStack align="stretch" spaceY={4}>
                        <Text fontSize="10px" fontWeight="black" color="jungle-teal" letterSpacing="widest">CONNECTION</Text>
                        <HStack justifyContent="space-between" p={3} bg="bg.muted" rounded="xl">
                            <VStack align="start" spaceY={0}>
                                <Text fontSize="9px" fontWeight="black" color="fg.muted">SOURCE</Text>
                                <Text fontSize="xs" fontWeight="black" color="fg">{entity.source}</Text>
                            </VStack>
                            <Icon as={LuExternalLink} size="xs" color="fg.muted" />
                            <VStack align="end" spaceY={0}>
                                <Text fontSize="9px" fontWeight="black" color="fg.muted">TARGET</Text>
                                <Text fontSize="xs" fontWeight="black" color="fg">{entity.target}</Text>
                            </VStack>
                        </HStack>
                    </VStack>
                )}
            </VStack>

            {/* Footer */}
            <Box p={5} borderTop="1px solid" borderColor="border.muted" bg="bg.muted/20">
                <Button 
                    w="full" 
                    variant="solid" 
                    bg="turf-green" 
                    color="white"
                    size="sm" 
                    rounded="xl" 
                    fontWeight="black" 
                    onClick={handleDeepAnalyze}
                    loading={isAnalyzing}
                    loadingText="ANALYZING..."
                    isDisabled={!isNode}
                    _hover={{ bg: "jungle-teal" }}
                >
                    {isAnalyzing ? <Spinner size="xs" /> : "DEEP ANALYZE"}
                </Button>
            </Box>
        </Box>
    );
};
