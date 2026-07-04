/**
 * Service to interface with the Freighter browser extension and Stellar Horizon Testnet.
 */

// Helper to check if Freighter is installed
export const isFreighterInstalled = () => {
  return typeof window !== 'undefined' && !!window.freighterApi;
};

// Request account access and return public key from Freighter
export const connectFreighter = async () => {
  if (!isFreighterInstalled()) {
    throw new Error('Freighter wallet extension is not installed.');
  }

  try {
    // Request access first (prompts the user in extension)
    const isAuthorized = await window.freighterApi.requestAccess();
    if (!isAuthorized) {
      throw new Error('User denied wallet connection access.');
    }

    // Get active address/public key
    const publicKey = await window.freighterApi.getAddress();
    if (!publicKey) {
      throw new Error('Could not retrieve address from Freighter.');
    }

    return publicKey;
  } catch (error) {
    console.error('[Stellar Connect Error]:', error);
    throw error;
  }
};

// Fetch XLM balance from Horizon Testnet
export const fetchXlmBalance = async (publicKey) => {
  if (!publicKey) return 0;

  try {
    const url = `https://horizon-testnet.stellar.org/accounts/${publicKey}`;
    const response = await fetch(url);
    
    if (response.status === 404) {
      // Account does not exist on testnet yet
      return -1; // special code indicating account needs funding
    }

    if (!response.ok) {
      throw new Error(`Horizon API error: ${response.statusText}`);
    }

    const data = await response.json();
    const nativeAsset = data.balances.find(b => b.asset_type === 'native');
    
    return nativeAsset ? parseFloat(nativeAsset.balance) : 0;
  } catch (error) {
    console.error('[Stellar Balance Fetch Error]:', error);
    return 0;
  }
};

// Fund testnet account using Friendbot faucet
export const fundWithFriendbot = async (publicKey) => {
  if (!publicKey) return false;

  try {
    const url = `https://friendbot.stellar.org/?addr=${publicKey}`;
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    console.error('[Friendbot Funding Error]:', error);
    return false;
  }
};
