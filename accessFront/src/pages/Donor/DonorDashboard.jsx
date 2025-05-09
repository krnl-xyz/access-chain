import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  VStack,
  HStack,
  Badge,
  Button,
  Progress,
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';

export default function DonorDashboard() {
  const { isConnected } = useAccount();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Mock data - replace with actual data from smart contract
  const stats = {
    totalDonations: '25,000',
    activeGrants: 3,
    impactScore: 85,
    totalGrants: 5,
  };

  const recentDonations = [
    {
      id: 1,
      title: 'Educational Support Program',
      amount: '10,000',
      date: '2024-03-15',
      status: 'active',
      progress: 65,
    },
    {
      id: 2,
      title: 'Healthcare Initiative',
      amount: '15,000',
      date: '2024-03-10',
      status: 'active',
      progress: 40,
    },
  ];

  if (!isConnected) {
    return (
      <Container maxWidth={'8xl'} py={8}>
        <VStack spacing={4} align="center">
          <Heading>Donor Dashboard</Heading>
          <Text>Please connect your wallet to view your donor dashboard</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxWidth={'8xl'} py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={2}>Donor Dashboard</Heading>
          <Text color="gray.600">Track your donations and impact</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Stat
            px={4}
            py={5}
            bg={bgColor}
            shadow="base"
            rounded="lg"
            borderWidth={1}
            borderColor={borderColor}
          >
            <StatLabel>Total Donations</StatLabel>
            <StatNumber>${stats.totalDonations}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              23.36%
            </StatHelpText>
          </Stat>

          <Stat
            px={4}
            py={5}
            bg={bgColor}
            shadow="base"
            rounded="lg"
            borderWidth={1}
            borderColor={borderColor}
          >
            <StatLabel>Active Grants</StatLabel>
            <StatNumber>{stats.activeGrants}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              9.05%
            </StatHelpText>
          </Stat>

          <Stat
            px={4}
            py={5}
            bg={bgColor}
            shadow="base"
            rounded="lg"
            borderWidth={1}
            borderColor={borderColor}
          >
            <StatLabel>Impact Score</StatLabel>
            <StatNumber>{stats.impactScore}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              14.05%
            </StatHelpText>
          </Stat>

          <Stat
            px={4}
            py={5}
            bg={bgColor}
            shadow="base"
            rounded="lg"
            borderWidth={1}
            borderColor={borderColor}
          >
            <StatLabel>Total Grants</StatLabel>
            <StatNumber>{stats.totalGrants}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              9.05%
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        <Box
          bg={bgColor}
          p={6}
          rounded="lg"
          shadow="base"
          borderWidth={1}
          borderColor={borderColor}
        >
          <Heading size="md" mb={4}>Recent Donations</Heading>
          <VStack spacing={4} align="stretch">
            {recentDonations.map((donation) => (
              <Box
                key={donation.id}
                p={4}
                borderWidth={1}
                borderColor={borderColor}
                rounded="md"
              >
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">{donation.title}</Text>
                      <Text color="gray.600">Amount: ${donation.amount}</Text>
                      <Text color="gray.600">Date: {donation.date}</Text>
                    </VStack>
                    <Badge
                      colorScheme={donation.status === 'active' ? 'green' : 'yellow'}
                    >
                      {donation.status}
                    </Badge>
                  </HStack>
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" color="gray.600">Progress</Text>
                      <Text fontSize="sm" color="gray.600">{donation.progress}%</Text>
                    </HStack>
                    <Progress
                      value={donation.progress}
                      colorScheme="blue"
                      size="sm"
                      rounded="full"
                    />
                  </Box>
                  <Button size="sm" variant="outline" width="full">
                    View Details
                  </Button>
                </VStack>
              </Box>
            ))}
          </VStack>
        </Box>

        <Box
          bg={bgColor}
          p={6}
          rounded="lg"
          shadow="base"
          borderWidth={1}
          borderColor={borderColor}
        >
          <VStack align="stretch" spacing={4}>
            <Heading size="md">Impact Overview</Heading>
            <Text>
              Your donations have helped support various initiatives across different sectors.
              Here's a breakdown of your impact:
            </Text>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <Box p={4} borderWidth={1} borderColor={borderColor} rounded="md">
                <Text fontWeight="bold" mb={2}>Education</Text>
                <Text color="gray.600">500 students supported</Text>
              </Box>
              <Box p={4} borderWidth={1} borderColor={borderColor} rounded="md">
                <Text fontWeight="bold" mb={2}>Healthcare</Text>
                <Text color="gray.600">1000 patients served</Text>
              </Box>
              <Box p={4} borderWidth={1} borderColor={borderColor} rounded="md">
                <Text fontWeight="bold" mb={2}>Environment</Text>
                <Text color="gray.600">5 projects completed</Text>
              </Box>
            </SimpleGrid>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
} 