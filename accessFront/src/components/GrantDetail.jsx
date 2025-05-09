import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { toast } from 'react-toastify';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../config/contracts';
import { sonicBlaze } from '../config/chains';
import VoteSimulation from './VoteSimulation';
import TokenBalanceDisplay from './TokenBalanceDisplay';

const GrantDetail = () => {
  const { grantId } = useParams();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const [loading, setLoading] = useState(true);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [grant, setGrant] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isNGO, setIsNGO] = useState(false);
  const [isGrantCreator, setIsGrantCreator] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [userApplication, setUserApplication] = useState(null);

  // Helper functions for contract interactions
  const readGrantContract = async (functionName, args = []) => {
    try {
      return await publicClient.readContract({
        address: CONTRACT_ADDRESSES.accessGrant,
        abi: CONTRACT_ABIS.accessGrant,
        functionName,
        args
      });
    } catch (error) {
      console.error(`Error reading contract function ${functionName}:`, error);
      throw error;
    }
  };

  const readNGOContract = async (functionName, args = []) => {
    try {
      return await publicClient.readContract({
        address: CONTRACT_ADDRESSES.ngoAccessControl,
        abi: CONTRACT_ABIS.ngoAccessControl,
        functionName,
        args
      });
    } catch (error) {
      console.error(`Error reading contract function ${functionName}:`, error);
      throw error;
    }
  };

  const writeGrantContract = async (functionName, args = []) => {
    try {
      if (!walletClient) throw new Error("Wallet not connected");
      
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.accessGrant,
        abi: CONTRACT_ABIS.accessGrant,
        functionName,
        args,
        chain: sonicBlaze,
        account: address
      });
      
      return hash;
    } catch (error) {
      console.error(`Error writing contract function ${functionName}:`, error);
      throw error;
    }
  };

  // Set up data loading and event listeners
  useEffect(() => {
    const fetchGrantDetails = async () => {
      try {
        setLoading(true);
        
        // Get all grants
        const grants = await readGrantContract('getGrants');
        
        // Find the specified grant
        const grantIdNumber = parseInt(grantId, 10);
        const foundGrant = grants.find(g => Number(g.id) === grantIdNumber);
        
        if (!foundGrant) {
          toast.error('Grant not found');
          navigate('/grants');
          return;
        }
        
        // Format grant data
        const formattedGrant = {
          id: Number(foundGrant.id),
          title: foundGrant.title,
          description: foundGrant.description,
          amount: ethers.formatEther(foundGrant.amount.toString()),
          deadline: new Date(Number(foundGrant.deadline) * 1000).toLocaleDateString(),
          deadlineTimestamp: Number(foundGrant.deadline),
          ngo: foundGrant.ngo,
          isActive: foundGrant.isActive
        };
        
        setGrant(formattedGrant);
        
        // Check if the current user is an NGO
        if (address) {
          const ngoStatus = await readNGOContract('isAuthorizedNGO', [address]);
          setIsNGO(ngoStatus);
          setIsGrantCreator(foundGrant.ngo.toLowerCase() === address.toLowerCase());
        }
        
        // This part would be more complex in a real application
        // For demonstration, we'll use a simplified approach
        // In a real app, you would need to query events or use a subgraph
        
        // Check if current user has applied (this is a stub - actual implementation would differ)
        // We're mocking this since we can't easily query all applications from the contract
        setHasApplied(false);
        setUserApplication(null);
        
        // If the user is the grant creator, fetch applications (mock for now)
        if (foundGrant.ngo.toLowerCase() === address?.toLowerCase()) {
          // In a real implementation, you would query applications from events or a subgraph
          setApplications([
            // These would come from contract events in a real implementation
          ]);
        }
      } catch (error) {
        console.error('Error fetching grant details:', error);
        toast.error('Failed to load grant details');
      } finally {
        setLoading(false);
      }
    };

    if (grantId && publicClient) {
      fetchGrantDetails();
    }
    
    // Set up event listeners
    if (publicClient) {
      try {
        // Watch for application events
        const unwatchSubmitted = publicClient.watchContractEvent({
          address: CONTRACT_ADDRESSES.accessGrant,
          abi: CONTRACT_ABIS.accessGrant,
          eventName: 'ApplicationSubmitted',
          onLogs: (logs) => {
            const eventLog = logs[0];
            if (eventLog && Number(eventLog.args.grantId) === parseInt(grantId, 10)) {
              toast.info(`New application submitted`);
              // Refresh applications if needed
            }
          }
        });
        
        const unwatchApproved = publicClient.watchContractEvent({
          address: CONTRACT_ADDRESSES.accessGrant,
          abi: CONTRACT_ABIS.accessGrant,
          eventName: 'ApplicationApproved',
          onLogs: (logs) => {
            const eventLog = logs[0];
            if (eventLog && Number(eventLog.args.grantId) === parseInt(grantId, 10)) {
              toast.success(`Application approved`);
              // Update application status
            }
          }
        });
        
        const unwatchRejected = publicClient.watchContractEvent({
          address: CONTRACT_ADDRESSES.accessGrant,
          abi: CONTRACT_ABIS.accessGrant,
          eventName: 'ApplicationRejected',
          onLogs: (logs) => {
            const eventLog = logs[0];
            if (eventLog && Number(eventLog.args.grantId) === parseInt(grantId, 10)) {
              toast.info(`Application rejected`);
              // Update application status
            }
          }
        });
        
        return () => {
          unwatchSubmitted?.();
          unwatchApproved?.();
          unwatchRejected?.();
        };
      } catch (error) {
        console.error('Error setting up event watchers:', error);
      }
    }
  }, [grantId, publicClient, address, navigate]);

  const handleApprove = async (applicantAddress) => {
    if (!isGrantCreator) {
      toast.error('Only the grant creator can approve applications');
      return;
    }
    
    try {
      setApprovalLoading(true);
      const grantIdNumber = parseInt(grantId, 10);
      
      toast.info('Submitting approval transaction...');
      await writeGrantContract('approveApplication', [grantIdNumber, applicantAddress]);
      
      toast.success('Application approved successfully!');
      
      // Update the applications list
      setApplications(applications.map(app => 
        app.applicant === applicantAddress 
          ? { ...app, approved: true, rejected: false } 
          : app
      ));
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error(error.reason || error.message || 'Failed to approve application');
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleReject = async (applicantAddress) => {
    if (!isGrantCreator) {
      toast.error('Only the grant creator can reject applications');
      return;
    }
    
    try {
      setApprovalLoading(true);
      const grantIdNumber = parseInt(grantId, 10);
      
      toast.info('Submitting rejection transaction...');
      await writeGrantContract('rejectApplication', [grantIdNumber, applicantAddress]);
      
      toast.success('Application rejected successfully!');
      
      // Update the applications list
      setApplications(applications.map(app => 
        app.applicant === applicantAddress 
          ? { ...app, approved: false, rejected: true } 
          : app
      ));
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error(error.reason || error.message || 'Failed to reject application');
    } finally {
      setApprovalLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-6">Loading grant details...</div>;
  }

  if (!grant) {
    return <div className="text-center p-6">Grant not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{grant.title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Grant Details</h3>
            <p className="text-gray-600 mb-2">Amount: {grant.amount} ETH</p>
            <p className="text-gray-600 mb-2">Deadline: {grant.deadline}</p>
            <p className="text-gray-600 mb-2">Status: {grant.isActive ? 'Active' : 'Closed'}</p>
            <p className="text-gray-600 mb-2">Created by: 
              <span className="text-xs ml-2 font-mono">
                {grant.ngo.slice(0, 6)}...{grant.ngo.slice(-4)}
              </span>
            </p>
            
            {/* Add Token Balance Display */}
            <div className="mt-4">
              <p className="text-gray-600 mb-1">Your ACCESS balance:</p>
              <TokenBalanceDisplay />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Description</h3>
            <p className="text-gray-600">{grant.description}</p>
          </div>
        </div>
        
        {!hasApplied && grant.isActive && grant.deadlineTimestamp > (Date.now() / 1000) && (
          <div className="mt-4">
            <button
              onClick={() => navigate(`/grants/${grantId}/apply`)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Apply for this Grant
            </button>
          </div>
        )}
        
        {hasApplied && userApplication && (
          <div className="mt-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Application</h3>
            <p className="text-gray-600 mb-2">{userApplication.proposal}</p>
            <p className="text-gray-600">
              Status: {
                userApplication.approved ? (
                  <span className="text-green-600 font-semibold">Approved</span>
                ) : userApplication.rejected ? (
                  <span className="text-red-600 font-semibold">Rejected</span>
                ) : (
                  <span className="text-yellow-600 font-semibold">Pending</span>
                )
              }
            </p>
          </div>
        )}
        
        {/* Add Community Voting */}
        <div className="mt-6">
          <VoteSimulation 
            grantId={Number(grantId)} 
            grantTitle={grant.title} 
          />
        </div>
      </div>
      
      {isGrantCreator && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Applications</h3>
          
          {applications.length === 0 ? (
            <p className="text-gray-600">No applications yet.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-gray-700 font-semibold mb-1">
                    Applicant: {app.applicant.slice(0, 6)}...{app.applicant.slice(-4)}
                  </p>
                  <p className="text-gray-600 mb-2">{app.proposal}</p>
                  
                  <div className="flex items-center mt-3">
                    {!app.approved && !app.rejected ? (
                      <>
                        <button
                          onClick={() => handleApprove(app.applicant)}
                          disabled={approvalLoading}
                          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded mr-2 focus:outline-none focus:shadow-outline text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(app.applicant)}
                          disabled={approvalLoading}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
                        >
                          Reject
                        </button>
                      </>
                    ) : app.approved ? (
                      <span className="text-green-600 font-semibold">Approved</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Rejected</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GrantDetail; 