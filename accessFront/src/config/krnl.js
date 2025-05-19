// Mock KRNL client for development
class MockKrnlClient {
  constructor(config) {
    this.config = config;
    this.kernels = {};
  }

  async callKernel({ kernelId, method, params }) {
    // Mock implementation for development
    console.log('KRNL Kernel Call:', { kernelId, method, params });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock responses based on kernel and method
    switch (kernelId) {
      case KERNELS.DISABILITY_VERIFICATION:
        return this.mockDisabilityVerification(params);
      case KERNELS.RESOURCE_MATCHING:
        return this.mockResourceMatching(params);
      case KERNELS.IMPACT_ANALYSIS:
        return this.mockImpactAnalysis(params);
      default:
        throw new Error(`Unknown kernel: ${kernelId}`);
    }
  }

  mockDisabilityVerification(params) {
    // Mock verification logic
    const hasDocumentation = params.documentation?.has_documentation;
    const documentationType = params.documentation?.type;

    // Return the actual Kernel ID and CID from the verification
    return {
      wallet_address: params.wallet_address,
      verified: hasDocumentation && documentationType,
      score: hasDocumentation ? 85 : 50,
      status: hasDocumentation ? 'pass' : 'pending',
      message: hasDocumentation 
        ? 'Disability registration verified successfully.'
        : 'Verification pending documentation review.',
      kernelId: '1588', // The actual Kernel ID from the verification
      cid: 'bafkreibtscpdv5czlgfq3k4fbkbuiufnpgygb32chdc24axz32mbtjfeh4', // The actual CID from the verification
      type: 'Offchain'
    };
  }

  mockResourceMatching(params) {
    return {
      matches: [
        {
          id: 'grant-1',
          title: 'Accessibility Technology Grant',
          matchScore: 85,
          description: 'Grant for assistive technology devices'
        },
        {
          id: 'grant-2',
          title: 'Educational Support Grant',
          matchScore: 75,
          description: 'Support for educational needs'
        }
      ]
    };
  }

  mockImpactAnalysis(params) {
    return {
      totalImpact: 85,
      metrics: {
        accessibility: 90,
        education: 80,
        employment: 75
      }
    };
  }
}

// Kernel IDs
export const KERNELS = {
  DISABILITY_VERIFICATION: 'DISABILITY_VERIFICATION',
  RESOURCE_MATCHING: 'RESOURCE_MATCHING',
  IMPACT_ANALYSIS: 'IMPACT_ANALYSIS'
};

// KRNL Platform Configuration
export const KRNL_CONFIG = {
  // Platform URL
  PLATFORM_URL: 'https://app.platform.lat',
  
  // API Endpoints
  API_ENDPOINTS: {
    VERIFICATION: '/api/v1/verification',
    RESOURCE_MATCHING: '/api/v1/matching',
    IMPACT_ANALYSIS: '/api/v1/impact',
    KERNEL_STATUS: '/api/v1/kernel/status'
  },
  
  // Verification parameters
  POLLING_INTERVAL: 5000, // 5 seconds
  MAX_POLLING_ATTEMPTS: 60, // 5 minutes total
  
  // Platform-specific settings
  REQUIRED_NETWORK: 'testnet'
};

// Real KRNL client for production
class KrnlClient {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.PLATFORM_URL;
  }

  async callKernel({ kernelId, method, params }) {
    const endpoint = KRNL_CONFIG.API_ENDPOINTS[kernelId];
    if (!endpoint) {
      throw new Error(`Unknown kernel: ${kernelId}`);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          method,
          params,
          kernelId
        })
      });

      if (!response.ok) {
        throw new Error(`KRNL API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('KRNL API call failed:', error);
      throw error;
    }
  }

  // Check kernel status
  async getKernelStatus(kernelId) {
    try {
      const response = await fetch(`${this.baseUrl}${KRNL_CONFIG.API_ENDPOINTS.KERNEL_STATUS}/${kernelId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get kernel status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get kernel status:', error);
      throw error;
    }
  }
}

// Create and export client instance
const krnlClient = process.env.NODE_ENV === 'production' 
  ? new KrnlClient(KRNL_CONFIG)
  : new MockKrnlClient({
      apiKey: process.env.REACT_APP_KRNL_API_KEY || 'mock-api-key',
      environment: process.env.NODE_ENV || 'development'
    });

export default krnlClient; 