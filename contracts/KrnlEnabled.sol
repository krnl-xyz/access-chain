// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IKRNLVerifier.sol";

/**
 * @title KrnlEnabled
 * @dev Base contract for KRNL integration with AccessChain contracts
 */
contract KrnlEnabled is Ownable {
    // KRNL Verifier interface
    IKRNLVerifier public krnlVerifier;
    
    // Events
    event VerificationRequested(address indexed user, bytes data);
    event VerificationCompleted(address indexed user, bool verified, bytes data);
    
    // Modifiers
    modifier onlyKrnlVerifier() {
        require(
            msg.sender == address(krnlVerifier),
            "KrnlEnabled: caller is not the KRNL verifier"
        );
        _;
    }
    
    /**
     * @dev Set the address of the KRNL verifier contract
     * @param verifierAddress The address of the KRNL verifier contract
     */
    function setKrnlVerifier(address verifierAddress) external onlyOwner {
        require(verifierAddress != address(0), "KrnlEnabled: verifier address cannot be zero");
        krnlVerifier = IKRNLVerifier(verifierAddress);
    }
    
    /**
     * @dev Request disability verification from KRNL
     * @param userId The user ID to verify
     * @param data Additional data for verification
     * @return requestId The unique identifier for this verification request
     */
    function verifyDisabilityStatus(string memory userId, bytes memory data) internal returns (bytes32) {
        require(address(krnlVerifier) != address(0), "KrnlEnabled: verifier not set");
        
        bytes32 requestId = krnlVerifier.requestVerification(msg.sender, data);
        emit VerificationRequested(msg.sender, data);
        
        return requestId;
    }
    
    /**
     * @dev Check if a user is verified
     * @param user The address to check
     * @return bool True if the user is verified
     */
    function isUserVerified(address user) public view returns (bool) {
        require(address(krnlVerifier) != address(0), "KrnlEnabled: verifier not set");
        return krnlVerifier.isVerified(user);
    }
    
    /**
     * @dev Get verification data for a user
     * @param user The address to check
     * @return bytes The verification data
     */
    function getUserVerificationData(address user) public view returns (bytes memory) {
        require(address(krnlVerifier) != address(0), "KrnlEnabled: verifier not set");
        return krnlVerifier.getVerificationData(user);
    }
    
    /**
     * @dev Check verification status for a request
     * @param requestId The request ID to check
     * @return completed Whether the verification is completed
     * @return verified Whether the user is verified
     */
    function checkVerificationStatus(bytes32 requestId) public view returns (bool completed, bool verified) {
        require(address(krnlVerifier) != address(0), "KrnlEnabled: verifier not set");
        return krnlVerifier.getVerificationStatus(requestId);
    }
} 