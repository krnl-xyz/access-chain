import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
} from '@chakra-ui/react';

export default function FAQ() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const faqs = [
    {
      question: 'What is AccessChain?',
      answer: 'AccessChain is a decentralized platform that connects donors with NGOs, making charitable giving more transparent, efficient, and impactful. We use blockchain technology to ensure transparency and accountability in the donation process.'
    },
    {
      question: 'How does AccessChain work?',
      answer: 'AccessChain uses smart contracts on the blockchain to facilitate donations between donors and NGOs. Donors can browse grant requests, make donations, and track their impact. NGOs can submit grant requests, receive donations, and provide updates on their projects.'
    },
    {
      question: 'How do I become a donor?',
      answer: 'To become a donor, simply connect your wallet to the platform, browse available grant requests, and make a donation. You can track your donations and their impact through your donor dashboard.'
    },
    {
      question: 'How do I register my NGO?',
      answer: 'To register your NGO, click on the "Register NGO" button, fill out the registration form with your organization\'s details, and submit the required documentation. Once verified, you can start submitting grant requests.'
    },
    {
      question: 'How are donations tracked?',
      answer: 'All donations are recorded on the blockchain, providing a transparent and immutable record of transactions. Donors can track their donations through their dashboard, and NGOs must provide regular updates on how the funds are being used.'
    },
    {
      question: 'What types of grants can I apply for?',
      answer: 'NGOs can apply for various types of grants, including education, healthcare, environment, and social services. Each grant request should clearly outline the project\'s objectives, budget, and expected impact.'
    },
    {
      question: 'How is the impact of donations measured?',
      answer: 'Impact is measured through regular progress reports from NGOs, including metrics such as number of beneficiaries, project milestones achieved, and overall outcomes. Donors can view these updates through their dashboard.'
    },
    {
      question: 'What are the fees for using AccessChain?',
      answer: 'AccessChain charges a small platform fee on donations to cover operational costs. The exact fee structure can be found in our terms and conditions.'
    },
    {
      question: 'How secure is the platform?',
      answer: 'AccessChain is built on blockchain technology, ensuring the highest level of security for all transactions. Smart contracts are audited and tested to prevent vulnerabilities, and all data is encrypted.'
    },
    {
      question: 'Can I cancel or refund a donation?',
      answer: 'Once a donation is made and confirmed on the blockchain, it cannot be cancelled or refunded. This is to ensure the integrity of the platform and protect the interests of NGOs.'
    },
    {
      question: 'How do I report an issue?',
      answer: 'If you encounter any issues, you can report them through our contact form or email our support team at support@accesschain.org. We aim to respond to all inquiries within 24 hours.'
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we take data privacy seriously. Personal information is encrypted and stored securely. We only collect necessary information required for the platform\'s operation and comply with relevant data protection regulations.'
    }
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={12} align="stretch">
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            Frequently Asked Questions
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="3xl" mx="auto">
            Find answers to common questions about AccessChain, our platform, and
            how to get started.
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
          <Accordion allowMultiple>
            {faqs.map((faq, index) => (
              <AccordionItem key={index}>
                <h2>
                  <AccordionButton py={4}>
                    <Box flex="1" textAlign="left" fontWeight="bold">
                      {faq.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Text color="gray.600">{faq.answer}</Text>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>

        <Box textAlign="center">
          <Text fontSize="lg" color="gray.600" mb={4}>
            Still have questions?
          </Text>
          <Text>
            Contact our support team at{' '}
            <Text as="span" color="blue.500">
              support@accesschain.org
            </Text>
          </Text>
        </Box>
      </VStack>
    </Container>
  );
} 