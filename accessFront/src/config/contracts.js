// Contract addresses and ABIs for the Access Chain Core contracts
export const CONTRACT_ADDRESSES = {
    NGOAccessControl: "0x16788aD7d27A8e244BEbF1cdc3906b43f7f66f80",
    RequestRegistry: "0xC880064656D06317A55EC3cD9036D8CE8E217497",
    AccessGrant: "0x1eA07a7e5Fc838146E9de9F801d50f3F896a6587",
    AccessToken: "0xd4F4B93aD2Fb9a543a74a9C5aad334cAd47B5a4B",
    AccessNFT: "0x9C270EA210E741B550bF822625694D0f64c71492",
    AccessDAO: "0x0081FB567ae0851f8fa47E39c6e3882e9f91e10F",
    
    // Aliases with consistent casing for backward compatibility
    ngoAccessControl: "0x16788aD7d27A8e244BEbF1cdc3906b43f7f66f80",
    requestRegistry: "0xC880064656D06317A55EC3cD9036D8CE8E217497",
    accessGrant: "0x1eA07a7e5Fc838146E9de9F801d50f3F896a6587",
    accessToken: "0xd4F4B93aD2Fb9a543a74a9C5aad334cAd47B5a4B",
    accessNFT: "0x9C270EA210E741B550bF822625694D0f64c71492",
    accessDAO: "0x0081FB567ae0851f8fa47E39c6e3882e9f91e10F"
};

// Individual contract address exports
export const NGOAccessControlAddress = "0x0Af2AD4D613673c2BDe677b0dA3FeF939C609519";
export const RequestRegistryAddress = CONTRACT_ADDRESSES.RequestRegistry;
export const AccessGrantAddress = CONTRACT_ADDRESSES.AccessGrant;
export const AccessTokenAddress = CONTRACT_ADDRESSES.AccessToken;
export const AccessNFTAddress = CONTRACT_ADDRESSES.AccessNFT;
export const AccessDAOAddress = CONTRACT_ADDRESSES.AccessDAO;

// NGO Access Control Contract ABI
export const NGOAccessControlABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "ngo",
        "type": "address"
      }
    ],
    "name": "NGOAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "ngo",
        "type": "address"
      }
    ],
    "name": "NGORemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "ngo",
        "type": "address"
      }
    ],
    "name": "addNGO",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getNGOs",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "isAuthorizedAdmin",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "isAuthorizedNGO",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isNGO",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "ngo",
        "type": "address"
      }
    ],
    "name": "removeNGO",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const RequestRegistryABI = [
    "function submitRequest(string calldata metadataURI) external",
    "function updateRequestStatus(uint256 requestId, uint8 newStatus) external",
    "function getUserRequests(address user) external view returns (uint256[])",
    "function requests(uint256) external view returns (address, string, uint8)",
    "event RequestSubmitted(uint256 indexed requestId, address indexed applicant)",
    "event RequestStatusUpdated(uint256 indexed requestId, uint8 status)"
];

export const AccessTokenABI = [
    "function mint(address to, uint256 amount) external",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function totalSupply() external view returns (uint256)"
];

export const AccessNFTABI = [
    "function mint(address to, string memory uri) external",
    "function burn(uint256 tokenId) external",
    "function tokenURI(uint256 tokenId) external view returns (string memory)",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "event TokenMinted(uint256 indexed tokenId, address indexed owner)",
    "event TokenBurned(uint256 indexed tokenId, address indexed owner)"
];

export const AccessDAOABI = [
    "function createProposal(string calldata description, uint256 votingPeriod) external",
    "function vote(uint256 proposalId, bool support) external",
    "function executeProposal(uint256 proposalId) external",
    "function getProposalStatus(uint256 proposalId) external view returns (bool, bool)",
    "event ProposalCreated(uint256 indexed proposalId, string description, uint256 deadline)",
    "event Voted(uint256 indexed proposalId, address indexed voter, uint8 option)",
    "event ProposalExecuted(uint256 indexed proposalId, bool passed)"
];

export const AccessGrantABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "ngoAccessControlAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "grantId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "applicant",
        "type": "address"
      }
    ],
    "name": "ApplicationApproved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "grantId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "applicant",
        "type": "address"
      }
    ],
    "name": "ApplicationRejected",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "grantId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "applicant",
        "type": "address"
      }
    ],
    "name": "ApplicationSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "grantId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "ngo",
        "type": "address"
      }
    ],
    "name": "GrantCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "grantId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "applicant",
        "type": "address"
      }
    ],
    "name": "approveApplication",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "grantId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "proposal",
        "type": "string"
      }
    ],
    "name": "applyForGrant",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "createGrant",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGrants",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "ngo",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
        ],
        "internalType": "struct AccessGrant.Grant[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "grants",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "ngo",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "grantId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "applicant",
        "type": "address"
      }
    ],
    "name": "rejectApplication",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Export contract configurations
export const CONTRACT_ABIS = {
  ngoAccessControl: NGOAccessControlABI,
  requestRegistry: RequestRegistryABI,
  accessGrant: AccessGrantABI,
  accessToken: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_ngoAccessControl",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "lockPeriod",
          "type": "uint256"
        }
      ],
      "name": "stake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unstake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getStakingPower",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "stakes",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "lockPeriod",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MIN_STAKE_AMOUNT",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MAX_STAKE_AMOUNT",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MIN_STAKE_PERIOD",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MAX_STAKE_PERIOD",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "lockPeriod",
          "type": "uint256"
        }
      ],
      "name": "TokensStaked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "reward",
          "type": "uint256"
        }
      ],
      "name": "TokensUnstaked",
      "type": "event"
    }
  ],
  accessNFT: AccessNFTABI,
  accessDAO: AccessDAOABI,
};

// Contract function names
export const CONTRACT_FUNCTIONS = {
  // RequestRegistry
  submitRequest: 'submitRequest',
  updateRequestStatus: 'updateRequestStatus',
  getUserRequests: 'getUserRequests',
  getRequestDetails: 'requests',

  // NGOAccessControl
  addNGO: 'addNGO',
  removeNGO: 'removeNGO',
  isAuthorizedNGO: 'isAuthorizedNGO',
  getNGOs: 'getNGOs',

  // AccessToken
  mint: 'mint',
  transfer: 'transfer',
  balanceOf: 'balanceOf',
  totalSupply: 'totalSupply',

  // AccessNFT
  mintNFT: 'mint',
  burnNFT: 'burn',
  tokenURI: 'tokenURI',
  ownerOf: 'ownerOf',

  // AccessDAO
  createProposal: 'createProposal',
  vote: 'vote',
  executeProposal: 'executeProposal',
  getProposalStatus: 'getProposalStatus',

  // AccessGrant
  createGrant: 'createGrant',
  getGrants: 'getGrants',
  applyForGrant: 'applyForGrant',
  approveApplication: 'approveApplication',
  rejectApplication: 'rejectApplication',
};

// Contract events
export const CONTRACT_EVENTS = {
  // RequestRegistry
  RequestSubmitted: 'RequestSubmitted',
  RequestStatusUpdated: 'RequestStatusUpdated',

  // NGOAccessControl
  NGOAdded: 'NGOAdded',
  NGORemoved: 'NGORemoved',

  // AccessToken
  Transfer: 'Transfer',

  // AccessNFT
  TokenMinted: 'TokenMinted',
  TokenBurned: 'TokenBurned',

  // AccessDAO
  ProposalCreated: 'ProposalCreated',
  Voted: 'Voted',
  ProposalExecuted: 'ProposalExecuted',

  // AccessGrant
  GrantCreated: 'GrantCreated',
  ApplicationSubmitted: 'ApplicationSubmitted',
  ApplicationApproved: 'ApplicationApproved',
  ApplicationRejected: 'ApplicationRejected',
}; 