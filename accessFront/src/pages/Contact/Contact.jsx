import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  useColorModeValue,
  SimpleGrid,
  Icon,
} from '@chakra-ui/react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function Contact() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // TODO: Implement contact form submission
      console.log('Form submitted:', formData);
      toast({
        title: 'Message sent',
        description: 'Thank you for contacting us. We will get back to you soon.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: FaEnvelope,
      title: 'Email',
      content: 'contact@accesschain.org',
    },
    {
      icon: FaPhone,
      title: 'Phone',
      content: '+1 (555) 123-4567',
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Address',
      content: '123 Blockchain Street, Tech City, TC 12345',
    },
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={12} align="stretch">
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            Contact Us
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="3xl" mx="auto">
            Have questions or need assistance? We're here to help. Reach out to us
            using the form below or through our contact information.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box
            bg={bgColor}
            p={8}
            rounded="lg"
            shadow="base"
            borderWidth={1}
            borderColor={borderColor}
          >
            <VStack spacing={6} align="stretch">
              <Heading size="lg">Send us a Message</Heading>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your email address"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Subject</FormLabel>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Message subject"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Message</FormLabel>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your message"
                      rows={6}
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    isLoading={isLoading}
                    width="full"
                  >
                    Send Message
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Box>

          <VStack spacing={8} align="stretch">
            <Box
              bg={bgColor}
              p={8}
              rounded="lg"
              shadow="base"
              borderWidth={1}
              borderColor={borderColor}
            >
              <VStack spacing={6} align="stretch">
                <Heading size="lg">Contact Information</Heading>
                <VStack spacing={6} align="stretch">
                  {contactInfo.map((info, index) => (
                    <HStack key={index} spacing={4}>
                      <Icon
                        as={info.icon}
                        w={6}
                        h={6}
                        color="blue.500"
                      />
                      <Box>
                        <Text fontWeight="bold">{info.title}</Text>
                        <Text color="gray.600">{info.content}</Text>
                      </Box>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </Box>

            <Box
              bg={bgColor}
              p={8}
              rounded="lg"
              shadow="base"
              borderWidth={1}
              borderColor={borderColor}
            >
              <VStack spacing={4} align="stretch">
                <Heading size="lg">Office Hours</Heading>
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text>Monday - Friday</Text>
                    <Text fontWeight="bold">9:00 AM - 6:00 PM</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Saturday</Text>
                    <Text fontWeight="bold">10:00 AM - 4:00 PM</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Sunday</Text>
                    <Text fontWeight="bold">Closed</Text>
                  </HStack>
                </VStack>
              </VStack>
            </Box>

            <Box
              bg={bgColor}
              p={8}
              rounded="lg"
              shadow="base"
              borderWidth={1}
              borderColor={borderColor}
            >
              <VStack spacing={4} align="stretch">
                <Heading size="lg">Follow Us</Heading>
                <Text color="gray.600">
                  Stay connected with us on social media for the latest updates
                  and news.
                </Text>
                <HStack spacing={4}>
                  <Button variant="outline" width="full">
                    Twitter
                  </Button>
                  <Button variant="outline" width="full">
                    LinkedIn
                  </Button>
                  <Button variant="outline" width="full">
                    GitHub
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </SimpleGrid>
      </VStack>
    </Container>
  );
} 