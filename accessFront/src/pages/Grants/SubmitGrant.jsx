import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Textarea,
  useToast,
  VStack,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  useColorModeValue,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useAccount, useContractWrite, useWaitForTransaction, useNetwork } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, CONTRACT_FUNCTIONS } from '../../config/contracts';

export default function SubmitGrant() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { chain } = useNetwork();
  const isCorrectNetwork = chain?.id === 57054;

  useEffect(() => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to continue',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } else if (!isCorrectNetwork) {
      toast({
        title: 'Wrong Network',
        description: 'Please switch to Sonic Blaze Testnet',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isConnected, isCorrectNetwork, toast]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    duration: '',
    beneficiaries: '',
    impact: '',
  });

  const { write: submitGrant, data: submitData } = useContractWrite({
    address: CONTRACT_ADDRESSES.accessGrant,
    abi: CONTRACT_ABIS.accessGrant,
    functionName: CONTRACT_FUNCTIONS.submitRequest,
  });

  const { isLoading: isTransactionLoading } = useWaitForTransaction({
    hash: submitData?.hash,
    onSuccess: () => {
      toast({
        title: 'Grant Request Submitted',
        description: 'Your grant request has been submitted successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/grants/requests');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to submit a grant request',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await submitGrant({
        args: [
          formData.title,
          formData.description,
          formData.amount,
          formData.category,
          formData.duration,
          formData.beneficiaries,
          formData.impact,
        ],
      });
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (!isConnected) {
    return (
      <Container maxW="container.md" py={10}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          Please connect your wallet to submit a grant request.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading>Submit Grant Request</Heading>
          <Text mt={2} color="gray.600">
            Complete the form below to submit your grant request
          </Text>
        </Box>

        <Box
          as="form"
          onSubmit={handleSubmit}
          p={8}
          bg={bgColor}
          borderWidth={1}
          borderColor={borderColor}
          borderRadius="lg"
          boxShadow="lg"
        >
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Grant Title</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a descriptive title for your grant"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your project and its objectives"
                rows={4}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Requested Amount (ETH)</FormLabel>
              <NumberInput
                min={0}
                precision={2}
                value={formData.amount}
                onChange={(value) => handleNumberChange('amount', value)}
              >
                <NumberInputField
                  placeholder="Enter the amount of ETH requested"
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Select category"
              >
                <option value="education">Education</option>
                <option value="healthcare">Healthcare</option>
                <option value="environment">Environment</option>
                <option value="social">Social Services</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Duration (months)</FormLabel>
              <NumberInput
                min={1}
                max={36}
                value={formData.duration}
                onChange={(value) => handleNumberChange('duration', value)}
              >
                <NumberInputField placeholder="Enter project duration in months" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Number of Beneficiaries</FormLabel>
              <NumberInput
                min={1}
                value={formData.beneficiaries}
                onChange={(value) => handleNumberChange('beneficiaries', value)}
              >
                <NumberInputField placeholder="Enter expected number of beneficiaries" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Expected Impact</FormLabel>
              <Textarea
                name="impact"
                value={formData.impact}
                onChange={handleChange}
                placeholder="Describe the expected impact of your project"
                rows={4}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="full"
              isLoading={isLoading || isTransactionLoading}
              loadingText="Submitting..."
            >
              Submit Grant Request
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
} 