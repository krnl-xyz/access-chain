import React from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useColorModeValue,
  Text,
  Avatar,
  Flex,
  Divider,
} from '@chakra-ui/react';

export default function Profile() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            Profile Settings
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Manage your account information and preferences
          </Text>
        </Box>

        <Box
          bg={bgColor}
          p={8}
          rounded="lg"
          shadow="base"
          borderWidth={1}
          borderColor={borderColor}
        >
          <VStack spacing={6} align="stretch">
            <Flex direction="column" align="center" mb={6}>
              <Avatar size="2xl" mb={4} />
              <Button size="sm" colorScheme="blue" variant="outline">
                Change Photo
              </Button>
            </Flex>

            <Divider />

            <FormControl>
              <FormLabel>Full Name</FormLabel>
              <Input placeholder="Enter your full name" />
            </FormControl>

            <FormControl>
              <FormLabel>Email Address</FormLabel>
              <Input type="email" placeholder="Enter your email" />
            </FormControl>

            <FormControl>
              <FormLabel>Organization (if applicable)</FormLabel>
              <Input placeholder="Enter your organization name" />
            </FormControl>

            <FormControl>
              <FormLabel>Wallet Address</FormLabel>
              <Input placeholder="Your connected wallet address" isReadOnly />
            </FormControl>

            <Divider />

            <FormControl>
              <FormLabel>Bio</FormLabel>
              <Input placeholder="Tell us about yourself" />
            </FormControl>

            <Button colorScheme="blue" size="lg">
              Save Changes
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
} 