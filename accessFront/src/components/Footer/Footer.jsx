import React from 'react';
import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  useColorModeValue,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaTwitter, FaLinkedin, FaGithub, FaDiscord } from 'react-icons/fa';

export default function Footer() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'FAQ', href: '/faq' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Support', href: '#' },
      ],
    },
  ];

  const socialLinks = [
    { icon: FaTwitter, href: 'https://twitter.com/accesschain', label: 'Twitter' },
    { icon: FaLinkedin, href: 'https://linkedin.com/company/accesschain', label: 'LinkedIn' },
    { icon: FaGithub, href: 'https://github.com/accesschain', label: 'GitHub' },
    { icon: FaDiscord, href: 'https://discord.gg/accesschain', label: 'Discord' },
  ];

  return (
    <Box
      bg={bgColor}
      color={textColor}
      borderTop={1}
      borderStyle="solid"
      borderColor={borderColor}
    >
      <Container
        as={Stack}
        maxW="container.xl"
        py={8}
        spacing={8}
        justify="space-between"
        align={{ base: 'center', md: 'flex-start' }}
        direction={{ base: 'column', md: 'row' }}
      >
        <Stack spacing={6} align={{ base: 'center', md: 'flex-start' }}>
          <Text fontSize="lg" fontWeight="bold">
            AccessChain
          </Text>
          <Text fontSize="sm">
            Making charitable giving transparent, efficient, and impactful through
            blockchain technology.
          </Text>
          <HStack spacing={4}>
            {socialLinks.map((social) => (
              <IconButton
                key={social.label}
                as="a"
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                icon={<social.icon />}
                variant="ghost"
                size="sm"
              />
            ))}
          </HStack>
        </Stack>

        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={8}
          align={{ base: 'center', md: 'flex-start' }}
        >
          {footerLinks.map((group) => (
            <Stack key={group.title} spacing={4} align={{ base: 'center', md: 'flex-start' }}>
              <Text fontWeight="bold">{group.title}</Text>
              {group.links.map((link) => (
                <Link
                  key={link.name}
                  as={RouterLink}
                  to={link.href}
                  color={textColor}
                  _hover={{ textDecoration: 'none', color: 'blue.500' }}
                >
                  {link.name}
                </Link>
              ))}
            </Stack>
          ))}
        </Stack>
      </Container>

      <Box
        borderTop={1}
        borderStyle="solid"
        borderColor={borderColor}
        py={4}
      >
        <Container maxW="container.xl">
          <Text textAlign="center" fontSize="sm">
            © {new Date().getFullYear()} AccessChain. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Box>
  );
} 