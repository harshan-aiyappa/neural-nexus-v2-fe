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
                    bg={role === 'user' ? 'jungle-teal' : 'white/5'}
                    color={role === 'user' ? 'white' : 'inherit'}
                    rounded="2xl"
                    roundedTopRight={role === 'user' ? '4px' : '2xl'}
                    roundedTopLeft={role === 'assistant' ? '4px' : '2xl'}
                    border="1px solid"
                    borderColor={role === 'user' ? 'jungle-teal' : 'white/10'}
                >
                    <Text fontSize="sm" lineHeight="tall" whiteSpace="pre-wrap">{content}</Text>
                    <HStack justifyContent="flex-end" mt={2} opacity={0.6}>
                        {timestamp && <Text fontSize="9px" fontWeight="bold">{timestamp}</Text>}
                        {role === 'assistant' && confidence !== undefined && (
                            <Badge variant="subtle" colorPalette="green" fontSize="8px">
                                {Math.round(confidence * 100)}% RELIABLE
                            </Badge>
                        )}
                        {role === 'assistant' && engine && (
                            <Badge variant="outline" colorPalette="blue" fontSize="8px">
                                {engine} ENGINE
                            </Badge>
                        )}
                    </HStack>
                </Box>
            </VStack>
            {role === 'user' && (
                <Avatar.Root size="xs">
                    <Avatar.Fallback name="ME" bg="gray.700" color="white" fontSize="10px" />
                </Avatar.Root>
            )}
        </HStack>
    );
};
