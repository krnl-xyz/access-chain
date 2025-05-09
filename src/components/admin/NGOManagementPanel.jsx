import React from 'react';
import { Box, VStack, Text, Alert, AlertIcon, Button } from '@chakra-ui/react';
import { useColorModeValue } from '@chakra-ui/react';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';

const NGOManagementPanel = () => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const CONTRACT_OWNER = '0x1f0bde03ac69da9ab6aa0dc6169b906159ad569c';
  const isCorrectNetwork = chain?.id === 57054;

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Network Status */}
        <Box
          bg={useColorModeValue('white', 'gray.800')}
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <VStack align="stretch" spacing={2}>
            <Text fontWeight="bold">Network Status:</Text>
            <Text>{chain?.name || 'Not Connected'}</Text>
            {!isCorrectNetwork && (
              <Alert status="warning">
                <AlertIcon />
                <VStack align="stretch" spacing={2} width="100%">
                  <Text>Please connect to Sonic Blaze Testnet</Text>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => switchNetwork?.(57054)}
                  >
                    Switch to Sonic Blaze Testnet
                  </Button>
                </VStack>
              </Alert>
            )}
          </VStack>
        </Box>

        {/* Wallet Status */}
        <Box
          bg={useColorModeValue('white', 'gray.800')}
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <VStack align="stretch" spacing={2}>
            <Text fontWeight="bold">Your Wallet Address:</Text>
            <Text fontFamily="mono">{isConnected ? address : 'Not Connected'}</Text>
            <Text fontWeight="bold">Contract Owner Address:</Text>
            <Text fontFamily="mono">{CONTRACT_OWNER}</Text>
            {isConnected ? (
              <Alert status={address?.toLowerCase() === CONTRACT_OWNER.toLowerCase() ? 'success' : 'warning'}>
                <AlertIcon />
                {address?.toLowerCase() === CONTRACT_OWNER.toLowerCase() 
                  ? 'You are the contract owner'
                  : 'You are not the contract owner. Only the contract owner can add NGOs.'}
              </Alert>
            ) : (
              <Alert status="warning">
                <AlertIcon />
                Please connect your wallet to continue
              </Alert>
            )}
          </VStack>
        </Box>

        {/* Add NGO Form */}
        <Box
          bg={useColorModeValue('white', 'gray.800')}
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          {/* Add NGO form content */}
        </Box>
      </VStack>
    </Box>
  );
};

export default NGOManagementPanel; 