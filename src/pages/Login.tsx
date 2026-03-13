import { Box, Heading, Text, VStack, HStack, Circle, Input, Button, Image } from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import logoImg from '@/assets/nesso___nr_group_logo.jpeg';
import { nexusApi } from '@/services/api';
import gsap from 'gsap';

// Premium Auth Portal for Neural Nexus v2
export const Login = ({ onLogin }: { onLogin: (email: string) => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const loginRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Card entrance
            gsap.from(loginRef.current, {
                opacity: 0,
                y: 30,
                scale: 0.95,
                duration: 1.2,
                clearProps: "all",
                ease: 'expo.out'
            });

            // Ambient background animation
            gsap.to(".ambient-circle-1", {
                x: "15%",
                y: "10%",
                duration: 8,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
            gsap.to(".ambient-circle-2", {
                x: "-10%",
                y: "-15%",
                duration: 10,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
        return () => ctx.revert();
    }, [isRegister]);

    const handleAction = async () => {
        if (!email || !password || (isRegister && !fullName)) return;

        setIsLoading(true);
        try {
            if (isRegister) {
                await nexusApi.register(email, password, fullName);
                onLogin(email);
            } else {
                await nexusApi.login(email, password);
                onLogin(email);
            }
        } catch (error: any) {
            console.error("Auth error:", error);
            alert(error.response?.data?.detail || "Authentication failed");
        } finally {
            setIsLoading(false);
        }
    };

    const inputBg = "bg.muted";
    const borderColor = "border.subtle";

    return (
        <Box minH="100vh" bg="bg.canvas" display="flex" alignItems="center" justifyContent="center" position="relative" overflow="hidden">
            {/* Background Decorative Blurs - Animated */}
            <Box position="absolute" inset={0} pointerEvents="none" zIndex={0}>
                <Circle className="ambient-circle-1" size="600px" bg="jungle-teal" opacity="0.12" blur="150px" position="absolute" top="-10%" left="10%" />
                <Circle className="ambient-circle-2" size="500px" bg="turf-green" opacity="0.1" blur="130px" position="absolute" bottom="-5%" right="5%" />
            </Box>

            <VStack
                ref={loginRef}
                gap={8}
                w="440px"
                p={12}
                bg="bg.surface"
                backdropFilter="blur(20px) saturate(180%)"
                rounded="4xl"
                border="1px solid"
                borderColor={borderColor}
                shadow="0 40px 100px -20px rgba(0, 0, 0, 0.5)"
                position="relative"
                zIndex={1}
            >
                <VStack gap={4} mb={4}>
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
                    <VStack gap={1} textAlign="center">
                        <Heading size="2xl" letterSpacing="tight" fontWeight="black" lineHeight="1" color="fg">Neural Nexus</Heading>
                        <Text fontSize="10px" fontWeight="black" color="jungle-teal" letterSpacing="widest">V2 // {isRegister ? 'SYSTEM REGISTRATION' : 'GLOBAL ACCESS'}</Text>
                    </VStack>
                </VStack>

                <VStack w="full" gap={4}>
                    {isRegister && (
                        <VStack align="start" w="full" gap={1}>
                            <Text fontSize="10px" fontWeight="black" color="jungle-teal" ml={1} letterSpacing="widest">SCIENTIST NAME</Text>
                            <Input
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                rounded="2xl"
                                p={6}
                                bg={inputBg}
                                border="1px solid"
                                borderColor={borderColor}
                                color="fg"
                                _placeholder={{ color: "fg.muted" }}
                            />
                        </VStack>
                    )}

                    <VStack align="start" w="full" gap={1}>
                        <Text fontSize="10px" fontWeight="black" color="jungle-teal" ml={1} letterSpacing="widest">SCIENTIFIC IDENTITY</Text>
                        <Input
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            rounded="2xl"
                            p={6}
                            bg={inputBg}
                            border="1px solid"
                            borderColor={borderColor}
                            color="fg"
                            _placeholder={{ color: "fg.muted" }}
                        />
                    </VStack>

                    <VStack align="start" w="full" gap={1}>
                        <Text fontSize="10px" fontWeight="black" color="jungle-teal" ml={1} letterSpacing="widest">ACCESS KEY</Text>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            rounded="2xl"
                            p={6}
                            bg={inputBg}
                            border="1px solid"
                            borderColor={borderColor}
                            color="fg"
                            _placeholder={{ color: "fg.muted" }}
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
                        fontWeight="black"
                        letterSpacing="widest"
                        rounded="2xl"
                        onClick={handleAction}
                        loading={isLoading}
                        mt={4}
                    >
                        {isRegister ? 'ESTABLISH IDENTITY' : 'ESTABLISH CONNECTION'}
                    </Button>
                </VStack>

                <HStack w="full" justifyContent="center" gap={2}>
                    <Text fontSize="xs" color="fg.muted">{isRegister ? 'Already registered?' : 'New researcher?'}</Text>
                    <Button variant="plain" color="jungle-teal" fontSize="xs" fontWeight="bold" onClick={() => setIsRegister(!isRegister)}>
                        {isRegister ? 'Access Portal' : 'Request Auth'}
                    </Button>
                </HStack>
            </VStack>
        </Box>
    );
};
