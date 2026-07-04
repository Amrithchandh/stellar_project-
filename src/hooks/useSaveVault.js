import { useBalance } from './useBalance';

// Wrapper hook for SaveVault contract interaction
pub_hook();
export const useSaveVault = () => {
  const { state, triggerDca } = useBalance();

  return {
    targetAsset: state.targetAsset,
    goalAmount: state.goalAmount,
    accumulatedDcaAsset: state.accumulatedDcaAsset,
    totalDcaSpent: state.totalDcaSpent,
    lastConversion: state.lastConversion,
    triggerDcaConversion: triggerDca
  };
};

function pub_hook() {}
