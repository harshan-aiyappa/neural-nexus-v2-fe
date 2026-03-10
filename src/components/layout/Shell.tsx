import { Box, Flex, VStack, HStack, Heading, Text, Circle, Icon } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { ColorModeButton, useColorModeValue } from '@/components/ui/color-mode';
import { LuLayoutDashboard, LuLibrary, LuDatabase, LuLogOut, LuTelescope } from 'react-icons/lu';

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
                    <Icon as={icon} size="18px" />
                    <Text fontSize="sm" fontWeight={isActive ? 'bold' : 'medium'}>{label}</Text>
                </HStack>
            )}
        </NavLink>
    );
};

export const Shell = ({ children }: { children: React.ReactNode }) => {
    return (
        <Box minH="100vh" bg={useColorModeValue('white', 'slate.950')} color={useColorModeValue('slate.900', 'white')}>
            <Flex h="100vh" overflow="hidden">
                {/* Sidebar */}
                <VStack
                    w="280px"
                    borderRight="1px"
                    borderColor="jungle-teal/10"
                    p={6}
                    align="stretch"
                    justifyContent="space-between"
                    bg="black/5"
                >
                    <VStack align="stretch" spaceY={8}>
                        <HStack spaceX={3} mb={6}>
                            <Box
                                w="40px" h="40px"
                                bgGradient="to-br" gradientFrom="jungle-teal" gradientTo="turf-green"
                                rounded="lg"
                                display="flex" alignItems="center" justifyContent="center"
                                shadow="lg"
                            >
                                <Box w="20px" h="20px" border="2px solid white" rounded="full" opacity="0.8" />
                            </Box>
                            <Heading size="md" letterSpacing="tight">Neural Nexus <Text as="span" color="turf-green">V2</Text></Heading>
                        </HStack>

                        <VStack align="stretch" spaceY={1}>
                            <SidebarItem icon={LuLayoutDashboard} label="Dashboard" to="/" />
                            <SidebarItem icon={LuLibrary} label="Knowledge Library" to="/library" />
                            <SidebarItem icon={LuTelescope} label="Graph Discovery" to="/discovery" />
                            <SidebarItem icon={LuDatabase} label="System Health" to="/health" />
                        </VStack>
                    </VStack>

                    <VStack align="stretch" spaceY={4}>
                        <HStack justifyContent="space-between" p={2}>
                            <ColorModeButton />
                            <SidebarItem icon={LuLogOut} label="Logout" to="/logout" />
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
