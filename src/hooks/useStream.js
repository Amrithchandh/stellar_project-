import { useBalance } from './useBalance';

// Wrapper hook for StreamVault contract interaction
export const useStream = () => {
  const { state, fundStream, withdraw, updateAllocations, getLiveBalances } = useBalance();

  return {
    isActive: state.isActive,
    streamRate: state.streamRate,
    employerBalance: state.employerBalance,
    vaultAllocations: state.vaultAllocations,
    checkpointBalances: state.checkpointBalances,
    fundStream,
    withdrawFromVault: withdraw,
    updateAllocation: updateAllocations,
    getLiveBalances
  };
};
