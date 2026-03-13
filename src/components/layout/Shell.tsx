import { Box, Flex, VStack, HStack, Heading, Text, Icon, IconButton, Circle } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { ColorModeButton } from '@/components/ui/color-mode';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { 
    LuChevronLeft, 
    LuChevronRight, 
    LuLayoutDashboard, 
    LuSearch, 
    LuDatabase, 
    LuMessageSquare, 
    LuSettings, 
    LuLogOut, 
    LuUser,
    LuActivity
} from 'react-icons/lu';
import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import logoImg from '@/assets/nesso___nr_group_logo.jpeg';

interface SidebarItemProps {
    icon: any;
    label: string;
    to: string;
    isCollapsed: boolean;
}

const SidebarItem = ({ icon, label, to, isCollapsed }: SidebarItemProps) => {
    const activeColor = "turf-green";
    const labelRef = useRef<HTMLDivElement>(null);
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (labelRef.current) {
            gsap.to(labelRef.current, {
                opacity: isCollapsed ? 0 : 1,
                x: isCollapsed ? -10 : 0,
                display: isCollapsed ? 'none' : 'block',
                duration: 0.3,
                ease: "power2.inOut"
            });
        }
    }, [isCollapsed]);

    const handleMouseEnter = () => {
        gsap.to(itemRef.current, { x: 4, duration: 0.2, ease: "power2.out" });
    };

    const handleMouseLeave = () => {
        gsap.to(itemRef.current, { x: 0, duration: 0.2, ease: "power2.in" });
    };

    return (
        <NavLink to={to}>
            {({ isActive }) => (
                <HStack
                    ref={itemRef}
                    p={3}
                    rounded="xl"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    _hover={{ 
                        color: activeColor,
                        bg: "bg.muted"
                    }}
                    transition="background 0.3s"
                    cursor="pointer"
                    w="full"
                    gap={isCollapsed ? 0 : 3}
                    justifyContent={isCollapsed ? "center" : "flex-start"}
                    position="relative"
                    color={isActive ? activeColor : "fg.muted"}
                >
                    {isActive && (
                        <Box
                            position="absolute"
                            left="-12px"
                            w="4px"
                            h="24px"
                            bg="turf-green"
                            roundedRight="full"
                            shadow="0 0 15px var(--chakra-colors-turf-green)"
                        />
                    )}
                    <Box className="icon-wrapper">
                        <Icon as={icon} size="sm" />
                    </Box>
                    <Box ref={labelRef} flex={1} overflow="hidden">
                        <Text fontSize="sm" fontWeight={isActive ? 'black' : 'bold'} whiteSpace="nowrap">{label}</Text>
                    </Box>
                </HStack>
            )}
        </NavLink>
    );
};

export const Shell = ({ children, userEmail }: { children: React.ReactNode, userEmail: string }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (sidebarRef.current) {
            gsap.to(sidebarRef.current, {
                width: isCollapsed ? "80px" : "280px",
                duration: 0.5,
                ease: "expo.inOut"
            });
        }
    }, [isCollapsed]);

    // Entrance Animation
    useEffect(() => {
        if (contentRef.current) {
            gsap.fromTo(contentRef.current, 
                { opacity: 0, y: 20 },
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.8, 
                    ease: "power3.out", 
                    delay: 0.2,
                    clearProps: "opacity,transform"
                }
            );
        }
    }, []);

    const navItems = [
        { icon: LuLayoutDashboard, label: 'Overview', path: '/dashboard' },
        { icon: LuSearch, label: 'Discovery', path: '/discovery' },
        { icon: LuActivity, label: 'Analytics', path: '/analytics' },
        { icon: LuDatabase, label: 'Library', path: '/library' },
        { icon: LuSettings, label: 'Settings', path: '/settings' },
        { icon: LuMessageSquare, label: 'Nexus AI', path: '/chat' },
    ];

    return (
        <Box minH="100vh" bg="bg.canvas" color="fg" overflow="hidden">
            <Flex h="100vh" overflow="hidden">
                {/* Sidebar */}
                <VStack
                    ref={sidebarRef}
                    w={isCollapsed ? "80px" : "280px"}
                    h="100vh"
                    borderRight="1px solid"
                    borderColor="border.subtle"
                    p={isCollapsed ? 4 : 6}
                    align="stretch"
                    bg="bg.surface"
                    zIndex={20}
                    position="relative"
                >
                    <VStack align="stretch" spaceY={8} h="full">
                        {/* Logo */}
                        <HStack justifyContent={isCollapsed ? "center" : "space-between"}>
                            <HStack spaceX={3}>
                                <Box w="40px" h="40px" rounded="xl" overflow="hidden" shadow="2xl" border="1px solid" borderColor="border.subtle">
                                    <img src={logoImg} alt="Nesso Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </Box>
                                {!isCollapsed && (
                                    <VStack align="start" spaceY={0}>
                                        <Heading size="md" letterSpacing="tight" fontWeight="black" color="fg">NEXUS</Heading>
                                        <Text fontSize="10px" fontWeight="black" color="turf-green" letterSpacing="widest">V2 CORE</Text>
                                    </VStack>
                                )}
                            </HStack>
                        </HStack>

                        {/* Navigation */}
                        <VStack align="stretch" spaceY={1} flex={1}>
                            {navItems.map((item, index) => (
                                <SidebarItem 
                                    key={index} 
                                    icon={item.icon} 
                                    label={item.label} 
                                    to={item.path} 
                                    isCollapsed={isCollapsed} 
                                />
                            ))}
                        </VStack>

                        {/* Bottom Actions */}
                        <VStack pt={6} borderTop="1px solid" borderColor="border.muted" spaceY={4}>
                            <HStack w="full" justifyContent={isCollapsed ? "center" : "space-between"}>
                                <ColorModeButton />
                                {!isCollapsed && <SidebarItem icon={LuLogOut} label="Logout" to="/logout" isCollapsed={isCollapsed} />}
                            </HStack>
                            {!isCollapsed && (
                                <HStack p={2} bg="bg.muted" rounded="xl" w="full" spaceX={3}>
                                    <Circle size="8" bg="turf-green" shadow="premium">
                                        <LuUser color="white" size="14px" />
                                    </Circle>
                                    <VStack align="start" spaceY={0} overflow="hidden">
                                        <Text fontSize="xs" fontWeight="black" color="fg" truncate>{userEmail.split('@')[0]}</Text>
                                        <Text fontSize="9px" color="fg.muted" truncate>{userEmail}</Text>
                                    </VStack>
                                </HStack>
                            )}
                        </VStack>
                    </VStack>

                    <IconButton
                        aria-label="Toggle"
                        size="xs"
                        variant="solid"
                        bg="bg.surface"
                        color="fg"
                        border="1px solid"
                        borderColor="border.subtle"
                        position="absolute"
                        right="-14px"
                        top="48px"
                        rounded="full"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        shadow="premium"
                        _hover={{ bg: "turf-green", color: "white" }}
                        zIndex={30}
                    >
                        {isCollapsed ? <LuChevronRight /> : <LuChevronLeft />}
                    </IconButton>
                </VStack>

                {/* Main Content */}
                <Box 
                    ref={contentRef} 
                    flex={1} 
                    h="100%"
                    display="flex"
                    flexDirection="column"
                    overflow="hidden" 
                    bg="bg.canvas" 
                    position="relative"
                >
                    <CommandPalette />
                    {children}
                </Box>
            </Flex>
        </Box>
    );
};
