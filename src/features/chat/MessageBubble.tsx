import { Box, Text, HStack, Circle, VStack, Badge, Avatar } from '@chakra-ui/react';
import { LuSparkles } from 'react-icons/lu';

interface MessageProps {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
    confidence?: number;
    engine?: 'RAG' | 'Analytics';
}

export const MessageBubble = ({ role, content, timestamp, confidence, engine }: MessageProps) => {
    return (
        <HStack align="start" spaceX={4} alignSelf={role === 'user' ? 'flex-end' : 'flex-start'} maxW="80%">
            {role === 'assistant' && (
                <Circle size="32px" bg="jungle-teal/20" border="1px solid" borderColor="jungle-teal/40">
                    <LuSparkles size="14px" color="var(--chakra-colors-jungle-teal)" />
                </Circle>
            )}
            <VStack align={role === 'user' ? 'end' : 'start'} spaceY={2}>
                <Box
                    p={4}
                    pb={3}
                    bg={role === 'user' ? 'jungle-teal' : 'bg.muted'}
                    color={role === 'user' ? 'white' : 'fg'}
                    rounded="2xl"
                    roundedTopRight={role === 'user' ? '4px' : '2xl'}
                    roundedTopLeft={role === 'assistant' ? '4px' : '2xl'}
                    border="1px solid"
                    borderColor={role === 'user' ? 'jungle-teal' : 'border.subtle'}
                    shadow="sm"
                >
                    <Text fontSize="sm" lineHeight="tall" whiteSpace="pre-wrap" fontWeight="medium">{content}</Text>
                    <HStack justifyContent="flex-end" mt={2} opacity={0.6}>
                        {timestamp && <Text fontSize="9px" fontWeight="black" color={role === 'user' ? 'white/80' : 'fg.muted'}>{timestamp}</Text>}
                        {role === 'assistant' && confidence !== undefined && (
                            <Badge variant="solid" bg="jungle-teal" color="white" fontSize="8px" fontWeight="black">
                                {Math.round(confidence * 100)}% RELIABLE
                            </Badge>
                        )}
                        {role === 'assistant' && engine && (
                            <Badge variant="outline" borderColor="jungle-teal/30" color="jungle-teal" fontSize="8px" fontWeight="black">
                                {engine.toUpperCase()} ENGINE
                            </Badge>
                        )}
                    </HStack>
                </Box>
            </VStack>
            {role === 'user' && (
                <Avatar.Root size="xs">
                    <Avatar.Fallback name="ME" bg="jungle-teal" color="white" fontSize="10px" fontWeight="black" />
                </Avatar.Root>
            )}
        </HStack>
    );
};
