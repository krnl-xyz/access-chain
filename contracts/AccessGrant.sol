// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./NGOAccessControl.sol";

/// @title AccessGrant
/// @notice Manages grant programs for NGOs in AccessChain
contract AccessGrant is Ownable {
    enum GrantStatus { Active, Closed }

    struct Grant {
        uint256 id;
        string title;
        string description;
        uint256 amount;
        uint256 deadline;
        address ngo;
        bool isActive;
    }

    struct GrantRequest {
        address applicant;
        string proposal;
        bool approved;
        bool rejected;
    }

    uint256 private grantCounter;
    NGOAccessControl public ngoAccessControl;

    mapping(uint256 => Grant) public grants;
    mapping(uint256 => GrantRequest[]) public grantRequests;

    event GrantCreated(uint256 indexed grantId, address indexed ngo);
    event ApplicationSubmitted(uint256 indexed grantId, address indexed applicant);
    event ApplicationApproved(uint256 indexed grantId, address indexed applicant);
    event ApplicationRejected(uint256 indexed grantId, address indexed applicant);

    constructor(address ngoAccessControlAddress) {
        ngoAccessControl = NGOAccessControl(ngoAccessControlAddress);
    }

    /// @notice Create a new grant program (NGOs only)
    /// @param title Title of the grant
    /// @param description Description of the grant purpose
    /// @param amount Amount of funding available
    /// @param deadline Timestamp when the grant expires
    function createGrant(
        string calldata title,
        string calldata description,
        uint256 amount,
        uint256 deadline
    ) external {
        require(
            ngoAccessControl.isAuthorizedNGO(msg.sender),
            "Only authorized NGOs can create grants"
        );
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(amount > 0, "Amount must be greater than 0");

        grantCounter++;
        uint256 grantId = grantCounter;

        grants[grantId] = Grant({
            id: grantId,
            title: title,
            description: description,
            amount: amount,
            deadline: deadline,
            ngo: msg.sender,
            isActive: true
        });

        emit GrantCreated(grantId, msg.sender);
    }

    /// @notice Get all active and closed grants
    /// @return Array of all grants
    function getGrants() external view returns (Grant[] memory) {
        Grant[] memory allGrants = new Grant[](grantCounter);
        
        for (uint256 i = 1; i <= grantCounter; i++) {
            allGrants[i-1] = grants[i];
        }
        
        return allGrants;
    }

    /// @notice Apply for a grant
    /// @param grantId ID of the grant to apply for
    /// @param proposal Proposal text or IPFS link
    function applyForGrant(uint256 grantId, string calldata proposal) external {
        require(grantId > 0 && grantId <= grantCounter, "Invalid grant ID");
        require(grants[grantId].isActive, "Grant is not active");
        require(grants[grantId].deadline > block.timestamp, "Grant deadline has passed");
        
        // Check if already applied
        GrantRequest[] storage requests = grantRequests[grantId];
        for (uint256 i = 0; i < requests.length; i++) {
            require(requests[i].applicant != msg.sender, "Already applied for this grant");
        }
        
        grantRequests[grantId].push(GrantRequest({
            applicant: msg.sender,
            proposal: proposal,
            approved: false,
            rejected: false
        }));
        
        emit ApplicationSubmitted(grantId, msg.sender);
    }

    /// @notice Approve a grant application (NGO only)
    /// @param grantId ID of the grant
    /// @param applicant Address of the applicant to approve
    function approveApplication(uint256 grantId, address applicant) external {
        require(grantId > 0 && grantId <= grantCounter, "Invalid grant ID");
        require(grants[grantId].ngo == msg.sender, "Only the grant creator can approve applications");
        
        bool found = false;
        GrantRequest[] storage requests = grantRequests[grantId];
        
        for (uint256 i = 0; i < requests.length; i++) {
            if (requests[i].applicant == applicant) {
                require(!requests[i].approved, "Application already approved");
                require(!requests[i].rejected, "Application was rejected");
                
                requests[i].approved = true;
                found = true;
                break;
            }
        }
        
        require(found, "Application not found");
        emit ApplicationApproved(grantId, applicant);
    }

    /// @notice Reject a grant application (NGO only)
    /// @param grantId ID of the grant
    /// @param applicant Address of the applicant to reject
    function rejectApplication(uint256 grantId, address applicant) external {
        require(grantId > 0 && grantId <= grantCounter, "Invalid grant ID");
        require(grants[grantId].ngo == msg.sender, "Only the grant creator can reject applications");
        
        bool found = false;
        GrantRequest[] storage requests = grantRequests[grantId];
        
        for (uint256 i = 0; i < requests.length; i++) {
            if (requests[i].applicant == applicant) {
                require(!requests[i].approved, "Application already approved");
                require(!requests[i].rejected, "Application already rejected");
                
                requests[i].rejected = true;
                found = true;
                break;
            }
        }
        
        require(found, "Application not found");
        emit ApplicationRejected(grantId, applicant);
    }
} 