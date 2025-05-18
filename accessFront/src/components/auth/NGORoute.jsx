import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useNGOAccessControl } from '../../hooks/useNGOAccessControl';
import {
  Box,
  Container,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  VStack,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';

const NGORoute = ({ children }) => {
  const location = useLocation();
  const { ngoAddress } = useParams();
  const { isAuthorized, isLoadingAuthorization } = useNGOAccessControl();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  if (isLoadingAuthorization) {
    return (
      <Box bg={bgColor} minH="100vh" py={10}>
        <Container maxW="lg">
          <VStack spacing={4} align="center">
            <Spinner size="xl" />
            <Alert status="info">
              <AlertTitle>Verifying NGO Status...</AlertTitle>
            </Alert>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (!isAuthorized) {
    return (
      <Box bg={bgColor} minH="100vh" py={10}>
        <Container maxW="lg">
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            bg={useColorModeValue('white', 'gray.800')}
            borderRadius="xl"
            boxShadow="lg"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Access Denied
            </AlertTitle>
            <AlertDescription maxWidth="sm" mb={4}>
              You must be an authorized NGO to access this page.
            </AlertDescription>
            <Button
              colorScheme="blue"
              onClick={() => window.location.href = '/'}
            >
              Return to Home
            </Button>
          </Alert>
        </Container>
      </Box>
    );
  }

  return children;
};

export default NGORoute; 