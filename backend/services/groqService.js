const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Cost per million tokens (approximate)
const MODEL_COSTS = {
  'llama-3.3-70b-versatile': { input: 0.59, output: 0.79 },
  'llama-3.1-8b-instant': { input: 0.05, output: 0.08 },
};

async function chat(model, messages) {
  const start = Date.now();
  try {
    const completion = await groq.chat.completions.create({
      messages,
      model,
      temperature: 0.4,
      max_tokens: 2048,
    });
    const latencyMs = Date.now() - start;
    const usage = completion.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };
    return {
      content: completion.choices[0]?.message?.content || '',
      usage: {
        prompt: usage.prompt_tokens,
        completion: usage.completion_tokens,
        total: usage.total_tokens,
      },
      latencyMs,
      model,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    throw { error: error.message, latencyMs, model };
  }
}

function estimateCost(model, usage) {
  const costs = MODEL_COSTS[model] || MODEL_COSTS['llama-3.1-8b-instant'];
  const inputCost = (usage.prompt / 1000000) * costs.input;
  const outputCost = (usage.completion / 1000000) * costs.output;
  return Number((inputCost + outputCost).toFixed(6));
}

module.exports = { chat, estimateCost, MODEL_COSTS };
