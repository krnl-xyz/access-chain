import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={8} textAlign="center">
          <Heading mb={4}>Something went wrong</Heading>
          <Text mb={4}>We apologize for the inconvenience. Please try refreshing the page.</Text>
          <Button
            colorScheme="blue"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <Box mt={4} p={4} bg="gray.100" borderRadius="md" textAlign="left">
              <Text fontWeight="bold">Error Details:</Text>
              <Text fontSize="sm" whiteSpace="pre-wrap">
                {this.state.error && this.state.error.toString()}
              </Text>
              <Text fontWeight="bold" mt={2}>Stack Trace:</Text>
              <Text fontSize="sm" whiteSpace="pre-wrap">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </Text>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 