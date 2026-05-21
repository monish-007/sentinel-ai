const express = require('express');
const router = express.Router();

const memoryService = require('../services/memoryService');

/**
 * GET /api/memory/history
 * Return the in-memory operation log.
 */
router.get('/history', (req, res) => {
  const log = memoryService.getOperationLog();
  res.json({ operations: log, total: log.length });
});

/**
 * POST /api/memory/recall
 * Manual recall — search memory for relevant context.
 */
router.post('/recall', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'query is required and must be a non-empty string' });
    }

    const results = await memoryService.recall(memoryService.BANK_NAME, query);
    res.json({ query, results, count: results.length });
  } catch (err) {
    console.error('[Memory] Recall failed:', err.message);
    res.status(500).json({ error: 'Failed to recall memories' });
  }
});

/**
 * GET /api/memory/status
 * Whether the Hindsight memory backend is available.
 */
router.get('/status', (req, res) => {
  res.json({
    available: memoryService.isAvailable(),
    bankName: memoryService.BANK_NAME,
  });
});

module.exports = router;
