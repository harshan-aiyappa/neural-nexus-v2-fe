import { Box, Heading, Text, VStack, HStack, Circle, Flex, Input, Button } from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { useColorModeValue } from '@/components/ui/color-mode';
import gsap from 'gsap';

export const Login = ({ onLogin }: { onLogin: (email: string) => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const loginRef = useRef(null);

    useEffect(() => {
        gsap.from(loginRef.current, {
            opacity: 0,
            y: 30,
            duration: 1.2,
            ease: 'power4.out'
        });
    }, []);

    const handleLogin = () => {
        if (email && password) {
            onLogin(email);
        }
    };

    return (
        <Box minH="100vh" bg={useColorModeValue('white', 'slate.950')} display="flex" alignItems="center" justifyContent="center" position="relative" overflow="hidden">
            {/* Background Decorative Blurs */}
            <Circle size="400px" bg="jungle-teal" opacity="0.03" blur="100px" position="absolute" top="-100px" left="-100px" />
            <Circle size="400px" bg="turf-green" opacity="0.03" blur="100px" position="absolute" bottom="-100px" right="-100px" />

            <VStack
                ref={loginRef}
                spaceY={8}
                w="420px"
                p={12}
                bg={useColorModeValue('white', 'black/20')}
                backdropBlur="xl"
                rounded="4xl"
                border="1px solid"
                borderColor={useColorModeValue('slate.200', 'jungle-teal/20')}
                shadow="2xl"
                position="relative"
                zIndex={1}
            >
                <Box
                    w="70px" h="70px"
                    bgGradient="to-br" gradientFrom="jungle-teal" gradientTo="turf-green"
                    rounded="2xl"
                    display="flex" alignItems="center" justifyContent="center"
                    shadow="xl"
                    mb={4}
                >
                    <Box w="35px" h="35px" border="4px solid white" rounded="full" opacity="0.9" />
                </Box>

                <VStack spaceY={2} textAlign="center">
                    <Heading size="xl" letterSpacing="tight" fontWeight="black">Neural Nexus <Text as="span" color="turf-green">V2</Text></Heading>
                    <Text fontSize="sm" color="slate.500" fontWeight="medium">Global Scientific Intelligence Portal</Text>
                </VStack>

                <VStack w="full" spaceY={4}>
                    <VStack align="start" w="full" spaceY={1}>
                        <Text fontSize="xs" fontWeight="bold" color="slate.500" ml={1}>SCIENTIFIC IDENTITY</Text>
                        <Input
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            rounded="2xl"
                            p={6}
                            bg="black/5"
                            border="none"
                            _focus={{ bg: 'black/10', shadow: '0 0 0 2px #518E6D' }}
                        />
                    </VStack>

                    <VStack align="start" w="full" spaceY={1}>
                        <Text fontSize="xs" fontWeight="bold" color="slate.500" ml={1}>ACCESS KEY</Text>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            rounded="2xl"
                            p={6}
                            bg="black/5"
                            border="none"
                            _focus={{ bg: 'black/10', shadow: '0 0 0 2px #518E6D' }}
                        />
                    </VStack>

                    <Button
                        w="full"
                        h="56px"
                        bgGradient="to-r" gradientFrom="jungle-teal" gradientTo="turf-green"
                        color="white"
                        rounded="2xl"
                        onClick={handleLogin}
                        _hover={{ shadow: '0 10px 20px -5px rgba(81, 142, 109, 0.4)', transform: 'translateY(-2px)' }}
                        _active={{ transform: 'scale(0.98)' }}
                        transition="all 0.2s"
                        fontWeight="black"
                        fontSize="md"
                        mt={4}
                    >
                        Establish Connection
                    </Button>
                </VStack>

                <HStack w="full" justifyContent="center" spaceX={1}>
                    <Text fontSize="xs" color="slate.600">New researcher?</Text>
                    <Button variant="link" color="jungle-teal" fontSize="xs">Request Authorization</Button>
                </HStack>
            </VStack>
        </Box>
    );
};
