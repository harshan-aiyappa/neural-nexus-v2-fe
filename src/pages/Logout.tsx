import { Box, Heading, Text, VStack, Circle, Spinner } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

export const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Exit animation and redirect
        const tl = gsap.timeline({
            onComplete: () => {
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        });

        tl.from(".logout-msg", {
            opacity: 0,
            y: 20,
            duration: 1,
            ease: "power3.out"
        }).to(".progress-bar", {
            width: "100%",
            duration: 2,
            ease: "linear"
        });

        return () => { tl.kill(); };
    }, [navigate]);

    return (
        <Box minH="100vh" bg="bg.canvas" display="flex" alignItems="center" justifyContent="center" position="relative" overflow="hidden">
            <Circle size="400px" bg="red.500" opacity="0.05" blur="100px" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" />
            
            <VStack spaceY={8} className="logout-msg" textAlign="center">
                <Spinner size="xl" color="jungle-teal" />
                
                <VStack spaceY={2}>
                    <Heading size="2xl" fontWeight="black" color="fg" letterSpacing="tight">Connection Terminated</Heading>
                    <Text color="fg.muted" fontWeight="bold" letterSpacing="widest">SESSION ENDED SUCCESSFULLY</Text>
                </VStack>

                <Box w="300px" h="4px" bg="bg.muted" rounded="full" overflow="hidden" position="relative">
                    <Box className="progress-bar" w="0%" h="full" bg="jungle-teal" rounded="full" />
                </Box>
                
                <Text fontSize="xs" fontWeight="black" color="jungle-teal" opacity={0.6}>REDIRECTING TO SECURE ACCESS PORTAL...</Text>
            </VStack>
        </Box>
    );
};
