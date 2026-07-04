import { useState, useEffect, useCallback } from 'react';

const INITIAL_STATE = {
  employerAddress: 'employer_stellar_active_key_8892',
  workerAddress: 'worker_stellar_pub_key_3129',
  streamRate: 0.05, // simple units per second (e.g., ₹0.05/sec = ₹180/hour)
  streamStart: null, // timestamp
  lastCheckpoint: null, // timestamp
  employerBalance: 0, // total employer funded pool
  isActive: false,
  vaultAllocations: {
    spending: 50,
    savings: 20,
    goals: 20,
    bills: 10
  },
  checkpointBalances: {
    spending: 0,
    savings: 0,
    goals: 0,
    bills: 0
  },
  // SaveVault DCA State
  targetAsset: 'Digital Gold (XAU)',
  goalAmount: 1500, // target goal in savings
  accumulatedDcaAsset: 0, // grams of gold or tokens bought
  totalDcaSpent: 0, // fiat spent on DCA
  lastConversion: null, // timestamp
  // History log
  transactions: []
};

// Simulated price feed (mock Reflector Oracle)
export const getOraclePrice = (asset) => {
  // Returns mock price of XAU (Gold) in INR per gram (e.g. ₹6,500/gram) with slight random fluctuation
  const basePrice = 6500;
  const timeSeed = Math.sin(Date.now() / 60000) * 50;
  return Math.round((basePrice + timeSeed) * 100) / 100;
};

export const useBalance = () => {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('streamsave_state');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  // Persist state to localStorage on any change
  useEffect(() => {
    localStorage.setItem('streamsave_state', JSON.stringify(state));
  }, [state]);

  // Start the stream
  const fundStream = useCallback((amount, rate, allocations) => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      isActive: true,
      streamRate: Number(rate),
      employerBalance: Number(amount),
      streamStart: now,
      lastCheckpoint: now,
      vaultAllocations: allocations,
      checkpointBalances: {
        spending: 0,
        savings: 0,
        goals: 0,
        bills: 0
      },
      transactions: [
        {
          id: 'tx_' + Date.now(),
          type: 'fund_stream',
          amount: Number(amount),
          rate: Number(rate),
          timestamp: now
        },
        ...prev.transactions
      ]
    }));
  }, []);

  // Update allocations
  const updateAllocations = useCallback((newAllocations) => {
    if (!state.isActive) {
      setState(prev => ({ ...prev, vaultAllocations: newAllocations }));
      return;
    }

    const now = Date.now();
    const elapsedSeconds = (now - state.lastCheckpoint) / 1000;
    const accrued = state.streamRate * elapsedSeconds;

    // We must limit accrued by remaining employer balance
    const actualAccrued = Math.min(accrued, state.employerBalance);

    setState(prev => {
      const updatedCheckpointBalances = { ...prev.checkpointBalances };
      Object.keys(prev.vaultAllocations).forEach(vaultId => {
        const pct = prev.vaultAllocations[vaultId] / 100;
        updatedCheckpointBalances[vaultId] += actualAccrued * pct;
      });

      return {
        ...prev,
        lastCheckpoint: now,
        employerBalance: Math.max(0, prev.employerBalance - actualAccrued),
        checkpointBalances: updatedCheckpointBalances,
        vaultAllocations: newAllocations,
        transactions: [
          {
            id: 'tx_' + Date.now(),
            type: 'update_allocations',
            allocations: newAllocations,
            timestamp: now
          },
          ...prev.transactions
        ]
      };
    });
  }, [state.isActive, state.lastCheckpoint, state.streamRate, state.employerBalance]);

  // Withdraw from a vault
  const withdraw = useCallback((vaultId, amount) => {
    const now = Date.now();
    const elapsedSeconds = state.isActive ? (now - state.lastCheckpoint) / 1000 : 0;
    const accrued = state.streamRate * elapsedSeconds;
    const actualAccrued = Math.min(accrued, state.employerBalance);

    setState(prev => {
      // Calculate current balance first
      const updatedCheckpointBalances = { ...prev.checkpointBalances };
      Object.keys(prev.vaultAllocations).forEach(vId => {
        const pct = prev.vaultAllocations[vId] / 100;
        updatedCheckpointBalances[vId] += actualAccrued * pct;
      });

      // Check if enough funds
      if (updatedCheckpointBalances[vaultId] < amount) {
        return prev; // Insufficient funds, do nothing
      }

      // Deduct
      updatedCheckpointBalances[vaultId] -= amount;

      return {
        ...prev,
        lastCheckpoint: now,
        employerBalance: Math.max(0, prev.employerBalance - actualAccrued),
        checkpointBalances: updatedCheckpointBalances,
        transactions: [
          {
            id: 'tx_' + Date.now(),
            type: 'withdraw',
            vaultId,
            amount,
            timestamp: now
          },
          ...prev.transactions
        ]
      };
    });

    return true;
  }, [state.isActive, state.lastCheckpoint, state.streamRate, state.employerBalance]);

  // Trigger DCA auto-buy/conversion on SaveVault
  const triggerDca = useCallback(() => {
    const now = Date.now();
    const elapsedSeconds = state.isActive ? (now - state.lastCheckpoint) / 1000 : 0;
    const accrued = state.streamRate * elapsedSeconds;
    const actualAccrued = Math.min(accrued, state.employerBalance);

    setState(prev => {
      // Calculate current balances
      const updatedCheckpointBalances = { ...prev.checkpointBalances };
      Object.keys(prev.vaultAllocations).forEach(vId => {
        const pct = prev.vaultAllocations[vId] / 100;
        updatedCheckpointBalances[vId] += actualAccrued * pct;
      });

      // The savings amount to convert is whatever is in the savings vault checkpoint
      const savingsToConvert = updatedCheckpointBalances.savings;
      if (savingsToConvert <= 0) return prev;

      // Oracle lookup
      const price = getOraclePrice(prev.targetAsset);
      const assetBought = savingsToConvert / price; // Grams of gold

      // Empty the savings vault cash, add to DCA asset
      updatedCheckpointBalances.savings = 0;

      return {
        ...prev,
        lastCheckpoint: now,
        employerBalance: Math.max(0, prev.employerBalance - actualAccrued),
        checkpointBalances: updatedCheckpointBalances,
        accumulatedDcaAsset: prev.accumulatedDcaAsset + assetBought,
        totalDcaSpent: prev.totalDcaSpent + savingsToConvert,
        lastConversion: now,
        transactions: [
          {
            id: 'tx_' + Date.now(),
            type: 'dca_conversion',
            spent: savingsToConvert,
            receivedAsset: assetBought,
            assetName: prev.targetAsset,
            price: price,
            timestamp: now
          },
          ...prev.transactions
        ]
      };
    });
  }, [state.isActive, state.lastCheckpoint, state.streamRate, state.employerBalance]);

  // Reset/Clear stream
  const resetStream = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  // Compute live accrued values in real-time
  const getLiveBalances = useCallback(() => {
    if (!state.isActive) {
      return {
        balances: state.checkpointBalances,
        totalAccrued: Object.values(state.checkpointBalances).reduce((a, b) => a + b, 0),
        employerRemaining: state.employerBalance,
        elapsedTime: 0
      };
    }

    const now = Date.now();
    const elapsedSeconds = (now - state.lastCheckpoint) / 1000;
    const accrued = state.streamRate * elapsedSeconds;
    
    // Cap accrued at remaining employer balance
    const actualAccrued = Math.min(accrued, state.employerBalance);

    const liveBalances = {};
    Object.keys(state.checkpointBalances).forEach(vaultId => {
      const pct = state.vaultAllocations[vaultId] / 100;
      liveBalances[vaultId] = state.checkpointBalances[vaultId] + (actualAccrued * pct);
    });

    const totalAccrued = Object.values(liveBalances).reduce((a, b) => a + b, 0);
    const elapsedTime = Math.round((now - state.streamStart) / 1000);

    return {
      balances: liveBalances,
      totalAccrued,
      employerRemaining: Math.max(0, state.employerBalance - actualAccrued),
      elapsedTime
    };
  }, [state]);

  return {
    state,
    fundStream,
    withdraw,
    updateAllocations,
    triggerDca,
    resetStream,
    getLiveBalances
  };
};
