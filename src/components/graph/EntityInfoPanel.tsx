import { useEffect, useRef, useState } from 'react';
import { 
    Box, VStack, HStack, Text, Heading, IconButton, Badge, Circle, Icon, 
    Flex, Button, Spinner, Input, Textarea, Separator, 
    DialogRoot, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogActionTrigger
} from '@chakra-ui/react';
import { 
    LuX, LuInfo, LuExternalLink, LuDatabase, LuActivity, 
    LuBrainCircuit, LuPencil, LuLink, LuTrash2, LuCheck, LuSearch 
} from 'react-icons/lu';
import gsap from 'gsap';
import { NexusGraph2D } from './2d/NexusGraph2D';
import { nexusApi, Node, Relationship } from '@/services/api';
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

    // Edit State
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editProps, setEditProps] = useState<Record<string, any>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Connection Flow
    const [showConnectFlow, setShowConnectFlow] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedTarget, setSelectedTarget] = useState<any | null>(null);
    const [relType, setRelType] = useState('RELATED_TO');

    // Relationship Edit State
    const [editingRelId, setEditingRelId] = useState<string | null>(null);
    const [newRelType, setNewRelType] = useState('');

    useEffect(() => {
        if (entity) {
            setAnalysisReport(null);
            setIsAnalyzing(false);
            setIsEditing(false);
            setShowConnectFlow(false);
            setEditProps(entity.properties || {});
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
            const folderSlug = window.location.pathname.split('/').pop();
            const res = await nexusApi.deepAnalyze(
                entity.id, 
                folderSlug, 
                entity.name || entity.id,
                entity.neo4jLabel || entity.label
            );
            setAnalysisReport(res.report);
            setTimeout(() => {
                if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
            }, 100);
        } catch (e) { console.error(e); } finally { setIsAnalyzing(false); }
    };

    const handleSaveNode = async () => {
        if (!entity) return;
        setIsSaving(true);
        try {
            await nexusApi.updateNode(entity.id, editProps);
            setIsEditing(false);
            // In a real app, we'd trigger a graph refresh here
        } catch (e) { console.error(e); } finally { setIsSaving(false); }
    };

    const handleDeleteNode = async () => {
        if (!entity || !window.confirm("Permanently delete this node and all its connections?")) return;
        try {
            await nexusApi.deleteNode(entity.id);
            onClose();
        } catch (e) { console.error(e); }
    };

    const handleSearchNodes = async (q: string) => {
        setSearchQuery(q);
        if (q.length < 2) return;
        try {
            const res = await nexusApi.getStats(); // Just using search endpoint if it exists
            const searchRes = await api.post('/graph/search', { query: q });
            setSearchResults(searchRes.data.results);
        } catch (e) { console.error(e); }
    };

    const handleCreateLink = async () => {
        if (!entity || !selectedTarget) return;
        setIsSaving(true);
        try {
            await nexusApi.createRelationship(entity.id, selectedTarget.id, relType);
            setShowConnectFlow(false);
        } catch (e) { console.error(e); } finally { setIsSaving(false); }
    };

    const handleDeleteRel = async (relId: string) => {
        if (!window.confirm("Delete this connection?")) return;
        try { await nexusApi.deleteRelationship(relId); } catch (e) { console.error(e); }
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

                {/* Content Area - Context Switching */}
                {isEditing ? (
                    <VStack align="stretch" spaceY={4}>
                        <Heading size="xs">EDIT PROPERTIES</Heading>
                        {Object.entries(editProps).map(([key, value]) => {
                             if (['id', 'embedding'].includes(key.toLowerCase())) return null;
                             return (
                                <Box key={key}>
                                    <Text fontSize="9px" fontWeight="black" color="jungle-teal">{key.toUpperCase()}</Text>
                                    <Input 
                                        size="sm" 
                                        variant="subtle" 
                                        value={typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                        onChange={(e) => setEditProps({...editProps, [key]: e.target.value})}
                                        rounded="lg"
                                        bg="bg.muted"
                                    />
                                </Box>
                             )
                        })}
                        <Button size="xs" variant="ghost" colorPalette="teal" onClick={() => setEditProps({...editProps, "new_property": ""})}>+ ADD PROPERTY</Button>
                    </VStack>
                ) : showConnectFlow ? (
                    <VStack align="stretch" spaceY={4}>
                        <Heading size="xs">NEW CONNECTION</Heading>
                        <Box>
                            <Text fontSize="9px" fontWeight="black" color="jungle-teal">TARGET NODE SEARCH</Text>
                            <HStack>
                                <Input 
                                    size="sm" 
                                    placeholder="Search by name..." 
                                    value={searchQuery}
                                    onChange={(e) => handleSearchNodes(e.target.value)}
                                    rounded="lg"
                                />
                                <Icon as={LuSearch} />
                            </HStack>
                            {searchResults.length > 0 && (
                                <VStack align="stretch" mt={2} maxH="150px" overflowY="auto" border="1px solid" borderColor="border.muted" p={2} rounded="lg">
                                    {searchResults.map((res: any) => (
                                        <Button 
                                            key={res.id} 
                                            size="xs" 
                                            variant={selectedTarget?.id === res.id ? "solid" : "ghost"}
                                            onClick={() => setSelectedTarget(res)}
                                            justifyContent="flex-start"
                                        >
                                            {res.name || res.id}
                                        </Button>
                                    ))}
                                </VStack>
                            )}
                        </Box>
                        <Box>
                            <Text fontSize="9px" fontWeight="black" color="jungle-teal">RELATIONSHIP TYPE</Text>
                            <Input 
                                size="sm" 
                                value={relType} 
                                onChange={(e) => setRelType(e.target.value.toUpperCase())}
                                rounded="lg"
                            />
                        </Box>
                    </VStack>
                ) : (
                    <>
                        {/* Primary Attributes */}
                        <VStack align="stretch" spaceY={4}>
                            <HStack justifyContent="space-between" align="center">
                                <Text fontSize="10px" fontWeight="black" color="jungle-teal" letterSpacing="widest">INTELLIGENCE REPORT</Text>
                                <Badge variant="subtle" colorPalette="teal" size="sm">NEXUS ENHANCED</Badge>
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
                                    <VStack align="center" spaceY={1}>
                                        <Icon as={LuExternalLink} size="xs" color="fg.muted" />
                                        <IconButton 
                                            size="xs" 
                                            variant="ghost" 
                                            colorPalette="red" 
                                            rounded="full"
                                            onClick={() => handleDeleteRel(entity.id)}
                                        >
                                            <LuTrash2 />
                                        </IconButton>
                                    </VStack>
                                    <VStack align="end" spaceY={0}>
                                        <Text fontSize="9px" fontWeight="black" color="fg.muted">TARGET</Text>
                                        <Text fontSize="xs" fontWeight="black" color="fg">{entity.target}</Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                        )}
                    </>
                )}
            </VStack>

            {/* Footer */}
            <Box p={5} borderTop="1px solid" borderColor="border.muted" bg="bg.muted/20">
                {!isEditing && !showConnectFlow ? (
                    <VStack spaceY={2} w="full">
                        <HStack w="full" spaceX={2}>
                            <Button 
                                flex={1}
                                variant="outline" 
                                size="sm" 
                                rounded="xl" 
                                fontWeight="black" 
                                onClick={() => setIsEditing(true)}
                            >
                                <LuPencil />
                                EDIT NODE
                            </Button>
                            <Button 
                                flex={1}
                                variant="outline" 
                                size="sm" 
                                rounded="xl" 
                                fontWeight="black" 
                                onClick={() => setShowConnectFlow(true)}
                            >
                                <LuLink />
                                CONNECT
                            </Button>
                        </HStack>
                        <HStack w="full" spaceX={2}>
                            <Button 
                                flex={2}
                                variant="solid" 
                                bg="turf-green" 
                                color="white"
                                size="sm" 
                                rounded="xl" 
                                fontWeight="black" 
                                onClick={handleDeepAnalyze}
                                loading={isAnalyzing}
                                _hover={{ bg: "jungle-teal" }}
                            >
                                DEEP ANALYZE
                            </Button>
                            <IconButton 
                                aria-label="Delete"
                                variant="outline" 
                                colorPalette="red"
                                size="sm" 
                                rounded="xl" 
                                onClick={handleDeleteNode}
                            >
                                <LuTrash2 />
                            </IconButton>
                        </HStack>
                    </VStack>
                ) : (
                    <HStack w="full" spaceX={2}>
                        <Button 
                            flex={1}
                            variant="solid" 
                            colorPalette="purple" 
                            size="sm" 
                            rounded="xl" 
                            fontWeight="black" 
                            onClick={isEditing ? handleSaveNode : handleCreateLink}
                            loading={isSaving}
                        >
                            <LuCheck />
                            COMMIT
                        </Button>
                        <Button 
                            flex={1}
                            variant="ghost" 
                            size="sm" 
                            rounded="xl" 
                            fontWeight="black" 
                            onClick={() => { setIsEditing(false); setShowConnectFlow(false); }}
                        >
                            CANCEL
                        </Button>
                    </HStack>
                )}
            </Box>
        </Box>
    );
};
