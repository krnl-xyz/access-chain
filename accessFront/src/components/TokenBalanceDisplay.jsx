import React from 'react';
import { Box, HStack, Text, Icon, Tooltip, Skeleton } from '@chakra-ui/react';
import { FaCoins } from 'react-icons/fa';
import { useAccount, useBalance } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/contracts';

const TokenBalanceDisplay = () => {
  const { address, isConnected } = useAccount();
  
  // Get token balance from MetaMask
  const { data: tokenBalance, isLoading } = useBalance({
    address: address,
    token: CONTRACT_ADDRESSES.accessToken,
    watch: true,
    enabled: isConnected,
  });

  if (!isConnected) {
    return null;
  }

  return (
    <Tooltip label="ACCESS Tokens" hasArrow>
      <HStack 
        spacing={2} 
        bg="purple.50" 
        color="purple.800" 
        px={3} 
        py={2} 
        borderRadius="md"
        border="1px"
        borderColor="purple.200"
      >
        <Icon as={FaCoins} color="purple.500" />
        {isLoading ? (
          <Skeleton height="20px" width="40px" />
        ) : (
          <>
            <Text fontWeight="bold">{tokenBalance ? Number(tokenBalance.formatted).toFixed(2) : '0'}</Text>
            <Text fontSize="sm">ACCESS</Text>
          </>
        )}
      </HStack>
    </Tooltip>
  );
};

export default TokenBalanceDisplay; 