import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
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
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { accessGrantABI } from '../../constants/abis';
import { CONTRACT_ADDRESSES } from '../../constants/addresses';

const CreateGrant = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    totalAmount: '',
    deadline: '',
  });

  const [milestones, setMilestones] = useState([
    {
      description: '',
      amount: '',
      deadline: '',
    },
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMilestoneChange = (index, field, value) => {
    const newMilestones = [...milestones];
    newMilestones[index][field] = value;
    setMilestones(newMilestones);
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        description: '',
        amount: '',
        deadline: '',
      },
    ]);
  };

  const removeMilestone = (index) => {
    if (milestones.length > 1) {
      const newMilestones = milestones.filter((_, i) => i !== index);
      setMilestones(newMilestones);
    }
  };

  const validateMilestones = () => {
    const totalMilestoneAmount = milestones.reduce(
      (sum, milestone) => sum + parseFloat(milestone.amount || 0),
      0
    );
    return Math.abs(totalMilestoneAmount - parseFloat(formData.totalAmount)) < 0.0001;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateMilestones()) {
      toast({
        title: 'Validation Error',
        description: 'Milestone amounts must sum to total grant amount',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.AccessGrant,
        abi: accessGrantABI,
        functionName: 'createGrant',
        args: [
          formData.title,
          formData.description,
          parseEther(formData.totalAmount.toString()),
          Math.floor(new Date(formData.deadline).getTime() / 1000),
          milestones.map(m => ({
            description: m.description,
            amount: parseEther(m.amount.toString()),
            deadline: Math.floor(new Date(m.deadline).getTime() / 1000),
            status: 0, // NotStarted
            fundsReleased: false,
          })),
        ],
        account: address,
      });

      const hash = await walletClient.writeContract(request);
      
      toast({
        title: 'Grant Created',
        description: 'Your grant has been created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        totalAmount: '',
        deadline: '',
      });
      setMilestones([{
        description: '',
        amount: '',
        deadline: '',
      }]);

    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={8} maxW="1000px" mx="auto">
      <VStack spacing={8} align="stretch">
        <Heading>Create New Grant</Heading>
        <Text>Create a new grant with milestones for tracking progress and fund distribution.</Text>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel>Grant Title</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter grant title"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Input
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter grant description"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Total Amount (ETH)</FormLabel>
              <Input
                name="totalAmount"
                type="number"
                step="0.01"
                value={formData.totalAmount}
                onChange={handleInputChange}
                placeholder="Enter total grant amount"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Deadline</FormLabel>
              <Input
                name="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={handleInputChange}
              />
            </FormControl>

            <Box>
              <HStack justify="space-between" mb={4}>
                <Heading size="md">Milestones</Heading>
                <Button leftIcon={<AddIcon />} onClick={addMilestone} colorScheme="blue">
                  Add Milestone
                </Button>
              </HStack>

              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Description</Th>
                    <Th>Amount (ETH)</Th>
                    <Th>Deadline</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {milestones.map((milestone, index) => (
                    <Tr key={index}>
                      <Td>
                        <Input
                          value={milestone.description}
                          onChange={(e) =>
                            handleMilestoneChange(index, 'description', e.target.value)
                          }
                          placeholder="Milestone description"
                        />
                      </Td>
                      <Td>
                        <Input
                          type="number"
                          step="0.01"
                          value={milestone.amount}
                          onChange={(e) =>
                            handleMilestoneChange(index, 'amount', e.target.value)
                          }
                          placeholder="Amount"
                        />
                      </Td>
                      <Td>
                        <Input
                          type="datetime-local"
                          value={milestone.deadline}
                          onChange={(e) =>
                            handleMilestoneChange(index, 'deadline', e.target.value)
                          }
                        />
                      </Td>
                      <Td>
                        <IconButton
                          icon={<DeleteIcon />}
                          onClick={() => removeMilestone(index)}
                          isDisabled={milestones.length === 1}
                          colorScheme="red"
                          variant="ghost"
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            <Button type="submit" colorScheme="blue" size="lg">
              Create Grant
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default CreateGrant; 