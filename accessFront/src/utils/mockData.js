// Mock data for testing
export const mockGrants = [
  {
    id: 0,
    title: "Educational Support for Rural Communities",
    description: "Providing educational resources and support to rural communities in developing regions.",
    amount: "2.5",
    category: "education",
    duration: "12",
    beneficiaries: "500",
    impact: "Improve literacy rates and provide access to quality education for 500 children in rural areas.",
    status: "pending",
    submitter: "0x1234...5678",
    timestamp: new Date(2024, 2, 15).getTime(),
  },
  {
    id: 1,
    title: "Healthcare Access Initiative",
    description: "Establishing mobile healthcare units to serve underserved communities.",
    amount: "5.0",
    category: "healthcare",
    duration: "18",
    beneficiaries: "1000",
    impact: "Provide essential healthcare services to 1000 people in remote areas.",
    status: "approved",
    submitter: "0x8765...4321",
    timestamp: new Date(2024, 2, 10).getTime(),
  },
  {
    id: 2,
    title: "Environmental Conservation Project",
    description: "Implementing sustainable practices and conservation efforts in local communities.",
    amount: "3.0",
    category: "environment",
    duration: "24",
    beneficiaries: "2000",
    impact: "Reduce carbon footprint and promote sustainable practices in the community.",
    status: "completed",
    submitter: "0x2468...1357",
    timestamp: new Date(2024, 1, 28).getTime(),
  },
];

// Mock functions to simulate contract interactions
export const mockContract = {
  submitGrantRequest: async (title, description, amount, category, duration, beneficiaries, impact) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newGrant = {
      id: mockGrants.length,
      title,
      description,
      amount,
      category,
      duration,
      beneficiaries,
      impact,
      status: "pending",
      submitter: "0x" + Math.random().toString(16).slice(2, 10),
      timestamp: Date.now(),
    };
    
    mockGrants.push(newGrant);
    return { hash: "0x" + Math.random().toString(16).slice(2, 42) };
  },

  getGrantRequestCount: () => mockGrants.length,

  getAllGrantRequests: () => mockGrants,
};

// Mock hooks to replace wagmi hooks
export const useMockContract = () => {
  const [data, setData] = useState(mockGrants);
  const [isLoading, setIsLoading] = useState(false);

  const submitGrant = async (args) => {
    setIsLoading(true);
    try {
      const result = await mockContract.submitGrantRequest(...args);
      setData([...mockGrants]);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    submitGrant,
  };
}; 