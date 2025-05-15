import { KrnlClient } from '@krnl/client';
import { sonicBlaze } from './chains';

// Initialize the KRNL client
const krnlClient = new KrnlClient({
  chainId: sonicBlaze.id, // Use the Sonic Blaze chain ID
  rpc: {
    node: 'https://krnl-node.example.com', // Replace with the actual KRNL node URL
  },
  // Register your application with KRNL platform to get these values
  dappId: 'YOUR_DAPP_ID',
  dappKey: 'YOUR_DAPP_KEY',
});

// Export the initialized client
export default krnlClient;

// Define kernel IDs for different AccessChain features
export const KERNELS = {
  DISABILITY_VERIFICATION: 'kernel-xyz-123', // Replace with actual kernel ID for disability verification
  RESOURCE_MATCHING: 'kernel-xyz-456',      // Replace with actual kernel ID for resource matching
  IMPACT_ANALYSIS: 'kernel-xyz-789',        // Replace with actual kernel ID for impact analysis
}; 