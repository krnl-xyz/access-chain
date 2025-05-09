// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title AccessDAO
/// @notice Basic governance mechanism using AccessToken
contract AccessDAO is Ownable, ReentrancyGuard {
    IERC20 public accessToken;
    uint256 public constant MIN_VOTING_PERIOD = 3 days;
    uint256 public constant MIN_QUORUM = 1000 * 10 ** 18; // 1000 tokens

    enum VoteOption { None, Yes, No }

    struct Proposal {
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 deadline;
        uint256 totalVotingPower;
        mapping(address => VoteOption) votes;
        bool executed;
    }

    uint256 public proposalCounter;
    mapping(uint256 => Proposal) public proposals;

    event ProposalCreated(uint256 indexed proposalId, string description, uint256 deadline);
    event Voted(uint256 indexed proposalId, address indexed voter, VoteOption option);
    event ProposalExecuted(uint256 indexed proposalId, bool passed);
    event ProposalFailed(uint256 indexed proposalId, string reason);

    constructor(address tokenAddress) {
        accessToken = IERC20(tokenAddress);
    }

    /// @notice Create a new proposal
    /// @param description Human-readable description
    /// @param votingPeriod Duration in seconds (e.g., 3 days = 3 * 86400)
    function createProposal(string calldata description, uint256 votingPeriod) external nonReentrant {
        require(bytes(description).length > 0, "Description cannot be empty");
        require(votingPeriod >= MIN_VOTING_PERIOD, "Voting period too short");

        proposalCounter++;
        Proposal storage p = proposals[proposalCounter];
        p.description = description;
        p.deadline = block.timestamp + votingPeriod;
        p.totalVotingPower = accessToken.totalSupply();

        emit ProposalCreated(proposalCounter, description, p.deadline);
    }

    /// @notice Vote on a proposal (once)
    /// @param proposalId The proposal to vote on
    /// @param support Vote yes or no
    function vote(uint256 proposalId, bool support) external nonReentrant {
        Proposal storage p = proposals[proposalId];
        require(proposalId <= proposalCounter, "Invalid proposal ID");
        require(block.timestamp < p.deadline, "Voting period has ended");
        require(p.votes[msg.sender] == VoteOption.None, "Already voted");

        uint256 weight = accessToken.balanceOf(msg.sender);
        require(weight > 0, "Must own tokens to vote");

        if (support) {
            p.yesVotes += weight;
            p.votes[msg.sender] = VoteOption.Yes;
        } else {
            p.noVotes += weight;
            p.votes[msg.sender] = VoteOption.No;
        }

        emit Voted(proposalId, msg.sender, p.votes[msg.sender]);
    }

    /// @notice Execute a proposal after deadline (mark as passed/failed)
    /// @param proposalId The proposal to finalize
    function executeProposal(uint256 proposalId) external nonReentrant {
        Proposal storage p = proposals[proposalId];
        require(proposalId <= proposalCounter, "Invalid proposal ID");
        require(block.timestamp >= p.deadline, "Voting still active");
        require(!p.executed, "Already executed");

        uint256 totalVotes = p.yesVotes + p.noVotes;
        require(totalVotes >= MIN_QUORUM, "Quorum not met");

        bool passed = p.yesVotes > p.noVotes;
        p.executed = true;

        if (passed) {
            emit ProposalExecuted(proposalId, passed);
        } else {
            emit ProposalFailed(proposalId, "Proposal did not pass");
        }
    }

    function getProposalStatus(uint256 proposalId) external view returns (bool active, bool passed) {
        Proposal storage p = proposals[proposalId];
        active = block.timestamp < p.deadline;
        passed = p.executed ? p.yesVotes > p.noVotes : false;
        return (active, passed);
    }
}
