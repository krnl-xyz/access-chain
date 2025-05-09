import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  useToast,
  useColorModeValue,
  Divider,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Avatar,
  AvatarGroup,
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';

export default function GrantDetails() {
  const { id } = useParams();
  const { isConnected } = useAccount();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Mock data - replace with actual data from smart contract
  const grant = {
    id: id,
    title: 'Educational Support Program',
    description: 'Providing educational resources to underprivileged communities',
    amount: '10,000',
    raised: '6,500',
    category: 'education',
    status: 'active',
    submitter: {
      address: '0x1234...5678',
      name: 'Education Foundation',
      avatar: 'https://bit.ly/ryan-florence',
    },
    date: '2024-03-15',
    duration: '12 months',
    beneficiaries: '500',
    impact: 'Improving access to quality education for underprivileged children',
    milestones: [
      {
        title: 'Initial Setup',
        description: 'Establish learning centers',
        status: 'completed',
        date: '2024-04-15',
      },
      {
        title: 'Resource Distribution',
        description: 'Distribute educational materials',
        status: 'in-progress',
        date: '2024-05-15',
      },
      {
        title: 'Teacher Training',
        description: 'Train local teachers',
        status: 'pending',
        date: '2024-06-15',
      },
    ],
    donors: [
      { address: '0x1111...2222', amount: '2,000' },
      { address: '0x3333...4444', amount: '1,500' },
      { address: '0x5555...6666', amount: '3,000' },
    ],
  };

  const handleDonate = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to donate',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement donation with smart contract
      toast({
        title: 'Donation successful',
        description: 'Thank you for your contribution!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Donation failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in-progress':
        return 'blue';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <HStack justify="space-between" align="start">
            <Box>
              <Heading size="xl">{grant.title}</Heading>
              <Text mt={2} color="gray.600">
                Submitted by {grant.submitter.name}
              </Text>
            </Box>
            <Badge
              colorScheme={grant.status === 'active' ? 'green' : 'yellow'}
              fontSize="md"
              px={3}
              py={1}
            >
              {grant.status}
            </Badge>
          </HStack>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box
            bg={bgColor}
            p={6}
            rounded="lg"
            shadow="base"
            borderWidth={1}
            borderColor={borderColor}
          >
            <VStack align="stretch" spacing={6}>
              <Box>
                <Heading size="md" mb={4}>
                  Project Details
                </Heading>
                <Text>{grant.description}</Text>
              </Box>

              <Box>
                <Heading size="md" mb={4}>
                  Impact
                </Heading>
                <Text>{grant.impact}</Text>
              </Box>

              <Box>
                <Heading size="md" mb={4}>
                  Project Timeline
                </Heading>
                <VStack align="stretch" spacing={4}>
                  {grant.milestones.map((milestone, index) => (
                    <Box
                      key={index}
                      p={4}
                      borderWidth={1}
                      borderColor={borderColor}
                      rounded="md"
                    >
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="bold">{milestone.title}</Text>
                        <Badge colorScheme={getStatusColor(milestone.status)}>
                          {milestone.status}
                        </Badge>
                      </HStack>
                      <Text color="gray.600">{milestone.description}</Text>
                      <Text fontSize="sm" color="gray.500" mt={2}>
                        Due: {milestone.date}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </Box>

          <VStack spacing={6} align="stretch">
            <Box
              bg={bgColor}
              p={6}
              rounded="lg"
              shadow="base"
              borderWidth={1}
              borderColor={borderColor}
            >
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Funding Progress</Heading>
                <Stat>
                  <StatLabel>Amount Raised</StatLabel>
                  <StatNumber>${grant.raised}</StatNumber>
                  <StatHelpText>of ${grant.amount} goal</StatHelpText>
                </Stat>
                <Progress
                  value={(parseFloat(grant.raised.replace(/,/g, '')) / parseFloat(grant.amount.replace(/,/g, ''))) * 100}
                  colorScheme="blue"
                  size="lg"
                  rounded="full"
                />
                <Button
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  onClick={handleDonate}
                >
                  Donate Now
                </Button>
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
                <Heading size="md">Project Information</Heading>
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text color="gray.600">Category</Text>
                    <Text fontWeight="bold">{grant.category}</Text>
                  </Box>
                  <Box>
                    <Text color="gray.600">Duration</Text>
                    <Text fontWeight="bold">{grant.duration}</Text>
                  </Box>
                  <Box>
                    <Text color="gray.600">Beneficiaries</Text>
                    <Text fontWeight="bold">{grant.beneficiaries}</Text>
                  </Box>
                  <Box>
                    <Text color="gray.600">Start Date</Text>
                    <Text fontWeight="bold">{grant.date}</Text>
                  </Box>
                </SimpleGrid>
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
                <Heading size="md">Recent Donors</Heading>
                <VStack align="stretch" spacing={3}>
                  {grant.donors.map((donor, index) => (
                    <HStack key={index} justify="space-between">
                      <Text>{donor.address}</Text>
                      <Text fontWeight="bold">${donor.amount}</Text>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </SimpleGrid>
      </VStack>
    </Container>
  );
} 