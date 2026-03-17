import React, { useState, useEffect, useRef } from 'react';
import { VStack, HStack, Input, Text, Icon, Kbd, Flex, Circle } from '@chakra-ui/react';
import { LuSearch, LuCommand, LuLayoutDashboard, LuLibrary, LuNetwork, LuMessageSquare, LuCpu, LuUser, LuUpload, LuActivity, LuTrendingUp } from 'react-icons/lu'; // Fixed icon imports
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';

const COMMANDS = [
    { id: 'dashboard', label: 'Dashboard', icon: LuLayoutDashboard, path: '/dashboard' },
    { id: 'library', label: 'Library', icon: LuLibrary, path: '/library' },
    { id: 'upload', label: 'Upload Data', icon: LuUpload, path: '/upload' },
    { id: 'discovery', label: '3D Discovery', icon: LuNetwork, path: '/discovery' },
    { id: 'hierarchy', label: 'Hierarchy View', icon: LuNetwork, path: '/discovery/tree' },
    { id: 'chat', label: 'Nexus Chat', icon: LuMessageSquare, path: '/chat' },
    { id: 'audit', label: 'Audit Log', icon: LuActivity, path: '/dashboard/audit' },
    { id: 'analytics', label: 'Analytics Gallery', icon: LuTrendingUp, path: '/dashboard/analytics' },
    { id: 'algorithms', label: 'Algorithms', icon: LuCpu, path: '/algorithms' },
    { id: 'profile', label: 'Profile', icon: LuUser, path: '/profile' },
];

export const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const paletteRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            gsap.fromTo(containerRef.current, 
                { opacity: 0 }, 
                { opacity: 1, duration: 0.2, ease: "power2.out" }
            );
            gsap.fromTo(paletteRef.current, 
                { scale: 0.95, y: -20, opacity: 0 }, 
                { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
            );
            // Block scroll
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const filteredCommands = COMMANDS.filter(cmd => 
        cmd.label.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    const handleSelect = (path: string) => {
        navigate(path);
        setIsOpen(false);
        setSearch('');
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            if (filteredCommands[selectedIndex]) {
                handleSelect(filteredCommands[selectedIndex].path);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <Flex
            ref={containerRef}
            position="fixed"
            top={0}
            left={0}
            w="full"
            h="full"
            bg="black/40"
            backdropFilter="blur(8px)"
            zIndex={100}
            align="start"
            justify="center"
            pt="15vh"
            onClick={() => setIsOpen(false)}
        >
            <VStack
                ref={paletteRef}
                w="full"
                maxW="600px"
                bg="bg.surface"
                rounded="2xl"
                shadow="2xl"
                border="1px solid"
                borderColor="border.subtle"
                overflow="hidden"
                onClick={(e) => e.stopPropagation()}
                spaceY={0}
            >
                <HStack p={4} borderBottom="1px solid" borderColor="border.muted" w="full" gap={4}>
                    <Icon as={LuSearch} size="md" color="jungle-teal" />
                    <Input
                        variant="subtle"
                        placeholder="Search for pages, tools, or entities..."
                        fontSize="lg"
                        fontWeight="medium"
                        p={2}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={onKeyDown}
                        autoFocus
                    />
                    <HStack spaceX={1}>
                        <Kbd bg="bg.muted" color="fg.muted">ESC</Kbd>
                    </HStack>
                </HStack>

                {/* Results Area */}
                <VStack align="stretch" maxH="400px" overflowY="auto" p={2} spaceY={1}>
                    {filteredCommands.length > 0 ? (
                        <>
                            <Text px={4} py={2} fontSize="10px" fontWeight="black" color="jungle-teal" letterSpacing="widest">COMMANDS</Text>
                            {filteredCommands.map((cmd, idx) => (
                                <HStack
                                    key={cmd.id}
                                    p={3}
                                    px={4}
                                    rounded="xl"
                                    bg={idx === selectedIndex ? "brand.subtle" : "transparent"}
                                    color={idx === selectedIndex ? "jungle-teal" : "fg.muted"}
                                    _hover={{ bg: "bg.muted", color: "fg" }}
                                    cursor="pointer"
                                    onClick={() => handleSelect(cmd.path)}
                                    transition="all 0.2s"
                                    justifyContent="space-between"
                                >
                                    <HStack spaceX={4}>
                                        <Circle 
                                            size="8" 
                                            bg={idx === selectedIndex ? "jungle-teal/10" : "bg.muted"} 
                                            color={idx === selectedIndex ? "jungle-teal" : "fg.muted"}
                                        >
                                            <Icon as={cmd.icon} size="sm" />
                                        </Circle>
                                        <Text fontWeight={idx === selectedIndex ? "black" : "bold"} fontSize="sm">{cmd.label}</Text>
                                    </HStack>
                                    {idx === selectedIndex && (
                                        <HStack spaceX={1}>
                                            <Kbd bg="jungle-teal/20" color="jungle-teal" fontSize="xs">ENTER</Kbd>
                                        </HStack>
                                    )}
                                </HStack>
                            ))}
                        </>
                    ) : (
                        <Flex p={10} direction="column" align="center" justify="center" gap={4}>
                            <Icon as={LuCommand} size="xl" color="fg.muted" opacity={0.3} />
                            <Text color="fg.muted" fontSize="sm">No commands found for "{search}"</Text>
                        </Flex>
                    )}
                </VStack>

                {/* Footer */}
                <HStack p={3} px={5} bg="bg.muted" w="full" justifyContent="space-between" borderTop="1px solid" borderColor="border.subtle">
                    <HStack spaceX={4}>
                        <HStack spaceX={1}>
                            <Kbd fontSize="10px">↑</Kbd>
                            <Kbd fontSize="10px">↓</Kbd>
                            <Text fontSize="10px" fontWeight="bold" color="fg.muted">NAVIGATE</Text>
                        </HStack>
                        <HStack spaceX={1}>
                            <Kbd fontSize="10px">↵</Kbd>
                            <Text fontSize="10px" fontWeight="bold" color="fg.muted">SELECT</Text>
                        </HStack>
                    </HStack>
                    <HStack spaceX={2}>
                        <Text fontSize="10px" fontWeight="black" color="jungle-teal/60">NEURAL NEXUS</Text>
                    </HStack>
                </HStack>
            </VStack>
        </Flex>
    );
};
