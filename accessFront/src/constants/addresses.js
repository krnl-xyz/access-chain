import { KRNL_CONFIG } from '../config/krnl';

export const CONTRACT_ADDRESSES = {
    // Your existing contract addresses
    AccessGrant: "your_access_grant_address",
    NGOAccessControl: "your_ngo_access_control_address",
    // ... other addresses ...

    // KRNL Verifier address will be set dynamically based on the network
    get KrnlVerifier() {
        return KRNL_CONFIG.VERIFIER_ADDRESSES.SAPPHIRE_TESTNET;
    }
}; 