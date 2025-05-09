import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

export default function Layout({ children }) {
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box minH="100vh" bg={bgColor}>
      <Navbar />
      <Box as="main" minH="calc(100vh - 140px)">
        {children}
      </Box>
      <Footer />
    </Box>
  );
} 