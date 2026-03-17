import { 
    Box, VStack, HStack, Heading, Text, Icon, Button, Badge, 
    Input, Field, Circle, SimpleGrid, Separator
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { nexusApi } from '@/services/api';
import { 
    LuSettings, 
    LuShieldCheck, 
    LuLoaderCircle, 
    LuServer, 
    LuDatabase, 
    LuCpu,
    LuKey,
    LuTerminal,
    LuActivity,
    LuLayers
} from 'react-icons/lu';
import gsap from 'gsap';

export const Settings = () => {
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchStatus = async () => {
        setIsRefreshing(true);
        try {
            const data = await nexusApi.getSystemStatus();
            setStatus(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        gsap.from(".settings-panel", {
            opacity: 0,
            y: 20,
            stagger: 0.1,
            duration: 0.8,
            ease: "power3.out"
        });
    }, []);

    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{success: boolean, message: string} | null>(null);

    const handleVerifyKey = async () => {
        if (!apiKey) return;
        setIsVerifying(true);
        setVerificationResult(null);
        try {
            const res = await nexusApi.verifyApiKey(apiKey);
            setVerificationResult({ success: true, message: res.message });
        } catch (error: any) {
            const msg = error.response?.data?.detail || 'Validation failed';
            setVerificationResult({ success: false, message: msg });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSaveKey = async () => {
        setLoading(true);
        try {
            // Optional: verify before saving if not already verified
            if (!verificationResult?.success) {
                const check = await nexusApi.verifyApiKey(apiKey);
                if (!check.success) throw new Error("Key verification failed");
            }
            await nexusApi.updateApiKey('GEMINI_API_KEY', apiKey);
            await fetchStatus();
            setApiKey('');
            setVerificationResult(null);
            alert('API Key synchronized. Cognitive engine re-provisioned.');
        } catch (error: any) {
            const msg = error.response?.data?.detail || error.message || 'Authentication synchronization failed.';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={8} h="full" overflowY="auto" bg="bg.canvas">
            <VStack align="stretch" gap={8} maxW="1200px" mx="auto">
                {/* Header Section */}
                <HStack justifyContent="space-between" className="settings-panel">
                    <VStack align="start" gap={1}>
                        <HStack gap={3}>
                            <Icon as={LuSettings} size="xl" color="jungle-teal" />
                            <Heading size="3xl" fontWeight="black" color="fg">Core Configuration</Heading>
                        </HStack>
                        <Text color="jungle-teal" fontWeight="black" letterSpacing="widest" fontSize="xs">
                            ENGINE MANAGEMENT & SYSTEM INTEGRITY
                        </Text>
                    </VStack>
                    <HStack gap={4}>
                        <Button 
                            variant="surface" 
                            colorPalette="teal" 
                            rounded="xl" 
                            onClick={fetchStatus}
                            loading={isRefreshing}
                        >
                            <LuActivity style={{ marginRight: '8px' }} /> Sync Status
                        </Button>
                    </HStack>
                </HStack>

                <Separator borderColor="border.subtle" opacity={0.5} />

                <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
                    {/* System Integrity Dashboard */}
                    <VStack align="stretch" gap={6} className="settings-panel">
                        <HStack gap={2}>
                            <LuServer color="var(--chakra-colors-jungle-teal)" />
                            <Text fontWeight="black" fontSize="sm" letterSpacing="widest">SYSTEM INTEGRITY</Text>
                        </HStack>
                        
                        <SimpleGrid columns={2} gap={4}>
                            <IntegrityCard 
                                label="Cognitive Engine" 
                                value="Gemini AI" 
                                status={status?.gemini === 'ACTIVE' ? 'STABLE' : 'ACTION REQUIRED'} 
                                color={status?.gemini === 'ACTIVE' ? 'green' : 'red'}
                                icon={LuCpu}
                            />
                            <IntegrityCard 
                                label="Knowledge Graph" 
                                value="Neo4j" 
                                status={status?.neo4j === 'ACTIVE' ? 'CONNECTED' : 'DISCONNECTED'} 
                                color={status?.neo4j === 'ACTIVE' ? 'green' : 'red'}
                                icon={LuDatabase}
                            />
                            <IntegrityCard 
                                label="Metadata Store" 
                                value="MongoDB" 
                                status={status?.mongodb === 'ACTIVE' ? 'ONLINE' : 'OFFLINE'} 
                                color={status?.mongodb === 'ACTIVE' ? 'green' : 'red'}
                                icon={LuActivity}
                            />
                            <IntegrityCard 
                                label="Cache Engine" 
                                value="Redis" 
                                status={status?.redis === 'ACTIVE' ? 'ACTIVE' : 'OFFLINE'} 
                                color={status?.redis === 'ACTIVE' ? 'green' : 'red'}
                                icon={LuTerminal}
                            />
                        </SimpleGrid>

                        {/* Status Message */}
                        {status && (status.gemini !== 'ACTIVE' || status.neo4j !== 'ACTIVE') && (
                            <Box p={4} bg="red.500/10" border="1px solid" borderColor="red.500/20" rounded="2xl" animation="pulse 2s infinite">
                                <HStack gap={3} color="red.500">
                                    <LuLoaderCircle className="animate-spin" />
                                    <VStack align="start" gap={0}>
                                        <Text fontWeight="black" fontSize="xs">SYSTEM DEGRADATION DETECTED</Text>
                                        <Text fontSize="10px">
                                            {status.gemini !== 'ACTIVE' ? '• Gemini API key expired or invalid. ' : ''}
                                            {status.neo4j !== 'ACTIVE' ? '• Neo4j connection lost. ' : ''}
                                            Check terminal logs for details.
                                        </Text>
                                    </VStack>
                                </HStack>
                            </Box>
                        )}
                    </VStack>

                    {/* Credential Management */}
                    <VStack align="stretch" gap={6} className="settings-panel">
                        <HStack gap={2}>
                            <LuKey color="var(--chakra-colors-jungle-teal)" />
                            <Text fontWeight="black" fontSize="sm" letterSpacing="widest">IDENTITY & ACCESS</Text>
                        </HStack>

                        <Box p={6} bg="bg.surface" rounded="3xl" border="1px solid" borderColor="border.subtle" shadow="xl">
                            <VStack align="stretch" gap={6}>
                                <Field.Root>
                                    <Field.Label fontSize="xs" fontWeight="black" color="fg.muted">GEMINI API ACCESS KEY</Field.Label>
                                    <HStack w="full" gap={2}>
                                        <Input 
                                            type="password"
                                            placeholder="AIzaSy... (Click to rotate)"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            bg="bg.muted"
                                            border="none"
                                            rounded="xl"
                                            p={6}
                                            flex={1}
                                            _focus={{ ring: 2, ringColor: "jungle-teal" }}
                                        />
                                        <Button 
                                            h="50px" 
                                            px={6} 
                                            variant="outline" 
                                            rounded="xl" 
                                            fontWeight="black" 
                                            colorPalette="teal"
                                            onClick={handleVerifyKey}
                                            loading={isVerifying}
                                        >
                                            VERIFY
                                        </Button>
                                    </HStack>
                                    {verificationResult && (
                                        <Text fontSize="10px" mt={2} color={verificationResult.success ? "green.500" : "red.500"} fontWeight="bold">
                                            {verificationResult.success ? "✅ " : "❌ "} {verificationResult.message}
                                        </Text>
                                    )}
                                    <Field.HelperText fontSize="9px" color="fg.muted" mt={2}>
                                        <HStack gap={2}>
                                            <LuShieldCheck />
                                            <Text>End-to-end encrypted storage via secure environment injection.</Text>
                                        </HStack>
                                    </Field.HelperText>
                                </Field.Root>

                                <Button 
                                    w="full" 
                                    bg="jungle-teal" 
                                    color="white" 
                                    h="50px" 
                                    rounded="xl" 
                                    fontWeight="black"
                                    onClick={handleSaveKey}
                                    loading={loading}
                                    disabled={!apiKey || (verificationResult !== null && !verificationResult.success)}
                                    _hover={{ bg: 'turf-green', transform: 'translateY(-2px)' }}
                                    transition="all 0.3s"
                                >
                                    SYNCHRONIZE CREDENTIALS
                                </Button>
                            </VStack>
                        </Box>
                    </VStack>
                </SimpleGrid>

                {/* Advanced Engine Config */}
                <VStack align="stretch" gap={6} className="settings-panel">
                    <HStack gap={2}>
                        <LuTerminal color="var(--chakra-colors-jungle-teal)" />
                        <Text fontWeight="black" fontSize="sm" letterSpacing="widest">ENGINE PARAMETERS</Text>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                        <ConfigToggle label="Recursive Discovery" description="Deep entity relationship crawling" active />
                        <ConfigToggle label="Vector Alignment" description="RAG-driven context injection" active />
                        <ConfigToggle label="GDS Projections" description="Community detection analytics" />
                    </SimpleGrid>
                </VStack>

                {/* Graph Visual Preferences */}
                <VStack align="stretch" gap={6} className="settings-panel">
                    <HStack gap={2}>
                        <LuLayers color="var(--chakra-colors-jungle-teal)" />
                        <Text fontWeight="black" fontSize="sm" letterSpacing="widest">VISUAL PREFERENCES</Text>
                    </HStack>

                    <Box bg="bg.surface" p={6} rounded="3xl" border="1px solid" borderColor="border.subtle">
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={10}>
                            <VStack align="stretch" gap={4}>
                                <Text fontSize="xs" fontWeight="black" color="fg.muted">TOPOLOGY ENGINE RENDERER</Text>
                                <HStack justifyContent="space-between">
                                    <Text fontSize="sm" fontWeight="bold">Node Scale Factor</Text>
                                    <Badge colorPalette="teal">1.2x</Badge>
                                </HStack>
                                <HStack justifyContent="space-between">
                                    <Text fontSize="sm" fontWeight="bold">Relationship Curveness</Text>
                                    <Badge colorPalette="teal">0.15</Badge>
                                </HStack>
                                <HStack justifyContent="space-between">
                                    <Text fontSize="sm" fontWeight="bold">Text Resolution</Text>
                                    <Badge colorPalette="teal">High</Badge>
                                </HStack>
                            </VStack>
                            <VStack align="stretch" gap={4}>
                                <Text fontSize="xs" fontWeight="black" color="fg.muted">OVERLAY & EFFECTS</Text>
                                <ConfigToggle label="Glassmorphism UI" description="Advanced backdrop blur effects" active />
                                <ConfigToggle label="Dynamic Animations" description="GSAP orchestrated transitions" active />
                            </VStack>
                        </SimpleGrid>
                    </Box>
                </VStack>

                {/* Keybindings Management */}
                <VStack align="stretch" gap={6} className="settings-panel">
                    <HStack gap={2}>
                        <LuTerminal color="var(--chakra-colors-jungle-teal)" />
                        <Text fontWeight="black" fontSize="sm" letterSpacing="widest">KEYBOARD SHORTCUTS</Text>
                    </HStack>

                    <Box bg="bg.surface" p={6} rounded="3xl" border="1px solid" borderColor="border.subtle" overflow="hidden">
                        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
                            <ShortcutItem keys={['Shift', 'F']} label="Toggle Filter Panel" />
                            <ShortcutItem keys={['Ctrl', 'G']} label="Switch Graph View" />
                            <ShortcutItem keys={['Shift', 'S']} label="Open Sunburst View" />
                            <ShortcutItem keys={['Ctrl', 'K']} label="Global Command Search" />
                            <ShortcutItem keys={['Esc']} label="Close Panels / Reset" />
                            <ShortcutItem keys={['/']} label="Focus Search" />
                        </SimpleGrid>
                    </Box>
                </VStack>

            </VStack>
        </Box>
    );
};

const IntegrityCard = ({ label, value, status, color, icon }: any) => (
    <Box p={5} bg="bg.surface" rounded="3xl" border="1px solid" borderColor="border.subtle" shadow="lg" transition="all 0.3s" _hover={{ transform: 'translateY(-4px)', shadow: '2xl', borderColor: 'jungle-teal/30' }}>
        <VStack align="start" gap={3}>
            <Circle size="10" bg={`${color}.500/10`}>
                <Icon as={icon} color={`${color}.500`} />
            </Circle>
            <VStack align="start" gap={0}>
                <Text fontSize="9px" fontWeight="black" color="fg.muted" letterSpacing="widest">{label.toUpperCase()}</Text>
                <Text fontSize="sm" fontWeight="black" color="fg">{value}</Text>
            </VStack>
            <Badge colorPalette={color} variant="solid" rounded="md" fontSize="9px" px={2}>{status}</Badge>
        </VStack>
    </Box>
);

const ConfigToggle = ({ label, description, active = false }: any) => (
    <HStack p={5} bg="bg.surface" rounded="3xl" border="1px solid" borderColor={active ? "jungle-teal/30" : "border.subtle"} shadow="md" cursor="pointer" transition="all 0.3s" _hover={{ bg: 'bg.muted' }}>
        <VStack align="start" gap={0} flex={1}>
            <Text fontSize="xs" fontWeight="black" color="fg">{label}</Text>
            <Text fontSize="10px" color="fg.muted">{description}</Text>
        </VStack>
        <Circle size="4" bg={active ? "jungle-teal" : "border.muted"} shadow={active ? "0 0 10px var(--chakra-colors-jungle-teal)" : "none"} />
    </HStack>
);

const ShortcutItem = ({ keys, label }: { keys: string[], label: string }) => (
    <HStack p={4} bg="bg.muted/50" rounded="2xl" border="1px solid" borderColor="border.subtle" justifyContent="space-between">
        <Text fontSize="xs" fontWeight="bold">{label}</Text>
        <HStack gap={1}>
            {keys.map((k, i) => (
                <React.Fragment key={i}>
                    <Kbd>{k}</Kbd>
                    {i < keys.length - 1 && <Text fontSize="xs">+</Text>}
                </React.Fragment>
            ))}
        </HStack>
    </HStack>
);

const Kbd = ({ children }: { children: React.ReactNode }) => (
    <Box 
        px={2} py={1} bg="bg.surface" border="1px solid" borderColor="border.subtle" 
        rounded="md" fontSize="10px" fontWeight="black" shadow="sm" minW="30px" textAlign="center"
    >
        {children}
    </Box>
);

