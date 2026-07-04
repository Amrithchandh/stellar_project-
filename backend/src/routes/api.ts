import { Router } from 'express';
import { authenticateJwt, requireRole } from '../middleware/auth';
import { register, login, submitKyc } from '../controllers/auth';
import { 
  createCompany, 
  inviteEmployee, 
  approveEmployee, 
  createPayroll, 
  startSalaryStreaming, 
  pauseSalaryStream 
} from '../controllers/payroll';
import { 
  registerStudentProfile, 
  createStudentBudget, 
  logStudentIncome, 
  logContribution 
} from '../controllers/student';
import { getCoachNudge } from '../controllers/agent';
import { Role } from '@prisma/client';

const router = Router();

// Authentication Routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/kyc', authenticateJwt, submitKyc);

// Employer Routes
router.post('/employer/company', authenticateJwt, requireRole([Role.EMPLOYER]), createCompany);
router.post('/employer/invite', authenticateJwt, requireRole([Role.EMPLOYER]), inviteEmployee);
router.patch('/employer/approve/:id', authenticateJwt, requireRole([Role.EMPLOYER]), approveEmployee);
router.post('/employer/payroll', authenticateJwt, requireRole([Role.EMPLOYER]), createPayroll);
router.post('/employer/stream', authenticateJwt, requireRole([Role.EMPLOYER]), startSalaryStreaming);
router.post('/employer/stream/:id/pause', authenticateJwt, requireRole([Role.EMPLOYER]), pauseSalaryStream);

// Student Routes
router.post('/student/profile', authenticateJwt, requireRole([Role.STUDENT]), registerStudentProfile);
router.post('/student/budget', authenticateJwt, requireRole([Role.STUDENT]), createStudentBudget);
router.post('/student/income', authenticateJwt, requireRole([Role.STUDENT]), logStudentIncome);
router.post('/student/contribution', authenticateJwt, requireRole([Role.STUDENT]), logContribution);

// AI Coach Routes
router.get('/agent/nudge', authenticateJwt, getCoachNudge);

export default router;
