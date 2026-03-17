import { Box, Heading, Text, VStack, HStack, Button, Textarea, Flex, Badge, Circle, Icon } from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { LuUpload, LuFileCode, LuNetwork, LuSparkles, LuFileJson, LuFileStack, LuZap, LuShieldCheck, LuTriangle } from 'react-icons/lu';
import { nexusApi } from '@/services/api';
import gsap from 'gsap';

export const DataUpload = () => {
    const [cypherText, setCypherText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [useAi, setUseAi] = useState(true);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'warning' | 'error', message: string }>({ type: 'idle', message: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [folders, setFolders] = useState<any[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string>('');

    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const res = await nexusApi.getFolders();
                setFolders(res);
                if (res.length > 0) setSelectedFolder(res[0].slug);
            } catch (e) {
                console.error("Failed to fetch topics:", e);
            }
        };
        fetchFolders();

        const ctx = gsap.context(() => {
            gsap.fromTo(".upload-card", 
                { y: 30, opacity: 0, scale: 0.98 },
                { 
                    y: 0, 
                    opacity: 1, 
                    scale: 1,
                    duration: 0.8, 
                    stagger: 0.1, 
                    ease: "power3.out", 
                    delay: 0.2,
                    clearProps: "all"
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const simulateProgress = () => {
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + Math.random() * 10;
            });
        }, 800);
        return interval;
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedExt = ['.pdf', '.csv', '.xlsx', '.cypher', '.txt'];
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        if (!allowedExt.includes(ext)) {
            setStatus({ type: 'error', message: `Format ${ext} not supported CURRENTLY.` });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        setStatus({ type: 'idle', message: '' });
        const progInterval = simulateProgress();

        try {
            const res = await nexusApi.uploadUniversal(formData, selectedFolder, useAi);
            clearInterval(progInterval);
            setProgress(100);
            
            if (res.status === 'warning') {
                setStatus({ type: 'warning', message: res.message });
            } else {
                setStatus({ type: 'success', message: `Ingested data from ${file.name} successfully!` });
            }
        } catch (error: any) {
            clearInterval(progInterval);
            setStatus({ type: 'error', message: error.response?.data?.detail || 'Ingestion failed' });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setTimeout(() => setProgress(0), 4000);
        }
    };

    const handleTextUpload = async () => {
        if (!cypherText.trim()) return;

        setIsUploading(true);
        setStatus({ type: 'idle', message: '' });
        const progInterval = simulateProgress();

        try {
            await nexusApi.uploadCypherText(cypherText, selectedFolder);
            clearInterval(progInterval);
            setProgress(100);
            setStatus({ type: 'success', message: 'Raw Cypher synth completed and vectorized.' });
            setCypherText('');
        } catch (error: any) {
            clearInterval(progInterval);
            setStatus({ type: 'error', message: error.response?.data?.detail || 'Synthesis failed' });
        } finally {
            setIsUploading(false);
            setTimeout(() => setProgress(0), 4000);
        }
    };

    return (
        <Box p={8} w="full" ref={containerRef} className="custom-scrollbar" overflowY="auto" maxH="100vh" bg="bg.canvas">
            <VStack align="stretch" spaceY={10} w="full" maxW="1400px" mx="auto">
                {/* Header Section */}
                <HStack w="full" justifyContent="space-between" className="upload-card">
                    <VStack align="start" spaceY={2}>
                        <HStack spaceX={3}>
                            <Circle size="12" bg="bg.muted" border="2px solid" borderColor="turf-green/30" shadow="glow">
                                <LuUpload color="var(--chakra-colors-turf-green)" size="24px" />
                            </Circle>
                            <Heading size="3xl" fontWeight="black" letterSpacing="tighter" color="fg">Universal Ingestion</Heading>
                        </HStack>
                        <Text color="fg.muted" fontWeight="medium" maxW="800px" fontSize="sm">
                            The Nexus Hub: Drop anything from **Scientific PDFs** to **Complex Cypher** scripts. 
                            Our Gemini pipeline auto-detects entities, maps relationships, and populates the vector store.
                        </Text>
                    </VStack>
                    
                    <VStack align="end" spaceY={3}>
                        <HStack p={2} pl={4} bg="bg.surface" rounded="2xl" border="1px solid" borderColor="border.subtle" shadow="premium">
                            <VStack align="start" spaceY={0} mr={4}>
                                <Text fontSize="9px" fontWeight="black" color="turf-green" letterSpacing="widest">AI REASONING</Text>
                                <Text fontSize="11px" fontWeight="bold">{useAi ? 'ENABLED (MAX RECALL)' : 'DISABLED (DIRECT)'}</Text>
                            </VStack>
                            {/* Custom Toggle implementation to avoid Chakra v3 JSX issues */}
                            <Box 
                                w="44px" h="24px" bg={useAi ? "turf-green" : "border.muted"} 
                                rounded="full" position="relative" cursor="pointer"
                                onClick={() => setUseAi(!useAi)}
                                transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                            >
                                <Circle 
                                    size="18px" bg="white" position="absolute" top="3px"
                                    left={useAi ? "23px" : "3px"}
                                    transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                                    shadow="sm"
                                />
                            </Box>
                        </HStack>
                        
                        <HStack p={3} bg="bg.surface" rounded="2xl" border="1px solid" borderColor="border.subtle" shadow="premium">
                            <Text fontSize="10px" fontWeight="black" color="fg.muted" mr={2}>TARGET TOPIC</Text>
                            <select
                                style={{
                                    background: 'transparent',
                                    color: 'var(--chakra-colors-fg)',
                                    fontSize: '12px',
                                    fontWeight: '900',
                                    border: 'none',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'right'
                                }}
                                value={selectedFolder}
                                onChange={(e) => setSelectedFolder(e.target.value)}
                            >
                                {folders.map(f => (
                                    <option key={f.id} value={f.slug} style={{ background: 'var(--chakra-colors-bg-surface)', color: 'var(--chakra-colors-fg)' }}>{f.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </HStack>
                    </VStack>
                </HStack>

                {progress > 0 && (
                    <Box w="full" className="upload-card">
                        <HStack justifyContent="space-between" mb={2}>
                            <Text fontSize="10px" fontWeight="black" color="turf-green" letterSpacing="widest">
                                {progress === 100 ? 'PROCESS COMPLETE' : 'AI EXTRACTION IN PROGRESS...'}
                            </Text>
                            <Text fontSize="10px" fontWeight="black">{Math.round(progress)}%</Text>
                        </HStack>
                        {/* Custom Progress implementation to avoid Chakra v3 JSX issues */}
                        <Box w="full" h="1.5" bg="bg.muted" rounded="full" overflow="hidden">
                            <Box 
                                w={`${progress}%`} h="full" bgGradient="to-r" 
                                gradientFrom="turf-green" gradientTo="jungle-teal" 
                                transition="width 0.5s cubic-bezier(0.1, 1, 0.3, 1)" 
                            />
                        </Box>
                    </Box>
                )}

                <HStack w="full" align="stretch" spaceX={8}>
                    {/* Raw Text Input */}
                    <Flex flex={1.6} bg="bg.surface" p={8} rounded="3xl" border="1px solid" borderColor="border.subtle" direction="column" shadow="premium" className="upload-card">
                        <HStack mb={6} spaceX={3}>
                            <Icon as={LuFileCode} fontSize="20px" color="turf-green" />
                            <Heading size="md" fontWeight="black" color="fg">Logic Stream</Heading>
                            <Badge ml="auto" variant="subtle" colorPalette="green" rounded="md" fontSize="9px" fontWeight="black">CYPHER 4.0+</Badge>
                        </HStack>

                        <Textarea
                            placeholder="// Paste your CREATE, MERGE or MATCH-DELETE streams here..."
                            value={cypherText}
                            onChange={(e) => setCypherText(e.target.value)}
                            flex={1}
                            minH="450px"
                            bg="bg.canvas"
                            p={6}
                            border="1px solid"
                            borderColor="border.subtle"
                            rounded="2xl"
                            fontFamily="mono"
                            fontSize="xs"
                            color="fg"
                            fontWeight="bold"
                            lineHeight="loose"
                            _placeholder={{ color: "fg.muted" }}
                            _focus={{ borderColor: 'turf-green', shadow: '0 0 15px rgba(16, 123, 65, 0.1)' }}
                        />

                        <HStack mt={8} justifyContent="space-between">
                            <VStack align="start" gap={0}>
                                <Text fontSize="9px" color="fg.muted" fontWeight="black" letterSpacing="widest">TRANSACTION READY</Text>
                                <Text fontSize="10px" color="turf-green" fontWeight="bold">DIRECT PROTOCOL COMMIT</Text>
                            </VStack>
                            <Button
                                bg="turf-green"
                                color="white"
                                h="56px"
                                px={10}
                                rounded="xl"
                                shadow="glow"
                                fontWeight="black"
                                letterSpacing="widest"
                                fontSize="sm"
                                _hover={{ bg: 'jungle-teal', transform: 'translateY(-2px)' }}
                                onClick={handleTextUpload}
                                loading={isUploading}
                                disabled={!cypherText.trim() || !selectedFolder}
                                transition="all 0.3s"
                            >
                                <LuNetwork style={{ marginRight: '10px' }} /> SYNTHESIZE DATA
                            </Button>
                        </HStack>
                    </Flex>

                    {/* File Upload Zone */}
                    <VStack flex={1} spaceY={8}>
                        <Flex 
                            w="full"
                            flex={1}
                            bg="bg.surface" 
                            p={10} 
                            rounded="3xl" 
                            border="2px dashed" 
                            borderColor="turf-green/20" 
                            direction="column" 
                            justify="center" 
                            align="center" 
                            textAlign="center" 
                            _hover={{ bg: 'turf-green/5', borderColor: "turf-green", transform: 'translateY(-2px)' }} 
                            transition="all 0.4s"
                            cursor="pointer" 
                            onClick={() => fileInputRef.current?.click()} 
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={(e) => {
                                e.preventDefault(); e.stopPropagation();
                                const file = e.dataTransfer.files?.[0];
                                if (file) handleFileUpload({ target: { files: [file] } } as any);
                            }}
                            shadow="premium"
                            className="upload-card"
                        >
                            <Box position="relative" mb={6}>
                                <Circle size="20" bg="turf-green/5">
                                    <LuFileStack size="32px" color="var(--chakra-colors-turf-green)" />
                                </Circle>
                                <Circle size="7" bg="turf-green" position="absolute" bottom="-1" right="-1" border="3px solid" borderColor="bg.surface">
                                    <LuUpload size="12px" color="white" />
                                </Circle>
                            </Box>
                            
                            <Heading size="md" fontWeight="black" mb={2} color="fg">Multimodal Import</Heading>
                            <Text fontSize="xs" color="fg.muted" px={4} fontWeight="bold" lineHeight="tall">
                                PDF, CSV, Excel, or TXT. <br/>
                                <Text as="span" color="turf-green">Gemini Enhanced pipelines </Text>
                                handle extraction automatically.
                            </Text>
                            
                            <input
                                type="file"
                                accept=".pdf,.csv,.xlsx,.cypher,.txt"
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            
                            <VStack w="full" mt={10} spaceY={3}>
                                <HStack w="full" justifyContent="space-around" borderTop="1px solid" borderColor="border.subtle" pt={6}>
                                    <VStack gap={0}><Icon as={LuFileCode} color="orange.400" /><Text fontSize="8px" fontWeight="black">CSV</Text></VStack>
                                    <VStack gap={0}><Icon as={LuFileJson} color="blue.400" /><Text fontSize="8px" fontWeight="black">PDF</Text></VStack>
                                    <VStack gap={0}><Icon as={LuZap} color="yellow.400" /><Text fontSize="8px" fontWeight="black">XLSX</Text></VStack>
                                </HStack>
                                <Button mt={4} variant="outline" borderColor="turf-green/30" color="turf-green" rounded="xl" h="50px" w="full" fontWeight="black" loading={isUploading} disabled={!selectedFolder} _hover={{ bg: 'turf-green', color: 'white', shadow: 'glow' }}>
                                    BROWSE STORAGE
                                </Button>
                            </VStack>
                        </Flex>

                        <Box w="full" p={6} bg="turf-green/5" rounded="2xl" border="1px solid" borderColor="turf-green/20" className="upload-card">
                            <VStack align="start" spaceY={4}>
                                <HStack spaceX={3}>
                                    <LuSparkles color="var(--chakra-colors-turf-green)" />
                                    <Text fontSize="10px" fontWeight="black" color="fg" letterSpacing="widest">AI PROCESSING ENGINE</Text>
                                </HStack>
                                <Text fontSize="11px" color="fg.muted" fontWeight="bold">
                                    If you ingested data via direct Cypher file, run our high-dimensional embedding engine to enable semantic chat.
                                </Text>
                                <Button 
                                    size="sm" 
                                    w="full" 
                                    bg="jungle-teal" 
                                    color="white" 
                                    rounded="xl" 
                                    fontWeight="black" 
                                    fontSize="xs"
                                    onClick={async () => {
                                        setIsUploading(true);
                                        try {
                                            const res = await nexusApi.processEmbeddings(selectedFolder);
                                            setStatus({ type: 'success', message: res.message });
                                        } catch (e: any) {
                                            setStatus({ type: 'error', message: e.response?.data?.detail || 'Process failed' });
                                        } finally {
                                            setIsUploading(false);
                                        }
                                    }}
                                    loading={isUploading}
                                >
                                    GENERATE VECTORS
                                </Button>

                                <Box w="full" pt={4} mt={2} borderTop="1px solid" borderColor="turf-green/10">
                                    <VStack align="stretch" spaceY={3}>
                                        <StepItem icon={LuShieldCheck} label="Document Segmentation & OCR" active />
                                        <StepItem icon={LuShieldCheck} label="Gemini Entity Resolution" active />
                                        <StepItem icon={LuShieldCheck} label="Knowledge Graph Mapping" />
                                        <StepItem icon={LuShieldCheck} label="Vector Alignment (768D)" />
                                    </VStack>
                                </Box>
                            </VStack>
                        </Box>
                    </VStack>
                </HStack>

                {/* Status Indicator */}
                {status.message && (
                    <Box 
                        w="full" p={6} rounded="2xl" 
                        bg={status.type === 'error' ? 'red.500/8' : status.type === 'warning' ? 'orange.500/8' : 'turf-green/8'} 
                        border="1px solid" 
                        borderColor={status.type === 'error' ? 'red.500/30' : status.type === 'warning' ? 'orange.500/30' : 'turf-green/30'} 
                        className="upload-card"
                    >
                        <HStack spaceX={4}>
                            <Icon 
                                 as={status.type === 'error' ? LuTriangle : LuShieldCheck} 
                                 color={status.type === 'error' ? 'red.500' : status.type === 'warning' ? 'orange.500' : 'turf-green'} 
                                 size="sm"
                            />
                           <VStack align="start" spaceY={0}>
                               <Text color={status.type === 'error' ? 'red.600' : status.type === 'warning' ? 'orange.600' : 'turf-green'} fontWeight="black" fontSize="xs" letterSpacing="widest">
                                    {status.type.toUpperCase()}
                                </Text>
                                <Text fontWeight="bold" fontSize="sm" color="fg">{status.message}</Text>
                           </VStack>
                        </HStack>
                    </Box>
                )}
            </VStack>
        </Box>
    );
};

const StepItem = ({ icon, label, active = false }: any) => (
    <HStack gap={3} opacity={active ? 1 : 0.4}>
        <Icon as={icon} color={active ? "turf-green" : "fg.muted"} size="sm" />
        <Text fontSize="11px" fontWeight="bold" color={active ? "fg" : "fg.muted"}>{label}</Text>
    </HStack>
);
