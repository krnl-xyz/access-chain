// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./NGOAccessControl.sol";
import "./KrnlEnabled.sol";

/// @title AccessGrant
/// @notice Manages grant programs for NGOs in AccessChain with KRNL integration
contract AccessGrant is Ownable, ReentrancyGuard, KrnlEnabled {
    enum GrantStatus { Active, Closed }
    enum ApplicationStatus { Pending, Approved, Rejected, Completed }
    enum MilestoneStatus { NotStarted, InProgress, Completed, Failed }

    struct Milestone {
        string description;
        uint256 amount;
        uint256 deadline;
        MilestoneStatus status;
        bool fundsReleased;
    }

    struct Grant {
        uint256 id;
        string title;
        string description;
        uint256 totalAmount;
        uint256 remainingAmount;
        uint256 deadline;
        address ngo;
        bool isActive;
        Milestone[] milestones;
        uint256 applicantCount;
        uint256 approvedCount;
    }

    struct GrantRequest {
        address applicant;
        string proposal;
        ApplicationStatus status;
        uint256 currentMilestone;
        bool krnlVerified;
        bytes32 verificationHash;
        uint256 fundsReceived;
    }

    uint256 private grantCounter;
    NGOAccessControl public ngoAccessControl;

    mapping(uint256 => Grant) public grants;
    mapping(uint256 => mapping(address => GrantRequest)) public grantRequests;
    mapping(address => uint256[]) public userApplications;
    mapping(address => uint256[]) public ngoGrants;

    event GrantCreated(uint256 indexed grantId, address indexed ngo);
    event ApplicationSubmitted(uint256 indexed grantId, address indexed applicant);
    event ApplicationStatusUpdated(uint256 indexed grantId, address indexed applicant, ApplicationStatus status);
    event MilestoneCompleted(uint256 indexed grantId, address indexed applicant, uint256 milestoneIndex);
    event FundsReleased(uint256 indexed grantId, address indexed applicant, uint256 amount);
    event VerificationReceived(uint256 indexed grantId, address indexed applicant, bool verified);

    constructor(address ngoAccessControlAddress) KrnlEnabled() {
        ngoAccessControl = NGOAccessControl(ngoAccessControlAddress);
    }

    /// @notice Create a new grant program with milestones (NGOs only)
    function createGrant(
        string calldata title,
        string calldata description,
        uint256 totalAmount,
        uint256 deadline,
        Milestone[] calldata milestones
    ) external {
        require(
            ngoAccessControl.isAuthorizedNGO(msg.sender),
            "Only authorized NGOs can create grants"
        );
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(totalAmount > 0, "Amount must be greater than 0");
        require(milestones.length > 0, "Must have at least one milestone");

        uint256 totalMilestoneAmount = 0;
        for (uint256 i = 0; i < milestones.length; i++) {
            totalMilestoneAmount += milestones[i].amount;
        }
        require(totalMilestoneAmount == totalAmount, "Milestone amounts must sum to total");

        grantCounter++;
        uint256 grantId = grantCounter;

        grants[grantId].id = grantId;
        grants[grantId].title = title;
        grants[grantId].description = description;
        grants[grantId].totalAmount = totalAmount;
        grants[grantId].remainingAmount = totalAmount;
        grants[grantId].deadline = deadline;
        grants[grantId].ngo = msg.sender;
        grants[grantId].isActive = true;

        for (uint256 i = 0; i < milestones.length; i++) {
            grants[grantId].milestones.push(milestones[i]);
        }

        ngoGrants[msg.sender].push(grantId);
        emit GrantCreated(grantId, msg.sender);
    }

    /// @notice Apply for a grant with KRNL verification
    function applyForGrant(
        uint256 grantId,
        string calldata proposal,
        bytes calldata krnlData
    ) external nonReentrant {
        require(grantId > 0 && grantId <= grantCounter, "Invalid grant ID");
        require(grants[grantId].isActive, "Grant is not active");
        require(grants[grantId].deadline > block.timestamp, "Grant deadline has passed");
        require(grantRequests[grantId][msg.sender].applicant == address(0), "Already applied");

        // Initialize application
        grantRequests[grantId][msg.sender] = GrantRequest({
            applicant: msg.sender,
            proposal: proposal,
            status: ApplicationStatus.Pending,
            currentMilestone: 0,
            krnlVerified: false,
            verificationHash: keccak256(krnlData),
            fundsReceived: 0
        });

        userApplications[msg.sender].push(grantId);
        grants[grantId].applicantCount++;

        // Request KRNL verification
        bytes32 requestId = verifyDisabilityStatus(toString(msg.sender), krnlData);
        
        emit ApplicationSubmitted(grantId, msg.sender);
    }

    /// @notice Callback function for KRNL verification
    function onVerificationCompleted(address user, bool verified, bytes calldata data) external onlyKrnlVerifier {
        // Find the user's pending application
        uint256[] memory userApps = userApplications[user];
        for (uint256 i = 0; i < userApps.length; i++) {
            uint256 grantId = userApps[i];
            GrantRequest storage request = grantRequests[grantId][user];
            
            if (request.status == ApplicationStatus.Pending && !request.krnlVerified) {
                request.krnlVerified = verified;
                emit VerificationReceived(grantId, user, verified);
                break;
            }
        }
    }

    /// @notice Approve a verified grant application (NGO only)
    function approveApplication(uint256 grantId, address applicant) external {
        require(grants[grantId].ngo == msg.sender, "Only grant creator can approve");
        require(grantRequests[grantId][applicant].krnlVerified, "Application not verified");
        require(grantRequests[grantId][applicant].status == ApplicationStatus.Pending, "Invalid status");

        grantRequests[grantId][applicant].status = ApplicationStatus.Approved;
        grants[grantId].approvedCount++;

        emit ApplicationStatusUpdated(grantId, applicant, ApplicationStatus.Approved);
    }

    /// @notice Complete a milestone and release funds
    function completeMilestone(uint256 grantId, address applicant, uint256 milestoneIndex) 
        external 
        nonReentrant 
    {
        require(grants[grantId].ngo == msg.sender, "Only grant creator can complete milestone");
        require(grantRequests[grantId][applicant].status == ApplicationStatus.Approved, "Not approved");
        require(milestoneIndex < grants[grantId].milestones.length, "Invalid milestone");
        require(grants[grantId].milestones[milestoneIndex].status == MilestoneStatus.InProgress, "Invalid status");

        Milestone storage milestone = grants[grantId].milestones[milestoneIndex];
        milestone.status = MilestoneStatus.Completed;
        
        if (!milestone.fundsReleased) {
            milestone.fundsReleased = true;
            grants[grantId].remainingAmount -= milestone.amount;
            grantRequests[grantId][applicant].fundsReceived += milestone.amount;
            
            // Here you would typically transfer funds
            // For now, we'll just emit an event
            emit FundsReleased(grantId, applicant, milestone.amount);
        }

        emit MilestoneCompleted(grantId, applicant, milestoneIndex);
    }

    /// @notice Get all grants for an NGO
    function getNGOGrants(address ngo) external view returns (uint256[] memory) {
        return ngoGrants[ngo];
    }

    /// @notice Get all applications for a user
    function getUserApplications(address user) external view returns (uint256[] memory) {
        return userApplications[user];
    }

    /// @notice Helper function to convert address to string
    function toString(address account) internal pure returns (string memory) {
        return toString(abi.encodePacked(account));
    }

    /// @notice Helper function to convert bytes to string
    function toString(bytes memory data) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(2 + data.length * 2);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < data.length; i++) {
            str[2 + i * 2] = alphabet[uint8(data[i] >> 4)];
            str[2 + i * 2 + 1] = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }
} 