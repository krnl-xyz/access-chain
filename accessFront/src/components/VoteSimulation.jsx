import React, { useState } from 'react';
import {
  Box, 
  Heading, 
  Text,
  Button,
  HStack,
  Progress,
  Badge,
  VStack,
  useToast
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { useAccount } from 'wagmi';

const VoteSimulation = ({ grantId, grantTitle }) => {
  const { isConnected } = useAccount();
  const [votesFor, setVotesFor] = useState(65); // Starting mock values
  const [votesAgainst, setVotesAgainst] = useState(35);
  const [hasVoted, setHasVoted] = useState(false);
  const toast = useToast();
  
  const totalVotes = votesFor + votesAgainst;
  const forPercentage = Math.round((votesFor / totalVotes) * 100);
  const againstPercentage = Math.round((votesAgainst / totalVotes) * 100);
  
  const handleVote = (support) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to vote",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (support) {
      setVotesFor(votesFor + 1);
    } else {
      setVotesAgainst(votesAgainst + 1);
    }
    
    setHasVoted(true);
    
    toast({
      title: "Vote Recorded",
      description: `You voted ${support ? "FOR" : "AGAINST"} this grant application.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Box
      p={5}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="sm"
      bg="white"
    >
      <Heading size="md" mb={2}>Community Voting</Heading>
      <Text color="gray.600" mb={4}>
        Should this grant application be approved? Cast your vote!
      </Text>
      
      <VStack spacing={3} align="stretch">
        <Box>
          <HStack mb={1} justify="space-between">
            <Text fontSize="sm" fontWeight="bold" color="green.600">For approval</Text>
            <Badge colorScheme="green">{forPercentage}%</Badge>
          </HStack>
          <Progress value={forPercentage} colorScheme="green" size="sm" borderRadius="full" />
        </Box>
        
        <Box>
          <HStack mb={1} justify="space-between">
            <Text fontSize="sm" fontWeight="bold" color="red.600">Against approval</Text>
            <Badge colorScheme="red">{againstPercentage}%</Badge>
          </HStack>
          <Progress value={againstPercentage} colorScheme="red" size="sm" borderRadius="full" />
        </Box>
        
        <Text fontSize="sm" color="gray.500" textAlign="right">
          Total votes: {totalVotes}
        </Text>
      </VStack>
      
      {!hasVoted ? (
        <HStack mt={4} spacing={4} justify="center">
          <Button 
            leftIcon={<CheckIcon />} 
            colorScheme="green" 
            onClick={() => handleVote(true)}
            size="md"
          >
            Vote For
          </Button>
          <Button 
            leftIcon={<CloseIcon />} 
            colorScheme="red" 
            onClick={() => handleVote(false)}
            size="md"
          >
            Vote Against
          </Button>
        </HStack>
      ) : (
        <Box mt={4} p={3} bg="blue.50" borderRadius="md">
          <Text textAlign="center" color="blue.600" fontWeight="bold">
            Thank you for voting!
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default VoteSimulation; 