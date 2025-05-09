import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { FaCircle } from 'react-icons/fa';

export default function Privacy() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const sections = [
    {
      title: '1. Information We Collect',
      content: [
        'Personal information (name, email, address)',
        'Wallet addresses and transaction history',
        'Organization details for NGOs',
        'Usage data and analytics',
        'Communication records',
      ],
    },
    {
      title: '2. How We Use Your Information',
      content: [
        'To provide and maintain our services',
        'To process transactions and donations',
        'To verify user identities and prevent fraud',
        'To communicate with you about our services',
        'To improve our platform and user experience',
      ],
    },
    {
      title: '3. Information Sharing',
      content: [
        'We share information with NGOs for donation processing',
        'We may share data with service providers',
        'We comply with legal requirements to share information',
        'We do not sell your personal information',
        'We may share anonymized data for analytics',
      ],
    },
    {
      title: '4. Data Security',
      content: [
        'We implement industry-standard security measures',
        'We use encryption to protect sensitive data',
        'We regularly monitor for security threats',
        'We limit access to personal information',
        'We maintain backup systems and disaster recovery plans',
      ],
    },
    {
      title: '5. Your Rights',
      content: [
        'Right to access your personal information',
        'Right to correct inaccurate data',
        'Right to request data deletion',
        'Right to object to data processing',
        'Right to data portability',
      ],
    },
    {
      title: '6. Cookies and Tracking',
      content: [
        'We use cookies to improve user experience',
        'We use analytics tools to understand usage patterns',
        'You can control cookie settings in your browser',
        'We respect Do Not Track signals',
        'We provide clear information about tracking methods',
      ],
    },
    {
      title: '7. Third-Party Services',
      content: [
        'We use third-party services for specific functions',
        'These services have their own privacy policies',
        'We carefully select and monitor our service providers',
        'We ensure data protection agreements are in place',
        'We limit data sharing with third parties',
      ],
    },
    {
      title: '8. Children\'s Privacy',
      content: [
        'Our services are not intended for children under 13',
        'We do not knowingly collect children\'s data',
        'Parents can contact us to remove children\'s data',
        'We comply with children\'s privacy laws',
        'We implement age verification measures',
      ],
    },
    {
      title: '9. International Data Transfers',
      content: [
        'We may transfer data internationally',
        'We ensure appropriate safeguards are in place',
        'We comply with international data protection laws',
        'We inform users about international transfers',
        'We maintain data protection standards globally',
      ],
    },
    {
      title: '10. Changes to Privacy Policy',
      content: [
        'We may update this policy periodically',
        'We notify users of significant changes',
        'We provide clear information about updates',
        'We maintain version history of changes',
        'We encourage regular review of the policy',
      ],
    },
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={12} align="stretch">
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            Privacy Policy
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="3xl" mx="auto">
            We are committed to protecting your privacy and ensuring the security
            of your personal information. This policy explains how we collect,
            use, and protect your data.
          </Text>
        </Box>

        <Box
          bg={bgColor}
          p={8}
          rounded="lg"
          shadow="base"
          borderWidth={1}
          borderColor={borderColor}
        >
          <VStack spacing={8} align="stretch">
            {sections.map((section, index) => (
              <Box key={index}>
                <Heading size="md" mb={4}>
                  {section.title}
                </Heading>
                <List spacing={3}>
                  {section.content.map((item, itemIndex) => (
                    <ListItem key={itemIndex}>
                      <ListIcon as={FaCircle} color="blue.500" boxSize={2} />
                      <Text as="span" color="gray.600">
                        {item}
                      </Text>
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </VStack>
        </Box>

        <Box textAlign="center">
          <Text fontSize="lg" color="gray.600" mb={4}>
            Last updated: March 15, 2024
          </Text>
          <Text>
            For any privacy-related questions, please contact our Data Protection
            Officer at{' '}
            <Text as="span" color="blue.500">
              privacy@accesschain.org
            </Text>
          </Text>
        </Box>
      </VStack>
    </Container>
  );
} 