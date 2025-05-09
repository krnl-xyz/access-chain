import { useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { contracts } from '../config/contracts';

export function useNGOAccessControl() {
    const isAuthorizedNGO = (address) => {
        return useContractRead({
            ...contracts.NGOAccessControl,
            functionName: 'isAuthorizedNGO',
            args: [address],
        });
    };

    const getNGOs = () => {
        return useContractRead({
            ...contracts.NGOAccessControl,
            functionName: 'getNGOs',
        });
    };

    const addNGO = () => {
        return useContractWrite({
            ...contracts.NGOAccessControl,
            functionName: 'addNGO',
        });
    };

    const removeNGO = () => {
        return useContractWrite({
            ...contracts.NGOAccessControl,
            functionName: 'removeNGO',
        });
    };

    return {
        isAuthorizedNGO,
        getNGOs,
        addNGO,
        removeNGO,
    };
}

export function useRequestRegistry() {
    const submitRequest = () => {
        return useContractWrite({
            ...contracts.RequestRegistry,
            functionName: 'submitRequest',
        });
    };

    const updateRequestStatus = () => {
        return useContractWrite({
            ...contracts.RequestRegistry,
            functionName: 'updateRequestStatus',
        });
    };

    const getUserRequests = (address) => {
        return useContractRead({
            ...contracts.RequestRegistry,
            functionName: 'getUserRequests',
            args: [address],
        });
    };

    const getRequest = (requestId) => {
        return useContractRead({
            ...contracts.RequestRegistry,
            functionName: 'requests',
            args: [requestId],
        });
    };

    return {
        submitRequest,
        updateRequestStatus,
        getUserRequests,
        getRequest,
    };
}

export function useAccessToken() {
    const mint = () => {
        return useContractWrite({
            ...contracts.AccessToken,
            functionName: 'mint',
        });
    };

    const transfer = () => {
        return useContractWrite({
            ...contracts.AccessToken,
            functionName: 'transfer',
        });
    };

    const balanceOf = (address) => {
        return useContractRead({
            ...contracts.AccessToken,
            functionName: 'balanceOf',
            args: [address],
        });
    };

    const totalSupply = () => {
        return useContractRead({
            ...contracts.AccessToken,
            functionName: 'totalSupply',
        });
    };

    return {
        mint,
        transfer,
        balanceOf,
        totalSupply,
    };
}

export function useAccessNFT() {
    const mint = () => {
        return useContractWrite({
            ...contracts.AccessNFT,
            functionName: 'mint',
        });
    };

    const burn = () => {
        return useContractWrite({
            ...contracts.AccessNFT,
            functionName: 'burn',
        });
    };

    const tokenURI = (tokenId) => {
        return useContractRead({
            ...contracts.AccessNFT,
            functionName: 'tokenURI',
            args: [tokenId],
        });
    };

    const ownerOf = (tokenId) => {
        return useContractRead({
            ...contracts.AccessNFT,
            functionName: 'ownerOf',
            args: [tokenId],
        });
    };

    return {
        mint,
        burn,
        tokenURI,
        ownerOf,
    };
}

export function useAccessDAO() {
    const createProposal = () => {
        return useContractWrite({
            ...contracts.AccessDAO,
            functionName: 'createProposal',
        });
    };

    const vote = () => {
        return useContractWrite({
            ...contracts.AccessDAO,
            functionName: 'vote',
        });
    };

    const executeProposal = () => {
        return useContractWrite({
            ...contracts.AccessDAO,
            functionName: 'executeProposal',
        });
    };

    const getProposalStatus = (proposalId) => {
        return useContractRead({
            ...contracts.AccessDAO,
            functionName: 'getProposalStatus',
            args: [proposalId],
        });
    };

    return {
        createProposal,
        vote,
        executeProposal,
        getProposalStatus,
    };
} 