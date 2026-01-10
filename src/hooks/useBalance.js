import { useState, useEffect } from 'react';

const INITIAL_WALLETS = {
  leisure: 2000,
  savings: 1500,
  goals: 1000,
  bills: 500
};

export const useBalance = () => {
  const [wallets, setWallets] = useState(() => {
    const saved = localStorage.getItem('study_wallets');
    return saved ? JSON.parse(saved) : INITIAL_WALLETS;
  });

  const [totalBalance, setTotalBalance] = useState(() => {
    return Object.values(wallets).reduce((a, b) => a + b, 0);
  });

  useEffect(() => {
    localStorage.setItem('study_wallets', JSON.stringify(wallets));
    setTotalBalance(Object.values(wallets).reduce((a, b) => a + b, 0));
  }, [wallets]);

  const deduct = (amount, walletId) => {
    if (wallets[walletId] >= amount) {
      setWallets(prev => ({
        ...prev,
        [walletId]: prev[walletId] - amount
      }));
      return true;
    }
    return false;
  };

  return { wallets, totalBalance, deduct };
};
