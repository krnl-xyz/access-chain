import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Link as ChakraLink,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaHandshake,
  FaUsers,
  FaChartLine,
  FaCog,
  FaBars,
  FaTimes,
  FaCoins,
  FaLock,
  FaFileAlt,
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';

const Navigation = () => {
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const mainNavItems = [
    {
      name: 'Home',
      path: '/',
      icon: <Icon as={FaHome} />,
    },
    {
      name: 'Grants',
      path: '/grants',
      icon: <Icon as={FaHandshake} />,
    },
    {
      name: 'Token Staking (Coming Soon)',
      path: '/token/staking',
      icon: <Icon as={FaLock} />,
      isDisabled: true,
      tooltip: 'Token staking will be available in Q2 2024',
    },
  ];

  const grantNavItems = [
    {
      name: 'Available Grants',
      path: '/grants',
      icon: <Icon as={FaFileAlt} />,
    },
    {
      name: 'My Applications',
      path: '/grants/my-applications',
      icon: <Icon as={FaClipboardList} />,
    },
    {
      name: 'Review Applications',
      path: '/grants/review',
      icon: <Icon as={FaCheckCircle} />,
      isNGOOnly: true,
    },
  ];

  const ngoNavItems = [
    {
      name: 'NGO Dashboard',
      path: '/ngo-dashboard',
      icon: <Icon as={FaUsers} />,
    },
    {
      name: 'Create Grant',
      path: '/grants/create',
      icon: <Icon as={FaFileAlt} />,
    },
    {
      name: 'Manage Applications',
      path: '/grants/manage',
      icon: <Icon as={FaClipboardList} />,
    },
  ];

  const adminNavItems = [
    {
      name: 'Admin Dashboard',
      path: '/admin',
      icon: <Icon as={FaCog} />,
    },
    {
      name: 'NGO Management',
      path: '/admin/ngos',
      icon: <Icon as={FaUsers} />,
    },
  ];

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    const activeBg = useColorModeValue('blue.50', 'blue.900');
    const activeColor = useColorModeValue('blue.600', 'blue.200');

    return (
      <ChakraLink
        as={RouterLink}
        to={item.path}
        _hover={{ textDecoration: 'none' }}
        isDisabled={item.isDisabled}
        title={item.tooltip}
      >
        <HStack
          p={3}
          borderRadius="md"
          bg={isActive ? activeBg : 'transparent'}
          color={isActive ? activeColor : 'inherit'}
          _hover={{
            bg: item.isDisabled ? 'transparent' : activeBg,
            color: item.isDisabled ? 'inherit' : activeColor,
          }}
          opacity={item.isDisabled ? 0.6 : 1}
          cursor={item.isDisabled ? 'not-allowed' : 'pointer'}
        >
          {item.icon}
          <Text>{item.name}</Text>
        </HStack>
      </ChakraLink>
    );
  };

  const NavSection = ({ title, items }) => (
    <Box mb={6}>
      <Text
        fontSize="sm"
        fontWeight="bold"
        color="gray.500"
        mb={2}
        px={3}
      >
        {title}
      </Text>
      <VStack align="stretch" spacing={1}>
        {items.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </VStack>
    </Box>
  );

  // Mobile Navigation
  const MobileNav = () => (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Navigation</DrawerHeader>
        <DrawerBody>
          <VStack align="stretch" spacing={6}>
            <NavSection title="Main" items={mainNavItems} />
            <NavSection title="Grants" items={grantNavItems} />
            <NavSection title="NGO" items={ngoNavItems} />
            <NavSection title="Admin" items={adminNavItems} />
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <Box
        as="nav"
        position="fixed"
        left={0}
        w="250px"
        h="100vh"
        bg={bgColor}
        borderRight="1px"
        borderColor={borderColor}
        py={6}
        display={{ base: 'none', md: 'block' }}
      >
        <VStack align="stretch" spacing={6}>
          <NavSection title="Main" items={mainNavItems} />
          <NavSection title="Grants" items={grantNavItems} />
          <NavSection title="NGO" items={ngoNavItems} />
          <NavSection title="Admin" items={adminNavItems} />
        </VStack>
      </Box>

      {/* Mobile Navigation Button */}
      <Button
        display={{ base: 'flex', md: 'none' }}
        position="fixed"
        top={4}
        left={4}
        zIndex={1000}
        onClick={onOpen}
        variant="ghost"
        size="lg"
      >
        <Icon as={FaBars} />
      </Button>

      {/* Mobile Navigation Drawer */}
      <MobileNav />
    </>
  );
};

export default Navigation; 