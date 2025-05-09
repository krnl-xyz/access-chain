import React from 'react';
import { Box, Container, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import GrantListing from '../../components/GrantListing';

const GrantsPage = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box bg={bgColor} minH="calc(100vh - 64px)">
      <Container maxW="7xl" py={8}>
        <Box textAlign="center" mb={10}>
          <Heading
            as="h1"
            size="2xl"
            bgGradient="linear(to-r, blue.400, purple.500)"
            backgroundClip="text"
            mb={4}
          >
            Grant Opportunities
          </Heading>
          <Text fontSize="xl" color={textColor}>
            Discover and apply for funding opportunities that align with your mission
          </Text>
        </Box>
        <GrantListing />
      </Container>
    </Box>
  );
};

export default GrantsPage; 