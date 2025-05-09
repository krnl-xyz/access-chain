// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./NGOAccessControl.sol";

/// @title RequestRegistry
/// @notice Handles user funding/resource requests in AccessChain
contract RequestRegistry is Ownable {
    enum Status { Pending, Approved, Rejected }

    struct Request {
        address applicant;
        string metadataURI; // IPFS link to request details
        Status status;
    }

    uint256 private requestCounter;
    NGOAccessControl public ngoAccessControl;

    mapping(uint256 => Request) public requests;
    mapping(address => uint256[]) public userRequests;

    event RequestSubmitted(uint256 indexed requestId, address indexed applicant);
    event RequestStatusUpdated(uint256 indexed requestId, Status status);

    constructor(address ngoAccessControlAddress) {
        ngoAccessControl = NGOAccessControl(ngoAccessControlAddress);
    }

    /// @notice Submit a new funding/resource request
    /// @param metadataURI Link to IPFS metadata
    function submitRequest(string calldata metadataURI) external {
        requestCounter++;
        uint256 requestId = requestCounter;

        requests[requestId] = Request({
            applicant: msg.sender,
            metadataURI: metadataURI,
            status: Status.Pending
        });

        userRequests[msg.sender].push(requestId);
        emit RequestSubmitted(requestId, msg.sender);
    }

    /// @notice NGOs can update request status (Approve/Reject only)
    /// @param requestId ID of the request to update
    /// @param newStatus Must be Approved or Rejected
    function updateRequestStatus(uint256 requestId, Status newStatus) external {
        require(
            ngoAccessControl.isAuthorizedNGO(msg.sender),
            "Not authorized NGO"
        );
        require(
            newStatus == Status.Approved || newStatus == Status.Rejected,
            "Invalid status"
        );
        require(
            requests[requestId].status == Status.Pending,
            "Request not pending"
        );

        requests[requestId].status = newStatus;
        emit RequestStatusUpdated(requestId, newStatus);
    }

    /// @notice Get request IDs submitted by a specific user
    function getUserRequests(address user) external view returns (uint256[] memory) {
        return userRequests[user];
    }
}
