import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { KRNL_CONFIG } from '../config/krnl';
import { krnlVerifierABI } from '../constants/abis';
import { CONTRACT_ADDRESSES } from '../constants/addresses';
import { ensureCorrectNetwork } from '../utils/networkUtils';

export const useKrnlVerification = () => {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState('');
    const [verificationData, setVerificationData] = useState(null);
    const [requestId, setRequestId] = useState(null);
    const [error, setError] = useState(null);

    // Check if user is already verified
    const checkVerificationStatus = useCallback(async () => {
        if (!address || !CONTRACT_ADDRESSES.KrnlVerifier) return;

        try {
            const isVerified = await publicClient.readContract({
                address: CONTRACT_ADDRESSES.KrnlVerifier,
                abi: krnlVerifierABI,
                functionName: 'isVerified',
                args: [address],
            });

            if (isVerified) {
                const data = await publicClient.readContract({
                    address: CONTRACT_ADDRESSES.KrnlVerifier,
                    abi: krnlVerifierABI,
                    functionName: 'getVerificationData',
                    args: [address],
                });
                setVerificationData({ verified: true, data });
                setVerificationStatus('Already verified');
            }
        } catch (err) {
            console.error('Error checking verification status:', err);
        }
    }, [address, publicClient]);

    // Poll for verification completion
    const pollVerificationStatus = useCallback(async (reqId) => {
        if (!reqId) return;

        try {
            const { completed, verified } = await publicClient.readContract({
                address: CONTRACT_ADDRESSES.KrnlVerifier,
                abi: krnlVerifierABI,
                functionName: 'getVerificationStatus',
                args: [reqId],
            });

            if (completed) {
                setVerificationStatus(verified ? 'Verification successful!' : 'Verification failed');
                setVerificationData(verified ? { verified: true } : null);
                setIsVerifying(false);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error polling verification status:', err);
            return false;
        }
    }, [publicClient]);

    // Start verification process
    const startVerification = useCallback(async () => {
        if (!address || !walletClient) return;

        try {
            await ensureCorrectNetwork();
            setIsVerifying(true);
            setVerificationStatus('Initiating verification...');
            setError(null);

            const { request } = await publicClient.simulateContract({
                address: CONTRACT_ADDRESSES.KrnlVerifier,
                abi: krnlVerifierABI,
                functionName: 'requestVerification',
                args: [address, '0x'],
                account: address,
            });

            const hash = await walletClient.writeContract(request);
            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            // Find the VerificationRequested event
            const event = receipt.logs.find(
                log => log.address.toLowerCase() === CONTRACT_ADDRESSES.KrnlVerifier.toLowerCase()
            );

            if (event) {
                const reqId = event.topics[1];
                setRequestId(reqId);
                setVerificationStatus('Verification requested. Please complete verification on KRNL platform.');

                // Start polling
                const pollInterval = setInterval(async () => {
                    const completed = await pollVerificationStatus(reqId);
                    if (completed) {
                        clearInterval(pollInterval);
                    }
                }, KRNL_CONFIG.POLLING_INTERVAL);

                // Clear interval after max attempts
                setTimeout(() => {
                    clearInterval(pollInterval);
                    if (isVerifying) {
                        setVerificationStatus('Verification timed out. Please try again.');
                        setIsVerifying(false);
                    }
                }, KRNL_CONFIG.POLLING_INTERVAL * KRNL_CONFIG.MAX_POLLING_ATTEMPTS);
            }
        } catch (err) {
            setError(err.message);
            setVerificationStatus('Verification failed');
            setIsVerifying(false);
        }
    }, [address, walletClient, publicClient, pollVerificationStatus]);

    // Check verification status on mount and when address changes
    useEffect(() => {
        checkVerificationStatus();
    }, [address, checkVerificationStatus]);

    return {
        isVerifying,
        verificationStatus,
        verificationData,
        error,
        startVerification,
        checkVerificationStatus,
    };
}; 