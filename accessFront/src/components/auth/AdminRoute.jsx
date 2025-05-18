import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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
} from '@chakra-ui/react';
import { useAccount, usePublicClient } from 'wagmi';
import { NGOAccessControlABI, NGOAccessControlAddress } from '../../config/contracts';

const AdminRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const authCheckRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const checkAuthorization = async () => {
      if (!isConnected || !address) {
        if (mounted) {
          setIsAuthorized(false);
          setIsLoading(false);
          authCheckRef.current = false;
        }
        return;
      }

      try {
        // Check if the address is an admin
        const isAdmin = await publicClient.readContract({
          address: NGOAccessControlAddress,
          abi: NGOAccessControlABI,
          functionName: 'isAuthorizedAdmin',
          args: [address],
        });

        console.log('Admin check - Address:', address);
        console.log('Admin check - Is authorized:', isAdmin);

        authCheckRef.current = isAdmin;

        // Add a small delay to ensure state updates are processed
        setTimeout(() => {
          if (mounted) {
            setIsAuthorized(isAdmin);
            setIsLoading(false);
          }
        }, 100);
      } catch (error) {
        console.error('Error in admin check:', error);
        if (mounted) {
          setIsAuthorized(false);
          setIsLoading(false);
          authCheckRef.current = false;
        }
      }
    };

    checkAuthorization();

    return () => {
      mounted = false;
    };
  }, [address, isConnected, publicClient]);

  // Use the ref value for rendering decisions
  const shouldRender = !isLoading && authCheckRef.current;

  if (!isConnected) {
    return (
      <Box bg={bgColor} minH="100vh" py={10}>
        <Container maxW="lg">
          <Alert
            status="warning"
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
              Wallet Not Connected
            </AlertTitle>
            <AlertDescription maxWidth="sm" mb={4}>
              Please connect your wallet to access the admin dashboard.
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

  if (isLoading) {
    return (
      <Box bg={bgColor} minH="100vh" py={10}>
        <Container maxW="lg">
          <VStack spacing={4} align="center">
            <Spinner size="xl" />
            <Alert status="info">
              <AlertTitle>Verifying Admin Access...</AlertTitle>
              <AlertDescription>
                Checking if {address?.slice(0, 6)}...{address?.slice(-4)} is authorized
              </AlertDescription>
            </Alert>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (!shouldRender) {
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
              Your wallet address ({address?.slice(0, 6)}...{address?.slice(-4)}) is not authorized.
              Please contact the contract owner to get admin access.
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

export default AdminRoute; 