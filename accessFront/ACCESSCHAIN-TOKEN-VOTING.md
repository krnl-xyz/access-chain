# AccessChain Token and Voting Features

This documentation provides information on how to use the newly implemented Token Display and Community Voting features in the AccessChain application.

## Overview

AccessChain now includes two new features to enhance the disability resource and funding network:

1. **ACCESS Token Integration** - View your ACCESS token balance directly in the application
2. **Community Voting** - Vote on grant applications to help decide which projects get funded

## Setting Up

### Prerequisites

- MetaMask wallet installed and configured with the Sonic Blaze Testnet
- The ACCESS token added to your MetaMask wallet

### Adding ACCESS Token to MetaMask

1. Open MetaMask and ensure you're connected to the Sonic Blaze Testnet
2. Click "Import Tokens" at the bottom of the assets list
3. Enter the ACCESS token contract address: `0xd4F4B93aD2Fb9a543a74a9C5aad334cAd47B5a4B`
4. The token symbol "ACCESS" and decimals "18" should auto-populate
5. Click "Add Custom Token" and then "Import Tokens" to confirm

## ACCESS Token Display

The ACCESS token balance display shows how many tokens you currently have in your connected wallet.

### Where to Find Your Token Balance

- **Navbar**: Your token balance appears in the navigation bar when connected
- **Grant Detail Page**: View your token balance in the grant details section
- **Demo Dashboard**: See your token balance in the stats section

### Features

- Real-time balance updates
- Automatic detection when connecting your wallet
- Visual indication of token amounts

## Community Voting

The community voting feature allows users to participate in the grant decision-making process.

### How to Vote

1. Navigate to any grant detail page by clicking on a grant from the grants list
2. Scroll down to the "Community Voting" section
3. Review the current voting stats for the grant
4. Click "Vote For" if you support the grant, or "Vote Against" if you don't
5. Confirm the transaction in your MetaMask wallet

### Voting Rules

- You must have a connected wallet to vote
- Each wallet can vote once per grant
- Votes are recorded on the blockchain for transparency
- Current implementation shows local simulation only (blockchain implementation coming soon)

## Demo Dashboard

A special demo dashboard has been created to showcase these features together:

1. Navigate to the Demo Dashboard by clicking "Demo" in the main navigation
2. View the statistics, including your ACCESS token balance
3. See the community voting interface in action
4. Explore upcoming features

## Implementation Details

### TOKEN_BALANCE_DISPLAY Component

The `TokenBalanceDisplay` component uses wagmi's `useBalance` hook to read the token balance from the connected wallet:

```jsx
const { data: tokenBalance, isLoading } = useBalance({
  address: address,
  token: CONTRACT_ADDRESSES.accessToken,
  watch: true,
  enabled: isConnected,
});
```

### VOTE_SIMULATION Component

The `VoteSimulation` component provides a UI for users to vote on grant applications:

```jsx
const handleVote = (support) => {
  if (!isConnected) {
    toast({
      title: "Wallet not connected",
      description: "Please connect your wallet to vote",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
    return;
  }
  
  // Record vote (currently simulated)
  if (support) {
    setVotesFor(votesFor + 1);
  } else {
    setVotesAgainst(votesAgainst + 1);
  }
  
  setHasVoted(true);
};
```

## Upcoming Enhancements

1. **Token-Based Governance**: Use ACCESS tokens to vote with weight proportional to holdings
2. **Token Rewards**: Earn ACCESS tokens for contributing to the community
3. **Milestone-Based Funding**: Release funds based on project milestones with community verification

## Troubleshooting

### Token Balance Not Showing

- Ensure your wallet is connected
- Verify you've added the ACCESS token to MetaMask
- Check that you're on the correct network (Sonic Blaze Testnet)

### Voting Not Working

- Make sure your wallet is connected
- Confirm you have enough gas for the transaction
- Try refreshing the page if the interface appears stuck

## Support

If you encounter any issues with these features, please contact the AccessChain support team or open an issue on the GitHub repository.

---

*AccessChain: Empowering people with disabilities through blockchain technology* 