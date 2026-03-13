import { Box, HStack, Input, Button } from '@chakra-ui/react';
import { LuSend, LuShieldCheck } from 'react-icons/lu';

interface ChatInputProps {
    query: string;
    setQuery: (val: string) => void;
    onSend: () => void;
    isLoading: boolean;
    placeholder?: string;
}

export const ChatInput = ({ query, setQuery, onSend, isLoading, placeholder = "Ask a question..." }: ChatInputProps) => {
    const borderColor = "border.subtle";

    return (
        <Box p={6} borderTop="1px solid" borderColor={borderColor} bg="bg.muted">
            <HStack spaceX={4}>
                <Box flex={1} position="relative">
                    <Input
                        placeholder={placeholder}
                        h="60px"
                        rounded="2xl"
                        bg="bg.surface"
                        border="1px solid"
                        borderColor={borderColor}
                        p={6}
                        pr={14}
                        fontSize="md"
                        color="fg"
                        _placeholder={{ color: "fg.muted" }}
                        _focus={{ borderColor: 'jungle-teal', bg: 'bg.surface', shadow: '0 0 0 1px var(--chakra-colors-jungle-teal)' }}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && onSend()}
                        disabled={isLoading}
                    />
                    <Box position="absolute" right={4} top="50%" transform="translateY(-50%)" color="jungle-teal" opacity={0.5}>
                        <LuShieldCheck size="20px" />
                    </Box>
                </Box>
                <Button
                    bg="jungle-teal"
                    color="white"
                    h="60px"
                    w="60px"
                    rounded="2xl"
                    shadow="xl"
                    _hover={{ bg: 'turf-green', transform: 'translateY(-2px)' }}
                    _active={{ transform: 'scale(0.95)' }}
                    onClick={onSend}
                    loading={isLoading}
                    disabled={!query.trim()}
                >
                    <LuSend size="22px" />
                </Button>
            </HStack>
        </Box>
    );
};
