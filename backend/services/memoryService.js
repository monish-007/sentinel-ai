/**
 * Memory Service — Hindsight integration with graceful degradation.
 */

const BANK_NAME = 'sentinelops-ai';

// In-memory operation log
const operationLog = [];

function logOp(operation, bankName, success, detail) {
  operationLog.push({
    operation,
    bankName,
    success,
    detail,
    timestamp: new Date().toISOString(),
  });

  // Keep log size limited
  if (operationLog.length > 500) {
    operationLog.shift();
  }
}

let HindsightClient = null;
let client = null;

try {
  const hindsightModule = require('@vectorize-io/hindsight-client');

  // Handle CommonJS / ESM export differences
  HindsightClient =
    hindsightModule.HindsightClient ||
    hindsightModule.default ||
    hindsightModule;

  if (
    process.env.HINDSIGHT_URL &&
    process.env.HINDSIGHT_API_KEY
  ) {
    client = new HindsightClient({
      baseUrl: process.env.HINDSIGHT_URL,
      apiKey: process.env.HINDSIGHT_API_KEY,
    });

    console.log(
      '[Memory] Hindsight client initialised at',
      process.env.HINDSIGHT_URL
    );
  } else {
    console.warn(
      '[Memory] Missing HINDSIGHT_URL or HINDSIGHT_API_KEY — memory features disabled'
    );
  }
} catch (err) {
  console.warn(
    '[Memory] Failed to initialise Hindsight client:',
    err.message
  );
}

/**
 * Store interaction memory
 */
async function retain(bankName = BANK_NAME, data) {
  if (!client) {
    logOp('retain', bankName, false, 'Client unavailable');
    return null;
  }

  try {
    const result = await client.retain(bankName, data);

    logOp(
      'retain',
      bankName,
      true,
      typeof data === 'string'
        ? data.slice(0, 120)
        : 'object stored'
    );

    return result;
  } catch (err) {
    console.warn('[Memory] retain failed:', err.message);

    logOp('retain', bankName, false, err.message);

    return null;
  }
}

/**
 * Recall relevant memories
 */
async function recall(bankName = BANK_NAME, query) {
  if (!client) {
    logOp('recall', bankName, false, 'Client unavailable');
    return [];
  }

  try {
    const result = await client.recall(bankName, query);

    logOp(
      'recall',
      bankName,
      true,
      query.slice(0, 120)
    );

    return result || [];
  } catch (err) {
    console.warn('[Memory] recall failed:', err.message);

    logOp('recall', bankName, false, err.message);

    return [];
  }
}

/**
 * Reflection / insight generation
 */
async function reflect(bankName = BANK_NAME, context) {
  if (!client) {
    logOp('reflect', bankName, false, 'Client unavailable');
    return null;
  }

  try {
    const result = await client.reflect(bankName, context);

    logOp('reflect', bankName, true, 'ok');

    return result;
  } catch (err) {
    console.warn('[Memory] reflect failed:', err.message);

    logOp('reflect', bankName, false, err.message);

    return null;
  }
}

/**
 * Check if memory backend is available
 */
function isAvailable() {
  return client !== null;
}

/**
 * Return operation history
 */
function getOperationLog() {
  return operationLog;
}

module.exports = {
  retain,
  recall,
  reflect,
  isAvailable,
  getOperationLog,
  BANK_NAME,
};