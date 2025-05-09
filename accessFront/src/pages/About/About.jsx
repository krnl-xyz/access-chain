import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Image,
  useColorModeValue,
  Button,
  Icon,
  HStack,
} from '@chakra-ui/react';
import { FaHandshake, FaChartLine, FaShieldAlt, FaUsers } from 'react-icons/fa';

export default function About() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const features = [
    {
      icon: FaHandshake,
      title: 'Transparent Donations',
      description:
        'Every donation is tracked on the blockchain, ensuring complete transparency and accountability.',
    },
    {
      icon: FaChartLine,
      title: 'Impact Tracking',
      description:
        'Monitor the real impact of your donations with detailed progress reports and metrics.',
    },
    {
      icon: FaShieldAlt,
      title: 'Secure Platform',
      description:
        'Built on blockchain technology, ensuring the highest level of security for all transactions.',
    },
    {
      icon: FaUsers,
      title: 'Community Driven',
      description:
        'Join a community of donors and NGOs working together to create positive change.',
    },
  ];

  const team = [
    {
      name: 'John Doe',
      role: 'Founder & CEO',
      image: 'https://bit.ly/ryan-florence',
    },
    {
      name: 'Jane Smith',
      role: 'CTO',
      image: 'https://bit.ly/kent-c-dodds',
    },
    {
      name: 'Mike Johnson',
      role: 'Head of Operations',
      image: 'https://bit.ly/prosper-baba',
    },
  ];

  return (
    <Container maxWidth={'8xl'} py={8}>
      <VStack spacing={16} align="stretch">
        {/* Hero Section */}
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            About AccessChain
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="3xl" mx="auto">
            We're building a decentralized platform that connects donors with NGOs,
            making charitable giving more transparent, efficient, and impactful.
          </Text>
        </Box>

        {/* Mission Section */}
        <Box
          bg={bgColor}
          p={8}
          rounded="lg"
          shadow="base"
          borderWidth={1}
          borderColor={borderColor}
        >
          <VStack spacing={6} align="stretch">
            <Heading size="lg">Our Mission</Heading>
            <Text fontSize="lg">
              At AccessChain, we believe in the power of blockchain technology to
              revolutionize charitable giving. Our mission is to create a
              transparent and efficient platform that connects donors with NGOs,
              ensuring that every contribution makes a real impact.
            </Text>
            <Text fontSize="lg">
              By leveraging smart contracts and decentralized technology, we're
              building a future where charitable giving is more accessible,
              transparent, and effective than ever before.
            </Text>
          </VStack>
        </Box>

        {/* Features Section */}
        <Box>
          <Heading size="lg" mb={8} textAlign="center">
            Why Choose AccessChain?
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            {features.map((feature, index) => (
              <Box
                key={index}
                bg={bgColor}
                p={6}
                rounded="lg"
                shadow="base"
                borderWidth={1}
                borderColor={borderColor}
                textAlign="center"
              >
                <Icon
                  as={feature.icon}
                  w={10}
                  h={10}
                  color="blue.500"
                  mb={4}
                />
                <Heading size="md" mb={2}>
                  {feature.title}
                </Heading>
                <Text color="gray.600">{feature.description}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Team Section */}
        <Box>
          <Heading size="lg" mb={8} textAlign="center">
            Our Team
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {team.map((member, index) => (
              <Box
                key={index}
                bg={bgColor}
                p={6}
                rounded="lg"
                shadow="base"
                borderWidth={1}
                borderColor={borderColor}
                textAlign="center"
              >
                <Image
                  src={member.image}
                  alt={member.name}
                  borderRadius="full"
                  boxSize="150px"
                  mx="auto"
                  mb={4}
                />
                <Heading size="md" mb={2}>
                  {member.name}
                </Heading>
                <Text color="gray.600">{member.role}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* CTA Section */}
        <Box
          bg={bgColor}
          p={8}
          rounded="lg"
          shadow="base"
          borderWidth={1}
          borderColor={borderColor}
          textAlign="center"
        >
          <VStack spacing={6}>
            <Heading size="lg">Join Us in Making a Difference</Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Whether you're a donor looking to make an impact or an NGO seeking
              support, AccessChain provides the tools and platform you need to
              create positive change.
            </Text>
            <HStack spacing={4}>
              <Button colorScheme="blue" size="lg">
                Get Started
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
} 