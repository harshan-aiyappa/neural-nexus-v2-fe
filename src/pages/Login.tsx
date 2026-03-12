import { Box, Heading, Text, VStack, HStack, Circle, Input, Button, Image } from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { useColorModeValue } from '@/components/ui/color-mode';
import logoImg from '@/assets/nesso___nr_group_logo.jpeg';
import { nexusApi } from '@/services/api';
import gsap from 'gsap';

export const Login = ({ onLogin }: { onLogin: (email: string) => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const loginRef = useRef(null);

    useEffect(() => {
        gsap.from(loginRef.current, {
            opacity: 0,
            y: 30,
            duration: 1.2,
            ease: 'power4.out'
        });
    }, [isRegister]);

    const handleAction = async () => {
        if (!email || !password || (isRegister && !fullName)) return;

        setIsLoading(true);
        try {
            if (isRegister) {
                await nexusApi.register({ email, password, full_name: fullName, role: 'RESEARCHER' });
                onLogin(email);
            } else {
                const formData = new FormData();
                formData.append('username', email); // FastAPI OAuth2 uses 'username' field
                formData.append('password', password);
                await nexusApi.login(formData);
                onLogin(email);
            }
        } catch (error: any) {
            console.error("Auth error:", error);
            alert(error.response?.data?.detail || "Authentication failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box minH="100vh" bg="bg.canvas" display="flex" alignItems="center" justifyContent="center" position="relative" overflow="hidden">
            {/* Background Decorative Blurs */}
            <Circle size="500px" bg="jungle-teal" opacity={useColorModeValue('0.1', '0.05')} blur="120px" position="absolute" top="-150px" left="-150px" />
            <Circle size="500px" bg="turf-green" opacity={useColorModeValue('0.1', '0.05')} blur="120px" position="absolute" bottom="-150px" right="-150px" />

            <VStack
                ref={loginRef}
                spaceY={8}
                w="440px"
                p={12}
                bg={useColorModeValue('white', 'bg.surface')}
                backdropBlur="30px"
                rounded="4xl"
                border="1px solid"
                borderColor="border.subtle"
                shadow={useColorModeValue('0 25px 50px -12px rgba(81, 142, 109, 0.1)', '0 25px 50px -12px rgba(0, 0, 0, 0.7)')}
                position="relative"
                zIndex={1}
            >
                <VStack spaceY={4} mb={4}>
                    <Box
                        w="80px" h="80px"
                        rounded="2xl"
                        overflow="hidden"
                        shadow="2xl"
                        bg="white"
                        p={2}
                        border="2px solid"
                        borderColor="jungle-teal/30"
                    >
                        <Image src={logoImg} alt="Nesso Logo" w="full" h="full" objectFit="contain" />
                    </Box>
                    <VStack spaceY={1} textAlign="center">
                        <Heading size="2xl" letterSpacing="tight" fontWeight="black" lineHeight="1" color={useColorModeValue('gray.900', 'white')}>Neural Nexus</Heading>
                        <Text fontSize="10px" fontWeight="black" color="jungle-teal" letterSpacing="widest">V2 // {isRegister ? 'SYSTEM REGISTRATION' : 'GLOBAL ACCESS'}</Text>
                    </VStack>
                </VStack>

                <VStack w="full" spaceY={4}>
                    {isRegister && (
                        <VStack align="start" w="full" spaceY={1}>
                            <Text fontSize="10px" fontWeight="black" color="jungle-teal" ml={1} opacity={0.8} letterSpacing="widest">SCIENTIST NAME</Text>
                            <Input
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                rounded="2xl"
                                p={6}
                                bg={useColorModeValue('gray.50', 'white/5')}
                                border="1px solid"
                                borderColor={useColorModeValue('gray.200', 'white/10')}
                            />
                        </VStack>
                    )}

                    <VStack align="start" w="full" spaceY={1}>
                        <Text fontSize="10px" fontWeight="black" color="jungle-teal" ml={1} opacity={0.8} letterSpacing="widest">SCIENTIFIC IDENTITY</Text>
                        <Input
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            rounded="2xl"
                            p={6}
                            bg={useColorModeValue('gray.50', 'white/5')}
                            border="1px solid"
                            borderColor={useColorModeValue('gray.200', 'white/10')}
                        />
                    </VStack>

                    <VStack align="start" w="full" spaceY={1}>
                        <Text fontSize="10px" fontWeight="black" color="jungle-teal" ml={1} opacity={0.8} letterSpacing="widest">ACCESS KEY</Text>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            rounded="2xl"
                            p={6}
                            bg={useColorModeValue('gray.50', 'white/5')}
                            border="1px solid"
                            borderColor={useColorModeValue('gray.200', 'white/10')}
                        />
                    </VStack>

                    <Button
                        w="full"
                        h="60px"
                        bg="jungle-teal"
                        _hover={{
                            bg: 'turf-green',
                            shadow: '0 0 40px -5px rgba(81, 142, 109, 0.6)',
                            transform: 'translateY(-2px)'
                        }}
                        color="white"
                        rounded="2xl"
                        onClick={handleAction}
                        loading={isLoading}
                        mt={4}
                    >
                        {isRegister ? 'ESTABLISH IDENTITY' : 'ESTABLISH CONNECTION'}
                    </Button>
                </VStack>

                <HStack w="full" justifyContent="center" spaceX={2}>
                    <Text fontSize="xs" color="gray.600">{isRegister ? 'Already registered?' : 'New researcher?'}</Text>
                    <Button variant="plain" color="jungle-teal" fontSize="xs" fontWeight="bold" onClick={() => setIsRegister(!isRegister)}>
                        {isRegister ? 'Access Portal' : 'Request Auth'}
                    </Button>
                </HStack>
            </VStack>
        </Box>
    );
};
