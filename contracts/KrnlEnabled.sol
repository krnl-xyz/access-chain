// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KrnlEnabled
 * @dev Base contract for KRNL integration with AccessChain contracts
 */
contract KrnlEnabled is Ownable {
    // KRNL Kernel addresses
    address public disabilityVerificationKernelAddress;
    address public resourceMatchingKernelAddress;
    address public impactAnalysisKernelAddress;
    
    // Events
    event KernelCallRequested(address indexed kernel, bytes data);
    event KernelResponseReceived(address indexed kernel, bytes response);
    
    // Modifiers
    modifier onlyKernel(address kernelAddress) {
        require(
            msg.sender == kernelAddress,
            "KrnlEnabled: caller is not the specified kernel"
        );
        _;
    }
    
    /**
     * @dev Set the address of a KRNL kernel
     * @param kernelType The type of kernel (0: Disability Verification, 1: Resource Matching, 2: Impact Analysis)
     * @param kernelAddress The address of the kernel
     */
    function setKernelAddress(uint8 kernelType, address kernelAddress) external onlyOwner {
        require(kernelAddress != address(0), "KrnlEnabled: kernel address cannot be zero");
        
        if (kernelType == 0) {
            disabilityVerificationKernelAddress = kernelAddress;
        } else if (kernelType == 1) {
            resourceMatchingKernelAddress = kernelAddress;
        } else if (kernelType == 2) {
            impactAnalysisKernelAddress = kernelAddress;
        } else {
            revert("KrnlEnabled: invalid kernel type");
        }
    }
    
    /**
     * @dev Call the disability verification kernel
     * @param userId The user ID to verify
     * @param data Additional data for verification
     */
    function verifyDisabilityStatus(string calldata userId, bytes calldata data) external {
        require(disabilityVerificationKernelAddress != address(0), "KrnlEnabled: kernel not set");
        
        // Prepare the data to send to the kernel
        bytes memory callData = abi.encode(userId, data);
        
        // Emit event for the kernel to pick up
        emit KernelCallRequested(disabilityVerificationKernelAddress, callData);
    }
    
    /**
     * @dev Receive response from the disability verification kernel
     * @param response The verification result
     */
    function receiveDisabilityVerification(bytes calldata response) 
        external 
        onlyKernel(disabilityVerificationKernelAddress) 
    {
        // Process the response from the kernel
        emit KernelResponseReceived(disabilityVerificationKernelAddress, response);
        
        // Implementation-specific logic to handle the response
        // This would typically decode the response and update contract state
    }
    
    /**
     * @dev Call the resource matching kernel
     * @param userId The user ID
     * @param needs User needs data
     */
    function findMatchingGrants(string calldata userId, bytes calldata needs) external {
        require(resourceMatchingKernelAddress != address(0), "KrnlEnabled: kernel not set");
        
        // Prepare the data to send to the kernel
        bytes memory callData = abi.encode(userId, needs);
        
        // Emit event for the kernel to pick up
        emit KernelCallRequested(resourceMatchingKernelAddress, callData);
    }
    
    /**
     * @dev Receive response from the resource matching kernel
     * @param response The matching result
     */
    function receiveGrantMatching(bytes calldata response) 
        external 
        onlyKernel(resourceMatchingKernelAddress) 
    {
        // Process the response from the kernel
        emit KernelResponseReceived(resourceMatchingKernelAddress, response);
        
        // Implementation-specific logic
    }
    
    /**
     * @dev Helper function to decode response from kernels
     * @param response The encoded response
     * @return The decoded response
     */
    function decodeKernelResponse(bytes memory response) internal pure returns (bool success, bytes memory data) {
        (success, data) = abi.decode(response, (bool, bytes));
    }
} 