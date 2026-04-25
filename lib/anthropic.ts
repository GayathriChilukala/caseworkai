import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("[caseworkai] ANTHROPIC_API_KEY not set in environment");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODEL = "claude-sonnet-4-6";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Retry-on-429/503 with backoff. Honors Retry-After if present.
 */
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 5): Promise<T> {
  let attempt = 0;
  let lastErr: any;
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      const retryable = status === 429 || status === 500 || status === 503 || status === 529;
      if (!retryable) throw err;
      lastErr = err;
      const retryAfterHeader =
        err?.headers?.["retry-after"] ?? err?.response?.headers?.["retry-after"];
      const retryAfterSec = retryAfterHeader ? Number(retryAfterHeader) : NaN;
      const base = Number.isFinite(retryAfterSec) && retryAfterSec > 0
        ? retryAfterSec * 1000
        : 800 * Math.pow(2, attempt);
      const jitter = Math.floor(Math.random() * 400);
      await sleep(base + jitter);
      attempt++;
    }
  }
  throw lastErr;
}

/**
 * Call Claude and parse a JSON response. Strips ```json fences.
 */
export async function callClaudeJSON<T>(args: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<T> {
  const res = await withRetry(() =>
    anthropic.messages.create({
      model: MODEL,
      max_tokens: args.maxTokens ?? 2048,
      system: args.system,
      messages: [{ role: "user", content: args.user }],
    })
  );

  const text = res.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text as string)
    .join("\n")
    .trim();

  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error(`Claude did not return valid JSON. Raw: ${text.slice(0, 500)}`);
  }
}

/**
 * Call Claude and return plain text (used for letter drafting).
 */
export async function callClaudeText(args: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const res = await withRetry(() =>
    anthropic.messages.create({
      model: MODEL,
      max_tokens: args.maxTokens ?? 2048,
      system: args.system,
      messages: [{ role: "user", content: args.user }],
    })
  );

  return res.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text as string)
    .join("\n")
    .trim();
}
