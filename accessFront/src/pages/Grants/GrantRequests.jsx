import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Select,
  Button,
  useColorModeValue,
  Badge,
  SimpleGrid,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useAccount } from 'wagmi';

export default function GrantRequests() {
  const { isConnected } = useAccount();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Mock data - replace with actual data from smart contract
  const grants = [
    {
      id: 1,
      title: 'Educational Support Program',
      description: 'Providing educational resources to underprivileged communities',
      amount: '10,000',
      category: 'education',
      status: 'active',
      submitter: '0x1234...5678',
      date: '2024-03-15',
    },
    {
      id: 2,
      title: 'Healthcare Initiative',
      description: 'Improving healthcare access in rural areas',
      amount: '15,000',
      category: 'healthcare',
      status: 'pending',
      submitter: '0x8765...4321',
      date: '2024-03-10',
    },
    {
      id: 3,
      title: 'Environmental Conservation',
      description: 'Protecting local ecosystems and promoting sustainability',
      amount: '20,000',
      category: 'environment',
      status: 'completed',
      submitter: '0x2468...1357',
      date: '2024-02-28',
    },
  ];

  const filteredGrants = grants.filter(grant => {
    const matchesSearch = grant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         grant.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || grant.category === categoryFilter;
    const matchesStatus = !statusFilter || grant.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={2}>Grant Requests</Heading>
          <Text color="gray.600">Browse and filter grant requests from NGOs</Text>
        </Box>

        <HStack spacing={4} wrap="wrap">
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search grants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          <Select
            placeholder="Category"
            maxW="200px"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="education">Education</option>
            <option value="healthcare">Healthcare</option>
            <option value="environment">Environment</option>
            <option value="social">Social Services</option>
          </Select>

          <Select
            placeholder="Status"
            maxW="200px"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </Select>

          <Button
            colorScheme="blue"
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('');
              setStatusFilter('');
            }}
          >
            Clear Filters
          </Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredGrants.map((grant) => (
            <Box
              key={grant.id}
              bg={bgColor}
              p={6}
              rounded="lg"
              shadow="base"
              borderWidth={1}
              borderColor={borderColor}
            >
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Badge
                    colorScheme={
                      grant.status === 'active'
                        ? 'green'
                        : grant.status === 'pending'
                        ? 'yellow'
                        : 'gray'
                    }
                  >
                    {grant.status}
                  </Badge>
                  <Text color="gray.600" fontSize="sm">
                    {grant.date}
                  </Text>
                </HStack>

                <Box>
                  <Heading size="md" mb={2}>
                    {grant.title}
                  </Heading>
                  <Text color="gray.600" noOfLines={2}>
                    {grant.description}
                  </Text>
                </Box>

                <HStack justify="space-between">
                  <Text fontWeight="bold">${grant.amount}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {grant.submitter}
                  </Text>
                </HStack>

                <Button
                  colorScheme="blue"
                  variant="outline"
                  size="sm"
                  width="full"
                >
                  View Details
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>

        {filteredGrants.length === 0 && (
          <Box textAlign="center" py={10}>
            <Text color="gray.500">No grants found matching your criteria</Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
} 