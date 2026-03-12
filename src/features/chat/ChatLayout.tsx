import { Box, Heading, Text, VStack, HStack, Circle, Flex, Icon, Avatar } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';
import { useState, useRef, useEffect } from 'react';
import { LuMessageSquare, LuBrain, LuSparkles } from 'react-icons/lu';
import { nexusApi } from '@/services/api';
import gsap from 'gsap';
import { ChatInput } from './ChatInput';
import { MessageBubble } from './MessageBubble';

export const ChatLayout = () => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [folders, setFolders] = useState<any[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string>('');

    const scrollRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef(null);

    const bgCard = useColorModeValue('white', 'black/20');
    const borderColor = useColorModeValue('gray.200', 'white/10');
    const selectColor = useColorModeValue('gray.700', 'gray');
    const optionBg = useColorModeValue('white', '#1a1a1a');

    useEffect(() => {
        const init = async () => {
            const data = await nexusApi.getFolders();
            setFolders(data);
            if (data.length > 0) setSelectedFolder(data[0].slug);
        };
        init();
        gsap.from(containerRef.current, { opacity: 0, scale: 0.98, duration: 0.8, ease: 'back.out(1.7)' });
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!query.trim()) return;

        const userMsg = { role: 'user', content: query, timestamp: new Date().toLocaleTimeString() };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setIsLoading(true);

        try {
            const data = await nexusApi.chat(query, selectedFolder);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.reply,
                confidence: data.grounding_score,
                engine: data.engine,
                timestamp: new Date().toLocaleTimeString()
            }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I encountered an error accessing the knowledge graph.",
                timestamp: new Date().toLocaleTimeString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Flex h="full" bg="bg.canvas" p={6} ref={containerRef} direction="column" spaceY={6}>
            <HStack justifyContent="space-between">
                <VStack align="start" spaceY={1}>
                    <HStack spaceX={3}>
                        <Box p={2} bg="jungle-teal" rounded="lg">
                            <LuMessageSquare color="white" size="20px" />
                        </Box>
                        <Heading size="lg" fontWeight="black" letterSpacing="tight">Chat Services</Heading>
                    </HStack>
                    <Text fontSize="11px" color="gray.500" fontWeight="bold" letterSpacing="widest">SEMANTIC ISOLATION PIPELINE ACTIVE</Text>
                </VStack>

                <HStack spaceX={4}>
                    <VStack align="end" spaceY={0}>
                        <Text fontSize="10px" fontWeight="black" color="jungle-teal">CONTEXT FOLDER</Text>
                        <select
                            style={{ background: 'transparent', color: selectColor, fontSize: '13px', fontWeight: 'bold', border: 'none', outline: 'none', cursor: 'pointer', textAlign: 'right' }}
                            value={selectedFolder}
                            onChange={(e) => setSelectedFolder(e.target.value)}
                        >
                            {folders.map(f => <option key={f.id} value={f.slug} style={{ background: optionBg, color: selectColor }}>{f.name.toUpperCase()}</option>)}
                        </select>
                    </VStack>
                    <Avatar.Root size="sm">
                        <Avatar.Fallback name="AI" bg="jungle-teal" color="white" />
                    </Avatar.Root>
                </HStack>
            </HStack>

            <Flex flex={1} bg={bgCard} rounded="3xl" border="1px solid" borderColor={borderColor} direction="column" overflow="hidden" shadow="2xl" backdropBlur="xl">
                {/* Chat History */}
                <Box flex={1} overflowY="auto" p={8} spaceY={6} ref={scrollRef}>
                    {messages.length === 0 && (
                        <VStack h="full" justifyContent="center" spaceY={4} opacity={0.5}>
                            <Icon as={LuBrain} w={12} h={12} color="jungle-teal" />
                            <Text fontSize="sm" fontWeight="medium">Select a folder and ask a question to start the discovery.</Text>
                        </VStack>
                    )}
                    {messages.map((m, i) => (
                        <MessageBubble
                            key={i}
                            role={m.role}
                            content={m.content}
                            confidence={m.confidence}
                            engine={m.engine}
                            timestamp={m.timestamp}
                        />
                    ))}
                    {isLoading && (
                        <HStack spaceX={4}>
                            <Circle size="32px" bg="white/5" className="animate-pulse">
                                <LuSparkles size="14px" color="gray" />
                            </Circle>
                            <Box p={4} bg="white/5" rounded="2xl" roundedTopLeft="4px" border="1px solid" borderColor="white/10">
                                <Text fontSize="xs" color="gray.500" fontStyle="italic">Analyzing graph context for {selectedFolder}...</Text>
                            </Box>
                        </HStack>
                    )}
                </Box>

                {/* Input Area */}
                <ChatInput
                    query={query}
                    setQuery={setQuery}
                    onSend={handleSend}
                    isLoading={isLoading}
                    placeholder={`Ask about ${selectedFolder || 'the graph'}...`}
                />
            </Flex>
        </Flex>
    );
};
