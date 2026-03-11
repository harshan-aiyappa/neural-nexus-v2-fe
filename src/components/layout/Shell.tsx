import { Box, Flex, VStack, HStack, Heading, Text, Icon } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { ColorModeButton, useColorModeValue } from '@/components/ui/color-mode';
import { LuLayoutDashboard, LuLibrary, LuDatabase, LuLogOut, LuTelescope } from 'react-icons/lu';
import logoImg from '@/assets/nesso___nr_group_logo.jpeg';

interface SidebarItemProps {
    icon: any;
    label: string;
    to: string;
}

const SidebarItem = ({ icon, label, to }: SidebarItemProps) => {
    const activeBg = useColorModeValue('jungle-teal/10', 'jungle-teal/20');
    const activeColor = 'jungle-teal';

    return (
        <NavLink to={to}>
            {({ isActive }) => (
                <HStack
                    p={3}
                    rounded="xl"
                    bg={isActive ? activeBg : 'transparent'}
                    color={isActive ? activeColor : 'slate.400'}
                    _hover={{ bg: activeBg, color: activeColor }}
                    transition="all 0.2s"
                    cursor="pointer"
                    w="full"
                    spaceX={3}
                >
                    <Icon as={icon} size="sm" />
                    <Text fontSize="sm" fontWeight={isActive ? 'bold' : 'medium'}>{label}</Text>
                </HStack>
            )}
        </NavLink>
    );
};

export const Shell = ({ children, userEmail }: { children: React.ReactNode, userEmail: string }) => {
    const bgCanvas = useColorModeValue('white', 'bg.canvas');
    const bgSidebar = useColorModeValue('gray.50', 'bg.surface');
    const borderColor = useColorModeValue('gray.100', 'border.subtle');
    const textColor = useColorModeValue('slate.900', 'white');

    return (
        <Box minH="100vh" bg={bgCanvas} color={textColor}>
            <Flex h="100vh" overflow="hidden">
                {/* Sidebar */}
                <VStack
                    w="280px"
                    borderRight="1px"
                    borderColor={borderColor}
                    p={6}
                    align="stretch"
                    justifyContent="space-between"
                    bg={bgSidebar}
                >
                    <VStack align="stretch" spaceY={8}>
                        <HStack spaceX={3} mb={6}>
                            <Box
                                w="45px" h="45px"
                                rounded="lg"
                                overflow="hidden"
                                shadow="lg"
                                bg="white"
                            >
                                <img src={logoImg} alt="Nesso Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </Box>
                            <VStack align="start" spaceY={0}>
                                <Heading size="md" letterSpacing="tight" lineHeight="1">Neural Nexus</Heading>
                                <Text fontSize="10px" fontWeight="black" color="turf-green" letterSpacing="widest">V2 // NESSO PLATFORM</Text>
                            </VStack>
                        </HStack>

                        <VStack align="stretch" spaceY={1}>
                            <SidebarItem icon={LuLayoutDashboard} label="Dashboard" to="/" />
                            <SidebarItem icon={LuLibrary} label="Knowledge Library" to="/library" />
                            <SidebarItem icon={LuTelescope} label="Graph Discovery" to="/discovery" />
                            <SidebarItem icon={LuDatabase} label="System Health" to="/health" />
                        </VStack>
                    </VStack>

                    <VStack align="stretch" spaceY={4}>
                        <HStack justifyContent="space-between" p={2} borderTop="1px solid" borderColor={borderColor} pt={6}>
                            <VStack align="start" spaceY={0}>
                                <Text fontSize="10px" fontWeight="black" color="jungle-teal" letterSpacing="widest">RESEARCHER</Text>
                                <Text fontSize="xs" fontWeight="bold" color="slate.500" truncate maxW="150px">{userEmail}</Text>
                            </VStack>
                            <HStack spaceX={2}>
                                <ColorModeButton />
                                <SidebarItem icon={LuLogOut} label="" to="/logout" />
                            </HStack>
                        </HStack>
                    </VStack>
                </VStack>

                {/* Main Content Area */}
                <Box flex={1} overflowY="auto" position="relative">
                    {children}
                </Box>
            </Flex>
        </Box>
    );
};
