# Team-AccessChain

## Overview
AccessChain is a blockchain-based platform that connects people with disabilities to funding and resources through transparent grant management. It eliminates intermediaries, ensuring direct support reaches beneficiaries while providing NGOs with efficient tools to create and manage disability support grants.

## Features
✅ On-chain disability verification and registration
✅ NGO verification and grant management system
✅ Direct funding between donors and beneficiaries
✅ Community voting on grant applications
✅ ACCESS token integration for governance
✅ Accessibility-first design for all users

## Project Structure
- `contracts/`: Smart contracts for disability verification, grant management, and token functionality
- `accessFront/`: React-based frontend application with Chakra UI components
- `scripts/`: Deployment and configuration scripts
- `test/`: Contract test files
- `assets/`: Design assets and images
- `docs/`: Additional documentation

## Tech Stack
- Solidity + Hardhat
- React + Chakra UI
- Wagmi v2 / Ethers.js
- MetaMask integration
- Sonic Blaze Testnet

## How to Run Locally
1. Clone the repo
```shell
git clone https://github.com/Blockbridge-Network/Team-AccessChain-Core.git
cd Team-AccessChain-Core
```

2. Install dependencies
```shell
npm install
cd accessFront
npm install
```

3. Configure MetaMask for Sonic Blaze Testnet
   - Network Name: Sonic Blaze Testnet
   - RPC URL: https://rpc.blaze.soniclabs.com
   - Chain ID: 57054
   - Currency Symbol: SONIC

4. Start the development server
```shell
cd accessFront
npm run dev
```

## Contracts
| Contract | Address | Network |
|----------|---------|---------|
| NGOAccessControl | 0x16788aD7d27A8e244BEbF1cdc3906b43f7f66f80 | Sonic Testnet |
| RequestRegistry | 0xC880064656D06317A55EC3cD9036D8CE8E217497 | Sonic Testnet |
| AccessGrant | 0x1eA07a7e5Fc838146E9de9F801d50f3F896a6587 | Sonic Testnet |
| AccessToken | 0xd4F4B93aD2Fb9a543a74a9C5aad334cAd47B5a4B | Sonic Testnet |
| AccessNFT | 0x9C270EA210E741B550bF822625694D0f64c71492 | Sonic Testnet |
| AccessDAO | 0x0081FB567ae0851f8fa47E39c6e3882e9f91e10F | Sonic Testnet |

## 📸 Screenshots
Check out our application screenshots in the [screenshots](./screenshots) directory.

## 🎥 Demo Video
[Watch our demo video](https://youtu.be/your-video-id) to see AccessChain in action.

## Team
- Richmond Andoh (Full-Stack Developer)
- Agyemang Nana Akua (Frontend Developer)
- Adwoa Favour (UI/UX Designer)

## 📄 License
MIT
