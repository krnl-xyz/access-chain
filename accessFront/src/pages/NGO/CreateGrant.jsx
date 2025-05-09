import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  Heading,
  Text,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { useGrantRegistry } from '../../hooks/useGrantRegistry';
import { useNGOAccessControl } from '../../hooks/useNGOAccessControl';

const CreateGrant = () => {
  const { address, isConnected } = useAccount();
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    deadline: '',
  });

  const {
    createNewGrant,
    isCreating,
    isCreateSuccess,
    isCreateError,
    createError,
  } = useGrantRegistry();

  const { isAuthorized, isLoadingAuthorization } = useNGOAccessControl();

  // Show success message
  useEffect(() => {
    if (isCreateSuccess) {
      toast({
        title: 'Grant Created',
        description: 'Your grant has been successfully created',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // Reset form
      setFormData({
        title: '',
        description: '',
        amount: '',
        deadline: '',
      });
    }
  }, [isCreateSuccess, toast]);

  // Show error message
  useEffect(() => {
    if (isCreateError) {
      toast({
        title: 'Error',
        description: createError?.message || 'Failed to create grant',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isCreateError, createError, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to create a grant',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!isAuthorized) {
      toast({
        title: 'Not Authorized',
        description: 'Only authorized NGOs can create grants',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const { title, description, amount, deadline } = formData;
      
      // Basic validation
      if (!title || !description || !amount || !deadline) {
        toast({
          title: 'Missing Fields',
          description: 'Please fill in all fields',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Convert amount to wei (assuming amount is in ETH)
      const amountInWei = BigInt(parseFloat(amount) * 1e18);
      
      // Convert deadline to Unix timestamp
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);

      await createNewGrant(
        title,
        description,
        amountInWei,
        deadlineTimestamp
      );
    } catch (error) {
      console.error('Error creating grant:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create grant',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoadingAuthorization) {
    return (
      <Container maxW="container.md" py={10}>
        <Text>Loading authorization status...</Text>
      </Container>
    );
  }

  if (!isAuthorized) {
    return (
      <Container maxW="container.md" py={10}>
        <Alert status="warning">
          <AlertIcon />
          Only authorized NGOs can create grants. Please contact the administrator.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg">Create New Grant</Heading>
          <Text mt={2} color="gray.600">
            Create a new grant opportunity for applicants
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel>Grant Title</FormLabel>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter grant title"
              />
              <FormHelperText>A clear and concise title for your grant</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter grant description"
              />
              <FormHelperText>Detailed description of the grant purpose</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Amount (ETH)</FormLabel>
              <NumberInput
                value={formData.amount}
                onChange={(value) => setFormData(prev => ({ ...prev, amount: value }))}
                min={0}
                precision={4}
              >
                <NumberInputField placeholder="Enter grant amount in ETH" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText>Total amount of ETH for this grant</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Application Deadline</FormLabel>
              <Input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                min={new Date().toISOString().slice(0, 16)}
              />
              <FormHelperText>Deadline for grant applications</FormHelperText>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              isLoading={isCreating}
              loadingText="Creating Grant..."
              isDisabled={!isConnected || !isAuthorized}
            >
              Create Grant
            </Button>
          </VStack>
        </form>
      </VStack>
    </Container>
  );
};

export default CreateGrant; 