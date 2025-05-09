// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AccessToken is ERC20, Ownable, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 10000000 * 10 ** 18; // 10M tokens
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10 ** 18; // 1M tokens
    uint256 public constant TRANSFER_COOLDOWN = 1 days;
    mapping(address => uint256) public lastTransferTime;

    constructor() ERC20("AccessToken", "ACT") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function mint(address to, uint256 amount) external onlyOwner nonReentrant {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        if (from != address(0) && to != address(0)) {
            require(
                block.timestamp - lastTransferTime[from] >= TRANSFER_COOLDOWN,
                "Transfer cooldown not met"
            );
            lastTransferTime[from] = block.timestamp;
        }
        super._beforeTokenTransfer(from, to, amount);
    }
}