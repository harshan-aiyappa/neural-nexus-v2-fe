import React from 'react';
import { Box, Table, Badge, Text, HStack, Circle } from '@chakra-ui/react';

interface Props {
  data: {
    nodes: any[];
  };
  onNodeClick?: (node: any) => void;
}

export const NodeListView: React.FC<Props> = ({ data, onNodeClick }) => {
  return (
    <Box w="full" h="full" overflowY="auto" p={6} bg="bg.canvas" className="custom-scrollbar">
      <Box bg="bg.surface" rounded="3xl" border="1px solid" borderColor="border.subtle" overflow="hidden" shadow="premium">
        <Table.Root variant="outline" size="sm">
          <Table.Header bg="bg.muted">
            <Table.Row>
              <Table.ColumnHeader color="fg.muted" fontWeight="black" py={4}>ENTITY NAME</Table.ColumnHeader>
              <Table.ColumnHeader color="fg.muted" fontWeight="black">CLASSIFICATION</Table.ColumnHeader>
              <Table.ColumnHeader color="fg.muted" fontWeight="black">CONNECTIONS</Table.ColumnHeader>
              <Table.ColumnHeader color="fg.muted" fontWeight="black">ID</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.nodes.map((node) => (
              <Table.Row 
                key={node.id} 
                _hover={{ bg: "bg.muted" }} 
                cursor="pointer" 
                onClick={() => onNodeClick?.(node)}
                transition="all 0.2s"
              >
                <Table.Cell py={4}>
                  <HStack gap={3}>
                    <Circle size="2" bg="turf-green" shadow="glow" />
                    <Text fontWeight="black" color="fg">{node.name || node.id}</Text>
                  </HStack>
                </Table.Cell>
                <Table.Cell>
                  <Badge variant="subtle" colorPalette="teal" fontSize="9px" rounded="md">
                    {String(node.neo4jLabel || 'ENTITY').toUpperCase()}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                   <Text fontSize="xs" fontWeight="bold" color="fg.muted">--</Text>
                </Table.Cell>
                <Table.Cell>
                   <Text fontSize="10px" fontFamily="mono" color="fg.subtle">{node.id}</Text>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
};
