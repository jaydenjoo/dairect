import Anthropic from "@anthropic-ai/sdk";
import { AI_TIMEOUT_MS } from "@/lib/validation/ai-estimate";

export const CLAUDE_MODEL = "claude-sonnet-4-6";

export function getClaudeClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set. Check your environment variables.");
  }
  return new Anthropic({
    apiKey,
    timeout: AI_TIMEOUT_MS,
    maxRetries: 0,
  });
}
