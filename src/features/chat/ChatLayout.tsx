import { Box, VStack, HStack, Text, Heading, IconButton, Badge, Circle, Flex } from '@chakra-ui/react';
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

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <Flex h="full" w="full" bg="bg.canvas" ref={containerRef} overflow="hidden" position="relative">
            {/* Context Sidebar */}
            <Box
                w={isSidebarOpen ? "300px" : "0px"}
                h="full"
                bg="bg.surface"
                borderRight="1px solid"
                borderColor="border.subtle"
                transition="all 0.5s cubic-bezier(0.19, 1, 0.22, 1)"
                overflow="hidden"
                zIndex={30}
                className="glass-card"
            >
                <VStack align="stretch" p={6} gap={8}>
                    <HStack justifyContent="space-between">
                        <Heading size="xs" color="fg.muted" letterSpacing="widest" fontWeight="black">KNOWLEDGE CONTEXT</Heading>
                        <IconButton size="xs" aria-label="Collapse" variant="ghost" onClick={() => setIsSidebarOpen(false)} rounded="full">
                            <LuMessageSquare size="14px" />
                        </IconButton>
                    </HStack>

                    <VStack align="stretch" gap={4}>
                        <Box p={4} bg="bg.muted/50" rounded="2xl" border="1px solid" borderColor="border.subtle">
                            <Text fontSize="10px" fontWeight="black" color="brand-emerald" mb={2}>ACTIVE CLUSTER</Text>
                            <select
                                style={{ background: 'transparent', color: 'var(--chakra-colors-fg)', fontSize: '13px', fontWeight: '900', border: 'none', outline: 'none', cursor: 'pointer', width: '100%' }}
                                value={selectedFolder}
                                onChange={(e) => setSelectedFolder(e.target.value)}
                            >
                                {folders.map(f => <option key={f.id} value={f.slug} style={{ background: 'var(--chakra-colors-bg-surface)', color: 'var(--chakra-colors-fg)' }}>{f.name.toUpperCase()}</option>)}
                            </select>
                        </Box>

                        <VStack align="start" gap={1} px={2}>
                            <Text fontSize="xs" fontWeight="bold" opacity={0.3}>No recent history in this session</Text>
                        </VStack>
                    </VStack>
                </VStack>
            </Box>

            {!isSidebarOpen && (
                <IconButton
                    position="absolute"
                    top={4}
                    left={4}
                    zIndex={40}
                    variant="ghost"
                    onClick={() => setIsSidebarOpen(true)}
                    bg="bg.surface/80"
                    backdropFilter="blur(10px)"
                    rounded="full"
                >
                    <LuMessageSquare size="18px" />
                </IconButton>
            )}

            {/* Main Chat Area */}
            <Flex flex={1} direction="column" position="relative" h="full">
                {/* Floating Header */}
                <HStack 
                    position="absolute" 
                    top={0} 
                    left={0} 
                    right={0} 
                    p={6} 
                    justifyContent="space-between" 
                    zIndex={20}
                    bgGradient="to-b"
                    gradientFrom="bg.canvas"
                    gradientTo="transparent"
                >
                    <HStack gap={3}>
                        <Circle size="10" bg="brand-emerald" shadow="glow">
                            <LuBrain color="white" size="20px" />
                        </Circle>
                        <VStack align="start" gap={0}>
                            <Heading size="md" fontWeight="black" letterSpacing="tight">Semantic Chat</Heading>
                            <HStack gap={2}>
                                <Circle size="1.5" bg="brand-emerald" className="animate-pulse" />
                                <Text fontSize="9px" fontWeight="black" color="brand-emerald" letterSpacing="widest">RAG ENGINE</Text>
                            </HStack>
                        </VStack>
                    </HStack>

                    <HStack gap={4}>
                        <HStack bg="bg.surface/60" backdropFilter="blur(10px)" p={1} rounded="xl" border="1px solid" borderColor="border.subtle">
                            <Badge variant="subtle" colorPalette="teal" size="sm" rounded="lg">STABLE</Badge>
                        </HStack>
                    </HStack>
                </HStack>

                {/* Messages Scroller */}
                <Box 
                    flex={1} 
                    overflowY="auto" 
                    px={{ base: 4, md: "15%", lg: "20%" }} 
                    pt="120px" 
                    pb="140px" 
                    ref={scrollRef}
                    className="custom-scrollbar"
                >
                    {messages.length === 0 && (
                        <VStack h="full" justifyContent="center" gap={6} opacity={0.4}>
                            < LuSparkles size="48px" className="animate-float" />
                            <VStack gap={1} textAlign="center">
                                <Text fontSize="lg" fontWeight="black" letterSpacing="tight">How can I help you synthesize knowledge today?</Text>
                                <Text fontSize="xs" fontWeight="bold">Select a research cluster in the sidebar to begin.</Text>
                            </VStack>
                        </VStack>
                    )}
                    <VStack align="stretch" gap={8} w="full">
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
                    </VStack>
                    {isLoading && (
                        <HStack gap={5} mt={8} className="animate-pulse">
                            <Circle size="40px" bg="bg.muted" border="1px solid" borderColor="border.subtle">
                                <LuSparkles size="18px" color="var(--chakra-colors-brand-emerald)" />
                            </Circle>
                            <Box p={5} bg="bg.muted/50" backdropFilter="blur(10px)" rounded="2xl" border="1px solid" borderColor="border.subtle">
                                <Text fontSize="xs" color="fg.muted" fontWeight="black">Analyzing {selectedFolder}...</Text>
                            </Box>
                        </HStack>
                    )}
                </Box>

                {/* Floating Input Area */}
                <Box 
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    p={8}
                    bgGradient="to-t"
                    gradientFrom="bg.canvas"
                    gradientTo="transparent"
                    zIndex={20}
                >
                    <Box maxW={{ base: "full", md: "800px" }} mx="auto">
                        <ChatInput
                            query={query}
                            setQuery={setQuery}
                            onSend={handleSend}
                            isLoading={isLoading}
                            placeholder={`Query ${selectedFolder.replace('_', ' ')}...`}
                        />
                    </Box>
                </Box>
            </Flex>
        </Flex>
    );
};
