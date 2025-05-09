// NGO Access Control ABI in JSON format
export const ngoAccessControlAbi = [
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
  }
]; 