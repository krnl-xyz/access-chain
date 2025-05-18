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
    EnumerableSet.AddressSet private _admins;
    mapping(address => bool) public isNGO;
    mapping(address => bool) public isAdmin;

    event NGOAdded(address indexed ngo);
    event NGORemoved(address indexed ngo);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    constructor() {
        // Owner is automatically an NGO and admin
        _addNGO(msg.sender);
        _addAdmin(msg.sender);
    }

    modifier onlyNGO() {
        require(isNGO[msg.sender], "Caller is not an NGO");
        _;
    }

    modifier onlyAdmin() {
        require(isAdmin[msg.sender] || owner() == msg.sender, "Caller is not an admin");
        _;
    }

    /// @notice Add an address as an NGO
    /// @param ngo Address to add as NGO
    function addNGO(address ngo) external onlyAdmin {
        require(ngo != address(0), "Invalid address");
        require(!isNGO[ngo], "Already an NGO");
        _addNGO(ngo);
    }

    /// @notice Remove an address from NGO status
    /// @param ngo Address to remove from NGO status
    function removeNGO(address ngo) external onlyAdmin {
        require(isNGO[ngo], "Not an NGO");
        _removeNGO(ngo);
    }

    /// @notice Add an address as an admin
    /// @param admin Address to add as admin
    function addAdmin(address admin) external onlyOwner {
        require(admin != address(0), "Invalid address");
        require(!isAdmin[admin], "Already an admin");
        _addAdmin(admin);
    }

    /// @notice Remove an address from admin status
    /// @param admin Address to remove from admin status
    function removeAdmin(address admin) external onlyOwner {
        require(isAdmin[admin], "Not an admin");
        require(admin != owner(), "Cannot remove owner as admin");
        _removeAdmin(admin);
    }

    /// @notice Check if an address is an NGO
    /// @param account Address to check
    /// @return True if account is an NGO
    function isAuthorizedNGO(address account) external view returns (bool) {
        return isNGO[account];
    }

    /// @notice Check if an address is an admin
    /// @param account Address to check
    /// @return True if account is an admin
    function isAuthorizedAdmin(address account) external view returns (bool) {
        return isAdmin[account] || owner() == account;
    }

    /// @notice Get all NGOs
    /// @return Array of NGO addresses
    function getNGOs() external view returns (address[] memory) {
        return _ngos.values();
    }

    /// @notice Get all admins
    /// @return Array of admin addresses
    function getAdmins() external view returns (address[] memory) {
        return _admins.values();
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

    function _addAdmin(address admin) private {
        _admins.add(admin);
        isAdmin[admin] = true;
        emit AdminAdded(admin);
    }

    function _removeAdmin(address admin) private {
        _admins.remove(admin);
        isAdmin[admin] = false;
        emit AdminRemoved(admin);
    }
}
