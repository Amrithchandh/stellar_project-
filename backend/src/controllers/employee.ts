import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

// GET /api/employee/dashboard — Full employee financial overview
export const getEmployeeDashboard = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const employee = await prisma.employee.findUnique({
      where: { userId: req.user.id },
      include: {
        company: true,
        streams: {
          orderBy: { startedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!employee) return res.status(404).json({ error: 'Employee profile not found' });

    const wallet = await prisma.wallet.findFirst({
      where: { userId: req.user.id },
      include: {
        vaults: { include: { goals: true, bills: true, subscriptions: true } },
        transactions: { orderBy: { timestamp: 'desc' }, take: 5 }
      }
    });

    const activeStream = employee.streams.find(s => s.status === 'ACTIVE');
    let earnedSoFar = 0;
    let elapsedSeconds = 0;

    if (activeStream) {
      const now = Date.now();
      const startMs = new Date(activeStream.startedAt).getTime();
      const pausedMs = Number(activeStream.totalPausedMs || 0);
      elapsedSeconds = Math.floor((now - startMs - pausedMs) / 1000);
      earnedSoFar = (employee.salaryRate * elapsedSeconds) / 10_000_000; // Convert stroops to XLM
    }

    const unpaidBills = wallet?.vaults.flatMap(v => v.bills.filter(b => !b.isPaid)) || [];
    const activeGoals = wallet?.vaults.flatMap(v => v.goals.filter(g => !g.isCompleted)) || [];

    return res.json({
      employee: {
        id: employee.id,
        company: employee.company.name,
        position: employee.position,
        department: employee.department,
        salaryRateXlmPerSec: employee.salaryRate / 10_000_000,
        isApproved: employee.isApproved
      },
      stream: activeStream ? {
        id: activeStream.id,
        status: activeStream.status,
        startedAt: activeStream.startedAt,
        elapsedSeconds,
        earnedXlm: earnedSoFar
      } : null,
      wallet: wallet ? {
        publicKey: wallet.publicKey,
        vaults: wallet.vaults
      } : null,
      recentTransactions: wallet?.transactions || [],
      unpaidBills,
      activeGoals
    });
  } catch (error) {
    console.error('[Employee]: Dashboard fetch failed:', error);
    return res.status(500).json({ error: 'Failed to load employee dashboard' });
  }
};

// GET /api/employee/stream/balance — Real-time computed streamed balance
export const getLiveStreamBalance = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const employee = await prisma.employee.findUnique({
      where: { userId: req.user.id },
      include: { streams: { where: { status: 'ACTIVE' }, take: 1 } }
    });

    if (!employee || employee.streams.length === 0) {
      return res.json({ earnedXlm: 0, elapsedSeconds: 0, rateXlmPerSec: 0, streamActive: false });
    }

    const stream = employee.streams[0];
    const now = Date.now();
    const startMs = new Date(stream.startedAt).getTime();
    const pausedMs = Number(stream.totalPausedMs || 0);
    const elapsedMs = now - startMs - pausedMs;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const earnedStroops = employee.salaryRate * elapsedSeconds;
    const earnedXlm = earnedStroops / 10_000_000;

    return res.json({
      streamActive: true,
      earnedXlm,
      earnedStroops,
      elapsedSeconds,
      rateXlmPerSec: employee.salaryRate / 10_000_000,
      rateStroopsPerSec: employee.salaryRate,
      streamId: stream.id,
      startedAt: stream.startedAt
    });
  } catch (error) {
    console.error('[Employee]: Live balance failed:', error);
    return res.status(500).json({ error: 'Failed to compute live stream balance' });
  }
};

// POST /api/employee/goal — Create a savings goal
export const createEmployeeGoal = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { vaultId, name, description, targetAmount, targetAsset, targetDate } = req.body;

  if (!vaultId || !name || !targetAmount || !targetAsset) {
    return res.status(400).json({ error: 'vaultId, name, targetAmount, and targetAsset are required' });
  }

  try {
    const wallet = await prisma.wallet.findFirst({ where: { userId: req.user.id } });
    if (!wallet) return res.status(404).json({ error: 'No wallet found' });

    const vault = await prisma.vault.findFirst({ where: { id: vaultId, walletId: wallet.id } });
    if (!vault) return res.status(404).json({ error: 'Vault not found or not owned by user' });

    const goal = await prisma.goal.create({
      data: {
        vaultId,
        name,
        description,
        targetAmount: parseFloat(targetAmount),
        targetAsset,
        targetDate: targetDate ? new Date(targetDate) : undefined
      }
    });

    return res.status(201).json({ message: 'Savings goal created', goal });
  } catch (error) {
    console.error('[Employee]: Goal creation failed:', error);
    return res.status(500).json({ error: 'Failed to create goal' });
  }
};

// POST /api/employee/bill — Add a bill reminder
export const createEmployeeBill = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { vaultId, provider, category, amountDue, dueDate } = req.body;

  if (!vaultId || !provider || !amountDue || !dueDate) {
    return res.status(400).json({ error: 'vaultId, provider, amountDue, and dueDate are required' });
  }

  try {
    const wallet = await prisma.wallet.findFirst({ where: { userId: req.user.id } });
    if (!wallet) return res.status(404).json({ error: 'No wallet found' });

    const vault = await prisma.vault.findFirst({ where: { id: vaultId, walletId: wallet.id } });
    if (!vault) return res.status(404).json({ error: 'Vault not found or not owned by user' });

    const bill = await prisma.bill.create({
      data: { vaultId, provider, category, amountDue: parseFloat(amountDue), dueDate: new Date(dueDate) }
    });

    return res.status(201).json({ message: 'Bill added', bill });
  } catch (error) {
    console.error('[Employee]: Bill creation failed:', error);
    return res.status(500).json({ error: 'Failed to add bill' });
  }
};

// GET /api/employee/transactions — Full transaction history
export const getEmployeeTransactions = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { page = '1', limit = '20', type } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  try {
    const wallet = await prisma.wallet.findFirst({ where: { userId: req.user.id } });
    if (!wallet) return res.status(404).json({ error: 'No wallet found' });

    const where: any = { walletId: wallet.id };
    if (type) where.type = type;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({ where, orderBy: { timestamp: 'desc' }, skip, take: parseInt(limit as string) }),
      prisma.transaction.count({ where })
    ]);

    return res.json({ transactions, pagination: { total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error) {
    console.error('[Employee]: Transactions fetch failed:', error);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};
