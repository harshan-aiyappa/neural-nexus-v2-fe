import { Box, Text, HStack, VStack, Badge } from '@chakra-ui/react';

interface MessageProps {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
    confidence?: number;
    engine?: 'RAG' | 'Analytics';
}

export const MessageBubble = ({ role, content, timestamp, confidence, engine }: MessageProps) => {
    return (
        <HStack align="start" gap={4} alignSelf={role === 'user' ? 'flex-end' : 'flex-start'} maxW={{ base: "90%", md: "80%" }}>
            <VStack align={role === 'user' ? 'end' : 'start'} gap={2} w="full">
                <Box
                    p={5}
                    bg={role === 'user' ? 'brand-emerald/10' : 'bg.surface/40'}
                    backdropFilter="blur(10px)"
                    color="fg"
                    rounded="2xl"
                    border="1px solid"
                    borderColor={role === 'user' ? 'brand-emerald/30' : 'white/10'}
                    shadow={role === 'user' ? "none" : "sm"}
                    position="relative"
                >
                    <Text fontSize="sm" lineHeight="relaxed" whiteSpace="pre-wrap" fontWeight="medium">
                        {content}
                    </Text>
                    
                    <HStack justifyContent="flex-end" mt={4} gap={3} opacity={0.6}>
                        {timestamp && <Text fontSize="9px" fontWeight="black" color="fg.muted">{timestamp}</Text>}
                        {role === 'assistant' && (
                            <HStack gap={2}>
                                {confidence !== undefined && (
                                    <Badge variant="subtle" colorPalette="teal" size="xs">
                                        {Math.round(confidence * 100)}% RELIABLE
                                    </Badge>
                                )}
                                {engine && (
                                    <Badge variant="outline" colorPalette="gray" size="xs">
                                        {engine}
                                    </Badge>
                                )}
                            </HStack>
                        )}
                    </HStack>
                </Box>
            </VStack>
        </HStack>
    );
};
