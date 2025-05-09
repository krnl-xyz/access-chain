import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Switch,
  Button,
  useToast,
  Divider,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Icon,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaEye, FaFont, FaVolumeUp, FaHandPointer, FaMedal, FaIdCard } from 'react-icons/fa';
import { useAccessibility } from '../../context/AccessibilityContext';

const AccessibilitySettings = () => {
  const toast = useToast();
  const { 
    highContrast,
    largeText,
    reduceMotion,
    screenReader,
    disabilityType,
    disabilityVerified,
    assistiveTechnologies,
    toggleSetting,
    updateSetting,
    resetSettings,
  } = useAccessibility();

  // Colors
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Handle saving preferences
  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your accessibility settings have been updated.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle reset preferences
  const handleReset = () => {
    resetSettings();
    toast({
      title: 'Settings reset',
      description: 'Your accessibility settings have been reset to defaults.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>Accessibility Settings</Heading>
          <Text>Customize your experience on AccessChain to suit your needs.</Text>
        </Box>

        {/* User Disability Status Card */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader pb={0}>
            <Heading size="md">Your Disability Status</Heading>
          </CardHeader>
          
          <CardBody>
            {disabilityType ? (
              <VStack align="start" spacing={4}>
                <Box>
                  <Text fontWeight="bold">Registered Disability Type:</Text>
                  <Text>
                    {disabilityType.charAt(0).toUpperCase() + disabilityType.slice(1)} Impairment
                    {disabilityVerified && (
                      <Badge colorScheme="green" ml={2}>Verified</Badge>
                    )}
                  </Text>
                </Box>
                
                {assistiveTechnologies.length > 0 && (
                  <Box>
                    <Text fontWeight="bold">Assistive Technologies:</Text>
                    <Box mt={2}>
                      {assistiveTechnologies.map(tech => (
                        <Badge key={tech} colorScheme="blue" mr={2} mb={2}>
                          {tech}
                        </Badge>
                      ))}
                    </Box>
                  </Box>
                )}

                {!disabilityVerified && (
                  <Text fontSize="sm" color="orange.500">
                    Your disability status is pending verification. 
                    Some features may be limited until verification is complete.
                  </Text>
                )}
              </VStack>
            ) : (
              <VStack align="start" spacing={2}>
                <Text>You haven't registered a disability status yet.</Text>
                <Button
                  as={RouterLink}
                  to="/accessibility/onboarding"
                  colorScheme="blue"
                  leftIcon={<Icon as={FaIdCard} />}
                  size="sm"
                >
                  Register Disability Status
                </Button>
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Display Settings */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader pb={0}>
            <Heading size="md">Display Settings</Heading>
          </CardHeader>
          
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl display="flex" alignItems="center">
                <Icon as={FaEye} mr={3} />
                <FormLabel htmlFor="high-contrast" mb="0">
                  High Contrast Mode
                </FormLabel>
                <Switch
                  id="high-contrast"
                  isChecked={highContrast}
                  onChange={() => toggleSetting('highContrast')}
                />
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <Icon as={FaFont} mr={3} />
                <FormLabel htmlFor="large-text" mb="0">
                  Larger Text
                </FormLabel>
                <Switch
                  id="large-text"
                  isChecked={largeText}
                  onChange={() => toggleSetting('largeText')}
                />
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <Icon as={FaHandPointer} mr={3} />
                <FormLabel htmlFor="reduce-motion" mb="0">
                  Reduce Motion
                </FormLabel>
                <Switch
                  id="reduce-motion"
                  isChecked={reduceMotion}
                  onChange={() => toggleSetting('reduceMotion')}
                />
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <Icon as={FaVolumeUp} mr={3} />
                <FormLabel htmlFor="screen-reader" mb="0">
                  Screen Reader Compatible
                </FormLabel>
                <Switch
                  id="screen-reader"
                  isChecked={screenReader}
                  onChange={() => toggleSetting('screenReader')}
                />
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Action buttons */}
        <Box display="flex" justifyContent="space-between">
          <Button
            onClick={handleReset}
            variant="outline"
            colorScheme="red"
          >
            Reset to Default
          </Button>
          
          <Button
            onClick={handleSave}
            colorScheme="blue"
          >
            Save Settings
          </Button>
        </Box>
        
        {/* Resources */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader pb={0}>
            <Heading size="md">Additional Resources</Heading>
          </CardHeader>
          
          <CardBody>
            <VStack align="start" spacing={2}>
              <Text>
                Need help with accessibility? Check out these resources:
              </Text>
              <Button as={RouterLink} to="/faq#accessibility" variant="link" colorScheme="blue">
                Accessibility FAQ
              </Button>
              <Button as={RouterLink} to="/help/accessibility-guide" variant="link" colorScheme="blue">
                Accessibility User Guide
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default AccessibilitySettings;