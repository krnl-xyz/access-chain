import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  FormErrorMessage,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Heading,
  useToast,
  InputGroup,
  InputRightAddon,
  Container,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Divider,
  HStack,
  Text,
  Tooltip,
  Icon,
  useColorModeValue,
  Badge,
  InputLeftElement,
  Progress,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
  Flex,
  SimpleGrid,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  FormHelperText,
  Stack,
  Switch,
  Checkbox,
  IconButton,
  useDisclosure,
  Collapse
} from '@chakra-ui/react';
import { 
  ChevronLeftIcon, 
  InfoIcon, 
  AddIcon, 
  CheckIcon, 
  QuestionIcon, 
  CalendarIcon, 
  EditIcon,
  WarningIcon,
  CheckCircleIcon,
  ArrowForwardIcon,
  ChevronDownIcon
} from '@chakra-ui/icons';
import { useGrantManagement } from '../hooks/useGrantManagement';

const GRANT_CATEGORIES = [
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'environment', label: 'Environment' },
  { value: 'technology', label: 'Technology' },
  { value: 'social', label: 'Social Services' },
  { value: 'arts', label: 'Arts & Culture' },
  { value: 'research', label: 'Research & Development' },
  { value: 'other', label: 'Other' }
];

// Form steps
const steps = [
  { title: 'Basic Info', description: 'Grant details' },
  { title: 'Requirements', description: 'Eligibility criteria' },
  { title: 'Review', description: 'Confirm details' }
];

const CreateGrantForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: isAdvancedOpen, onToggle: onAdvancedToggle } = useDisclosure();
  const { activeStep, goToNext, goToPrevious, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });
  
  const {
    createGrant,
    isPending,
    isSuccess,
    error,
    isAuthorizedNGO,
    isLoadingNgoStatus,
    isCorrectNetwork,
  } = useGrantManagement();

  // Color mode values for better UI
  const formBackground = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const tooltipBg = useColorModeValue('gray.700', 'gray.200');
  const tooltipColor = useColorModeValue('white', 'gray.800');
  const tagBg = useColorModeValue('blue.50', 'blue.900');
  const stepperActiveBg = useColorModeValue('blue.500', 'blue.300');
  const infoBackground = useColorModeValue('blue.50', 'blue.900');
  const highEmphasisText = useColorModeValue('gray.800', 'white');

  // Enhanced form data with more fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    deadlineDate: '',
    category: '',
    minQualificationScore: '70',
    maxApplicants: '',
    tags: [],
    requirements: '',
    impactDescription: '',
    expectedOutcomes: '',
    applicationProcess: 'Applicants will submit proposals that will be reviewed by our team.',
    customTag: '',
    allowPartialFunding: false
  });

  // Form errors state
  const [formErrors, setFormErrors] = useState({});
  
  // Track form completion progress
  const calculateProgress = () => {
    // Basic fields that are required
    const requiredFields = ['title', 'description', 'amount', 'deadlineDate', 'category'];
    const completedFields = requiredFields.filter(field => formData[field] && formData[field].trim() !== '');
    return (completedFields.length / requiredFields.length) * 100;
  };

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

  const handleAmountChange = (valueString) => {
    setFormData({
      ...formData,
      amount: valueString
    });
    
    if (formErrors.amount) {
      setFormErrors({
        ...formErrors,
        amount: ''
      });
    }
  };
  
  const handleCategoryChange = (e) => {
    setFormData({
      ...formData,
      category: e.target.value
    });
    
    if (formErrors.category) {
      setFormErrors({
        ...formErrors,
        category: ''
      });
    }
  };
  
  const handleTagAdd = () => {
    if (!formData.customTag || formData.tags.includes(formData.customTag)) {
      return;
    }
    
    setFormData({
      ...formData,
      tags: [...formData.tags, formData.customTag],
      customTag: ''
    });
  };
  
  const handleTagRemove = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      if (!formData.title.trim()) {
        errors.title = 'Title is required';
      }
      
      if (!formData.description.trim()) {
        errors.description = 'Description is required';
      } else if (formData.description.trim().length < 50) {
        errors.description = 'Description should be at least 50 characters';
      }
      
      if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
        errors.amount = 'Amount must be a positive number';
      }
      
      if (!formData.deadlineDate) {
        errors.deadlineDate = 'Deadline is required';
      } else {
        const deadlineTimestamp = new Date(formData.deadlineDate).getTime() / 1000;
        if (deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
          errors.deadlineDate = 'Deadline must be in the future';
        }
      }
      
      if (!formData.category) {
        errors.category = 'Please select a category';
      }
    }
    
    if (step === 1) {
      // Validate requirements
      if (formData.maxApplicants && (isNaN(Number(formData.maxApplicants)) || Number(formData.maxApplicants) <= 0)) {
        errors.maxApplicants = 'Max applicants must be a positive number';
      }
      
      if (formData.minQualificationScore && (isNaN(Number(formData.minQualificationScore)) || Number(formData.minQualificationScore) < 0 || Number(formData.minQualificationScore) > 100)) {
        errors.minQualificationScore = 'Score must be between 0 and 100';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const goToNextStep = () => {
    if (validateStep(activeStep)) {
      goToNext();
    }
  };

  const validateForm = () => {
    return validateStep(0) && validateStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Form validation failed',
        description: 'Please check the form for errors',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }
    
    // Calculate UNIX timestamp from date input
    const deadlineDate = new Date(formData.deadlineDate);
    
    // Make sure the deadline is at least 1 day in the future
    const minDeadline = new Date();
    minDeadline.setDate(minDeadline.getDate() + 1);
    
    if (deadlineDate < minDeadline) {
      setFormErrors(prev => ({
        ...prev,
        deadlineDate: 'Deadline must be at least 1 day in the future'
      }));
      return;
    }
    
    const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000);
    
    try {
      // Format the amount to ensure it's a string with at most 18 decimal places
      const amount = parseFloat(formData.amount).toString();
      
      // Create enhanced metadata (will be used by smart contract)
      const metadata = {
        category: formData.category,
        tags: formData.tags,
        requirements: formData.requirements,
        impactDescription: formData.impactDescription,
        expectedOutcomes: formData.expectedOutcomes,
        applicationProcess: formData.applicationProcess,
        minQualificationScore: formData.minQualificationScore,
        maxApplicants: formData.maxApplicants || 'unlimited',
        allowPartialFunding: formData.allowPartialFunding
      };
      
      // Show loading toast
      toast({
        title: 'Creating grant...',
        description: 'Please confirm the transaction in your wallet',
        status: 'info',
        duration: null,
        isClosable: false,
        position: 'top-right',
      });
      
      await createGrant({
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount: amount,
        deadline: deadlineTimestamp,
        metadata: JSON.stringify(metadata)
      });
      
      // Transaction submitted, wait for confirmation
    } catch (error) {
      console.error('Grant creation error:', error);
      toast.closeAll();
      toast({
        title: 'Error creating grant',
        description: error.message || 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  // Show success toast when transaction is successful
  React.useEffect(() => {
    if (isSuccess) {
      toast.closeAll();
      toast({
        title: 'Grant created!',
        description: 'Your grant has been successfully created',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        amount: '',
        deadlineDate: '',
        category: '',
        minQualificationScore: '70',
        maxApplicants: '',
        tags: [],
        requirements: '',
        impactDescription: '',
        expectedOutcomes: '',
        applicationProcess: 'Applicants will submit proposals that will be reviewed by our team.',
        customTag: '',
        allowPartialFunding: false
      });
      
      // Redirect to grants page after success
      setTimeout(() => {
        navigate('/grants');
      }, 2000);
    }
  }, [isSuccess, toast, navigate]);

  // Generate summary for review step
  const renderSummary = () => {
    return (
      <VStack spacing={4} align="stretch">
        <Box p={4} borderRadius="md" bg={infoBackground}>
          <SimpleGrid columns={[1, null, 2]} spacing={4}>
            <Box>
              <Text fontWeight="bold" fontSize="sm" color="gray.500">GRANT TITLE</Text>
              <Text fontSize="md" fontWeight="500">{formData.title}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" fontSize="sm" color="gray.500">AMOUNT</Text>
              <Text fontSize="md" fontWeight="500">{formData.amount} SONIC</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" fontSize="sm" color="gray.500">CATEGORY</Text>
              <Text fontSize="md" fontWeight="500">{GRANT_CATEGORIES.find(cat => cat.value === formData.category)?.label || formData.category}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" fontSize="sm" color="gray.500">DEADLINE</Text>
              <Text fontSize="md" fontWeight="500">{new Date(formData.deadlineDate).toLocaleString()}</Text>
            </Box>
            {formData.tags.length > 0 && (
              <Box gridColumn={[null, null, "1 / span 2"]}>
                <Text fontWeight="bold" fontSize="sm" color="gray.500">TAGS</Text>
                <HStack mt={1} flexWrap="wrap">
                  {formData.tags.map(tag => (
                    <Tag key={tag} size="sm" colorScheme="blue" borderRadius="full">{tag}</Tag>
                  ))}
                </HStack>
              </Box>
            )}
          </SimpleGrid>
        </Box>

        <Box>
          <Text fontWeight="bold" fontSize="sm" color="gray.500">DESCRIPTION</Text>
          <Text fontSize="md">{formData.description}</Text>
        </Box>

        {formData.requirements && (
          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.500">REQUIREMENTS</Text>
            <Text fontSize="md">{formData.requirements}</Text>
          </Box>
        )}

        {formData.impactDescription && (
          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.500">EXPECTED IMPACT</Text>
            <Text fontSize="md">{formData.impactDescription}</Text>
          </Box>
        )}

        <Alert status="info" borderRadius="md" bg={infoBackground} border="1px solid" borderColor="blue.200">
          <AlertIcon />
          <Box>
            <AlertTitle fontWeight="bold">Ready to submit?</AlertTitle>
            <AlertDescription>
              Please review all details before creating your grant. Once submitted, some details cannot be changed.
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    );
  };
  
  // Render basic information step form
  const renderBasicInfoForm = () => {
    return (
      <VStack spacing={6} align="stretch">
        <FormControl isInvalid={!!formErrors.title} isRequired>
          <FormLabel fontWeight="bold">
            <HStack>
              <Text>Grant Title</Text>
              <Tooltip 
                label="A clear, descriptive title for your grant opportunity" 
                bg={tooltipBg} 
                color={tooltipColor}
              >
                <InfoIcon color="gray.400" />
              </Tooltip>
            </HStack>
          </FormLabel>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="E.g., Clean Water Initiative 2025"
            size="lg"
            focusBorderColor="blue.400"
          />
          <FormErrorMessage>{formErrors.title}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!formErrors.description} isRequired>
          <FormLabel fontWeight="bold">
            <HStack>
              <Text>Description</Text>
              <Tooltip 
                label="Detailed explanation of the grant purpose, eligibility, and expected outcomes" 
                bg={tooltipBg} 
                color={tooltipColor}
              >
                <InfoIcon color="gray.400" />
              </Tooltip>
            </HStack>
          </FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the purpose of this grant, who can apply, and what the expected outcomes are..."
            size="lg"
            minH="150px"
            focusBorderColor="blue.400"
          />
          <FormHelperText>
            Minimum 50 characters. Be specific about the purpose, impact, and ideal recipients.
          </FormHelperText>
          <FormErrorMessage>{formErrors.description}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!formErrors.category} isRequired>
          <FormLabel fontWeight="bold">
            <HStack>
              <Text>Category</Text>
              <Tooltip 
                label="The main focus area of this grant" 
                bg={tooltipBg} 
                color={tooltipColor}
              >
                <InfoIcon color="gray.400" />
              </Tooltip>
            </HStack>
          </FormLabel>
          <Select
            name="category"
            value={formData.category}
            onChange={handleCategoryChange}
            placeholder="Select a category"
            size="lg"
            focusBorderColor="blue.400"
          >
            {GRANT_CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{formErrors.category}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!formErrors.amount} isRequired>
          <FormLabel fontWeight="bold">
            <HStack>
              <Text>Grant Amount</Text>
              <Tooltip 
                label="The total amount of funding available for this grant" 
                bg={tooltipBg} 
                color={tooltipColor}
              >
                <InfoIcon color="gray.400" />
              </Tooltip>
            </HStack>
          </FormLabel>
          <InputGroup size="lg">
            <InputLeftElement
              pointerEvents="none"
              color="gray.500"
              fontSize="1.2em"
              children="Ξ"
            />
            <NumberInput
              min={0}
              value={formData.amount}
              onChange={handleAmountChange}
              w="100%"
              precision={4}
            >
              <NumberInputField
                name="amount"
                placeholder="0.0000"
                pl={10}
                focusBorderColor="blue.400"
              />
            </NumberInput>
            <InputRightAddon children="SONIC" />
          </InputGroup>
          <FormErrorMessage>{formErrors.amount}</FormErrorMessage>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Enter the total funding amount in SONIC tokens
          </Text>
        </FormControl>

        <FormControl isInvalid={!!formErrors.deadlineDate} isRequired>
          <FormLabel fontWeight="bold">
            <HStack>
              <Text>Application Deadline</Text>
              <Tooltip 
                label="The date and time when applications will close" 
                bg={tooltipBg} 
                color={tooltipColor}
              >
                <InfoIcon color="gray.400" />
              </Tooltip>
            </HStack>
          </FormLabel>
          <InputGroup size="lg">
            <InputLeftElement
              pointerEvents="none"
              color="gray.500"
              children={<CalendarIcon />}
            />
            <Input
              name="deadlineDate"
              type="datetime-local"
              value={formData.deadlineDate}
              onChange={handleChange}
              pl={10}
              focusBorderColor="blue.400"
            />
          </InputGroup>
          <FormErrorMessage>{formErrors.deadlineDate}</FormErrorMessage>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Applications will be accepted until this date and time
          </Text>
        </FormControl>

        <FormControl>
          <FormLabel fontWeight="bold">
            <HStack>
              <Text>Tags (Optional)</Text>
              <Tooltip 
                label="Keywords that help categorize your grant" 
                bg={tooltipBg} 
                color={tooltipColor}
              >
                <InfoIcon color="gray.400" />
              </Tooltip>
            </HStack>
          </FormLabel>
          <InputGroup size="md">
            <Input
              name="customTag"
              value={formData.customTag}
              onChange={handleChange}
              placeholder="Add keyword tags (e.g., 'sustainability', 'youth')"
              focusBorderColor="blue.400"
            />
            <InputRightAddon
              children={<IconButton 
                icon={<AddIcon />} 
                size="sm" 
                variant="ghost" 
                onClick={handleTagAdd}
                aria-label="Add tag"
              />}
            />
          </InputGroup>
          <Box mt={2}>
            <HStack spacing={2} flexWrap="wrap">
              {formData.tags.map(tag => (
                <Tag 
                  key={tag} 
                  size="md" 
                  borderRadius="full" 
                  variant="subtle" 
                  colorScheme="blue"
                  mb={2}
                >
                  <TagLabel>{tag}</TagLabel>
                  <TagCloseButton onClick={() => handleTagRemove(tag)} />
                </Tag>
              ))}
            </HStack>
          </Box>
          <FormHelperText>
            Tags help potential applicants discover your grant
          </FormHelperText>
        </FormControl>
      </VStack>
    );
  };
  
  // Render requirements step form
  const renderRequirementsForm = () => {
    return (
      <VStack spacing={6} align="stretch">
        <FormControl>
          <FormLabel fontWeight="bold">
            <HStack>
              <Text>Eligibility Requirements</Text>
              <Tooltip 
                label="Specific qualifications applicants must meet" 
                bg={tooltipBg} 
                color={tooltipColor}
              >
                <InfoIcon color="gray.400" />
              </Tooltip>
            </HStack>
          </FormLabel>
          <Textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            placeholder="Describe who can apply for this grant and any prerequisites..."
            size="md"
            minH="120px"
            focusBorderColor="blue.400"
          />
          <FormHelperText>
            Clearly outline any eligibility criteria such as location, organization type, or other requirements
          </FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel fontWeight="bold">
            <HStack>
              <Text>Expected Impact</Text>
              <Tooltip 
                label="The intended effect of the funded project" 
                bg={tooltipBg} 
                color={tooltipColor}
              >
                <InfoIcon color="gray.400" />
              </Tooltip>
            </HStack>
          </FormLabel>
          <Textarea
            name="impactDescription"
            value={formData.impactDescription}
            onChange={handleChange}
            placeholder="Describe the positive impact you expect this grant to achieve..."
            size="md"
            minH="120px"
            focusBorderColor="blue.400"
          />
        </FormControl>

        <FormControl>
          <FormLabel fontWeight="bold">
            <HStack>
              <Text>Expected Outcomes</Text>
              <Tooltip 
                label="Specific, measurable results expected from the project" 
                bg={tooltipBg} 
                color={tooltipColor}
              >
                <InfoIcon color="gray.400" />
              </Tooltip>
            </HStack>
          </FormLabel>
          <Textarea
            name="expectedOutcomes"
            value={formData.expectedOutcomes}
            onChange={handleChange}
            placeholder="List specific, measurable outcomes that you expect from successful applicants..."
            size="md"
            minH="120px"
            focusBorderColor="blue.400"
          />
        </FormControl>
        
        <Divider my={2} />

        <HStack justify="flex-end">
          <Button
            rightIcon={<ChevronDownIcon />}
            variant="ghost" 
            colorScheme="blue"
            onClick={onAdvancedToggle}
          >
            {isAdvancedOpen ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
          </Button>
        </HStack>

        <Collapse in={isAdvancedOpen} animateOpacity>
          <VStack spacing={6} align="stretch" p={4} bg="gray.50" borderRadius="md" _dark={{ bg: 'gray.700' }}>
            <FormControl isInvalid={!!formErrors.minQualificationScore}>
              <FormLabel fontWeight="bold">
                <HStack>
                  <Text>Minimum Qualification Score</Text>
                  <Tooltip 
                    label="Threshold score (0-100) applicants must meet" 
                    bg={tooltipBg} 
                    color={tooltipColor}
                  >
                    <InfoIcon color="gray.400" />
                  </Tooltip>
                </HStack>
              </FormLabel>
              <NumberInput
                min={0}
                max={100}
                value={formData.minQualificationScore}
                onChange={(value) => setFormData({...formData, minQualificationScore: value})}
                size="md"
              >
                <NumberInputField
                  name="minQualificationScore"
                  placeholder="70"
                  focusBorderColor="blue.400"
                />
              </NumberInput>
              <FormErrorMessage>{formErrors.minQualificationScore}</FormErrorMessage>
              <FormHelperText>
                Applicants must achieve this minimum score to be considered (0-100)
              </FormHelperText>
            </FormControl>

            <FormControl isInvalid={!!formErrors.maxApplicants}>
              <FormLabel fontWeight="bold">
                <HStack>
                  <Text>Maximum Number of Applicants</Text>
                  <Tooltip 
                    label="Limit on the number of applications allowed" 
                    bg={tooltipBg} 
                    color={tooltipColor}
                  >
                    <InfoIcon color="gray.400" />
                  </Tooltip>
                </HStack>
              </FormLabel>
              <NumberInput
                min={0}
                value={formData.maxApplicants}
                onChange={(value) => setFormData({...formData, maxApplicants: value})}
                size="md"
              >
                <NumberInputField
                  name="maxApplicants"
                  placeholder="Leave blank for unlimited"
                  focusBorderColor="blue.400"
                />
              </NumberInput>
              <FormErrorMessage>{formErrors.maxApplicants}</FormErrorMessage>
              <FormHelperText>
                Leave blank if you want to accept unlimited applications
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="bold">
                <HStack>
                  <Text>Application Process</Text>
                  <Tooltip 
                    label="How applications will be evaluated" 
                    bg={tooltipBg} 
                    color={tooltipColor}
                  >
                    <InfoIcon color="gray.400" />
                  </Tooltip>
                </HStack>
              </FormLabel>
              <Textarea
                name="applicationProcess"
                value={formData.applicationProcess}
                onChange={handleChange}
                placeholder="Describe how applications will be evaluated and selected..."
                size="md"
                focusBorderColor="blue.400"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="bold">
                <HStack>
                  <Text>Allow Partial Funding</Text>
                  <Tooltip 
                    label="Enable partial grant funding if full amount cannot be awarded" 
                    bg={tooltipBg} 
                    color={tooltipColor}
                  >
                    <InfoIcon color="gray.400" />
                  </Tooltip>
                </HStack>
              </FormLabel>
              <Switch
                name="allowPartialFunding"
                isChecked={formData.allowPartialFunding}
                onChange={handleCheckboxChange}
                colorScheme="blue"
                size="lg"
              />
              <FormHelperText>
                If enabled, applicants may receive partial funding if the full amount cannot be awarded
              </FormHelperText>
            </FormControl>
          </VStack>
        </Collapse>
      </VStack>
    );
  };

  // Display different content based on user status
  if (isLoadingNgoStatus) {
    return (
      <Container maxW="4xl" py={8}>
        <Card variant="outline" borderColor={borderColor} boxShadow="md">
          <CardBody>
            <Alert status="info" variant="left-accent" borderRadius="md">
              <AlertIcon boxSize="6" />
              <Box>
                <AlertTitle fontSize="lg">Checking authorization...</AlertTitle>
                <AlertDescription>
                  Please wait while we verify your NGO status. This will only take a moment.
                </AlertDescription>
              </Box>
            </Alert>
          </CardBody>
        </Card>
      </Container>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <Container maxW="4xl" py={8}>
        <Card variant="outline" borderColor="orange.200" boxShadow="md">
          <CardBody>
            <Alert status="warning" variant="left-accent" borderRadius="md">
              <AlertIcon boxSize="6" />
              <Box>
                <AlertTitle fontSize="lg">Wrong Network</AlertTitle>
                <AlertDescription>
                  Please switch to Sonic Blaze Testnet in your wallet to create grants.
                </AlertDescription>
              </Box>
            </Alert>
            <Button 
              mt={4} 
              colorScheme="orange" 
              leftIcon={<ChevronLeftIcon />}
              onClick={() => navigate('/grants')}
            >
              Back to Grants
            </Button>
          </CardBody>
        </Card>
      </Container>
    );
  }

  if (!isAuthorizedNGO) {
    return (
      <Container maxW="4xl" py={8}>
        <Card variant="outline" borderColor="red.200" boxShadow="md">
          <CardBody>
            <Alert status="warning" variant="left-accent" borderRadius="md">
              <AlertIcon boxSize="6" />
              <Box>
                <AlertTitle fontSize="lg">Not Authorized</AlertTitle>
                <AlertDescription display="flex" flexDirection="column" gap={2}>
                  <Text>Only registered NGOs can create grants on AccessChain.</Text>
                  <Text>Please contact the administrator to register your organization.</Text>
                </AlertDescription>
              </Box>
            </Alert>
            <Button 
              mt={4} 
              colorScheme="blue" 
              variant="outline"
              leftIcon={<ChevronLeftIcon />}
              onClick={() => navigate('/grants')}
            >
              Browse Available Grants
            </Button>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={8}>
      <Button 
        mb={6} 
        leftIcon={<ChevronLeftIcon />} 
        variant="ghost"
        onClick={() => navigate('/grants')}
      >
        Back to Grants
      </Button>

      {/* Form Progress */}
      <Progress 
        value={calculateProgress()} 
        size="sm" 
        colorScheme="blue" 
        borderRadius="full" 
        mb={8}
        hasStripe={true}
      />

      <Card 
        variant="outline" 
        borderColor={borderColor} 
        boxShadow="lg" 
        borderRadius="lg" 
        overflow="hidden"
      >
        <CardHeader bg={headerBg} py={5}>
          <HStack spacing={2}>
            <Badge colorScheme="blue" fontSize="0.8em" px={2} py={1} borderRadius="md">
              NGO Access
            </Badge>
            <Heading as="h2" size="lg">
              Create New Grant
            </Heading>
          </HStack>
          <Text color="gray.600" mt={2}>
            Set up funding opportunities for your charitable initiatives
          </Text>
          
          {/* Stepper */}
          <Box mt={6}>
            <Stepper 
              index={activeStep} 
              colorScheme="blue"
              size="sm"
            >
              {steps.map((step, index) => (
                <Step key={index} onClick={() => validateStep(activeStep) && setActiveStep(index)}>
                  <StepIndicator>
                    <StepStatus
                      complete={<StepIcon />}
                      incomplete={<StepNumber />}
                      active={<StepNumber />}
                    />
                  </StepIndicator>

                  <Box flexShrink='0'>
                    <StepTitle>{step.title}</StepTitle>
                    <StepDescription>{step.description}</StepDescription>
                  </Box>

                  <StepSeparator />
                </Step>
              ))}
            </Stepper>
          </Box>
        </CardHeader>

        <CardBody p={6}>
          <form>
            {activeStep === 0 && renderBasicInfoForm()}
            {activeStep === 1 && renderRequirementsForm()}
            {activeStep === 2 && renderSummary()}
            
            {error && (
              <Alert status="error" borderRadius="md" mt={6}>
                <AlertIcon />
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardBody>
        
        <Divider />
        
        <CardFooter>
          <Flex justifyContent="space-between" width="100%">
            <Button
              variant="ghost"
              onClick={activeStep === 0 ? () => navigate('/grants') : goToPrevious}
              isDisabled={isPending}
            >
              {activeStep === 0 ? 'Cancel' : 'Back'}
            </Button>
            
            <HStack>
              {activeStep === steps.length - 1 ? (
                <Button
                  colorScheme="blue"
                  isLoading={isPending}
                  loadingText="Creating Grant..."
                  onClick={handleSubmit}
                  leftIcon={<CheckIcon />}
                  size="lg"
                  px={8}
                >
                  Create Grant
                </Button>
              ) : (
                <Button
                  colorScheme="blue"
                  onClick={goToNextStep}
                  rightIcon={<ArrowForwardIcon />}
                  variant="solid"
                >
                  Next Step
                </Button>
              )}
            </HStack>
          </Flex>
        </CardFooter>
      </Card>
    </Container>
  );
};

export default CreateGrantForm;