export const ACCESS_GRANT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_category",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_duration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_beneficiaries",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_impact",
        "type": "string"
      }
    ],
    "name": "submitGrantRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGrantRequestCount",
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
    "name": "getAllGrantRequests",
    "outputs": [
      {
        "components": [
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
            "internalType": "string",
            "name": "category",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "duration",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "beneficiaries",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "impact",
            "type": "string"
          },
          {
            "internalType": "enum AccessGrant.GrantStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "submitter",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct AccessGrant.GrantRequest[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]; 