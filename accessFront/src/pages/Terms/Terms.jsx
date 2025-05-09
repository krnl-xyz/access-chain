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

export default function Terms() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const sections = [
    {
      title: '1. Introduction',
      content: [
        'Welcome to AccessChain. By accessing and using our platform, you agree to be bound by these Terms of Service. Please read these terms carefully before using our services.',
        'AccessChain is a decentralized platform that connects donors with NGOs, facilitating transparent and efficient charitable giving through blockchain technology.',
      ],
    },
    {
      title: '2. Definitions',
      content: [
        '"Platform" refers to the AccessChain website and services.',
        '"User" refers to any individual or organization using the Platform.',
        '"Donor" refers to users who make donations through the Platform.',
        '"NGO" refers to non-governmental organizations registered on the Platform.',
        '"Smart Contract" refers to the self-executing contracts on the blockchain.',
      ],
    },
    {
      title: '3. User Registration',
      content: [
        'Users must provide accurate and complete information during registration.',
        'Users are responsible for maintaining the security of their accounts.',
        'Users must be at least 18 years old to use the Platform.',
        'NGOs must provide valid documentation for verification.',
      ],
    },
    {
      title: '4. Platform Services',
      content: [
        'The Platform facilitates donations between donors and NGOs.',
        'All transactions are recorded on the blockchain.',
        'The Platform provides tools for tracking donations and impact.',
        'The Platform may charge fees for certain services.',
      ],
    },
    {
      title: '5. Donations and Payments',
      content: [
        'Donations are processed through blockchain transactions.',
        'All donations are final and non-refundable.',
        'The Platform charges a small fee on donations.',
        'Users are responsible for any taxes related to their transactions.',
      ],
    },
    {
      title: '6. NGO Responsibilities',
      content: [
        'NGOs must provide accurate information about their projects.',
        'NGOs must use donations for the stated purposes.',
        'NGOs must provide regular updates on project progress.',
        'NGOs must comply with all applicable laws and regulations.',
      ],
    },
    {
      title: '7. Donor Responsibilities',
      content: [
        'Donors must ensure they have sufficient funds for donations.',
        'Donors should review project details before donating.',
        'Donors are responsible for their own tax obligations.',
        'Donors should report any suspicious activity.',
      ],
    },
    {
      title: '8. Privacy and Data Protection',
      content: [
        'We collect and process personal data in accordance with our Privacy Policy.',
        'Users have the right to access and control their personal data.',
        'We implement appropriate security measures to protect user data.',
        'We may share data with third parties as required by law.',
      ],
    },
    {
      title: '9. Intellectual Property',
      content: [
        'The Platform and its content are protected by intellectual property rights.',
        'Users retain rights to their content but grant us a license to use it.',
        'Users must not infringe on others\' intellectual property rights.',
        'We may use user content for promotional purposes.',
      ],
    },
    {
      title: '10. Limitation of Liability',
      content: [
        'We are not liable for any indirect or consequential damages.',
        'We do not guarantee the success of any project.',
        'Users are responsible for their own decisions and actions.',
        'Our liability is limited to the amount paid for our services.',
      ],
    },
    {
      title: '11. Termination',
      content: [
        'We may terminate or suspend accounts for violations of these terms.',
        'Users may terminate their accounts at any time.',
        'Termination does not affect any obligations incurred before termination.',
        'We may retain certain information after account termination.',
      ],
    },
    {
      title: '12. Changes to Terms',
      content: [
        'We may modify these terms at any time.',
        'Users will be notified of significant changes.',
        'Continued use of the Platform constitutes acceptance of changes.',
        'Users should review the terms periodically.',
      ],
    },
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={12} align="stretch">
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            Terms of Service
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="3xl" mx="auto">
            Please read these terms carefully before using AccessChain. By using
            our platform, you agree to be bound by these terms.
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
            For any questions about these terms, please contact us at{' '}
            <Text as="span" color="blue.500">
              legal@accesschain.org
            </Text>
          </Text>
        </Box>
      </VStack>
    </Container>
  );
} 