import { sapphireTestnet } from '../config/chains';

export const switchToSapphireNetwork = async () => {
    if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
    }

    try {
        // Try switching to Sapphire Testnet
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${sapphireTestnet.id.toString(16)}` }],
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: `0x${sapphireTestnet.id.toString(16)}`,
                            chainName: sapphireTestnet.name,
                            nativeCurrency: sapphireTestnet.nativeCurrency,
                            rpcUrls: sapphireTestnet.rpcUrls.default.http,
                            blockExplorerUrls: [sapphireTestnet.blockExplorers.default.url],
                        },
                    ],
                });
            } catch (addError) {
                throw new Error('Failed to add Sapphire Testnet to MetaMask');
            }
        } else {
            throw new Error('Failed to switch to Sapphire Testnet');
        }
    }
};

export const ensureCorrectNetwork = async () => {
    if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
    }

    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    const requiredChainId = `0x${sapphireTestnet.id.toString(16)}`;

    if (currentChainId !== requiredChainId) {
        await switchToSapphireNetwork();
    }
}; 