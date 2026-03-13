import { Box, Heading, Text, VStack, HStack, Flex, Circle, Badge, Icon, Button } from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { nexusApi } from '@/services/api';
import { LuActivity, LuChevronRight, LuFilter, LuDownload, LuBox, LuFileText } from 'react-icons/lu';
import gsap from 'gsap';

export const AuditLog = () => {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const data = await nexusApi.getActivity();
                setActivities(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch activity:", error);
                setLoading(false);
            }
        };
        fetchActivity();
    }, []);

    useEffect(() => {
        if (!loading && activities.length > 0) {
            const ctx = gsap.context(() => {
                gsap.from(".audit-item", {
                    opacity: 0,
                    x: -20,
                    stagger: 0.1,
                    duration: 0.6,
                    ease: "power3.out"
                });
            }, containerRef);
            return () => ctx.revert();
        }
    }, [loading, activities]);

    const borderColor = "border.subtle";
    const cardBg = "bg.surface";

    return (
        <Box p={8} maxW="1200px" mx="auto" ref={containerRef}>
            {/* Header */}
            <Flex justifyContent="space-between" align="end" mb={10}>
                <VStack align="start" spaceY={1}>
                    <HStack spaceX={3}>
                        <Circle size="10" bg="jungle-teal/10" color="jungle-teal">
                            <LuActivity size="20px" />
                        </Circle>
                        <VStack align="start" spaceY={0}>
                            <Text fontSize="10px" fontWeight="black" color="jungle-teal" letterSpacing="widest">SYSTEM INTEGRITY</Text>
                            <Heading size="xl" fontWeight="black" letterSpacing="tight">Unified Audit Log</Heading>
                        </VStack>
                    </HStack>
                    <Text color="fg.muted" fontSize="sm" maxW="600px">
                        Track every transformation, ingestion, and extraction event across your knowledge folders. 
                        Maintained by the Symmetry Guardian protocol.
                    </Text>
                </VStack>
                <HStack gap={3}>
                    <Button variant="outline" size="sm" rounded="full" gap={2}>
                        <LuFilter /> Filter
                    </Button>
                    <Button colorPalette="teal" size="sm" rounded="full" gap={2}>
                        <LuDownload /> Export CSV
                    </Button>
                </HStack>
            </Flex>

            {/* Metrics Dashboard */}
            <HStack mb={12} spaceX={6} align="stretch">
                {[
                    { label: "TOTAL EVENTS", value: activities.length, color: "jungle-teal" },
                    { label: "UNIQUE FOLDERS", value: "8", color: "turf-green" },
                    { label: "INTEGRITY RATE", value: "99.9%", color: "blue.400" },
                ].map((stat, idx) => (
                    <Box key={idx} flex={1} bg={cardBg} p={6} rounded="3xl" border="1px solid" borderColor={borderColor} shadow="sm">
                        <Text fontSize="10px" fontWeight="black" color="fg.muted" letterSpacing="widest">{stat.label}</Text>
                        <Heading size="lg" fontWeight="black" color={stat.color} mt={1}>{stat.value}</Heading>
                    </Box>
                ))}
            </HStack>

            {/* Timeline */}
            <VStack align="stretch" spaceY={0} position="relative">
                {/* Vertical Line */}
                <Box position="absolute" left="19px" top="0" bottom="0" w="2px" bg="border.subtle" opacity={0.5} zIndex={0} />

                {activities.map((activity, idx) => (
                    <HStack key={idx} className="audit-item" align="start" py={6} position="relative" zIndex={1} spaceX={6}>
                        {/* Status Circle */}
                        <Circle 
                            size="10" 
                            bg={activity.color === 'jungle-teal' ? "jungle-teal" : "turf-green"} 
                            color="white" 
                            shadow="lg"
                            border="4px solid"
                            borderColor="bg.canvas"
                        >
                            <Icon as={activity.type === 'Ingestion' ? LuBox : LuFileText} size="sm" />
                        </Circle>

                        <Box flex={1}>
                            <HStack bg={cardBg} p={5} rounded="2xl" border="1px solid" borderColor={borderColor} shadow="sm" _hover={{ shadow: "md", borderColor: "jungle-teal/30", transform: "translateY(-2px)" }} transition="all 0.3s">
                                <VStack align="start" flex={1} spaceY={1}>
                                    <HStack justifyContent="space-between" w="full">
                                        <Badge colorPalette={activity.color === 'jungle-teal' ? "teal" : "green"} variant="solid" size="xs" fontSize="9px" rounded="md">
                                            {activity.type.toUpperCase()}
                                        </Badge>
                                        <Text fontSize="xs" fontWeight="black" color="fg.muted">{activity.date}</Text>
                                    </HStack>
                                    <Heading size="sm" fontWeight="black" color="fg">{activity.title}</Heading>
                                    <Text fontSize="xs" color="fg.muted" fontWeight="bold">{activity.result}</Text>
                                </VStack>
                                <Icon as={LuChevronRight} color="fg.muted" />
                            </HStack>
                        </Box>
                    </HStack>
                ))}

                {activities.length === 0 && !loading && (
                    <Flex p={20} border="2px dashed" borderColor={borderColor} rounded="3xl" direction="column" align="center" justify="center" opacity={0.4}>
                        <LuActivity size="40px" />
                        <Text mt={4} fontWeight="black">NO RECENT SYSTEM ACTIVITY</Text>
                    </Flex>
                )}
            </VStack>
        </Box>
    );
};
