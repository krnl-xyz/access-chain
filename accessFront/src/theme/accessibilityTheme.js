import { extendTheme } from '@chakra-ui/react';

// Base theme
const baseTheme = {
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    heading: 'Inter, system-ui, sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'md',
      },
    },
    Link: {
      baseStyle: {
        fontWeight: 'semibold',
      },
    },
  },
};

// High contrast theme for users with visual impairments
const highContrastTheme = {
  colors: {
    // High contrast colors
    brand: {
      50: '#FFFFFF',
      100: '#E0E0E0',
      200: '#C0C0C0',
      300: '#A0A0A0',
      400: '#808080',
      500: '#000000', // Primary color is black for high contrast
      600: '#000000',
      700: '#000000',
      800: '#000000',
      900: '#000000',
    },
    // Override text and background colors
    text: {
      primary: '#FFFFFF',
      secondary: '#FFFF00', // Yellow for secondary text
    },
    bg: {
      primary: '#000000',
      secondary: '#1A1A1A',
    },
  },
  styles: {
    global: {
      body: {
        bg: '#000000',
        color: '#FFFFFF',
      },
      a: {
        color: '#FFFF00', // Yellow links for visibility
        _hover: {
          textDecoration: 'underline',
        },
      },
    },
  },
  components: {
    Button: {
      variants: {
        solid: {
          bg: '#FFFFFF',
          color: '#000000',
          _hover: {
            bg: '#E0E0E0',
          },
        },
        outline: {
          borderColor: '#FFFFFF',
          borderWidth: '2px', // Thicker border for visibility
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderColor: '#FFFFFF',
          _placeholder: {
            color: '#C0C0C0',
          },
        },
      },
    },
    FormLabel: {
      baseStyle: {
        color: '#FFFFFF',
        marginBottom: '2px',
      },
    },
  },
};

// Large text theme for users with visual impairments
const largeTextTheme = {
  fontSizes: {
    xs: '16px', // Increase from default 12px
    sm: '18px', // Increase from default 14px
    md: '20px', // Increase from default 16px
    lg: '22px', // Increase from default 18px
    xl: '24px', // Increase from default 20px
    '2xl': '28px', // Increase from default 24px
    '3xl': '32px', // Increase from default 30px
    '4xl': '38px', // Increase from default 36px
    '5xl': '46px', // Increase from default 48px
    '6xl': '64px', // Increase from default 60px
  },
  space: {
    // Increase spacing to accommodate larger text
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1.25rem',
    lg: '1.75rem',
    xl: '2.5rem',
  },
  components: {
    Button: {
      baseStyle: {
        fontSize: 'md',
        padding: '0.75rem 1.5rem',
      },
    },
    Input: {
      baseStyle: {
        field: {
          fontSize: 'md',
          padding: '0.75rem 1rem',
        },
      },
    },
  },
};

// Reduced motion theme for users with vestibular disorders
const reducedMotionTheme = {
  styles: {
    global: {
      // Apply to all elements
      '*': {
        transitionDuration: '0s !important',
        animationDuration: '0s !important',
      },
    },
  },
};

// Screen reader optimized theme
const screenReaderTheme = {
  components: {
    Button: {
      baseStyle: {
        // Ensure all buttons have clear focus indicators
        _focus: {
          boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)',
          outline: '2px solid #3182ce',
        },
      },
    },
    Link: {
      baseStyle: {
        _focus: {
          boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)',
          outline: '2px solid #3182ce',
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          _focus: {
            borderColor: '#3182ce',
            boxShadow: '0 0 0 1px #3182ce',
          },
        },
      },
    },
  },
};

// Generate theme based on user preferences
export const generateTheme = (preferences = {}) => {
  const {
    highContrast = false,
    largeText = false,
    reduceMotion = false,
    screenReader = false,
  } = preferences;

  let themeExtensions = [baseTheme];

  if (highContrast) {
    themeExtensions.push(highContrastTheme);
  }

  if (largeText) {
    themeExtensions.push(largeTextTheme);
  }

  if (reduceMotion) {
    themeExtensions.push(reducedMotionTheme);
  }

  if (screenReader) {
    themeExtensions.push(screenReaderTheme);
  }

  return extendTheme(...themeExtensions);
};

// Default theme with no accessibility options
export const defaultTheme = extendTheme(baseTheme);

export default generateTheme;