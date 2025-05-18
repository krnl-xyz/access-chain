// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./NGOAccessControl.sol";

/// @title AccessToken
/// @notice ERC20 token for the AccessChain platform with staking capabilities
contract AccessToken is ERC20, Ownable, ReentrancyGuard {
    NGOAccessControl public ngoAccessControl;
    
    // Staking structures
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 lockPeriod;
    }
    
    // Staking parameters
    uint256 public constant MIN_STAKE_AMOUNT = 100 * 10**18; // 100 tokens
    uint256 public constant MAX_STAKE_AMOUNT = 1000000 * 10**18; // 1M tokens
    uint256 public constant MIN_STAKE_PERIOD = 30 days;
    uint256 public constant MAX_STAKE_PERIOD = 365 days;
    
    // Staking rewards
    uint256 public constant BASE_REWARD_RATE = 5; // 5% APY
    uint256 public constant BONUS_REWARD_RATE = 10; // 10% APY for long-term staking
    
    // Mappings
    mapping(address => Stake) public stakes;
    mapping(address => uint256) public stakingPower;
    
    // Events
    event TokensStaked(address indexed user, uint256 amount, uint256 lockPeriod);
    event TokensUnstaked(address indexed user, uint256 amount, uint256 reward);
    event StakingPowerUpdated(address indexed user, uint256 newPower);
    
    constructor(address _ngoAccessControl) ERC20("AccessChain Token", "ACC") Ownable() {
        ngoAccessControl = NGOAccessControl(_ngoAccessControl);
    }
    
    /// @notice Mint tokens to an address (only owner)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /// @notice Stake tokens for platform participation
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant {
        require(amount >= MIN_STAKE_AMOUNT, "Amount below minimum stake");
        require(amount <= MAX_STAKE_AMOUNT, "Amount above maximum stake");
        require(lockPeriod >= MIN_STAKE_PERIOD, "Lock period too short");
        require(lockPeriod <= MAX_STAKE_PERIOD, "Lock period too long");
        require(stakes[msg.sender].amount == 0, "Already staked");
        
        // Transfer tokens from user to contract
        _transfer(msg.sender, address(this), amount);
        
        // Create stake
        stakes[msg.sender] = Stake({
            amount: amount,
            timestamp: block.timestamp,
            lockPeriod: lockPeriod
        });
        
        // Calculate staking power (amount * lock period multiplier)
        uint256 power = calculateStakingPower(amount, lockPeriod);
        stakingPower[msg.sender] = power;
        
        emit TokensStaked(msg.sender, amount, lockPeriod);
        emit StakingPowerUpdated(msg.sender, power);
    }
    
    /// @notice Unstake tokens after lock period
    function unstake() external nonReentrant {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No stake found");
        require(block.timestamp >= userStake.timestamp + userStake.lockPeriod, "Lock period not ended");
        
        uint256 amount = userStake.amount;
        uint256 reward = calculateReward(userStake);
        
        // Clear stake
        delete stakes[msg.sender];
        stakingPower[msg.sender] = 0;
        
        // Transfer staked tokens and rewards
        _transfer(address(this), msg.sender, amount + reward);
        
        emit TokensUnstaked(msg.sender, amount, reward);
        emit StakingPowerUpdated(msg.sender, 0);
    }
    
    /// @notice Calculate staking power based on amount and lock period
    function calculateStakingPower(uint256 amount, uint256 lockPeriod) public pure returns (uint256) {
        // Base power is the amount
        // Lock period multiplier: 1x for minimum period, up to 2x for maximum period
        uint256 lockMultiplier = 1e18 + ((lockPeriod - MIN_STAKE_PERIOD) * 1e18) / (MAX_STAKE_PERIOD - MIN_STAKE_PERIOD);
        return (amount * lockMultiplier) / 1e18;
    }
    
    /// @notice Calculate reward for a stake
    function calculateReward(Stake memory userStake) public view returns (uint256) {
        uint256 stakingDuration = block.timestamp - userStake.timestamp;
        uint256 rewardRate = userStake.lockPeriod >= MAX_STAKE_PERIOD ? BONUS_REWARD_RATE : BASE_REWARD_RATE;
        
        // Calculate reward: amount * rate * duration / (365 days)
        return (userStake.amount * rewardRate * stakingDuration) / (365 days * 100);
    }
    
    /// @notice Get staking power for an address
    function getStakingPower(address user) external view returns (uint256) {
        return stakingPower[user];
    }
    
    /// @notice Check if an address has sufficient staking power for grant creation
    function hasGrantCreationPower(address user) external view returns (bool) {
        return stakingPower[user] >= MIN_STAKE_AMOUNT;
    }
    
    /// @notice Check if an address has sufficient staking power for grant application
    function hasGrantApplicationPower(address user) external view returns (bool) {
        return stakingPower[user] >= (MIN_STAKE_AMOUNT / 2);
    }
}