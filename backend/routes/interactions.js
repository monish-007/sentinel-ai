const express = require('express');
const router = express.Router();

const Interaction = require('../models/Interaction');

/**
 * GET /api/interactions
 * List interactions with pagination.
 */
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [interactions, total] = await Promise.all([
      Interaction.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Interaction.countDocuments(),
    ]);

    res.json({
      interactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[Interactions] List failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});

/**
 * GET /api/interactions/:id
 * Get a single interaction by ID.
 */
router.get('/:id', async (req, res) => {
  try {
    const interaction = await Interaction.findById(req.params.id).lean();
    if (!interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }
    res.json(interaction);
  } catch (err) {
    console.error('[Interactions] Get failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch interaction' });
  }
});

module.exports = router;
