import { KrnlClient } from '@krnl/client';
import { sapphireTestnet } from './chains';

// Oasis Sapphire Testnet Configuration
export const SAPPHIRE_TESTNET = {
    id: 23295, // Oasis Sapphire Testnet Chain ID
    name: 'Oasis Sapphire Testnet',
    network: 'sapphire-testnet',
    rpcUrls: {
        default: 'https://testnet.sapphire.oasis.dev',
        public: 'https://testnet.sapphire.oasis.dev',
    },
    blockExplorers: {
        default: {
            name: 'Sapphire Testnet Explorer',
            url: 'https://testnet.explorer.sapphire.oasis.dev'
        },
    },
    nativeCurrency: {
        name: 'TEST',
        symbol: 'TEST',
        decimals: 18
    }
};

// Initialize the KRNL client
const krnlClient = new KrnlClient({
    chainId: sapphireTestnet.id,
    rpc: {
        node: sapphireTestnet.rpcUrls.default.http[0],
    },
    // These will be provided by KRNL platform when you register your dApp
    dappId: process.env.REACT_APP_KRNL_DAPP_ID || 'YOUR_DAPP_ID',
    dappKey: process.env.REACT_APP_KRNL_DAPP_KEY || 'YOUR_DAPP_KEY',
});

// Export the initialized client
export default krnlClient;

// Define kernel IDs for different AccessChain features
export const KERNELS = {
  DISABILITY_VERIFICATION: 'kernel-xyz-123', // Replace with actual kernel ID for disability verification
  RESOURCE_MATCHING: 'kernel-xyz-456',      // Replace with actual kernel ID for resource matching
  IMPACT_ANALYSIS: 'kernel-xyz-789',        // Replace with actual kernel ID for impact analysis
};

// KRNL Platform Configuration
export const KRNL_CONFIG = {
    // Platform URL
    PLATFORM_URL: 'https://app.platform.lat',
    
    // Chain configuration
    CHAIN: sapphireTestnet,
    
    // Network-specific verifier contract addresses
    VERIFIER_ADDRESSES: {
        SAPPHIRE_TESTNET: '0x1234567890123456789012345678901234567890', // Replace with actual KRNL verifier contract address
    },
    
    // Verification parameters
    POLLING_INTERVAL: 5000, // 5 seconds
    MAX_POLLING_ATTEMPTS: 60, // 5 minutes total
    
    // Platform-specific settings
    REQUIRED_NETWORK: 'sapphire-testnet',
}; 