// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IKRNLVerifier {
    // Events
    event VerificationRequested(address indexed user, bytes data);
    event VerificationCompleted(address indexed user, bool verified, bytes data);
    
    // Functions
    function requestVerification(address user, bytes calldata data) external returns (bytes32);
    function isVerified(address user) external view returns (bool);
    function getVerificationData(address user) external view returns (bytes memory);
    function getVerificationStatus(bytes32 requestId) external view returns (bool completed, bool verified);
    
    // Optional: Platform-specific functions
    function getPlatformId() external view returns (string memory);
    function getVerifierAddress() external view returns (address);
} 