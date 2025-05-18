import { configureChains, createConfig } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { publicProvider } from 'wagmi/providers/public';
import { sonicBlaze, sapphireTestnet } from './chains';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';

// Configure chains
// const projectId = process.env.VITE_WALLET_CONNECT_PROJECT_ID; // Get this from https://cloud.walletconnect.com
const projectId = 'c4f79cc821944f183565b21f455a8c5a'; // Hardcoded for testing - replace with your own in production

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [sonicBlaze, sapphireTestnet],
  [publicProvider()]
);

// Create wagmi config
export const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains }),
    new MetaMaskConnector({ chains }),
  ],
  publicClient,
  webSocketPublicClient,
});

// Create web3modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains: [sonicBlaze],
  defaultChain: sonicBlaze,
  featuredWalletIds: [],
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#3182CE',
  },
});

export { chains };