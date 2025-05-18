import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
  Progress,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
} from '@chakra-ui/react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useParams } from 'react-router-dom';
import { accessGrantABI } from '../../constants/abis';
import { CONTRACT_ADDRESSES } from '../../constants/addresses';

const MilestoneStatus = {
  NotStarted: 0,
  InProgress: 1,
  Completed: 2,
  Failed: 3,
};

const getStatusColor = (status) => {
  switch (status) {
    case MilestoneStatus.NotStarted:
      return 'gray';
    case MilestoneStatus.InProgress:
      return 'blue';
    case MilestoneStatus.Completed:
      return 'green';
    case MilestoneStatus.Failed:
      return 'red';
    default:
      return 'gray';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case MilestoneStatus.NotStarted:
      return 'Not Started';
    case MilestoneStatus.InProgress:
      return 'In Progress';
    case MilestoneStatus.Completed:
      return 'Completed';
    case MilestoneStatus.Failed:
      return 'Failed';
    default:
      return 'Unknown';
  }
};

const ManageMilestones = () => {
  const { grantId } = useParams();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [grantDetails, setGrantDetails] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchGrantDetails();
  }, [grantId]);

  const fetchGrantDetails = async () => {
    try {
      const grant = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.AccessGrant,
        abi: accessGrantABI,
        functionName: 'grants',
        args: [grantId],
      });

      setGrantDetails(grant);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch grant details',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCompleteMilestone = async () => {
    if (!selectedMilestone) return;

    setIsLoading(true);
    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.AccessGrant,
        abi: accessGrantABI,
        functionName: 'completeMilestone',
        args: [
          grantId,
          selectedMilestone.applicant,
          selectedMilestone.index,
        ],
        account: address,
      });

      const hash = await walletClient.writeContract(request);
      
      toast({
        title: 'Milestone Completed',
        description: 'The milestone has been marked as completed',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh grant details
      await fetchGrantDetails();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCompletionModal = (milestone, index) => {
    setSelectedMilestone({ ...milestone, index });
    setCompletionNotes('');
    onOpen();
  };

  if (!grantDetails) {
    return <Progress size="xs" isIndeterminate />;
  }

  const totalMilestones = grantDetails.milestones.length;
  const completedMilestones = grantDetails.milestones.filter(
    m => m.status === MilestoneStatus.Completed
  ).length;
  const progress = (completedMilestones / totalMilestones) * 100;

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <VStack spacing={8} align="stretch">
        <Heading>Manage Grant Milestones</Heading>

        <Box borderWidth="1px" borderRadius="lg" p={6}>
          <VStack align="stretch" spacing={4}>
            <Text fontWeight="bold" fontSize="xl">{grantDetails.title}</Text>
            <Text>{grantDetails.description}</Text>
            <Box>
              <Text mb={2}>Overall Progress</Text>
              <Progress value={progress} colorScheme="blue" hasStripe />
              <Text mt={2} textAlign="right">{completedMilestones} of {totalMilestones} milestones completed</Text>
            </Box>
          </VStack>
        </Box>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Description</Th>
              <Th>Amount (ETH)</Th>
              <Th>Deadline</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {grantDetails.milestones.map((milestone, index) => (
              <Tr key={index}>
                <Td>{milestone.description}</Td>
                <Td>{milestone.amount} ETH</Td>
                <Td>{new Date(milestone.deadline * 1000).toLocaleDateString()}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(milestone.status)}>
                    {getStatusText(milestone.status)}
                  </Badge>
                </Td>
                <Td>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    isDisabled={
                      milestone.status !== MilestoneStatus.InProgress ||
                      milestone.fundsReleased
                    }
                    onClick={() => openCompletionModal(milestone, index)}
                  >
                    Complete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Complete Milestone</ModalHeader>
            <ModalBody>
              <VStack spacing={4}>
                <Alert status="info">
                  <AlertIcon />
                  Completing this milestone will release the associated funds to the grantee.
                </Alert>
                <FormControl>
                  <FormLabel>Completion Notes</FormLabel>
                  <Textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Add any notes about the milestone completion..."
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleCompleteMilestone}
                isLoading={isLoading}
              >
                Complete Milestone
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default ManageMilestones; 