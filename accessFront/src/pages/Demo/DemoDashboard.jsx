import React from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  HStack,
  VStack,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  Divider,
  Progress,
  useColorModeValue
} from '@chakra-ui/react';
import { FaHandHoldingHeart, FaUsers, FaCoins, FaCheckCircle } from 'react-icons/fa';
import TokenBalanceDisplay from '../../components/TokenBalanceDisplay';
import VoteSimulation from '../../components/VoteSimulation';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';

const DemoDashboard = () => {
  const { isConnected } = useAccount();
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // Mock data
  const activeDonations = 12;
  const impactedLives = 328;
  const verifiedNGOs = 5;
  const recentGrants = [
    { id: 1, title: "Accessibility Equipment for Schools", amount: "5,000", status: "active" },
    { id: 2, title: "Support for Visually Impaired Children", amount: "3,500", status: "active" },
    { id: 3, title: "Mobility Solutions for Disabilities", amount: "7,200", status: "pending" }
  ];
  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={2}>AccessChain: Disability Resource & Funding Network</Heading>
          <Text color="gray.600">Making impact through blockchain transparency</Text>
          
          {!isConnected && (
            <Box mt={4} p={4} bg="yellow.50" borderRadius="md">
              <Text color="yellow.700">
                Connect your wallet to interact with ACCESS tokens and voting!
              </Text>
            </Box>
          )}
        </Box>
        
        <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(4, 1fr)" }} gap={6}>
          <GridItem>
            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <HStack>
                    <Box color="purple.500">
                      <FaHandHoldingHeart size={24} />
                    </Box>
                    <StatLabel>Active Donations</StatLabel>
                  </HStack>
                  <StatNumber>{activeDonations}</StatNumber>
                  <StatHelpText>Supporting lives</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <HStack>
                    <Box color="blue.500">
                      <FaUsers size={24} />
                    </Box>
                    <StatLabel>Lives Impacted</StatLabel>
                  </HStack>
                  <StatNumber>{impactedLives}</StatNumber>
                  <StatHelpText>And growing</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <HStack>
                    <Box color="green.500">
                      <FaCheckCircle size={24} />
                    </Box>
                    <StatLabel>Verified NGOs</StatLabel>
                  </HStack>
                  <StatNumber>{verifiedNGOs}</StatNumber>
                  <StatHelpText>Trusted partners</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <HStack>
                    <Box color="yellow.500">
                      <FaCoins size={24} />
                    </Box>
                    <StatLabel>Your Balance</StatLabel>
                  </HStack>
                  <HStack mt={2}>
                    <TokenBalanceDisplay />
                  </HStack>
                  <StatHelpText>ACCESS tokens</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
        
        <Grid templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
          <GridItem colSpan={{ base: 1, lg: 2 }}>
            <Card bg={cardBg}>
              <CardHeader>
                <Heading size="md">Active Grants</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {recentGrants.map(grant => (
                    <Box key={grant.id} p={4} borderWidth="1px" borderRadius="md">
                      <HStack justify="space-between">
                        <Heading size="sm">{grant.title}</Heading>
                        <Badge colorScheme={grant.status === 'active' ? 'green' : 'yellow'}>
                          {grant.status}
                        </Badge>
                      </HStack>
                      <Text mt={2} color="gray.600">Amount: {grant.amount} SONIC</Text>
                      <Progress 
                        mt={3} 
                        value={Math.random() * 100} 
                        size="sm" 
                        colorScheme="blue" 
                      />
                      <HStack mt={3}>
                        <Button size="sm" colorScheme="blue" as={Link} to={`/grants/${grant.id}`}>
                          View Details
                        </Button>
                        <Button size="sm" as={Link} to={`/grants/${grant.id}/apply`}>
                          Apply
                        </Button>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <VoteSimulation 
              grantId={1}
              grantTitle="Accessibility Equipment for Schools"
            />
          </GridItem>
        </Grid>
        
        <Divider my={4} />
        
        <Heading size="md" mb={4}>Features Coming Soon</Heading>
        <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={4}>
          <GridItem>
            <Card bg={cardBg} height="100%">
              <CardBody>
                <Heading size="sm" mb={3}>Token-Based Governance</Heading>
                <Text>Use ACCESS tokens to vote on important platform decisions and grant approvals.</Text>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card bg={cardBg} height="100%">
              <CardBody>
                <Heading size="sm" mb={3}>Token Rewards for Contributors</Heading>
                <Text>Earn ACCESS tokens for helping verify beneficiaries and reviewing grant applications.</Text>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card bg={cardBg} height="100%">
              <CardBody>
                <Heading size="sm" mb={3}>Milestone-Based Funding</Heading>
                <Text>Release funds based on project milestones with community verification.</Text>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </VStack>
    </Container>
  );
};

export default DemoDashboard; 