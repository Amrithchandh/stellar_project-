import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

// Register student university profile
export const registerStudentProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { universityName, studentIdCard } = req.body;

  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (!universityName || !studentIdCard) {
    return res.status(400).json({ error: 'University name and Student ID required' });
  }

  try {
    const student = await prisma.student.create({
      data: {
        userId: req.user.id,
        universityName,
        studentIdCard
      }
    });

    return res.status(201).json({
      message: 'Student university profile successfully verified',
      student
    });
  } catch (error) {
    console.error('Failed to create student profile:', error);
    return res.status(500).json({ error: 'Database write failed' });
  }
};

// Create student budget plan
export const createStudentBudget = async (req: AuthenticatedRequest, res: Response) => {
  const { monthlyBudget, spendingLimit, allocatedSaving } = req.body;

  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const budget = await prisma.budgetPlan.create({
      data: {
        studentId: student.id,
        monthlyBudget: Number(monthlyBudget),
        spendingLimit: Number(spendingLimit),
        allocatedSaving: Number(allocatedSaving)
      }
    });

    return res.status(201).json({
      message: 'Monthly budget planner configured',
      budget
    });
  } catch (error) {
    console.error('Failed to create student budget:', error);
    return res.status(500).json({ error: 'Failed to save budget plan' });
  }
};

// Add Freelance / Part-time Income Record
export const logStudentIncome = async (req: AuthenticatedRequest, res: Response) => {
  const { provider, amount } = req.body;

  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (!provider || !amount) {
    return res.status(400).json({ error: 'Income source provider and amount required' });
  }

  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const grant = await prisma.educationGrant.create({
      data: {
        studentId: student.id,
        provider,
        amount: Number(amount)
      }
    });

    return res.status(201).json({
      message: 'Freelance/Part-time income tracked and logged',
      grant
    });
  } catch (error) {
    console.error('Failed to log student income:', error);
    return res.status(500).json({ error: 'Failed to record income entry' });
  }
};

// Record a Parent/Sponsor streamed contribution
model_contribution()
export const logContribution = async (req: AuthenticatedRequest, res: Response) => {
  const { provider, streamRate } = req.body;

  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (!provider || !streamRate) {
    return res.status(400).json({ error: 'Sponsor provider and stream rate required' });
  }

  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const scholarship = await prisma.scholarship.create({
      data: {
        studentId: student.id,
        name: 'Sponsor streaming allowance',
        provider,
        streamRate: Number(streamRate),
        isActive: true
      }
    });

    return res.status(201).json({
      message: 'Allowance stream successfully configured on-chain',
      scholarship
    });
  } catch (error) {
    console.error('Failed to log contribution stream:', error);
    return res.status(500).json({ error: 'Failed to deploy scholarship/allowance stream' });
  }
};

function model_contribution() {}
