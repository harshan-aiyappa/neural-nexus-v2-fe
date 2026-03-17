import { Box, Heading, Text, VStack, Button, Container, Flex, Circle } from '@chakra-ui/react';
import { LuArrowRight, LuNetwork, LuShieldCheck, LuBrain, LuSparkles } from 'react-icons/lu';
import { NavLink } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const Landing = () => {
    const heroRef = useRef(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const shapeRef1 = useRef<HTMLDivElement>(null);
    const shapeRef2 = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero entrance animation
            gsap.fromTo(".hero-content > *", 
                { y: 60, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 1.2, 
                    stagger: 0.15, 
                    ease: "power4.out", 
                    delay: 0.3,
                    clearProps: "all"
                }
            );

            // Floating shapes animation
            gsap.to(shapeRef1.current, {
                y: "-=30",
                x: "+=20",
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            gsap.to(shapeRef2.current, {
                y: "+=40",
                x: "-=15",
                duration: 5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: 0.5
            });

            // Dynamic background movement on mouse
            const handleMouseMove = (e: MouseEvent) => {
                if (!bgRef.current) return;
                const { clientX, clientY } = e;
                const moveX = (clientX - window.innerWidth / 2) / 60;
                const moveY = (clientY - window.innerHeight / 2) / 60;
                
                gsap.to(bgRef.current, {
                    x: moveX,
                    y: moveY,
                    duration: 1,
                    ease: "power2.out"
                });
            };

            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <Box 
            ref={heroRef} 
            minH="100vh" 
            bg="bg.canvas" 
            position="relative" 
            overflow="hidden" 
            display="flex" 
            alignItems="center"
        >
            {/* Premium Animated Background Layer */}
            <Box ref={bgRef} position="absolute" inset={0} pointerEvents="none" zIndex={0}>
                {/* Main ambient glows */}
                <Circle size="700px" bg="turf-green" opacity="0.08" blur="160px" position="absolute" top="-10%" left="5%" />
                <Circle size="600px" bg="jungle-teal" opacity="0.05" blur="140px" position="absolute" bottom="5%" right="10%" />
                
                {/* Floating "Bio-Shapes" (Glassmorphism blobs) */}
                <Box 
                    ref={shapeRef1}
                    position="absolute" top="20%" right="15%" 
                    w="120px" h="120px" 
                    bg="rgba(16, 123, 65, 0.15)" 
                    rounded="full" 
                    backdropFilter="blur(20px)"
                    border="1px solid rgba(81, 142, 109, 0.1)"
                    shadow="glow"
                    zIndex={1}
                />
                <Box 
                    ref={shapeRef2}
                    position="absolute" bottom="25%" left="12%" 
                    w="180px" h="180px" 
                    bg="rgba(81, 142, 109, 0.1)" 
                    rounded="full" 
                    backdropFilter="blur(30px)"
                    border="1px solid rgba(81, 142, 109, 0.1)"
                    zIndex={1}
                />
            </Box>

            <Container maxW="container.xl" position="relative" zIndex={10}>
                <VStack spaceY={10} align="center" textAlign="center" className="hero-content">
                    {/* Top Badge */}
                    <HStack spaceX={3} p={1.5} pr={4} bg="bg.muted" rounded="full" border="1px solid" borderColor="border.subtle">
                        <Circle size="8" bg="turf-green" shadow="glow">
                            <LuSparkles size="14px" color="white" />
                        </Circle>
                        <Text fontSize="10px" fontWeight="black" color="fg.muted" letterSpacing="widest">NEXUS CORE ENGINE // RELOADED</Text>
                    </HStack>

                    <Heading 
                        as="h1" 
                        fontSize={{ base: "6xl", md: "9xl" }} 
                        fontWeight="black" 
                        color="fg" 
                        lineHeight="0.85" 
                        letterSpacing="tighter"
                    >
                        THE FUTURE OF <br />
                        <Text as="span" className="premium-gradient-text" style={{ textShadow: "0 0 60px rgba(16, 123, 65, 0.15)" }}>QUANTUM RAG</Text>
                    </Heading>

                    <Text fontSize={{ base: "lg", md: "2xl" }} color="fg.muted" maxW="800px" fontWeight="medium" lineHeight="tall">
                        Discover the hidden architecture of scientific knowledge. 
                        Our high-fidelity graph engine connects nodes, patterns, and insights 
                        with sub-second precision and unparalleled visual clarity.
                    </Text>

                    <Flex gap={6} mt={10} direction={{ base: "column", md: "row" }}>
                        <NavLink to="/login">
                            <Button 
                                size="xl" 
                                bg="turf-green" 
                                color="white" 
                                h="72px"
                                px={12} 
                                rounded="2xl" 
                                fontWeight="black"
                                letterSpacing="wider"
                                shadow="premium"
                                _hover={{ 
                                    bg: "brand.turf-2", 
                                    transform: "translateY(-6px) scale(1.02)",
                                    shadow: "0 30px 60px -10px rgba(16, 123, 65, 0.4)"
                                }}
                                transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                            >
                                START EXPLORATION <LuArrowRight style={{ marginLeft: '12px' }} />
                            </Button>
                        </NavLink>
                        
                        <Button 
                            variant="outline" 
                            size="xl" 
                            h="72px"
                            borderColor="border.subtle" 
                            px={12} 
                            rounded="2xl" 
                            fontWeight="black"
                            color="fg"
                            _hover={{ 
                                bg: "bg.muted",
                                transform: "translateY(-6px)",
                                borderColor: "turf-green"
                            }}
                            transition="all 0.3s"
                        >
                            RESEARCH DOCS
                        </Button>
                    </Flex>

                    {/* Features Shelf */}
                    <Flex gap={16} mt={32} wrap="wrap" justify="center">
                        <HStack spaceX={3} p={4} rounded="2xl" bg="bg.subtle" border="1px solid" borderColor="border.subtle" _hover={{ border: "1px solid", borderColor: "turf-green/30", shadow: "lg" }} transition="all 0.3s">
                            <Circle size="10" bg="turf-green/10" color="turf-green"><LuNetwork size="18px" /></Circle>
                            <VStack align="start" spaceY={0}>
                                <Text fontWeight="black" fontSize="xs">3D GRAPH</Text>
                                <Text fontSize="9px" color="fg.muted">VISUALIZATION</Text>
                            </VStack>
                        </HStack>
                        <HStack spaceX={3} p={4} rounded="2xl" bg="bg.subtle" border="1px solid" borderColor="border.subtle" _hover={{ border: "1px solid", borderColor: "turf-green/30", shadow: "lg" }} transition="all 0.3s">
                            <Circle size="10" bg="turf-green/10" color="turf-green"><LuBrain size="18px" /></Circle>
                            <VStack align="start" spaceY={0}>
                                <Text fontWeight="black" fontSize="xs">DYNAMIC RAG</Text>
                                <Text fontSize="9px" color="fg.muted">INTELLIGENCE</Text>
                            </VStack>
                        </HStack>
                        <HStack spaceX={3} p={4} rounded="2xl" bg="bg.subtle" border="1px solid" borderColor="border.subtle" _hover={{ border: "1px solid", borderColor: "turf-green/30", shadow: "lg" }} transition="all 0.3s">
                            <Circle size="10" bg="turf-green/10" color="turf-green"><LuShieldCheck size="18px" /></Circle>
                            <VStack align="start" spaceY={0}>
                                <Text fontWeight="black" fontSize="xs">ENTERPRISE</Text>
                                <Text fontSize="9px" color="fg.muted">SECURITY</Text>
                            </VStack>
                        </HStack>
                    </Flex>
                </VStack>
            </Container>
        </Box>
    );
};

const HStack = ({ children, spaceX = 2, ...props }: any) => (
    <Flex gap={spaceX} align="center" {...props}>{children}</Flex>
);
