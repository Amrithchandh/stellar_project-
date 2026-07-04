import axios from 'axios';

export interface VaultBalances {
  spending: number;
  savings: number;
  goals: number;
  bills: number;
}

export class HorizonClient {
  private horizonUrl: string;

  constructor(network: 'testnet' | 'public' = 'testnet') {
    this.horizonUrl = network === 'testnet' 
      ? 'https://horizon-testnet.stellar.org' 
      : 'https://horizon.stellar.org';
  }

  // Fetch accounts on Stellar testnet
  async getAccountDetails(address: string) {
    try {
      const response = await axios.get(`${this.horizonUrl}/accounts/${address}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Stellar account ${address}:`, error);
      return null;
    }
  }

  // Fetch recent ledger transactions for the account to extract vault operations
  async getAccountTransactions(address: string) {
    try {
      const response = await axios.get(`${this.horizonUrl}/accounts/${address}/transactions?order=desc&limit=10`);
      return response.data._embedded.records;
    } catch (error) {
      console.error(`Error fetching transactions for account ${address}:`, error);
      return [];
    }
  }

  // Calculate vault history metrics (e.g. weekly withdrawals) from ledger transactions
  calculateWithdrawalFrequency(transactions: any[]): Record<string, number> {
    const frequency: Record<string, number> = { spending: 0, savings: 0, goals: 0, bills: 0 };
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    transactions.forEach(tx => {
      const txTime = new Date(tx.created_at).getTime();
      if (txTime >= oneWeekAgo) {
        // Mock parsing transaction memo/ops to identify vault withdrawals
        // e.g., if memo says "withdraw_goals", we increment goals count
        const memo = tx.memo || '';
        if (memo.includes('withdraw_spend')) frequency.spending++;
        if (memo.includes('withdraw_save')) frequency.savings++;
        if (memo.includes('withdraw_goals')) frequency.goals++;
        if (memo.includes('withdraw_bills')) frequency.bills++;
      }
    });

    return frequency;
  }
}
