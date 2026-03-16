import { Box, HStack, Input, Button } from '@chakra-ui/react';
import { LuSend } from 'react-icons/lu';

interface ChatInputProps {
    query: string;
    setQuery: (val: string) => void;
    onSend: () => void;
    isLoading: boolean;
    placeholder?: string;
}

export const ChatInput = ({ query, setQuery, onSend, isLoading, placeholder = "Ask a question..." }: ChatInputProps) => {
    return (
        <Box 
            p={2} 
            bg="bg.surface/40" 
            backdropFilter="blur(20px)" 
            rounded="3xl" 
            border="1px solid" 
            borderColor="white/10"
            shadow="premium"
            className="chat-input-pill"
        >
            <HStack gap={2}>
                <Box flex={1} position="relative">
                    <Input
                        placeholder={placeholder}
                        h="54px"
                        rounded="2xl"
                        bg="transparent"
                        border="none"
                        p={4}
                        fontSize="md"
                        color="fg"
                        _placeholder={{ color: "fg.muted", opacity: 0.5 }}
                        _focus={{ outline: 'none', shadow: 'none' }}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && onSend()}
                        disabled={isLoading}
                    />
                </Box>
                <Button
                    bg="brand-emerald"
                    color="white"
                    h="44px"
                    w="44px"
                    rounded="xl"
                    shadow="glow"
                    _hover={{ bg: 'brand-emerald/80', transform: 'scale(1.05)' }}
                    _active={{ transform: 'scale(0.95)' }}
                    onClick={onSend}
                    loading={isLoading}
                    disabled={!query.trim()}
                >
                    <LuSend size="18px" />
                </Button>
            </HStack>
        </Box>
    );
};
