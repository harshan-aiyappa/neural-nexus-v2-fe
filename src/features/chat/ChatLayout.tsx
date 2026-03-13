import { Box, Heading, Text, VStack, HStack, Circle, Flex, Icon, Avatar } from '@chakra-ui/react';
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

    useEffect(() => {
        const init = async () => {
            const data = await nexusApi.getFolders();
            setFolders(data);
            if (data.length > 0) setSelectedFolder(data[0].slug);
        };
        init();

        const ctx = gsap.context(() => {
            gsap.from(".chat-header", { 
                y: -20,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out' 
            });
            gsap.from(".chat-container", {
                scale: 0.98,
                opacity: 0,
                duration: 1,
                delay: 0.2,
                ease: "expo.out"
            });
        });
        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
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
        <Flex h="full" bg="bg.canvas" p={8} ref={containerRef} direction="column" spaceY={8} overflowX="hidden" position="relative">
            <HStack justifyContent="space-between" w="full" className="chat-header">
                <VStack align="start" spaceY={1}>
                    <HStack spaceX={4}>
                        <Circle size="12" bg="brand-emerald" shadow="glow">
                            <LuMessageSquare color="white" size="22px" />
                        </Circle>
                        <Heading size="3xl" fontWeight="black" letterSpacing="tighter" color="fg">Semantic Chat</Heading>
                    </HStack>
                    <Text fontSize="10px" color="brand-emerald" fontWeight="black" letterSpacing="widest" ml={16}>RAG PIPELINE // ACTIVE</Text>
                </VStack>

                <HStack spaceX={6} p={2} bg="bg.surface" rounded="2xl" border="1px solid" borderColor="border.subtle" shadow=" premium">
                    <VStack align="end" spaceY={0} px={2}>
                        <Text fontSize="9px" fontWeight="black" color="brand-emerald" letterSpacing="widest">CONTEXT</Text>
                        <select
                            style={{ background: 'transparent', color: 'var(--chakra-colors-fg)', fontSize: '13px', fontWeight: '900', border: 'none', outline: 'none', cursor: 'pointer', textAlign: 'right' }}
                            value={selectedFolder}
                            onChange={(e) => setSelectedFolder(e.target.value)}
                        >
                            {folders.map(f => <option key={f.id} value={f.slug} style={{ background: 'var(--chakra-colors-bg-surface)', color: 'var(--chakra-colors-fg)' }}>{f.name.toUpperCase()}</option>)}
                        </select>
                    </VStack>
                    <Avatar.Root size="md" border="2px solid" borderColor="brand-emerald/20">
                        <Avatar.Fallback name="AI" bg="brand-emerald" color="white" />
                    </Avatar.Root>
                </HStack>
            </HStack>

            <Flex flex={1} bg="bg.surface" rounded="3xl" border="1px solid" borderColor="border.subtle" direction="column" overflow="hidden" shadow=" premium" className="chat-container">
                {/* Chat History */}
                <Box flex={1} overflowY="auto" p={10} spaceY={8} ref={scrollRef}>
                    {messages.length === 0 && (
                        <VStack h="full" justifyContent="center" spaceY={6}>
                            <Icon as={LuBrain} w={16} h={16} color="brand-emerald" opacity={0.15} className="animate-float" />
                            <Text fontSize="sm" fontWeight="black" color="fg.muted" letterSpacing="wider">SELECT A FOLDER TO BEGIN KNOWLEDGE SYNTHESIS.</Text>
                        </VStack>
                    )}
                    {messages.map((m, i) => (
                        <Box key={i} className="message-reveal">
                            <MessageBubble
                                role={m.role}
                                content={m.content}
                                confidence={m.confidence}
                                engine={m.engine}
                                timestamp={m.timestamp}
                            />
                        </Box>
                    ))}
                    {isLoading && (
                        <HStack spaceX={5} animate-pulse>
                            <Circle size="40px" bg="bg.muted" border="1px solid" borderColor="border.subtle" className="animate-spin-slow">
                                <LuSparkles size="18px" color="var(--chakra-colors-brand-emerald)" />
                            </Circle>
                            <Box p={5} bg="bg.muted" rounded="2xl" roundedTopLeft="2px" border="1px solid" borderColor="border.subtle" shadow="sm">
                                <Text fontSize="xs" color="fg.muted" fontWeight="black" fontStyle="italic" letterSpacing="wide">Synthesizing {selectedFolder} knowledge graph...</Text>
                            </Box>
                        </HStack>
                    )}
                </Box>

                {/* Input Area */}
                <Box borderTop="1px solid" borderColor="border.muted" p={2}>
                    <ChatInput
                        query={query}
                        setQuery={setQuery}
                        onSend={handleSend}
                        isLoading={isLoading}
                        placeholder={`Query ${selectedFolder.replace('_', ' ')} cluster...`}
                    />
                </Box>
            </Flex>
        </Flex>
    );
};
