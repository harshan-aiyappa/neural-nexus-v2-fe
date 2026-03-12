import { Box, Heading, Text, VStack, HStack, Button, Textarea, Flex, Badge, Icon, Circle } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';
import { useState, useRef, useEffect } from 'react';
import { LuUpload, LuFileCode, LuNetwork } from 'react-icons/lu';
import { nexusApi } from '@/services/api';

export const DataUpload = () => {
    const [cypherText, setCypherText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [folders, setFolders] = useState<any[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string>('');

    const cardBg = useColorModeValue('white', 'bg.surface');
    const borderColor = useColorModeValue('gray.200', 'white/10');
    const selectBg = useColorModeValue('gray.100', 'rgba(0,0,0,0.1)');
    const selectColor = useColorModeValue('gray.800', 'white');
    const optionBg = useColorModeValue('white', '#1a1a1a');

    useEffect(() => {
        const fetchFolders = async () => {
            const res = await nexusApi.getFolders();
            setFolders(res);
            if (res.length > 0) setSelectedFolder(res[0].slug);
        };
        fetchFolders();
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
            setStatus({ type: 'success', message: `Successfully queued ${res.filename} for embedding! Check dashboard later.` });
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
            setStatus({ type: 'success', message: 'Successfully queued raw Cypher for embedding! Check dashboard later.' });
            setCypherText('');
        } catch (error: any) {
            setStatus({ type: 'error', message: error.response?.data?.detail || 'Upload failed' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Box p={8} w="full">
            <VStack align="start" spaceY={8} w="full">
                {/* Header Subtitle */}
                <HStack w="full" justifyContent="space-between">
                    <VStack align="start" spaceY={2}>
                        <Heading size="2xl" fontWeight="black" letterSpacing="tight">Upload Data</Heading>
                        <Text color="gray.400">Upload bulk Cypher files. The system will automatically clean comments, ingest data, and generate Gemini embeddings in the background.</Text>
                    </VStack>
                    <VStack align="end" spaceY={1}>
                        <Text fontSize="10px" fontWeight="black" color="jungle-teal">TARGET FOLDER</Text>
                        <select
                            style={{
                                background: selectBg,
                                color: selectColor,
                                fontSize: '12px',
                                fontWeight: 'bold',
                                padding: '8px 16px',
                                borderRadius: '10px',
                                border: `1px solid ${borderColor}`,
                                cursor: 'pointer'
                            }}
                            value={selectedFolder}
                            onChange={(e) => setSelectedFolder(e.target.value)}
                        >
                            {folders.map(f => (
                                <option key={f.id} value={f.slug} style={{ background: optionBg, color: selectColor }}>{f.name.toUpperCase()}</option>
                            ))}
                        </select>
                    </VStack>
                </HStack>

                <HStack w="full" align="stretch" spaceX={8}>
                    {/* Raw Text Input */}
                    <Flex flex={2} bg={cardBg} p={6} rounded="3xl" border="1px solid" borderColor={borderColor} direction="column" shadow="xl">
                        <HStack mb={4} spaceX={3}>
                            <Circle size="10" bg="jungle-teal/10" color="jungle-teal">
                                <LuFileCode size="20px" />
                            </Circle>
                            <Heading size="md" fontWeight="black">Paste Cypher Query</Heading>
                        </HStack>

                        <Textarea
                            placeholder="// Paste your CREATE or MERGE statements here..."
                            value={cypherText}
                            onChange={(e) => setCypherText(e.target.value)}
                            flex={1}
                            minH="300px"
                            bg={useColorModeValue('gray.50', 'black/5')}
                            p={4}
                            border="1px solid"
                            borderColor={borderColor}
                            rounded="2xl"
                            fontFamily="mono"
                            fontSize="sm"
                            _focus={{ borderColor: 'jungle-teal' }}
                        />

                        <HStack mt={6} justifyContent="space-between">
                            <Badge variant="subtle" colorPalette="yellow" size="sm">Auto-cleans formatting</Badge>
                            <Button
                                bg="jungle-teal"
                                color="white"
                                rounded="xl"
                                shadow="md"
                                _hover={{ bg: 'turf-green' }}
                                onClick={handleTextUpload}
                                loading={isUploading}
                                disabled={!cypherText.trim() || !selectedFolder}
                            >
                                <LuNetwork /> Ingest & Embed Data
                            </Button>
                        </HStack>
                    </Flex>

                    {/* File Upload Zone */}
                    <Flex flex={1} bg={cardBg} p={6} rounded="3xl" border="1px dashed" borderColor="jungle-teal/50" direction="column" justify="center" align="center" textAlign="center" _hover={{ bg: 'jungle-teal/5' }} cursor="pointer" onClick={() => fileInputRef.current?.click()} shadow="lg">
                        <Icon as={LuUpload} w={16} h={16} color="jungle-teal" mb={4} />
                        <Heading size="md" fontWeight="black" mb={2}>Upload .cypher File</Heading>
                        <Text fontSize="sm" color="gray.400" px={4}>
                            Select a seed file (like seed_data.cypher) to ingest entire pre-constructed knowledge graphs.
                        </Text>
                        <input
                            type="file"
                            accept=".cypher,.txt"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        <Button mt={8} variant="outline" borderColor="jungle-teal" color="jungle-teal" rounded="xl" w="full" loading={isUploading} disabled={!selectedFolder}>
                            Browse Files
                        </Button>
                    </Flex>
                </HStack>

                {/* Status Indicator */}
                {status.message && (
                    <Box w="full" p={4} rounded="xl" bg={status.type === 'success' ? 'green.500/10' : 'red.500/10'} border="1px solid" borderColor={status.type === 'success' ? 'green.500/30' : 'red.500/30'}>
                        <Text color={status.type === 'success' ? 'green.500' : 'red.500'} fontWeight="bold" fontSize="sm">
                            {status.message}
                        </Text>
                    </Box>
                )}
            </VStack>
        </Box>
    );
};
