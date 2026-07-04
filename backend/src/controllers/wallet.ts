import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { StellarService } from '../services/stellar';

const stellar = new StellarService();

// POST /api/wallet/connect — Register a Stellar public key for authenticated user
export const connectWallet = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { publicKey, walletName } = req.body;

  if (!publicKey) return res.status(400).json({ error: 'Stellar public key required' });

  try {
    const isValid = await stellar.verifyAccountExists(publicKey);
    if (!isValid) {
      return res.status(422).json({ error: 'Stellar account not found on network. Please fund your account first.' });
    }

    const existing = await prisma.wallet.findUnique({ where: { publicKey } });
    if (existing && existing.userId !== req.user.id) {
      return res.status(409).json({ error: 'This wallet is already connected to another account' });
    }

    const wallet = await prisma.wallet.upsert({
      where: { publicKey },
      update: { walletName: walletName || 'Primary Wallet', isVerified: true },
      create: {
        userId: req.user.id,
        publicKey,
        walletName: walletName || 'Primary Wallet',
        isVerified: true
      }
    });

    // Auto-create default vaults for Workers
    const existingVaults = await prisma.vault.count({ where: { walletId: wallet.id } });
    if (existingVaults === 0) {
      const defaultVaults = req.user.role === 'STUDENT'
        ? [
            { name: 'Daily Expenses', allocationPct: 50 },
            { name: 'Education', allocationPct: 20 },
            { name: 'Emergency', allocationPct: 20 },
            { name: 'Career Growth', allocationPct: 10 }
          ]
        : [
            { name: 'Spending', allocationPct: 50 },
            { name: 'Savings', allocationPct: 25 },
            { name: 'Goals', allocationPct: 15 },
            { name: 'Bills', allocationPct: 10 }
          ];

      await prisma.vault.createMany({
        data: defaultVaults.map(v => ({ ...v, walletId: wallet.id }))
      });
    }

    await prisma.activityLog.create({
      data: { userId: req.user.id, action: `Connected wallet: ${publicKey.slice(0, 12)}...`, ipAddress: req.ip }
    });

    return res.status(201).json({ message: 'Wallet connected and verified on Stellar network', wallet });
  } catch (error) {
    console.error('[Wallet]: Connect failed:', error);
    return res.status(500).json({ error: 'Failed to connect wallet' });
  }
};

// GET /api/wallet/balances — Fetch real Stellar Horizon balances
export const getWalletBalances = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const wallet = await prisma.wallet.findFirst({
      where: { userId: req.user.id },
      include: { vaults: true }
    });

    if (!wallet) return res.status(404).json({ error: 'No wallet connected. Please connect a Stellar wallet first.' });

    const horizonBalances = await stellar.getAccountBalances(wallet.publicKey);

    return res.json({
      wallet: {
        id: wallet.id,
        publicKey: wallet.publicKey,
        walletName: wallet.walletName,
        isVerified: wallet.isVerified
      },
      horizonBalances,
      vaults: wallet.vaults
    });
  } catch (error) {
    console.error('[Wallet]: Balance fetch failed:', error);
    return res.status(500).json({ error: 'Failed to fetch wallet balances from Stellar network' });
  }
};

// GET /api/wallet/transactions — List all transactions for user's wallet
export const getWalletTransactions = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  try {
    const wallet = await prisma.wallet.findFirst({ where: { userId: req.user.id } });
    if (!wallet) return res.status(404).json({ error: 'No wallet found' });

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { timestamp: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.transaction.count({ where: { walletId: wallet.id } })
    ]);

    // Also fetch latest from Horizon for on-chain history
    const horizonTxs = await stellar.fetchTransactionHistory(wallet.publicKey);

    return res.json({
      transactions,
      horizonTransactions: horizonTxs,
      pagination: { total, page: parseInt(page as string), limit: parseInt(limit as string), totalPages: Math.ceil(total / parseInt(limit as string)) }
    });
  } catch (error) {
    console.error('[Wallet]: Transaction list failed:', error);
    return res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
};

// POST /api/wallet/withdraw — Build withdrawal XDR for Freighter wallet signing
export const buildWithdrawal = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { destinationAddress, amount, assetCode, assetIssuer } = req.body;

  if (!destinationAddress || !amount) {
    return res.status(400).json({ error: 'Destination address and amount are required' });
  }

  try {
    const wallet = await prisma.wallet.findFirst({ where: { userId: req.user.id } });
    if (!wallet) return res.status(404).json({ error: 'No wallet connected' });

    const xdr = await stellar.buildPaymentXdr(wallet.publicKey, destinationAddress, String(amount), assetCode, assetIssuer);

    return res.json({ xdr, message: 'Sign this XDR with your Freighter wallet and submit via POST /api/wallet/submit' });
  } catch (error) {
    console.error('[Wallet]: Build withdrawal XDR failed:', error);
    return res.status(500).json({ error: 'Failed to build withdrawal transaction' });
  }
};

// POST /api/wallet/submit — Submit a signed XDR transaction to the Stellar network
export const submitSignedTransaction = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { xdr, type, amount, asset, toAddress, memo } = req.body;

  if (!xdr) return res.status(400).json({ error: 'Signed XDR required' });

  try {
    const wallet = await prisma.wallet.findFirst({ where: { userId: req.user.id } });
    if (!wallet) return res.status(404).json({ error: 'No wallet found' });

    const txHash = await stellar.submitTransaction(xdr);

    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: type || 'WITHDRAWAL',
        amount: parseFloat(amount) || 0,
        asset: asset || 'XLM',
        txHash,
        toAddress,
        memo,
        status: 'CONFIRMED'
      }
    });

    await prisma.activityLog.create({
      data: { userId: req.user.id, action: `Submitted transaction: ${txHash}`, ipAddress: req.ip }
    });

    return res.json({ success: true, txHash, explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}` });
  } catch (error) {
    console.error('[Wallet]: Submit transaction failed:', error);
    return res.status(500).json({ error: 'Failed to submit transaction to Stellar network' });
  }
};

// PATCH /api/wallet/vault/allocation — Update vault allocation percentages
export const updateVaultAllocations = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { allocations } = req.body; // Array of { vaultId, allocationPct }

  if (!allocations || !Array.isArray(allocations)) {
    return res.status(400).json({ error: 'Allocations array required: [{ vaultId, allocationPct }]' });
  }

  const total = allocations.reduce((sum: number, a: any) => sum + a.allocationPct, 0);
  if (total !== 100) {
    return res.status(400).json({ error: `Vault allocations must sum to exactly 100%. Current total: ${total}%` });
  }

  try {
    const wallet = await prisma.wallet.findFirst({ where: { userId: req.user.id } });
    if (!wallet) return res.status(404).json({ error: 'No wallet found' });

    const updateOps = allocations.map((a: { vaultId: string; allocationPct: number }) =>
      prisma.vault.update({
        where: { id: a.vaultId, walletId: wallet.id },
        data: { allocationPct: a.allocationPct }
      })
    );

    const updated = await prisma.$transaction(updateOps);
    return res.json({ message: 'Vault allocations updated', vaults: updated });
  } catch (error) {
    console.error('[Wallet]: Vault allocation update failed:', error);
    return res.status(500).json({ error: 'Failed to update vault allocations' });
  }
};
