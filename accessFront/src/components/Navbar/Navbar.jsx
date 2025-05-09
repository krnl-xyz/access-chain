import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  useColorMode,
  useToast,
  Tooltip,
  HStack,
  Avatar,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  MenuGroup,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MoonIcon,
  SunIcon,
  SettingsIcon,
  UnlockIcon,
} from '@chakra-ui/icons';
import { FaUniversalAccess, FaWheelchair, FaIdCard, FaAdjust, FaFont, FaHandPaper, FaEye } from 'react-icons/fa';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function Navbar() {
  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();
  const toast = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const { address, isConnected } = useAccount();
  const { highContrast, largeText, reduceMotion, disabilityType, disabilityVerified, toggleSetting } = useAccessibility();
  
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connect({ connector: new MetaMaskConnector() });
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect to wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Show success toast when connection is established
  useEffect(() => {
    if (isConnected && address) {
      toast({
        title: 'Wallet Connected',
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [isConnected, address, toast]);

  const NAV_ITEMS = [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'About',
      href: '/about',
    },
    {
      label: 'Demo',
      href: '/demo',
    },
    {
      label: 'Admin',
      href: '/admin-dashboard',
    },
    {
      label: 'Dashboard',
      children: [
        {
          label: 'Donor Dashboard',
          subLabel: 'View your donations and impact',
          href: '/donor-dashboard',
        },
        {
          label: 'NGO Dashboard',
          subLabel: 'Manage your grants and projects',
          href: '/ngo-dashboard',
        },
      ],
    },
    {
      label: 'Grants',
      children: [
        {
          label: 'Browse Grants',
          subLabel: 'Explore available grant opportunities',
          href: '/grants',
        },
        {
          label: 'Request Grant',
          subLabel: 'Submit a new grant request',
          href: '/grant-request',
        },
      ],
    },
    {
      label: 'Accessibility',
      children: [
        {
          label: 'Settings',
          subLabel: 'Customize your experience',
          href: '/accessibility/settings',
          icon: SettingsIcon,
        },
        {
          label: 'Disability Registration',
          subLabel: 'Register your disability status',
          href: '/accessibility/onboarding',
          icon: FaWheelchair,
        },
      ],
    },
    {
      label: 'Contact',
      href: '/contact',
    },
  ];

  return (
    <Box>
      <Flex
        bg={useColorModeValue(highContrast ? 'white' : 'white', 'gray.800')}
        color={useColorModeValue(highContrast ? 'black' : 'gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
        justify={'space-between'}
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }} align={'center'}>
          <Text
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            color={useColorModeValue('gray.800', 'white')}
            fontWeight="bold"
            fontSize={largeText ? "xl" : "lg"}
            as={RouterLink}
            to="/"
            _hover={{
              textDecoration: 'none',
            }}
          >
            AccessChain
            {disabilityVerified && (
              <Badge ml={2} colorScheme="green">Verified</Badge>
            )}
          </Text>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav NAV_ITEMS={NAV_ITEMS} location={location} />
          </Flex>
        </Flex>

        <HStack spacing={3}>
          {/* Accessibility Menu */}
          <Menu closeOnSelect={false}>
            <MenuButton
              as={IconButton}
              aria-label="Accessibility options"
              icon={<FaUniversalAccess />}
              variant="ghost"
            />
            <MenuList>
              <MenuGroup title="Quick Settings">
                <MenuItem 
                  icon={<FaEye />} 
                  onClick={() => toggleSetting('highContrast')}
                  command={highContrast ? "On" : "Off"}
                >
                  High Contrast
                </MenuItem>
                <MenuItem 
                  icon={<FaFont />} 
                  onClick={() => toggleSetting('largeText')}
                  command={largeText ? "On" : "Off"}
                >
                  Large Text
                </MenuItem>
                <MenuItem 
                  icon={<FaHandPaper />} 
                  onClick={() => toggleSetting('reduceMotion')}
                  command={reduceMotion ? "On" : "Off"}
                >
                  Reduce Motion
                </MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="Status">
                {disabilityType ? (
                  <MenuItem as={RouterLink} to="/accessibility/settings" icon={<SettingsIcon />}>
                    Manage Settings
                  </MenuItem>
                ) : (
                  <MenuItem as={RouterLink} to="/accessibility/onboarding" icon={<FaIdCard />}>
                    Register Disability
                  </MenuItem>
                )}
              </MenuGroup>
            </MenuList>
          </Menu>
          
          {/* Theme Toggle */}
          <IconButton
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
          />
          
          {isConnected && address ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}
                leftIcon={<Avatar size="xs" />}
                rightIcon={<ChevronDownIcon />}
              >
                {`${address?.substring(0, 6)}...${address?.substring(address.length - 4)}`}
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/profile">Profile</MenuItem>
                <MenuItem as={RouterLink} to="/grants">My Grants</MenuItem>
                <MenuDivider />
                <MenuItem onClick={() => disconnect()}>Disconnect</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button 
              onClick={handleConnect}
              leftIcon={<UnlockIcon />} 
              colorScheme="blue" 
              size="sm"
              isLoading={isConnecting}
              loadingText="Connecting..."
            >
              Connect Wallet
            </Button>
          )}
        </HStack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav NAV_ITEMS={NAV_ITEMS} location={location} />
      </Collapse>
    </Box>
  );
}

const DesktopNav = ({ NAV_ITEMS, location }) => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');
  const { largeText } = useAccessibility();

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link
                as={RouterLink}
                p={2}
                to={navItem.href ?? '#'}
                fontSize={largeText ? 'md' : 'sm'}
                fontWeight={500}
                color={location.pathname === navItem.href ? 'blue.500' : linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
                {navItem.children && (
                  <Icon
                    as={ChevronDownIcon}
                    transition={'all .25s ease-in-out'}
                    w={6}
                    h={6}
                  />
                )}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel, icon }) => {
  const { largeText } = useAccessibility();
  const IconComponent = icon;

  return (
    <Link
      as={RouterLink}
      to={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('blue.50', 'gray.900') }}
    >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Flex align="center">
            {icon && 
              <Icon 
                as={IconComponent} 
                mr={2} 
                color="blue.400"
                aria-hidden="true" 
              />
            }
            <Text
              transition={'all .3s ease'}
              _groupHover={{ color: 'blue.400' }}
              fontWeight={500}
              fontSize={largeText ? 'md' : 'sm'}
            >
              {label}
            </Text>
          </Flex>
          <Text fontSize={largeText ? 'sm' : 'xs'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}
        >
          <Icon color={'blue.400'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = ({ NAV_ITEMS, location }) => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} location={location} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href, location }) => {
  const { isOpen, onToggle } = useDisclosure();
  const { largeText } = useAccessibility();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={RouterLink}
        to={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text
          fontWeight={600}
          fontSize={largeText ? 'md' : 'sm'}
          color={location.pathname === href ? 'blue.500' : undefined}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link
                key={child.label}
                as={RouterLink}
                to={child.href}
                py={2}
                fontSize={largeText ? 'md' : 'sm'}
                color={location.pathname === child.href ? 'blue.500' : undefined}
              >
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};