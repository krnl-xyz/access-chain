import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount, usePublicClient } from 'wagmi';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Progress,
  Select,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Text,
  Textarea,
  VStack,
  useToast,
  useSteps,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Badge,
  Tag,
  useDisclosure,
  Collapse,
} from '@chakra-ui/react';
import { 
  ChevronLeftIcon, 
  InfoIcon, 
  CheckIcon, 
  ArrowForwardIcon, 
  CalendarIcon, 
  AttachmentIcon 
} from '@chakra-ui/icons';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../config/contracts';
import { sonicBlaze } from '../config/chains';
import { useGrantManagement } from '../hooks/useGrantManagement';

// Form steps
const steps = [
  { title: 'Project Info', description: 'Basic details' },
  { title: 'Implementation', description: 'How you\'ll execute' },
  { title: 'Budget & Timeline', description: 'Resource planning' },
  { title: 'Review', description: 'Finalize application' }
];

const GrantApplicationForm = () => {
  const { grantId } = useParams();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const toast = useToast();
  const { activeStep, goToNext, goToPrevious, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });
  
  // Use the grant management hook
  const { 
    applyForGrant, 
    isPending, 
    isSuccess, 
    error, 
    isTransactionLoading,
    isTransactionSuccess 
  } = useGrantManagement();
  
  // Color mode values
  const formBackground = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const tooltipBg = useColorModeValue('gray.700', 'gray.200');
  const tooltipColor = useColorModeValue('white', 'gray.800');
  const infoBackground = useColorModeValue('blue.50', 'blue.900');
  const highEmphasisText = useColorModeValue('gray.800', 'white');

  const [loading, setLoading] = useState(false);
  const [loadingGrant, setLoadingGrant] = useState(true);
  const [grantDetails, setGrantDetails] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Enhanced application form data
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectSummary: '',
    background: '',
    objectives: '',
    methodology: '',
    expectedOutcomes: '',
    targetBeneficiaries: '',
    beneficiaryCount: '0',
    timeline: '',
    milestones: '',
    budget: '',
    teamMembers: '',
    additionalInfo: '',
    organizationName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    previousExperience: '',
    implementationStrategy: '',
    sustainabilityPlan: '',
    monitoringEvaluation: '',
    riskMitigation: '',
    projectDuration: '6'
  });

  // Fetch grant details
  useEffect(() => {
    const fetchGrantDetails = async () => {
      if (!publicClient || !grantId) return;
      
      try {
        setLoadingGrant(true);
        // Get grant by ID
        const grant = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.accessGrant,
          abi: CONTRACT_ABIS.accessGrant,
          functionName: 'grants',
          args: [grantId]
        });
        
        // Format data
        const formattedGrant = {
          id: Number(grantId),
          title: grant.title,
          description: grant.description,
          amount: grant.amount ? ethers.formatEther(grant.amount.toString()) : '0',
          deadline: grant.deadline ? new Date(Number(grant.deadline) * 1000).toLocaleDateString() : 'N/A',
          deadlineTimestamp: Number(grant.deadline || 0),
          ngo: grant.ngo,
          isActive: grant.isActive || false,
          isExpired: (grant.deadline && Number(grant.deadline) < (Date.now() / 1000)) || false
        };
        
        setGrantDetails(formattedGrant);
        
        // Use grant title as project title default
        setFormData(prev => ({
          ...prev,
          projectTitle: `Application for: ${formattedGrant.title || 'Grant'}`
        }));
      } catch (error) {
        console.error('Error fetching grant details:', error);
        toast({
          title: 'Error loading grant details',
          description: error.message || 'Could not load grant information. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoadingGrant(false);
      }
    };

    fetchGrantDetails();
  }, [publicClient, grantId, toast]);

  // Watch for transaction success to redirect after submission
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'Application submitted!',
        description: 'Your grant application has been successfully submitted',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      
      // Navigate back to grant detail page after submission
      setTimeout(() => {
        navigate(`/grants/${grantId}`);
      }, 2000);
    }
  }, [isSuccess, navigate, grantId, toast]);

  // Watch for transaction errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error submitting application',
        description: error.message || 'Failed to submit application',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  }, [error, toast]);

  // Calculate form completion progress
  const calculateProgress = () => {
    // Weight each section differently
    const sections = {
      projectInfo: ['projectTitle', 'projectSummary', 'objectives', 'targetBeneficiaries'],
      implementation: ['methodology', 'implementationStrategy', 'sustainabilityPlan', 'riskMitigation'],
      budgetTimeline: ['budget', 'timeline', 'milestones', 'projectDuration']
    };
    
    // Count completed required fields by section
    const getCompletedFields = (fields) => {
      return fields.filter(field => formData[field] && formData[field].trim().length > 0).length;
    };
    
    const totalFields = Object.values(sections).flat().length;
    const completedFields = Object.values(sections).reduce((acc, fields) => acc + getCompletedFields(fields), 0);
    
    return (completedFields / totalFields) * 100;
  };

  // Input field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Number input handler
  const handleNumberChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validate current step
  const validateStep = (step) => {
    const errors = {};
    
    // Validate Project Info step
    if (step === 0) {
      if (!formData.projectTitle.trim()) {
        errors.projectTitle = 'Project title is required';
      }
      
      if (!formData.projectSummary.trim()) {
        errors.projectSummary = 'Project summary is required';
      } else if (formData.projectSummary.trim().length < 100) {
        errors.projectSummary = 'Project summary should be at least 100 characters';
      }
      
      if (!formData.objectives.trim()) {
        errors.objectives = 'Objectives are required';
      }
      
      if (!formData.targetBeneficiaries.trim()) {
        errors.targetBeneficiaries = 'Target beneficiaries are required';
      }
    }
    // Validate Implementation step
    else if (step === 1) {
      if (!formData.methodology.trim()) {
        errors.methodology = 'Methodology is required';
      }
      
      if (!formData.implementationStrategy.trim()) {
        errors.implementationStrategy = 'Implementation strategy is required';
      }
      
      if (!formData.sustainabilityPlan.trim()) {
        errors.sustainabilityPlan = 'Sustainability plan is required';
      }
      
      if (!formData.riskMitigation.trim()) {
        errors.riskMitigation = 'Risk mitigation plan is required';
      }
    }
    // Validate Budget & Timeline step
    else if (step === 2) {
      if (!formData.budget.trim()) {
        errors.budget = 'Budget is required';
      }
      
      if (!formData.timeline.trim()) {
        errors.timeline = 'Timeline is required';
      }
      
      if (!formData.milestones.trim()) {
        errors.milestones = 'Milestones are required';
      }
      
      if (!formData.projectDuration) {
        errors.projectDuration = 'Project duration is required';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Go to next step if validation passes
  const goToNextStep = () => {
    if (validateStep(activeStep)) {
      goToNext();
      window.scrollTo(0, 0);
    }
  };

  // Validate all form fields
  const validateForm = () => {
    let isValid = true;
    for (let i = 0; i < steps.length - 1; i++) { // Exclude review step
      if (!validateStep(i)) {
        isValid = false;
      }
    }
    return isValid;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Form validation failed',
        description: 'Please check all sections for errors',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }
    
    if (!address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to submit your application',
        status: 'warning',
        duration: 5000,
        isClosable: true
      });
      return;
    }

    try {
      setLoading(true);
      
      // Convert grantId to number
      const grantIdNumber = parseInt(grantId, 10);
      
      // Create structured JSON proposal
      const proposal = JSON.stringify({
        projectTitle: formData.projectTitle,
        projectSummary: formData.projectSummary,
        objectives: formData.objectives,
        methodology: formData.methodology,
        targetBeneficiaries: formData.targetBeneficiaries,
        beneficiaryCount: formData.beneficiaryCount,
        implementationStrategy: formData.implementationStrategy,
        sustainabilityPlan: formData.sustainabilityPlan,
        monitoringEvaluation: formData.monitoringEvaluation,
        riskMitigation: formData.riskMitigation,
        timeline: formData.timeline,
        milestones: formData.milestones,
        budget: formData.budget,
        projectDuration: formData.projectDuration,
        additionalInfo: formData.additionalInfo,
        organizationName: formData.organizationName,
        contactPerson: formData.contactPerson,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        applicantAddress: address,
        submissionDate: new Date().toISOString()
      });
      
      toast({
        title: 'Submitting application',
        description: 'Please confirm the transaction in your wallet',
        status: 'info',
        duration: null,
        isClosable: false,
        position: 'top-right',
      });
      
      // Submit application using the useGrantManagement hook
      await applyForGrant(grantIdNumber, proposal);

    } catch (error) {
      console.error('Error applying for grant:', error);
      toast.closeAll();
      toast({
        title: 'Error submitting application',
        description: error.reason || error.message || 'Failed to submit application',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  // Check for expired grants
  useEffect(() => {
    if (grantDetails && grantDetails.isExpired) {
      toast({
        title: 'Grant Expired',
        description: 'This grant is no longer accepting applications',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      
      setTimeout(() => {
        navigate(`/grants/${grantId}`);
      }, 3000);
    }
  }, [grantDetails, grantId, navigate, toast]);

  // Generate proposal summary for review step
  const renderReviewSection = () => {
    return (
      <VStack spacing={6} align="stretch">
        <Box p={5} bg={infoBackground} borderRadius="md" boxShadow="sm">
          <Text fontWeight="bold" fontSize="lg" mb={3}>Application Summary</Text>
          
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontWeight="bold" color="gray.500" fontSize="sm">PROJECT TITLE</Text>
              <Text>{formData.projectTitle}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" color="gray.500" fontSize="sm">PROJECT SUMMARY</Text>
              <Text>{formData.projectSummary}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" color="gray.500" fontSize="sm">OBJECTIVES</Text>
              <Text>{formData.objectives}</Text>
            </Box>
            
            <HStack>
              <Box flex="1">
                <Text fontWeight="bold" color="gray.500" fontSize="sm">PROJECT DURATION</Text>
                <Text>{formData.projectDuration} months</Text>
              </Box>
              
              <Box flex="1">
                <Text fontWeight="bold" color="gray.500" fontSize="sm">BENEFICIARY COUNT</Text>
                <Text>{formData.beneficiaryCount}</Text>
              </Box>
            </HStack>
          </VStack>
        </Box>
        
        <VStack spacing={4} align="stretch">
          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="sm">IMPLEMENTATION STRATEGY</Text>
            <Text>{formData.implementationStrategy}</Text>
          </Box>
          
          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="sm">SUSTAINABILITY PLAN</Text>
            <Text>{formData.sustainabilityPlan}</Text>
          </Box>
          
          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="sm">BUDGET</Text>
            <Text whiteSpace="pre-line">{formData.budget}</Text>
          </Box>
        </VStack>
        
        {grantDetails && (
          <Alert status="info" variant="subtle" colorScheme="blue">
            <AlertIcon />
            <Box>
              <AlertTitle fontWeight="bold">Ready to submit?</AlertTitle>
              <AlertDescription>
                You're applying for "{grantDetails.title}" with a maximum funding of {grantDetails.amount} SONIC.
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </VStack>
    );
  };

  // Render Project Info form
  const renderProjectInfoForm = () => {
    return (
      <VStack spacing={6} align="stretch">
        <FormControl isRequired isInvalid={!!formErrors.projectTitle}>
          <FormLabel fontWeight="bold">Project Title</FormLabel>
          <Input
            name="projectTitle"
            value={formData.projectTitle}
            onChange={handleChange}
            placeholder="Enter a clear, descriptive title for your project"
          />
          <FormErrorMessage>{formErrors.projectTitle}</FormErrorMessage>
        </FormControl>
        
        <FormControl isRequired isInvalid={!!formErrors.projectSummary}>
          <FormLabel fontWeight="bold">Project Summary</FormLabel>
          <Textarea
            name="projectSummary"
            value={formData.projectSummary}
            onChange={handleChange}
            placeholder="Provide a brief overview of your project, its purpose, and its expected impact"
            minH="150px"
          />
          <FormHelperText>
            Minimum 100 characters. Summarize your project's main goals and impact.
          </FormHelperText>
          <FormErrorMessage>{formErrors.projectSummary}</FormErrorMessage>
        </FormControl>
        
        <FormControl isRequired isInvalid={!!formErrors.objectives}>
          <FormLabel fontWeight="bold">Project Objectives</FormLabel>
          <Textarea
            name="objectives"
            value={formData.objectives}
            onChange={handleChange}
            placeholder="List the specific, measurable objectives of your project"
            minH="120px"
          />
          <FormErrorMessage>{formErrors.objectives}</FormErrorMessage>
        </FormControl>
        
        <FormControl>
          <FormLabel fontWeight="bold">Background & Context</FormLabel>
          <Textarea
            name="background"
            value={formData.background}
            onChange={handleChange}
            placeholder="Describe the background, context, and needs addressed by this project"
            minH="120px"
          />
        </FormControl>
        
        <FormControl isRequired isInvalid={!!formErrors.targetBeneficiaries}>
          <FormLabel fontWeight="bold">Target Beneficiaries</FormLabel>
          <Textarea
            name="targetBeneficiaries"
            value={formData.targetBeneficiaries}
            onChange={handleChange}
            placeholder="Describe who will benefit from this project and how they will be selected"
          />
          <FormErrorMessage>{formErrors.targetBeneficiaries}</FormErrorMessage>
        </FormControl>
        
        <FormControl>
          <FormLabel fontWeight="bold">Estimated Number of Beneficiaries</FormLabel>
          <NumberInput
            min={0}
            value={formData.beneficiaryCount}
            onChange={(value) => handleNumberChange('beneficiaryCount', value)}
          >
            <NumberInputField 
              placeholder="Enter estimated number of people who will benefit"
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        
        <FormControl>
          <FormLabel fontWeight="bold">Organization Name</FormLabel>
          <Input
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            placeholder="Name of your organization (if applicable)"
          />
        </FormControl>
        
        <FormControl>
          <FormLabel fontWeight="bold">Contact Person</FormLabel>
          <Input
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            placeholder="Name of primary contact person"
          />
        </FormControl>
        
        <HStack spacing={4}>
          <FormControl>
            <FormLabel fontWeight="bold">Email</FormLabel>
            <Input
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="Contact email address"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel fontWeight="bold">Phone</FormLabel>
            <Input
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="Contact phone number"
            />
          </FormControl>
        </HStack>
      </VStack>
    );
  };

  // Render Implementation form
  const renderImplementationForm = () => {
    return (
      <VStack spacing={6} align="stretch">
        <FormControl isRequired isInvalid={!!formErrors.methodology}>
          <FormLabel fontWeight="bold">Methodology</FormLabel>
          <Textarea
            name="methodology"
            value={formData.methodology}
            onChange={handleChange}
            placeholder="Describe the approaches, methods and techniques you will use"
            minH="120px"
          />
          <FormErrorMessage>{formErrors.methodology}</FormErrorMessage>
        </FormControl>
        
        <FormControl isRequired isInvalid={!!formErrors.implementationStrategy}>
          <FormLabel fontWeight="bold">Implementation Strategy</FormLabel>
          <Textarea
            name="implementationStrategy"
            value={formData.implementationStrategy}
            onChange={handleChange}
            placeholder="Explain your step-by-step strategy for implementing the project"
            minH="120px"
          />
          <FormErrorMessage>{formErrors.implementationStrategy}</FormErrorMessage>
        </FormControl>
        
        <FormControl>
          <FormLabel fontWeight="bold">Monitoring & Evaluation Plan</FormLabel>
          <Textarea
            name="monitoringEvaluation"
            value={formData.monitoringEvaluation}
            onChange={handleChange}
            placeholder="Describe how you will monitor progress and evaluate results"
            minH="120px"
          />
        </FormControl>
        
        <FormControl isRequired isInvalid={!!formErrors.sustainabilityPlan}>
          <FormLabel fontWeight="bold">Sustainability Plan</FormLabel>
          <Textarea
            name="sustainabilityPlan"
            value={formData.sustainabilityPlan}
            onChange={handleChange}
            placeholder="Explain how the project will be sustained beyond the grant period"
            minH="120px"
          />
          <FormErrorMessage>{formErrors.sustainabilityPlan}</FormErrorMessage>
        </FormControl>
        
        <FormControl isRequired isInvalid={!!formErrors.riskMitigation}>
          <FormLabel fontWeight="bold">Risk Assessment & Mitigation</FormLabel>
          <Textarea
            name="riskMitigation"
            value={formData.riskMitigation}
            onChange={handleChange}
            placeholder="Identify potential risks and your strategies to mitigate them"
            minH="120px"
          />
          <FormErrorMessage>{formErrors.riskMitigation}</FormErrorMessage>
        </FormControl>
        
        <FormControl>
          <FormLabel fontWeight="bold">Previous Experience</FormLabel>
          <Textarea
            name="previousExperience"
            value={formData.previousExperience}
            onChange={handleChange}
            placeholder="Describe relevant experience that demonstrates your capability to implement this project"
            minH="120px"
          />
        </FormControl>
        
        <FormControl>
          <FormLabel fontWeight="bold">Team Members</FormLabel>
          <Textarea
            name="teamMembers"
            value={formData.teamMembers}
            onChange={handleChange}
            placeholder="List key team members and their roles/qualifications"
          />
        </FormControl>
      </VStack>
    );
  };

  // Render Budget & Timeline form
  const renderBudgetTimelineForm = () => {
    return (
      <VStack spacing={6} align="stretch">
        <FormControl isRequired isInvalid={!!formErrors.budget}>
          <FormLabel fontWeight="bold">Budget Breakdown</FormLabel>
          <Textarea
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="Provide a detailed breakdown of your budget, including line items and amounts"
            minH="200px"
          />
          <FormHelperText>
            Format as line items with estimated costs. Be as specific as possible.
          </FormHelperText>
          <FormErrorMessage>{formErrors.budget}</FormErrorMessage>
        </FormControl>
        
        <FormControl isRequired isInvalid={!!formErrors.projectDuration}>
          <FormLabel fontWeight="bold">Project Duration (months)</FormLabel>
          <NumberInput
            min={1}
            max={36}
            value={formData.projectDuration}
            onChange={(value) => handleNumberChange('projectDuration', value)}
          >
            <NumberInputField 
              placeholder="Enter project duration in months"
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormErrorMessage>{formErrors.projectDuration}</FormErrorMessage>
        </FormControl>
        
        <FormControl isRequired isInvalid={!!formErrors.timeline}>
          <FormLabel fontWeight="bold">Project Timeline</FormLabel>
          <Textarea
            name="timeline"
            value={formData.timeline}
            onChange={handleChange}
            placeholder="Outline the timeline for your project with key activities and dates"
            minH="150px"
          />
          <FormErrorMessage>{formErrors.timeline}</FormErrorMessage>
        </FormControl>
        
        <FormControl isRequired isInvalid={!!formErrors.milestones}>
          <FormLabel fontWeight="bold">Key Milestones</FormLabel>
          <Textarea
            name="milestones"
            value={formData.milestones}
            onChange={handleChange}
            placeholder="List key milestones and deliverables with their expected completion dates"
            minH="150px"
          />
          <FormErrorMessage>{formErrors.milestones}</FormErrorMessage>
        </FormControl>
        
        <FormControl>
          <FormLabel fontWeight="bold">Additional Information</FormLabel>
          <Textarea
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            placeholder="Any additional information relevant to your application"
            minH="120px"
          />
        </FormControl>
      </VStack>
    );
  };

  if (loadingGrant) {
    return (
      <Box maxW="800px" mx="auto" p={5}>
        <Text textAlign="center">Loading grant details...</Text>
      </Box>
    );
  }

  if (!grantDetails) {
    return (
      <Box maxW="800px" mx="auto" p={5}>
        <Text textAlign="center">Grant not found or unavailable.</Text>
      </Box>
    );
  }

  return (
    <Box maxW="800px" mx="auto" p={5}>
      <Card
        bg={formBackground}
        borderRadius="lg"
        boxShadow="lg"
        mb={6}
        border="1px"
        borderColor={borderColor}
      >
        <CardHeader bg={headerBg} borderTopRadius="lg" p={5}>
          <Heading as="h1" size="lg">Apply for Grant: {grantDetails.title}</Heading>
          <HStack mt={2} spacing={4}>
            <Badge colorScheme="purple">Amount: {grantDetails.amount} ETH</Badge>
            <Badge colorScheme={grantDetails.isExpired ? "red" : "green"}>
              Deadline: {grantDetails.deadline}
            </Badge>
          </HStack>
        </CardHeader>
        
        <CardBody p={0}>
          <Box px={5} py={4}>
            <Progress
              value={calculateProgress()}
              size="sm"
              colorScheme="blue"
              borderRadius="full"
              mb={6}
            />
            
            <Stepper index={activeStep} mb={6} size={{ base: 'sm', md: 'md' }}>
              {steps.map((step, index) => (
                <Step key={index} onClick={() => index < activeStep && setActiveStep(index)}>
                  <StepIndicator>
                    <StepStatus
                      complete={<StepIcon />}
                      incomplete={<StepNumber />}
                      active={<StepNumber />}
                    />
                  </StepIndicator>
                  
                  <Box flexShrink="0" display={{ base: index === activeStep ? 'block' : 'none', md: 'block' }}>
                    <StepTitle>{step.title}</StepTitle>
                    <StepDescription display={{ base: 'none', md: 'block' }}>{step.description}</StepDescription>
                  </Box>
                  
                  <StepSeparator />
                </Step>
              ))}
            </Stepper>
            
            <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : (e) => e.preventDefault()}>
              {activeStep === 0 && renderProjectInfoForm()}
              {activeStep === 1 && renderImplementationForm()}
              {activeStep === 2 && renderBudgetTimelineForm()}
              {activeStep === 3 && renderReviewSection()}
              
              <Divider my={6} />
              
              <HStack justifyContent="space-between" width="100%">
                {activeStep > 0 ? (
                  <Button
                    onClick={goToPrevious}
                    leftIcon={<ChevronLeftIcon />}
                    variant="outline"
                    isDisabled={loading || isPending}
                  >
                    Previous
                  </Button>
                ) : (
                  <Box></Box>
                )}
                
                {activeStep < steps.length - 1 ? (
                  <Button
                    onClick={goToNextStep}
                    rightIcon={<ArrowForwardIcon />}
                    colorScheme="blue"
                    isDisabled={loading || isPending}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    colorScheme="green"
                    isLoading={loading || isPending || isTransactionLoading}
                    loadingText="Submitting"
                    rightIcon={<CheckIcon />}
                  >
                    Submit Application
                  </Button>
                )}
              </HStack>
            </form>
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
};

export default GrantApplicationForm;