import { 
    DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogBackdrop,
    Button, VStack, Input, Field, Text, HStack, Badge, Box
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { nexusApi } from '@/services/api';
import { LuSettings, LuShieldCheck, LuLoaderCircle } from 'react-icons/lu';

export const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            nexusApi.getSystemStatus().then(setStatus);
        }
    }, [isOpen]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await nexusApi.updateApiKey('GEMINI_API_KEY', apiKey);
            const newStatus = await nexusApi.getSystemStatus();
            setStatus(newStatus);
            setApiKey('');
            alert('API Key updated successfully. The engine is now re-initializing.');
        } catch (error) {
            console.error(error);
            alert('Failed to update key. Ensure you have administrator privileges.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogRoot open={isOpen} onOpenChange={onClose}>
            <DialogBackdrop />
            <DialogContent rounded="3xl" bg="bg.surface" border="1px solid" borderColor="border.subtle" p={4}>
                <DialogHeader>
                    <HStack spaceX={3}>
                        <LuSettings size="20px" color="jungle-teal" />
                        <DialogTitle fontSize="xl" fontWeight="black" color="fg">Core Engine Resilience</DialogTitle>
                    </HStack>
                </DialogHeader>

                <DialogBody pb={6}>
                    <VStack align="stretch" spaceY={6}>
                        {/* System Status */}
                        <Box p={4} bg="jungle-teal/5" rounded="2xl" border="1px solid" borderColor="jungle-teal/20">
                            <Text fontSize="10px" fontWeight="black" color="jungle-teal" letterSpacing="widest" mb={3}>SYSTEM INTEGRITY</Text>
                            <HStack justifyContent="space-between">
                                <HStack>
                                    <Text fontSize="sm" fontWeight="bold">Gemini AI</Text>
                                    <Badge colorPalette={status?.gemini === 'ACTIVE' ? 'green' : 'red'} variant="subtle">
                                        {status?.gemini || 'LOADING...'}
                                    </Badge>
                                </HStack>
                                <HStack>
                                    <Text fontSize="sm" fontWeight="bold">Neo4j</Text>
                                    <Badge colorPalette="green" variant="subtle">STABLE</Badge>
                                </HStack>
                            </HStack>
                        </Box>

                        {/* API Key Input */}
                        <Field.Root>
                            <Field.Label fontSize="xs" fontWeight="bold" color="fg.muted">GEMINI API KEY (ROTATE)</Field.Label>
                            <Input 
                                type="password" 
                                placeholder="Paste new AIzaSy... key here" 
                                value={apiKey} 
                                onChange={(e) => setApiKey(e.target.value)}
                                rounded="xl"
                                bg="bg.muted"
                                border="none"
                                _focus={{ ring: 2, ringColor: "jungle-teal" }}
                            />
                            <Field.HelperText fontSize="10px">
                                <HStack color="fg.muted" mt={1}>
                                    <LuShieldCheck />
                                    <Text>Keys are persisted locally to .env and environment memory.</Text>
                                </HStack>
                            </Field.HelperText>
                        </Field.Root>

                        {status?.gemini === 'MISSING' && (
                            <HStack p={3} bg="red.500/10" color="red.500" rounded="xl" fontSize="xs" fontWeight="bold">
                                <LuLoaderCircle />
                                <Text>Extraction services are currently offline due to expired credentials.</Text>
                            </HStack>
                        )}
                    </VStack>
                </DialogBody>

                <DialogFooter>
                    <Button variant="ghost" rounded="xl" fontWeight="bold" onClick={onClose}>Cancel</Button>
                    <Button 
                        bg="jungle-teal" 
                        color="white" 
                        rounded="xl" 
                        fontWeight="black" 
                        onClick={handleSave}
                        loading={loading}
                        disabled={!apiKey}
                        _hover={{ bg: 'turf-green' }}
                    >
                        Save Configuration
                    </Button>
                </DialogFooter>
            </DialogContent>
        </DialogRoot>
    );
};
