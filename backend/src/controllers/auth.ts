import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_production_key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'super_secret_refresh_key';

// User Registration
export const register = async (req: AuthenticatedRequest, res: Response) => {
  const { email, password, firstName, lastName, role, phoneNumber } = req.body;

  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({ error: 'Missing registration details' });
  }

  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phoneNumber }] }
    });

    if (existing) {
      return res.status(400).json({ error: 'User already exists with this email or phone number' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    
    // DB transaction: Create user, profile, and initial onboarding settings
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          phoneNumber,
          passwordHash,
          role: role as Role
        }
      });

      await tx.profile.create({
        data: {
          userId: newUser.id,
          firstName,
          lastName
        }
      });

      return newUser;
    });

    return res.status(201).json({
      message: 'User successfully registered',
      userId: result.id,
      role: result.role
    });

  } catch (error) {
    console.error('Registration failed:', error);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
};

// User Login
export const login = async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT access token & Refresh token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh session to DB
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return res.json({
      accessToken: token,
      refreshToken: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Login failed:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
};

// Stubbed KYC onboarding submission (stores documents/verification details)
export const submitKyc = async (req: AuthenticatedRequest, res: Response) => {
  const { documentType, documentNumber, documentUrl } = req.body;
  
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!documentType || !documentNumber || !documentUrl) {
    return res.status(400).json({ error: 'Missing KYC document details' });
  }

  try {
    const kyc = await prisma.kyc.upsert({
      where: { userId: req.user.id },
      update: {
        documentType,
        documentNumber,
        documentUrl,
        status: 'VERIFIED', // Auto-verify for demo compliance
        verifiedAt: new Date()
      },
      create: {
        userId: req.user.id,
        documentType,
        documentNumber,
        documentUrl,
        status: 'VERIFIED',
        verifiedAt: new Date()
      }
    });

    return res.status(200).json({
      message: 'KYC verified successfully',
      kyc
    });
  } catch (error) {
    console.error('KYC submission failed:', error);
    return res.status(500).json({ error: 'Failed to process KYC verification' });
  }
};
