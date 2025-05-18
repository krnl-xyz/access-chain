import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaLock } from 'react-icons/fa';

const StakingPage = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      p={8}
      maxW="container.md"
      mx="auto"
      bg={bgColor}
      borderRadius="lg"
      boxShadow="lg"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <VStack spacing={6} align="center">
        <Icon as={FaLock} w={12} h={12} color="blue.500" />
        <Heading size="xl">Token Staking Coming Soon</Heading>
        <Text fontSize="lg" textAlign="center" color="gray.600">
          We're currently working on implementing token staking functionality.
          This feature will allow you to stake your tokens and earn rewards.
          Please check back later for updates.
        </Text>
        <Text fontSize="md" textAlign="center" color="gray.500">
          Expected launch: Q2 2024
        </Text>
      </VStack>
    </Box>
  );
};

export default StakingPage; 