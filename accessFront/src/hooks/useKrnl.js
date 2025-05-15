import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import krnlClient, { KERNELS } from '../config/krnl';

/**
 * Custom hook for interacting with KRNL kernels
 * @returns {Object} KRNL kernel methods and state
 */
const useKrnl = () => {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Verify disability status using the KRNL kernel
   * @param {Object} userData - User data for verification
   * @returns {Promise<Object>} Verification result
   */
  const verifyDisabilityStatus = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call the disability verification kernel
      const response = await krnlClient.callKernel({
        kernelId: KERNELS.DISABILITY_VERIFICATION,
        method: 'verifyDisability',
        params: {
          userId: address,
          ...userData
        }
      });
      
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to verify disability status');
      setLoading(false);
      throw err;
    }
  }, [address]);
  
  /**
   * Match users with appropriate grants based on needs
   * @param {Object} userNeeds - User's specific needs and requirements
   * @returns {Promise<Array>} Matching grants
   */
  const findMatchingGrants = useCallback(async (userNeeds) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call the resource matching kernel
      const response = await krnlClient.callKernel({
        kernelId: KERNELS.RESOURCE_MATCHING,
        method: 'matchGrants',
        params: {
          userId: address,
          needs: userNeeds
        }
      });
      
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to find matching grants');
      setLoading(false);
      throw err;
    }
  }, [address]);
  
  /**
   * Analyze impact of distributed grants
   * @param {Array} grantIds - IDs of grants to analyze
   * @returns {Promise<Object>} Impact analysis
   */
  const analyzeGrantImpact = useCallback(async (grantIds) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call the impact analysis kernel
      const response = await krnlClient.callKernel({
        kernelId: KERNELS.IMPACT_ANALYSIS,
        method: 'analyzeImpact',
        params: {
          grantIds
        }
      });
      
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to analyze grant impact');
      setLoading(false);
      throw err;
    }
  }, []);
  
  return {
    loading,
    error,
    verifyDisabilityStatus,
    findMatchingGrants,
    analyzeGrantImpact
  };
};

export default useKrnl; 