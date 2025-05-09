// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/// @title NGOAccessControl
/// @notice Manages NGO roles and permissions
contract NGOAccessControl is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    // Role management
    EnumerableSet.AddressSet private _ngos;
    mapping(address => bool) public isNGO;

    event NGOAdded(address indexed ngo);
    event NGORemoved(address indexed ngo);

    constructor() {
        // Owner is automatically an NGO
        _addNGO(msg.sender);
    }

    modifier onlyNGO() {
        require(isNGO[msg.sender], "Caller is not an NGO");
        _;
    }

    /// @notice Add an address as an NGO
    /// @param ngo Address to add as NGO
    function addNGO(address ngo) external onlyOwner {
        require(ngo != address(0), "Invalid address");
        require(!isNGO[ngo], "Already an NGO");
        _addNGO(ngo);
    }

    /// @notice Remove an address from NGO status
    /// @param ngo Address to remove from NGO status
    function removeNGO(address ngo) external onlyOwner {
        require(isNGO[ngo], "Not an NGO");
        _removeNGO(ngo);
    }

    /// @notice Check if an address is an NGO
    /// @param account Address to check
    /// @return True if account is an NGO
    function isAuthorizedNGO(address account) external view returns (bool) {
        return isNGO[account];
    }

    /// @notice Get all NGOs
    /// @return Array of NGO addresses
    function getNGOs() external view returns (address[] memory) {
        return _ngos.values();
    }

    function _addNGO(address ngo) private {
        _ngos.add(ngo);
        isNGO[ngo] = true;
        emit NGOAdded(ngo);
    }

    function _removeNGO(address ngo) private {
        _ngos.remove(ngo);
        isNGO[ngo] = false;
        emit NGORemoved(ngo);
    }
}
