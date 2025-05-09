import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  Textarea,
  Select,
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';

export default function RegisterNGO() {
  const { isConnected } = useAccount();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    email: '',
    category: '',
    registrationNumber: '',
    address: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
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
        description: 'Please connect your wallet to register an NGO',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement NGO registration with smart contract
      console.log('Form submitted:', formData);
      
      toast({
        title: 'Registration submitted',
        description: 'Your NGO registration has been submitted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading>Register Your NGO</Heading>
          <Text mt={2} color="gray.600">
            Complete the form below to register your NGO on AccessChain
          </Text>
        </Box>

        <Box
          as="form"
          onSubmit={handleSubmit}
          p={8}
          borderWidth={1}
          borderRadius="lg"
          boxShadow="lg"
        >
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Organization Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your organization name"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your organization's mission and activities"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Website</FormLabel>
              <Input
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://your-organization.com"
                type="url"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@your-organization.com"
                type="email"
              />
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
              <FormLabel>Registration Number</FormLabel>
              <Input
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="Enter your official registration number"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Address</FormLabel>
              <Textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your organization's physical address"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="full"
              isLoading={isLoading}
              loadingText="Submitting..."
            >
              Register NGO
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
} 