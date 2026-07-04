import express from 'express';
import { HorizonClient, VaultBalances } from './horizon';
import { ClaudeClient } from './claude';

const app = express();
const port = process.env.PORT || 3001;

// Load API Keys securely
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 'mock_key_for_demo';
const horizonClient = new HorizonClient();
const claudeClient = new ClaudeClient(CLAUDE_API_KEY);

const SYSTEM_PROMPT = `
You are StreamSave's AI financial coach.
Your role is to encourage gig workers to save and avoid impulsive spending.
You give actionable, friendly advice. No investment advice, no price predictions.
Be extremely concise. Maximum 2 sentences. 
`;

app.use(express.json());

// Expose GET /nudge/:account_address
app.get('/nudge/:account_address', async (req, res) => {
  const { account_address } = req.params;

  try {
    // 1. Read on-chain ledger state
    const account = await horizonClient.getAccountDetails(account_address);
    const transactions = await horizonClient.getAccountTransactions(account_address);
    
    // 2. Build structured behavioral context
    const withdrawalFreq = horizonClient.calculateWithdrawalFrequency(transactions);
    
    // Mock balances and goal progress from ledger states for simulation
    const mockContext = {
      vaultBalances: {
        spending: 245.50,
        savings: 180.00,
        goals: 620.00,
        bills: 90.00
      },
      goalProgress: {
        target: 'Digital Gold (XAU)',
        accumulatedAsset: 0.0245,
        targetValue: 1500,
        completionPercentage: 41
      },
      withdrawalsThisWeek: withdrawalFreq,
      conversionsCount: transactions.filter((tx: any) => (tx.memo || '').includes('dca')).length
    };

    // 3. Request personalized LLM nudge
    const nudge = await claudeClient.generateNudge(
      SYSTEM_PROMPT, 
      JSON.stringify(mockContext, null, 2)
    );

    res.json({
      success: true,
      nudge,
      context: mockContext
    });

  } catch (error) {
    console.error('Error generating nudge service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate nudge'
    });
  }
});

app.listen(port, () => {
  console.log(`StreamSave Agent service running on port ${port}`);
});
