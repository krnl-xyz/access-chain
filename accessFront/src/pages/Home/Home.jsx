import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Image,
  Stack,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Badge,
  useDisclosure,
  Icon,
  chakra,
  SlideFade,
  Fade,
  ScaleFade,
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { Link as RouterLink } from 'react-router-dom';
import { FaHandHoldingHeart, FaUniversalAccess, FaHandsHelping, FaRegLightbulb, FaChartLine, FaUsers } from 'react-icons/fa';

// Images of people with disabilities (using provided URLs)
const HERO_IMAGES = [
  "https://dmu.go.ug/sites/default/files/2023-08/beatrice-aleema-blog.jpg", // Woman with disability
  "https://socialprotection-humanrights.org/wp-content/uploads/2015/05/soccer-disabled.jpg", // Soccer players with disabilities
  "https://www.samrc.ac.za/sites/default/files/inline-images/wheelchair_0.jpg", // Person in wheelchair
  "https://assets.td.org/m/12116f793f2bdd65/webimage-Why-AI-Generated-Art-Is-Missing-the-Mark-for-People-With-Disabilities.png" // Disability representation
];

// Success stories
const SUCCESS_STORIES = [
  {
    title: "Mobility Devices for Rural Areas",
    description: "Provided 50 customized wheelchairs to people with mobility impairments in underserved rural communities",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    impact: "50+ lives improved"
  },
  {
    title: "Assistive Technology Lab",
    description: "Established a technology center providing access to specialized software and hardware for visual and hearing impairments",
    image: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    impact: "200+ beneficiaries"
  },
  {
    title: "Inclusive Education Initiative",
    description: "Trained educators on accessible teaching methods and provided learning materials for students with diverse needs",
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    impact: "15 schools transformed"
  }
];

export default function Home() {
  const { isConnected } = useAccount();
  const { isOpen, onOpen } = useDisclosure({ defaultIsOpen: false });
  
  // Colors
  const bgColor = useColorModeValue('blue.50', 'blue.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Open animation with delay for better page load
  useEffect(() => {
    const timer = setTimeout(() => {
      onOpen();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [onOpen]);
  
  return (
    <Box>
      {/* Hero Section with Animation */}
      <Box 
        bg={bgColor} 
        position="relative" 
        overflow="hidden" 
        py={{ base: 16, md: 20 }}
      >
        {/* Background Elements */}
        <Box 
          position="absolute" 
          top="0" 
          left="0" 
          right="0" 
          bottom="0" 
          opacity="0.1" 
          zIndex="0"
        >
          {[...Array(5)].map((_, i) => (
            <Box
              key={i}
              position="absolute"
              bg="blue.400"
              width={{ base: "100px", md: "150px" }}
              height={{ base: "100px", md: "150px" }}
              borderRadius="full"
              top={`${Math.random() * 100}%`}
              left={`${Math.random() * 100}%`}
              transition="transform 3s ease-in-out"
              _hover={{ transform: "translateY(-10px)" }}
              style={{ 
                animationDelay: `${i * 0.5}s`,
                transform: `scale(${Math.random() * 0.5 + 0.5})`
              }}
            />
          ))}
        </Box>

        <Container maxW="container.xl" position="relative" zIndex="1">
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8} alignItems="center">
            <GridItem>
              <Fade in={true} transition={{ enter: { duration: 0.8 } }}>
                <Heading
                  as="h1"
                  size="2xl"
                  fontWeight="bold"
                  lineHeight="shorter"
                  mb={6}
                >
                  <chakra.span color="blue.500">AccessChain:</chakra.span> Empowering People with Disabilities through Blockchain
                </Heading>
                
                <Text
                  fontSize="xl"
                  mb={8}
                  color={useColorModeValue("gray.600", "gray.300")}
                >
                  A decentralized platform connecting individuals with disabilities to funding and resources 
                  while ensuring transparency and direct support without intermediaries.
                </Text>
                
                <HStack spacing={4} mb={8}>
                  <Button
                    as={RouterLink}
                    to="/grants"
                    size="lg"
                    colorScheme="blue"
                    fontWeight="bold"
                    rounded="full"
                    px={8}
                    leftIcon={<FaHandHoldingHeart />}
                  >
                    Browse Grants
                  </Button>
                  
                  <Button
                    as={RouterLink}
                    to="/demo"
                    size="lg"
                    variant="outline"
                    colorScheme="blue"
                    fontWeight="bold"
                    rounded="full"
                    px={8}
                  >
                    Try Demo
                  </Button>
                </HStack>
                
                <HStack spacing={6} wrap="wrap">
                  {["Transparent", "Inclusive", "Empowering", "Direct Support"].map((tag, index) => (
                    <Badge 
                      key={tag} 
                      colorScheme="blue" 
                      fontSize="sm" 
                      px={3} 
                      py={1} 
                      borderRadius="full"
                    >
                      {tag}
                    </Badge>
                  ))}
                </HStack>
              </Fade>
            </GridItem>
            
            <GridItem display={{ base: "none", lg: "block" }}>
              <Grid templateColumns="repeat(2, 1fr)" gap={4} position="relative">
                {HERO_IMAGES.map((src, index) => (
                  <SlideFade
                    key={index}
                    in={true}
                    offsetY="30px"
                    transition={{ enter: { delay: 0.2 * index, duration: 0.8 } }}
                  >
                    <Image
                      src={src}
                      alt={`Person with disability ${index + 1}`}
                      borderRadius="xl"
                      boxShadow="lg"
                      objectFit="cover"
                      height="200px"
                      width="100%"
                      transform={index % 2 === 0 ? "rotate(-5deg)" : "rotate(5deg)"}
                      transition="transform 0.3s ease-in-out"
                      _hover={{ 
                        transform: index % 2 === 0 ? "rotate(-5deg) scale(1.05)" : "rotate(5deg) scale(1.05)",
                        zIndex: 10
                      }}
                    />
                  </SlideFade>
                ))}
                
                <ScaleFade 
                  initialScale={0.1} 
                  in={true}
                  transition={{ enter: { delay: 1, duration: 0.5 } }}
                >
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    bg="blue.500"
                    color="white"
                    borderRadius="full"
                    p={4}
                    zIndex={2}
                    transition="transform 2s ease-in-out"
                    _hover={{ transform: "translate(-50%, -50%) scale(1.1)" }}
                  >
                    <Icon as={FaUniversalAccess} w={10} h={10} />
                  </Box>
                </ScaleFade>
              </Grid>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section with Animation */}
      <Box py={20}>
        <Container maxW="container.xl">
          <SlideFade in={true} offsetY="50px">
            <Box textAlign="center" mb={16}>
              <Heading as="h2" size="xl" mb={4}>
                How AccessChain Works
              </Heading>
              <Text fontSize="lg" maxW="800px" mx="auto" color={useColorModeValue("gray.600", "gray.300")}>
                Our blockchain-based platform creates a transparent ecosystem connecting people with disabilities, 
                NGOs, donors, and service providers.
              </Text>
            </Box>
          </SlideFade>

          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={8}>
            {[
              {
                icon: FaUniversalAccess,
                title: "Disability Registration",
                description: "Verifiable on-chain registration of people with disabilities and their specific needs"
              },
              {
                icon: FaHandsHelping,
                title: "NGO Grant Creation",
                description: "Authorized NGOs create targeted grants to address specific disability support needs"
              },
              {
                icon: FaUsers,
                title: "Community Voting",
                description: "Token holders vote on grant proposals ensuring resources go to the most impactful projects"
              }
            ].map((feature, index) => (
              <SlideFade
                key={index}
                in={true}
                offsetY="20px"
                transition={{ enter: { delay: 0.2 * index, duration: 0.5 } }}
              >
                <VStack
                  bg={cardBg}
                  p={8}
                  borderRadius="xl"
                  boxShadow="md"
                  spacing={4}
                  align="flex-start"
                  height="100%"
                  borderTop="4px solid"
                  borderColor="blue.500"
                  transition="transform 0.3s ease, box-shadow 0.3s ease"
                  _hover={{
                    transform: "translateY(-8px)",
                    boxShadow: "xl"
                  }}
                >
                  <Flex
                    bg="blue.500"
                    color="white"
                    p={3}
                    borderRadius="full"
                    justify="center"
                    align="center"
                  >
                    <Icon as={feature.icon} w={6} h={6} />
                  </Flex>
                  <Heading as="h3" size="md">
                    {feature.title}
                  </Heading>
                  <Text color={useColorModeValue("gray.600", "gray.300")}>
                    {feature.description}
                  </Text>
                </VStack>
              </SlideFade>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Success Stories Section */}
      <Box bg={useColorModeValue("gray.50", "gray.900")} py={20}>
        <Container maxW="container.xl">
          <Fade in={true} transition={{ enter: { duration: 0.8 } }}>
            <Box mb={12} textAlign="center">
              <Heading as="h2" size="xl" mb={4}>
                Impact Stories
              </Heading>
              <Text fontSize="lg" maxW="800px" mx="auto" color={useColorModeValue("gray.600", "gray.300")}>
                See how AccessChain is transforming lives through blockchain-powered funding and resource allocation.
              </Text>
            </Box>
          </Fade>

          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={8}>
            {SUCCESS_STORIES.map((story, index) => (
              <ScaleFade
                key={index}
                initialScale={0.9}
                in={true}
                transition={{ enter: { delay: 0.2 * index, duration: 0.6 } }}
              >
                <Flex
                  direction="column"
                  bg={cardBg}
                  borderRadius="xl"
                  overflow="hidden"
                  boxShadow="md"
                  height="100%"
                  transition="transform 0.3s ease"
                  _hover={{
                    transform: "translateY(-8px)",
                    boxShadow: "xl"
                  }}
                >
                  <Image
                    src={story.image}
                    alt={story.title}
                    height="200px"
                    objectFit="cover"
                  />
                  <Box p={6}>
                    <Badge colorScheme="green" mb={2}>{story.impact}</Badge>
                    <Heading as="h3" size="md" mb={3}>
                      {story.title}
                    </Heading>
                    <Text color={useColorModeValue("gray.600", "gray.300")}>
                      {story.description}
                    </Text>
                  </Box>
                </Flex>
              </ScaleFade>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Call to Action Section */}
      <Box py={20}>
        <Container maxW="container.lg" textAlign="center">
          <Fade in={true} transition={{ enter: { duration: 0.8 } }}>
            <Heading as="h2" size="xl" mb={6}>
              Join the AccessChain Movement
            </Heading>
            <Text fontSize="lg" maxW="800px" mx="auto" mb={10} color={useColorModeValue("gray.600", "gray.300")}>
              Whether you're a person with disabilities, an NGO, or a donor, you can be part of creating 
              a more accessible and inclusive world through blockchain technology.
            </Text>
            
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
              gap={6}
              maxW="900px"
              mx="auto"
              mb={12}
            >
              {[
                {
                  title: "For People with Disabilities",
                  description: "Register your needs and access funding and resources directly",
                  button: "Register Now",
                  link: "/accessibility/onboarding"
                },
                {
                  title: "For NGOs",
                  description: "Create grants and manage projects with full transparency",
                  button: "Create Grants",
                  link: "/ngo/create-grant"
                },
                {
                  title: "For Donors",
                  description: "Contribute to verified projects and track your impact",
                  button: "Browse Projects",
                  link: "/grants"
                }
              ].map((item, index) => (
                <SlideFade
                  key={index}
                  in={true}
                  offsetY="20px"
                  transition={{ enter: { delay: 0.2 * index, duration: 0.6 } }}
                >
                  <Box
                    p={6}
                    borderRadius="lg"
                    bg={cardBg}
                    boxShadow="md"
                  >
                    <Heading as="h3" size="md" mb={3}>
                      {item.title}
                    </Heading>
                    <Text mb={6} color={useColorModeValue("gray.600", "gray.300")}>
                      {item.description}
                    </Text>
                    <Button
                      as={RouterLink}
                      to={item.link}
                      colorScheme="blue"
                      variant="outline"
                      size="md"
                    >
                      {item.button}
                    </Button>
                  </Box>
                </SlideFade>
              ))}
            </Grid>
            
            <Button
              as={RouterLink}
              to="/demo"
              size="lg"
              colorScheme="blue"
              fontWeight="bold"
              rounded="full"
              px={8}
              leftIcon={<FaRegLightbulb />}
              transition="transform 0.3s ease"
              _hover={{ transform: "scale(1.05)" }}
            >
              Explore Demo Dashboard
            </Button>
          </Fade>
        </Container>
      </Box>
    </Box>
  );
} 