import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormHelperText,
  Heading,
  Input,
  Select,
  Text,
  Stack,
  VStack,
  HStack,
  Radio,
  RadioGroup,
  Textarea,
  Checkbox,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Progress,
  Divider,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FaUniversalAccess, FaFileAlt, FaCheck, FaWheelchair } from 'react-icons/fa';
import { useAccount } from 'wagmi';
import { useAccessibility } from '../../context/AccessibilityContext';

const DisabilityOnboarding = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { address, isConnected } = useAccount();
  const { registerDisability, updateAssistiveTechnologies, updateSetting } = useAccessibility();

  // Multi-step form state tracking
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    disabilityType: '',
    disabilityDetails: '',
    severity: 'moderate',
    assistiveTechnologies: [],
    accessibilityNeeds: {
      highContrast: false,
      largeText: false,
      screenReader: false,
      reduceMotion: false,
      keyboardOnly: false,
    },
    documentationType: '',
    hasDocumentation: false,
    additionalNeeds: '',
    consentToData: false,
    consentToNFT: false,
  });

  // Styling
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Handle general input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle accessibility needs changes
  const handleAccessibilityChange = (setting, value) => {
    setFormData(prev => ({
      ...prev,
      accessibilityNeeds: {
        ...prev.accessibilityNeeds,
        [setting]: value
      }
    }));
  };

  // Handle assistive technology selection
  const handleAssistiveTechChange = (tech) => {
    setFormData(prev => {
      const currentTech = [...prev.assistiveTechnologies];
      if (currentTech.includes(tech)) {
        return {
          ...prev,
          assistiveTechnologies: currentTech.filter(t => t !== tech)
        };
      } else {
        return {
          ...prev,
          assistiveTechnologies: [...currentTech, tech]
        };
      }
    });
  };

  // Final submission handler
  const handleSubmit = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to register your disability status',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!formData.consentToData) {
      toast({
        title: 'Consent required',
        description: 'Please provide consent for data processing before submitting',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      // In a real implementation, you would:
      // 1. Upload documentation to IPFS if available
      // 2. Store disability information on-chain or in a secure database
      // 3. Issue a verification request for the AccessNFT if consent given

      // For now, we'll simulate this process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update accessibility context
      registerDisability(formData.disabilityType, false); // Start as unverified
      updateAssistiveTechnologies(formData.assistiveTechnologies);
      
      // Apply accessibility settings based on user preferences
      Object.entries(formData.accessibilityNeeds).forEach(([setting, value]) => {
        updateSetting(setting, value);
      });

      toast({
        title: 'Registration successful',
        description: 'Your disability information has been submitted. You will be notified when verification is complete.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate('/profile');
    } catch (error) {
      console.error('Error submitting disability information:', error);
      toast({
        title: 'Submission error',
        description: error.message || 'An error occurred while submitting your information',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Step navigation
  const nextStep = () => {
    if (isStepValid()) {
      setStep(prev => prev + 1);
    } else {
      toast({
        title: 'Required information missing',
        description: 'Please fill in all required fields to continue',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const prevStep = () => setStep(prev => Math.max(1, prev - 1));

  // Validate current step
  const isStepValid = () => {
    switch (step) {
      case 1: // Disability information
        return !!formData.disabilityType;
      case 2: // Assistive technologies
        return true; // Optional step
      case 3: // Accessibility needs
        return true; // Optional step
      case 4: // Documentation and consent
        return true; // We'll check consent on final submit
      default:
        return false;
    }
  };

  // Render form steps
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Box bg={cardBg} p={6} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
            <VStack spacing={6} align="stretch">
              <Heading size="md">Disability Information</Heading>
              <Text>This information helps us match you with appropriate grants and customize your experience.</Text>
              
              <FormControl isRequired>
                <FormLabel htmlFor="disabilityType">Type of Disability</FormLabel>
                <Select
                  id="disabilityType"
                  name="disabilityType"
                  placeholder="Select disability type"
                  value={formData.disabilityType}
                  onChange={handleInputChange}
                >
                  <option value="visual">Visual Impairment</option>
                  <option value="hearing">Hearing Impairment</option>
                  <option value="mobility">Mobility/Physical Impairment</option>
                  <option value="cognitive">Cognitive Disability</option>
                  <option value="speech">Speech Disability</option>
                  <option value="neurological">Neurological Disability</option>
                  <option value="multiple">Multiple Disabilities</option>
                  <option value="other">Other</option>
                </Select>
                <FormHelperText>
                  Select the category that best describes your disability
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="disabilityDetails">Additional Details (Optional)</FormLabel>
                <Textarea
                  id="disabilityDetails"
                  name="disabilityDetails"
                  placeholder="Provide additional details about your disability"
                  value={formData.disabilityDetails}
                  onChange={handleInputChange}
                />
                <FormHelperText>
                  Sharing more information helps us better understand your specific needs
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="severity">Severity Level</FormLabel>
                <RadioGroup 
                  id="severity" 
                  name="severity"
                  value={formData.severity}
                  onChange={(val) => setFormData(prev => ({ ...prev, severity: val }))}
                >
                  <Stack direction="row" spacing={4}>
                    <Radio value="mild">Mild</Radio>
                    <Radio value="moderate">Moderate</Radio>
                    <Radio value="severe">Severe</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </VStack>
          </Box>
        );

      case 2:
        return (
          <Box bg={cardBg} p={6} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
            <VStack spacing={6} align="stretch">
              <Heading size="md">Assistive Technologies</Heading>
              <Text>Let us know which assistive technologies you use so we can optimize your experience.</Text>

              <FormControl>
                <FormLabel>Which assistive technologies do you use?</FormLabel>
                <Stack spacing={3}>
                  <Checkbox 
                    isChecked={formData.assistiveTechnologies.includes('screenReader')}
                    onChange={() => handleAssistiveTechChange('screenReader')}
                  >
                    Screen reader (e.g., JAWS, NVDA, VoiceOver)
                  </Checkbox>
                  <Checkbox 
                    isChecked={formData.assistiveTechnologies.includes('magnifier')}
                    onChange={() => handleAssistiveTechChange('magnifier')}
                  >
                    Screen magnifier
                  </Checkbox>
                  <Checkbox 
                    isChecked={formData.assistiveTechnologies.includes('voiceRecognition')}
                    onChange={() => handleAssistiveTechChange('voiceRecognition')}
                  >
                    Voice recognition software
                  </Checkbox>
                  <Checkbox 
                    isChecked={formData.assistiveTechnologies.includes('alternativeInput')}
                    onChange={() => handleAssistiveTechChange('alternativeInput')}
                  >
                    Alternative keyboard or input device
                  </Checkbox>
                  <Checkbox 
                    isChecked={formData.assistiveTechnologies.includes('switchDevice')}
                    onChange={() => handleAssistiveTechChange('switchDevice')}
                  >
                    Switch device
                  </Checkbox>
                  <Checkbox 
                    isChecked={formData.assistiveTechnologies.includes('brailleDisplay')}
                    onChange={() => handleAssistiveTechChange('brailleDisplay')}
                  >
                    Braille display
                  </Checkbox>
                  <Checkbox 
                    isChecked={formData.assistiveTechnologies.includes('hearingAid')}
                    onChange={() => handleAssistiveTechChange('hearingAid')}
                  >
                    Hearing aid or cochlear implant
                  </Checkbox>
                  <Checkbox 
                    isChecked={formData.assistiveTechnologies.includes('other')}
                    onChange={() => handleAssistiveTechChange('other')}
                  >
                    Other assistive technology
                  </Checkbox>
                </Stack>
              </FormControl>
            </VStack>
          </Box>
        );

      case 3:
        return (
          <Box bg={cardBg} p={6} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
            <VStack spacing={6} align="stretch">
              <Heading size="md">Accessibility Preferences</Heading>
              <Text>Choose how you'd like the AccessChain platform to adapt to your needs.</Text>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="highContrast" mb="0" flex="1">
                  High contrast mode
                </FormLabel>
                <Checkbox 
                  id="highContrast"
                  isChecked={formData.accessibilityNeeds.highContrast}
                  onChange={(e) => handleAccessibilityChange('highContrast', e.target.checked)}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="largeText" mb="0" flex="1">
                  Larger text
                </FormLabel>
                <Checkbox 
                  id="largeText"
                  isChecked={formData.accessibilityNeeds.largeText}
                  onChange={(e) => handleAccessibilityChange('largeText', e.target.checked)}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="screenReader" mb="0" flex="1">
                  Screen reader optimization
                </FormLabel>
                <Checkbox 
                  id="screenReader"
                  isChecked={formData.accessibilityNeeds.screenReader}
                  onChange={(e) => handleAccessibilityChange('screenReader', e.target.checked)}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="reduceMotion" mb="0" flex="1">
                  Reduce motion and animations
                </FormLabel>
                <Checkbox 
                  id="reduceMotion"
                  isChecked={formData.accessibilityNeeds.reduceMotion}
                  onChange={(e) => handleAccessibilityChange('reduceMotion', e.target.checked)}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="keyboardOnly" mb="0" flex="1">
                  Keyboard navigation only
                </FormLabel>
                <Checkbox 
                  id="keyboardOnly"
                  isChecked={formData.accessibilityNeeds.keyboardOnly}
                  onChange={(e) => handleAccessibilityChange('keyboardOnly', e.target.checked)}
                />
              </FormControl>
            </VStack>
          </Box>
        );

      case 4:
        return (
          <Box bg={cardBg} p={6} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
            <VStack spacing={6} align="stretch">
              <Heading size="md">Documentation & Consent</Heading>
              <Text>Optional documentation for verification and consent for data processing.</Text>

              <FormControl>
                <FormLabel>Do you have documentation of your disability?</FormLabel>
                <RadioGroup 
                  value={formData.hasDocumentation ? 'yes' : 'no'}
                  onChange={(val) => setFormData(prev => ({ 
                    ...prev, 
                    hasDocumentation: val === 'yes'
                  }))}
                >
                  <Stack direction="row" spacing={4}>
                    <Radio value="yes">Yes</Radio>
                    <Radio value="no">No</Radio>
                  </Stack>
                </RadioGroup>
                <FormHelperText>
                  Documentation helps with verification but is not required
                </FormHelperText>
              </FormControl>

              {formData.hasDocumentation && (
                <FormControl>
                  <FormLabel htmlFor="documentationType">Type of Documentation</FormLabel>
                  <Select
                    id="documentationType"
                    name="documentationType"
                    placeholder="Select document type"
                    value={formData.documentationType}
                    onChange={handleInputChange}
                  >
                    <option value="medical">Medical Certificate</option>
                    <option value="government">Government ID or Certificate</option>
                    <option value="educational">Educational Assessment</option>
                    <option value="insurance">Insurance Documentation</option>
                    <option value="other">Other Official Documentation</option>
                  </Select>
                  <FormHelperText>
                    You'll be guided on how to securely upload your documentation after registration
                  </FormHelperText>
                </FormControl>
              )}

              <FormControl>
                <FormLabel htmlFor="additionalNeeds">Additional Notes or Requirements</FormLabel>
                <Textarea
                  id="additionalNeeds"
                  name="additionalNeeds"
                  placeholder="Any other information you'd like to share about your accessibility needs"
                  value={formData.additionalNeeds}
                  onChange={handleInputChange}
                />
              </FormControl>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Privacy Notice</AlertTitle>
                  <AlertDescription>
                    Your privacy is important to us. Your information will only be used to:
                    <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                      <li>Customize your platform experience</li>
                      <li>Match you with relevant grants and resources</li>
                      <li>Verify eligibility for disability-specific opportunities</li>
                    </ul>
                  </AlertDescription>
                </Box>
              </Alert>

              <FormControl isRequired>
                <Checkbox 
                  id="consentToData"
                  name="consentToData"
                  isChecked={formData.consentToData}
                  onChange={handleInputChange}
                >
                  I consent to my disability information being processed for the purposes described above
                </Checkbox>
              </FormControl>

              <FormControl>
                <Checkbox 
                  id="consentToNFT"
                  name="consentToNFT"
                  isChecked={formData.consentToNFT}
                  onChange={handleInputChange}
                >
                  I consent to receiving a soulbound NFT as proof of my verified disability status (optional)
                </Checkbox>
                <FormHelperText>
                  This NFT will stay in your wallet and can be used to access disability-specific opportunities
                </FormHelperText>
              </FormControl>
            </VStack>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxW="3xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Icon as={FaWheelchair} w={10} h={10} color="blue.500" mb={3} />
          <Heading>Disability Registration</Heading>
          <Text mt={2} color="gray.600">
            Register your disability status to access specialized grants and customize your experience on AccessChain
          </Text>
        </Box>

        <Box width="100%">
          <Progress
            value={(step / 4) * 100}
            mb={4}
            size="md"
            colorScheme="blue"
            hasStripe
            isAnimated
            aria-label="Registration progress"
            borderRadius="md"
          />
          
          <HStack justify="space-between">
            <Text>Step {step} of 4</Text>
            <Text fontWeight="medium">{
              ['Disability Info', 'Assistive Tech', 'Accessibility Needs', 'Documentation & Consent'][step-1]
            }</Text>
          </HStack>
        </Box>

        {/* Render current step */}
        {renderStep()}

        {/* Navigation buttons */}
        <HStack spacing={4} justify="space-between">
          <Button
            onClick={prevStep}
            isDisabled={step === 1}
            variant="outline"
          >
            Previous
          </Button>
          
          {step < 4 ? (
            <Button
              onClick={nextStep}
              colorScheme="blue"
              isDisabled={!isStepValid()}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              colorScheme="green"
              isLoading={loading}
              isDisabled={!formData.consentToData}
              leftIcon={<FaCheck />}
            >
              Submit Registration
            </Button>
          )}
        </HStack>

        {/* Support information */}
        <Box fontSize="sm" color="gray.500">
          <Text>
            Need help? Contact our support team at{" "}
            <Button variant="link" colorScheme="blue" fontSize="sm">
              support@accesschain.org
            </Button>
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default DisabilityOnboarding;