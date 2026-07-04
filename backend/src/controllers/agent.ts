import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { ClaudeClient } from '../services/claude';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 'mock_production_key';
const claudeClient = new ClaudeClient(CLAUDE_API_KEY);

export const getCoachNudge = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // 1. Fetch complete database context for this user
    const dbUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        student: {
          include: {
            budgetPlans: true,
            loans: true,
            scholarships: true
          }
        },
        employee: {
          include: {
            streams: true
          }
        },
        wallets: {
          include: {
            vaults: {
              include: {
                goals: true,
                bills: true
              }
            }
          }
        }
      }
    });

    if (!dbUser) return res.status(404).json({ error: 'User profile data not found' });

    // 2. Aggregate logs for prompt context
    const recentActivity = await prisma.activityLog.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const contextPayload = {
      role: dbUser.role,
      profile: dbUser.profile,
      studentData: dbUser.student ? {
        university: dbUser.student.universityName,
        budget: dbUser.student.budgetPlans[0] || null,
        loansCount: dbUser.student.loans.length,
        scholarshipsRates: dbUser.student.scholarships.map(s => s.streamRate)
      } : null,
      wallets: dbUser.wallets.map(w => ({
        address: w.publicKey,
        vaults: w.vaults.map(v => ({
          name: v.name,
          balance: v.balance,
          allocation: v.allocationPct,
          goals: v.goals.map(g => ({ target: g.targetAmount, asset: g.targetAsset, accumulated: g.currentAccumulated }))
        }))
      })),
      recentActions: recentActivity.map(a => a.action)
    };

    const systemPrompt = `
      You are StreamSave's production financial coach.
      Analyze the user's database financial context profile and on-chain structure.
      Provide exactly 1-2 sentences of encouraging, actionable, direct feedback.
      Do not give investment advice, do not make price predictions, and never fabricate values.
      Speak directly to a user of role: ${dbUser.role}.
    `;

    // 3. Invoke Claude Sonnet with database parameters
    const nudge = await claudeClient.generateNudge(
      systemPrompt,
      JSON.stringify(contextPayload, null, 2)
    );

    // Save insight to database
    await prisma.aiInsight.create({
      data: {
        userId: dbUser.id,
        insight: nudge
      }
    });

    return res.json({
      success: true,
      nudge,
      rawContext: contextPayload
    });

  } catch (error) {
    console.error('Failed to generate AI nudge:', error);
    return res.status(500).json({ error: 'AI Agent service error' });
  }
};
