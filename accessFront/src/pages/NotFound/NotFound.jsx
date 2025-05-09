import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

export default function NotFound() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Container maxW="container.xl" py={20}>
      <VStack spacing={8} align="center">
        <Box
          bg={bgColor}
          p={12}
          rounded="lg"
          shadow="base"
          borderWidth={1}
          borderColor={borderColor}
          textAlign="center"
        >
          <Heading size="4xl" mb={4}>
            404
          </Heading>
          <Heading size="xl" mb={6}>
            Page Not Found
          </Heading>
          <Text fontSize="lg" color="gray.600" mb={8}>
            The page you're looking for doesn't exist or has been moved.
          </Text>
          <Button
            as={RouterLink}
            to="/"
            colorScheme="blue"
            size="lg"
          >
            Return Home
          </Button>
        </Box>
      </VStack>
    </Container>
  );
} 