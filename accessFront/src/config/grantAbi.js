// AccessGrant ABI in JSON format
export const accessGrantAbi = [
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
        "internalType": "address",
        "name": "applicant",
        "type": "address"
      }
    ],
    "name": "rejectApplication",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
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
  }
]; 