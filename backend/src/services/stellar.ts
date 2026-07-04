import * as StellarSdk from '@stellar/stellar-sdk';

const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';
const STELLAR_NETWORK = process.env.STELLAR_NETWORK || 'TESTNET';

export class StellarService {
  private server: StellarSdk.Horizon.Server;
  private networkPassphrase: string;

  constructor() {
    this.server = new StellarSdk.Horizon.Server(HORIZON_URL);
    this.networkPassphrase = STELLAR_NETWORK === 'PUBLIC'
      ? StellarSdk.Networks.PUBLIC
      : StellarSdk.Networks.TESTNET;
  }

  // Fetch real balances from the Stellar Horizon Ledger
  async getAccountBalances(publicKey: string): Promise<StellarSdk.Horizon.BalanceLine[]> {
    try {
      const accountInfo = await this.server.loadAccount(publicKey);
      return accountInfo.balances;
    } catch (error) {
      console.error(`[Stellar]: Failed to load account balances for ${publicKey}:`, error);
      throw new Error('Failed to load Stellar account balances');
    }
  }

  // Build an unsigned payment transaction envelope (XDR) to be signed by Freighter/xBull
  async buildPaymentXdr(
    sourceAddress: string,
    destinationAddress: string,
    amount: string,
    assetCode?: string,
    assetIssuer?: string
  ): Promise<string> {
    try {
      const sourceAccount = await this.server.loadAccount(sourceAddress);
      
      const asset = assetCode && assetIssuer
        ? new StellarSdk.Asset(assetCode, assetIssuer)
        : StellarSdk.Asset.native();

      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 } // indefinite or handle bounds
      })
      .addOperation(StellarSdk.Operation.payment({
        destination: destinationAddress,
        asset: asset,
        amount: amount
      }))
      .build();

      return transaction.toXDR();
    } catch (error) {
      console.error('[Stellar]: Failed to build payment XDR:', error);
      throw new Error('Failed to build payment transaction XDR');
    }
  }

  // Build XDR to update vault allocations inside StreamVault contract
  async buildUpdateAllocationXdr(
    sourceAddress: string,
    contractId: string,
    vaultId: string,
    pct: number
  ): Promise<string> {
    try {
      const sourceAccount = await this.server.loadAccount(sourceAddress);
      
      // Setup contract invocation arguments
      const contract = new StellarSdk.Contract(contractId);
      const updateAllocationCall = contract.call(
        'update_allocation',
        StellarSdk.xdr.ScVal.scvSymbol(vaultId),
        StellarSdk.xdr.ScVal.scvU32(pct)
      );

      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 }
      })
      .addOperation(updateAllocationCall)
      .build();

      return transaction.toXDR();
    } catch (error) {
      console.error('[Stellar]: Failed to build update allocation contract invocation XDR:', error);
      throw new Error('Failed to build contract invocation XDR');
    }
  }

  // Submit a signed transaction envelope (XDR) back from Freighter wallet
  async submitTransaction(xdrString: string): Promise<string> {
    try {
      const transaction = StellarSdk.TransactionBuilder.fromXDR(xdrString, this.networkPassphrase);
      const response = await this.server.submitTransaction(transaction);
      if (response.hash) {
        return response.hash;
      }
      throw new Error('Transaction submission failed: No hash returned.');
    } catch (error) {
      console.error('[Stellar]: Failed to submit signed transaction XDR:', error);
      throw new Error('Failed to submit transaction to Horizon');
    }
  }
}
