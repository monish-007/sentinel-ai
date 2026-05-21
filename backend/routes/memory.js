const express = require('express');
const router = express.Router();

const memoryService = require('../services/memoryService');

const Interaction = require('../models/Interaction');

/**
 * GET /api/memory
 * Return persistent memories extracted from past interactions.
 */
router.get('/', async (req, res) => {
  try {
    const interactions = await Interaction.find().sort({ createdAt: -1 }).limit(100);
    
    const memories = interactions.map(i => {
      let text = `[Query Context] ${i.query}`;
      
      // Attempt to parse structured decisions out of the raw response
      if (i.response) {
         try {
            let jsonStr = i.response.trim();
            if (jsonStr.startsWith('```')) {
              jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
            }
            const parsed = JSON.parse(jsonStr);
            if (parsed.decisionSummary) {
               text = `[Decision Context] Risk: ${parsed.riskLevel?.toUpperCase() || 'UNKNOWN'} | ${parsed.decisionSummary}`;
            }
         } catch(e) {
            text = `[Raw Context] ${i.response.slice(0, 200)}...`;
         }
      }

      return {
        text,
        createdAt: i.createdAt
      };
    });

    res.json({ memories, total: memories.length });
  } catch (err) {
    console.error('[Memory] Fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
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
