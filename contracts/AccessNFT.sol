// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title AccessNFT
/// @notice Soulbound NFTs representing credentials for users and NGOs
contract AccessNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Strings for uint256;
    
    uint256 private _tokenIdCounter;
    uint256 public constant MAX_SUPPLY = 10000;
    string public baseURI;

    /// @dev Mapping to disable transfer (Soulbound enforcement)
    mapping(uint256 => bool) public soulbound;
    mapping(uint256 => uint256) public lastTransferTime;
    uint256 public constant TRANSFER_COOLDOWN = 1 days;

    event TokenMinted(uint256 indexed tokenId, address indexed owner);
    event TokenBurned(uint256 indexed tokenId, address indexed owner);

    constructor() ERC721("AccessCredential", "ACNFT") {
        baseURI = "ipfs://";
    }

    /// @notice Mint a Soulbound NFT to a user
    /// @param to The address to receive the NFT
    /// @param uri Metadata URI (stored on IPFS)
    function mint(address to, string memory uri) external onlyOwner nonReentrant {
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");
        require(bytes(uri).length > 0, "URI cannot be empty");
        require(bytes(uri)[0] == 'Q', "Invalid IPFS hash");
        
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _mint(to, newTokenId);
        _setTokenURI(newTokenId, uri);
        soulbound[newTokenId] = true;

        emit TokenMinted(newTokenId, to);
    }

    /// @dev Prevent transfers if token is Soulbound
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        require(
            from == address(0) || !soulbound[tokenId],
            "Soulbound: Token is non-transferable"
        );
    }

    /// @notice Burn a Soulbound NFT if needed (e.g., revocation)
    /// @param tokenId Token ID to burn
    function burn(uint256 tokenId) external nonReentrant {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "Not owner or approved"
        );
        _burn(tokenId);
        emit TokenBurned(tokenId, _msgSender());
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
}