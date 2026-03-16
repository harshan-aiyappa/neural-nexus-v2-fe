import { Box, Heading, Text, VStack, HStack, Button, Textarea, Flex, Badge, Circle } from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { LuUpload, LuFileCode, LuNetwork, LuSparkles } from 'react-icons/lu';
import { nexusApi } from '@/services/api';
import gsap from 'gsap';

export const DataUpload = () => {
    const [cypherText, setCypherText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [folders, setFolders] = useState<any[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string>('');

    useEffect(() => {
        const fetchFolders = async () => {
            const res = await nexusApi.getFolders();
            setFolders(res);
            if (res.length > 0) setSelectedFolder(res[0].slug);
        };
        fetchFolders();

        const ctx = gsap.context(() => {
            gsap.fromTo(".upload-card", 
                { y: 30, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 0.8, 
                    stagger: 0.15, 
                    ease: "power3.out", 
                    delay: 0.2,
                    clearProps: "all"
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.cypher') && !file.name.endsWith('.txt')) {
            setStatus({ type: 'error', message: 'Only .cypher or .txt files are supported.' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        setStatus({ type: 'idle', message: '' });

        try {
            const res = await nexusApi.uploadCypherFile(formData, selectedFolder);
            setStatus({ type: 'success', message: `Successfully queued ${res.filename} for embedding!` });
            setCypherText('');
        } catch (error: any) {
            setStatus({ type: 'error', message: error.response?.data?.detail || 'File upload failed' });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleTextUpload = async () => {
        if (!cypherText.trim()) return;

        setIsUploading(true);
        setStatus({ type: 'idle', message: '' });

        try {
            await nexusApi.uploadCypherText(cypherText, selectedFolder);
            setStatus({ type: 'success', message: 'Successfully queued raw Cypher for embedding!' });
            setCypherText('');
        } catch (error: any) {
            setStatus({ type: 'error', message: error.response?.data?.detail || 'Upload failed' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Box p={8} w="full" ref={containerRef}>
            <VStack align="stretch" spaceY={10} w="full">
                <HStack w="full" justifyContent="space-between" className="upload-card">
                    <VStack align="start" spaceY={2}>
                        <HStack spaceX={3}>
                            <Circle size="10" bg="turf-green" shadow="glow">
                                <LuUpload color="white" size="20px" />
                            </Circle>
                            <Heading size="3xl" fontWeight="black" letterSpacing="tighter" color="fg">Data Ingestion</Heading>
                        </HStack>
                        <Text color="fg.muted" fontWeight="medium" maxW="800px">
                            Upload bulk Cypher files to the Nexus. Our Gemini-powered pipeline automatically cleans syntax, 
                            ingests nodes, and generates high-dimensional embeddings in the background.
                        </Text>
                    </VStack>
                    <VStack align="end" spaceY={1} p={3} bg="bg.surface" rounded="2xl" border="1px solid" borderColor="border.subtle" shadow="premium">
                        <Text fontSize="9px" fontWeight="black" color="turf-green" letterSpacing="widest">TARGET CLUSTER</Text>
                        <select
                            style={{
                                background: 'transparent',
                                color: 'var(--chakra-colors-fg)',
                                fontSize: '13px',
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
                    </VStack>
                </HStack>

                <HStack w="full" align="stretch" spaceX={8}>
                    {/* Raw Text Input */}
                    <Flex flex={2} bg="bg.surface" p={8} rounded="3xl" border="1px solid" borderColor="border.subtle" direction="column" shadow="premium" className="upload-card">
                        <HStack mb={6} spaceX={3}>
                            <LuFileCode size="24px" color="var(--chakra-colors-turf-green)" />
                            <Heading size="md" fontWeight="black" color="fg">Raw Cypher Stream</Heading>
                        </HStack>

                        <Textarea
                            placeholder="// Paste your CREATE or MERGE statements here..."
                            value={cypherText}
                            onChange={(e) => setCypherText(e.target.value)}
                            flex={1}
                            minH="400px"
                            bg="bg.muted"
                            p={6}
                            border="1px solid"
                            borderColor="border.subtle"
                            rounded="2xl"
                            fontFamily="mono"
                            fontSize="sm"
                            color="fg"
                            fontWeight="bold"
                            lineHeight="tall"
                            _placeholder={{ color: "fg.muted" }}
                            _focus={{ borderColor: 'turf-green', bg: 'bg.muted', shadow: '0 0 15px rgba(16, 123, 65, 0.1)' }}
                        />

                        <HStack mt={8} justifyContent="space-between">
                            <Badge variant="subtle" bg="turf-green/5" color="turf-green" size="sm" rounded="md" fontWeight="black" px={3}>SCHEMA AUTO-VALIDATION ACTIVE</Badge>
                            <Button
                                bg="turf-green"
                                color="white"
                                h="60px"
                                px={10}
                                rounded="2xl"
                                shadow="premium"
                                fontWeight="black"
                                letterSpacing="wider"
                                _hover={{ bg: 'brand.turf-2', transform: 'translateY(-2px)' }}
                                onClick={handleTextUpload}
                                loading={isUploading}
                                disabled={!cypherText.trim() || !selectedFolder}
                            >
                                <LuNetwork style={{ marginRight: '8px' }} /> SYNTHESIZE DATA
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
                            borderColor="turf-green/30" 
                            direction="column" 
                            justify="center" 
                            align="center" 
                            textAlign="center" 
                            _hover={{ bg: 'turf-green/5', borderColor: "turf-green", transform: 'scale(1.02)' }} 
                            transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                            cursor="pointer" 
                            onClick={() => fileInputRef.current?.click()} 
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const file = e.dataTransfer.files?.[0];
                                if (file) {
                                    const event = { target: { files: [file] } } as any;
                                    handleFileUpload(event);
                                }
                            }}
                            shadow="premium"
                            className="upload-card"
                        >
                            <Circle size="20" bg="turf-green/5" mb={6} shadow="inner">
                                <LuUpload size="32px" color="var(--chakra-colors-turf-green)" />
                            </Circle>
                            <Heading size="md" fontWeight="black" mb={2} color="fg">Import Seed File</Heading>
                            <Text fontSize="xs" color="fg.muted" px={4} fontWeight="bold" lineHeight="tall">
                                Select a verified .cypher or .txt structure to batch-ingest entire knowledge clusters.
                            </Text>
                            <input
                                type="file"
                                accept=".cypher,.txt"
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <Button mt={10} variant="outline" borderColor="turf-green" color="turf-green" rounded="2xl" h="56px" w="full" fontWeight="black" loading={isUploading} disabled={!selectedFolder} _hover={{ bg: 'turf-green', color: 'white' }}>
                                SCAN LOCAL DRIVE
                            </Button>
                        </Flex>

                        <Box w="full" p={6} bg="turf-green/5" rounded="2xl" border="1px solid" borderColor="turf-green/20" className="upload-card">
                            <VStack align="start" spaceY={4}>
                                <HStack spaceX={3}>
                                    <LuSparkles color="var(--chakra-colors-turf-green)" />
                                    <Text fontSize="10px" fontWeight="black" color="fg" letterSpacing="widest">AI PROCESSING</Text>
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
                            </VStack>
                        </Box>
                    </VStack>
                </HStack>

                {/* Status Indicator */}
                {status.message && (
                    <Box w="full" p={6} rounded="2xl" bg={status.type === 'success' ? 'turf-green/10' : 'red.500/10'} border="1px solid" borderColor={status.type === 'success' ? 'turf-green/30' : 'red.500/30'} className="upload-card" animate-in fade-in slide-in-from-bottom-2 duration-300>
                        <HStack spaceX={4}>
                           <Circle size="2" bg={status.type === 'success' ? 'turf-green' : 'red.500'} shadow="glow" />
                           <Text color={status.type === 'success' ? 'turf-green' : 'red.600'} fontWeight="black" fontSize="xs" letterSpacing="widest">
                                {status.message.toUpperCase()}
                            </Text>
                        </HStack>
                    </Box>
                )}
            </VStack>
        </Box>
    );
};
