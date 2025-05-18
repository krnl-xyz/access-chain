import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { toast } from 'react-toastify';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../config/contracts';
import { sonicBlaze } from '../config/chains';
import VoteSimulation from './VoteSimulation';
import TokenBalanceDisplay from './TokenBalanceDisplay';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Divider,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FaFileAlt, FaUsers, FaCheck, FaTimes, FaEye } from 'react-icons/fa';

const GrantDetail = () => {
  const { grantId } = useParams();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const [loading, setLoading] = useState(true);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [grant, setGrant] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isNGO, setIsNGO] = useState(false);
  const [isGrantCreator, setIsGrantCreator] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [userApplication, setUserApplication] = useState(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Helper functions for contract interactions
  const readGrantContract = async (functionName, args = []) => {
    try {
      return await publicClient.readContract({
        address: CONTRACT_ADDRESSES.accessGrant,
        abi: CONTRACT_ABIS.accessGrant,
        functionName,
        args
      });
    } catch (error) {
      console.error(`Error reading contract function ${functionName}:`, error);
      throw error;
    }
  };

  const readNGOContract = async (functionName, args = []) => {
    try {
      return await publicClient.readContract({
        address: CONTRACT_ADDRESSES.ngoAccessControl,
        abi: CONTRACT_ABIS.ngoAccessControl,
        functionName,
        args
      });
    } catch (error) {
      console.error(`Error reading contract function ${functionName}:`, error);
      throw error;
    }
  };

  const writeGrantContract = async (functionName, args = []) => {
    try {
      if (!walletClient) throw new Error("Wallet not connected");
      
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.accessGrant,
        abi: CONTRACT_ABIS.accessGrant,
        functionName,
        args,
        chain: sonicBlaze,
        account: address
      });
      
      return hash;
    } catch (error) {
      console.error(`Error writing contract function ${functionName}:`, error);
      throw error;
    }
  };

  // Set up data loading and event listeners
  useEffect(() => {
    const fetchGrantDetails = async () => {
      try {
        setLoading(true);
        
        // Get all grants
        const grants = await readGrantContract('getGrants');
        
        // Find the specified grant
        const grantIdNumber = parseInt(grantId, 10);
        const foundGrant = grants.find(g => Number(g.id) === grantIdNumber);
        
        if (!foundGrant) {
          toast.error('Grant not found');
          navigate('/grants');
          return;
        }
        
        // Format grant data
        const formattedGrant = {
          id: Number(foundGrant.id),
          title: foundGrant.title,
          description: foundGrant.description,
          amount: ethers.formatEther(foundGrant.amount.toString()),
          deadline: new Date(Number(foundGrant.deadline) * 1000).toLocaleDateString(),
          deadlineTimestamp: Number(foundGrant.deadline),
          ngo: foundGrant.ngo,
          isActive: foundGrant.isActive
        };
        
        setGrant(formattedGrant);
        
        // Check if the current user is an NGO
        if (address) {
          const ngoStatus = await readNGOContract('isAuthorizedNGO', [address]);
          setIsNGO(ngoStatus);
          setIsGrantCreator(foundGrant.ngo.toLowerCase() === address.toLowerCase());
        }
        
        // This part would be more complex in a real application
        // For demonstration, we'll use a simplified approach
        // In a real app, you would need to query events or use a subgraph
        
        // Check if current user has applied (this is a stub - actual implementation would differ)
        // We're mocking this since we can't easily query all applications from the contract
        setHasApplied(false);
        setUserApplication(null);
        
        // If the user is the grant creator, fetch applications (mock for now)
        if (foundGrant.ngo.toLowerCase() === address?.toLowerCase()) {
          // In a real implementation, you would query applications from events or a subgraph
          setApplications([
            // These would come from contract events in a real implementation
          ]);
        }
      } catch (error) {
        console.error('Error fetching grant details:', error);
        toast.error('Failed to load grant details');
      } finally {
        setLoading(false);
      }
    };

    if (grantId && publicClient) {
      fetchGrantDetails();
    }
    
    // Set up event listeners
    if (publicClient) {
      try {
        // Watch for application events
        const unwatchSubmitted = publicClient.watchContractEvent({
          address: CONTRACT_ADDRESSES.accessGrant,
          abi: CONTRACT_ABIS.accessGrant,
          eventName: 'ApplicationSubmitted',
          onLogs: (logs) => {
            const eventLog = logs[0];
            if (eventLog && Number(eventLog.args.grantId) === parseInt(grantId, 10)) {
              toast.info(`New application submitted`);
              // Refresh applications if needed
            }
          }
        });
        
        const unwatchApproved = publicClient.watchContractEvent({
          address: CONTRACT_ADDRESSES.accessGrant,
          abi: CONTRACT_ABIS.accessGrant,
          eventName: 'ApplicationApproved',
          onLogs: (logs) => {
            const eventLog = logs[0];
            if (eventLog && Number(eventLog.args.grantId) === parseInt(grantId, 10)) {
              toast.success(`Application approved`);
              // Update application status
            }
          }
        });
        
        const unwatchRejected = publicClient.watchContractEvent({
          address: CONTRACT_ADDRESSES.accessGrant,
          abi: CONTRACT_ABIS.accessGrant,
          eventName: 'ApplicationRejected',
          onLogs: (logs) => {
            const eventLog = logs[0];
            if (eventLog && Number(eventLog.args.grantId) === parseInt(grantId, 10)) {
              toast.info(`Application rejected`);
              // Update application status
            }
          }
        });
        
        return () => {
          unwatchSubmitted?.();
          unwatchApproved?.();
          unwatchRejected?.();
        };
      } catch (error) {
        console.error('Error setting up event watchers:', error);
      }
    }
  }, [grantId, publicClient, address, navigate]);

  const handleApprove = async (applicantAddress) => {
    if (!isGrantCreator) {
      toast.error('Only the grant creator can approve applications');
      return;
    }
    
    try {
      setApprovalLoading(true);
      const grantIdNumber = parseInt(grantId, 10);
      
      toast.info('Submitting approval transaction...');
      await writeGrantContract('approveApplication', [grantIdNumber, applicantAddress]);
      
      toast.success('Application approved successfully!');
      
      // Update the applications list
      setApplications(applications.map(app => 
        app.applicant === applicantAddress 
          ? { ...app, approved: true, rejected: false } 
          : app
      ));
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error(error.reason || error.message || 'Failed to approve application');
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleReject = async (applicantAddress) => {
    if (!isGrantCreator) {
      toast.error('Only the grant creator can reject applications');
      return;
    }
    
    try {
      setApprovalLoading(true);
      const grantIdNumber = parseInt(grantId, 10);
      
      toast.info('Submitting rejection transaction...');
      await writeGrantContract('rejectApplication', [grantIdNumber, applicantAddress]);
      
      toast.success('Application rejected successfully!');
      
      // Update the applications list
      setApplications(applications.map(app => 
        app.applicant === applicantAddress 
          ? { ...app, approved: false, rejected: true } 
          : app
      ));
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error(error.reason || error.message || 'Failed to reject application');
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleViewApplications = () => {
    navigate(`/grants/${grantId}/applications`);
  };

  if (loading) {
    return (
      <Box p={4}>
        <Text>Loading grant details...</Text>
      </Box>
    );
  }

  if (!grant) {
    return (
      <Box p={4}>
        <Text>Grant not found</Text>
      </Box>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" p={4}>
      <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
        <CardHeader>
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between">
              <Heading size="lg">{grant.title}</Heading>
              <Badge colorScheme={grant.isActive ? 'green' : 'red'}>
                {grant.isActive ? 'Active' : 'Closed'}
              </Badge>
            </HStack>
            <Text color="gray.500">Posted by: {grant.ngo}</Text>
          </VStack>
        </CardHeader>

        <CardBody>
          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading size="sm" mb={2}>Description</Heading>
              <Text>{grant.description}</Text>
            </Box>

            <HStack spacing={8}>
              <Box>
                <Text fontWeight="bold">Amount</Text>
                <Text>{grant.amount} SONIC</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Deadline</Text>
                <Text>{grant.deadline}</Text>
              </Box>
            </HStack>

            {isGrantCreator && (
              <Box>
                <Button
                  leftIcon={<Icon as={FaEye} />}
                  colorScheme="blue"
                  onClick={handleViewApplications}
                  size="lg"
                  width="full"
                >
                  Review Applications
                </Button>
              </Box>
            )}

            {!isGrantCreator && !hasApplied && grant.isActive && (
              <Button
                colorScheme="blue"
                onClick={() => navigate(`/grants/${grantId}/apply`)}
                size="lg"
                width="full"
              >
                Apply for Grant
              </Button>
            )}

            {hasApplied && (
              <Box>
                <Text color="green.500">You have already applied for this grant</Text>
                {userApplication && (
                  <Text mt={2}>
                    Status: {userApplication.approved ? 'Approved' : userApplication.rejected ? 'Rejected' : 'Pending'}
                  </Text>
                )}
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default GrantDetail; 