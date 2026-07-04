import Anthropic from '@anthropic-ai/sdk';

export class ClaudeClient {
  private anthropic: Anthropic;
  private model: string = 'claude-3-5-sonnet-20241022';

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey
    });
  }

  // Generates financial nudge messages using Claude Sonnet
  async generateNudge(systemPrompt: string, contextJson: string): Promise<string> {
    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 150,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Here is the user's current database state context as JSON:\n${contextJson}\n\nPlease generate a personalized 1-2 sentence coaching nudge.`
          }
        ],
        temperature: 0.7
      });

      if (response.content && response.content[0] && response.content[0].type === 'text') {
        return response.content[0].text.trim();
      }
      return 'Keep tracking your stream. You are building steady savings!';
    } catch (error) {
      console.error('[Claude Service]: Error calling Claude API:', error);
      return 'StreamSave active: Continue auto-DCA gold purchases to secure your target emergency fund.';
    }
  }
}
