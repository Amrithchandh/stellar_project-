import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { StreamStatus } from '@prisma/client';

// Create Company
export const createCompany = async (req: AuthenticatedRequest, res: Response) => {
  const { name, taxId } = req.body;

  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (!name || !taxId) return res.status(400).json({ error: 'Company name and Tax ID required' });

  try {
    const company = await prisma.company.create({
      data: { name, taxId }
    });

    // Link user as employer
    await prisma.employer.create({
      data: {
        userId: req.user.id,
        companyId: company.id
      }
    });

    return res.status(201).json({ message: 'Company created successfully', company });
  } catch (error) {
    console.error('Failed to create company:', error);
    return res.status(500).json({ error: 'Database transaction failed' });
  }
};

// Invite / Onboard employee
export const inviteEmployee = async (req: AuthenticatedRequest, res: Response) => {
  const { email, salaryRate, companyId } = req.body;

  if (!email || !salaryRate || !companyId) {
    return res.status(400).json({ error: 'Missing employee invitation details' });
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) return res.status(404).json({ error: 'Target employee user account not found' });

    const employee = await prisma.employee.create({
      data: {
        userId: targetUser.id,
        companyId,
        salaryRate: Number(salaryRate),
        isApproved: false
      }
    });

    return res.status(201).json({ message: 'Employee invited successfully', employee });
  } catch (error) {
    console.error('Failed to invite employee:', error);
    return res.status(500).json({ error: 'Failed to process employee invite' });
  }
};

// Approve employee
export const approveEmployee = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: { isApproved: true }
    });

    return res.json({ message: 'Employee approved for payroll streaming', employee });
  } catch (error) {
    console.error('Failed to approve employee:', error);
    return res.status(500).json({ error: 'Database update failed' });
  }
};

// Create and Fund Payroll
export const createPayroll = async (req: AuthenticatedRequest, res: Response) => {
  const { companyId, totalBudget } = req.body;

  if (!companyId || !totalBudget) {
    return res.status(400).json({ error: 'Company ID and total budget required' });
  }

  try {
    const payroll = await prisma.payroll.create({
      data: {
        companyId,
        totalBudget: Number(totalBudget)
      }
    });

    return res.status(201).json({ message: 'Payroll funded successfully', payroll });
  } catch (error) {
    console.error('Failed to create payroll:', error);
    return res.status(500).json({ error: 'Database insert failed' });
  }
};

// Start Salary Streaming
export const startSalaryStreaming = async (req: AuthenticatedRequest, res: Response) => {
  const { employeeId, payrollId } = req.body;

  if (!employeeId || !payrollId) {
    return res.status(400).json({ error: 'Employee ID and Payroll ID required' });
  }

  try {
    const stream = await prisma.stream.create({
      data: {
        employeeId,
        payrollId,
        status: StreamStatus.ACTIVE,
        startedAt: new Date()
      }
    });

    return res.status(201).json({ message: 'Salary stream deployed to Stellar Ledger', stream });
  } catch (error) {
    console.error('Failed to start stream:', error);
    return res.status(500).json({ error: 'Database stream deploy failed' });
  }
};

// Pause Salary Stream
export const pauseSalaryStream = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const stream = await prisma.stream.update({
      where: { id },
      data: {
        status: StreamStatus.PAUSED,
        pausedAt: new Date()
      }
    });

    return res.json({ message: 'Salary stream paused', stream });
  } catch (error) {
    console.error('Failed to pause stream:', error);
    return res.status(500).json({ error: 'Stream update failed' });
  }
};
