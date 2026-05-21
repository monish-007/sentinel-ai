const express = require('express');
const router = express.Router();

const analyticsService = require('../services/analyticsService');

/**
 * GET /api/analytics/overview
 */
router.get('/overview', async (req, res) => {
  try {
    const overview = await analyticsService.getOverview();
    res.json(overview);
  } catch (err) {
    console.error('[Analytics] Overview failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

/**
 * GET /api/analytics/costs?days=30
 */
router.get('/costs', async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const costs = await analyticsService.getCostBreakdown(days);
    res.json(costs);
  } catch (err) {
    console.error('[Analytics] Costs failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch cost breakdown' });
  }
});

/**
 * GET /api/analytics/routing?limit=50
 */
router.get('/routing', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const timeline = await analyticsService.getRoutingTimeline(limit);
    res.json(timeline);
  } catch (err) {
    console.error('[Analytics] Routing failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch routing timeline' });
  }
});

/**
 * GET /api/analytics/models
 */
router.get('/models', async (req, res) => {
  try {
    const distribution = await analyticsService.getModelDistribution();
    res.json(distribution);
  } catch (err) {
    console.error('[Analytics] Models failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch model distribution' });
  }
});

/**
 * GET /api/analytics/latency
 */
router.get('/latency', async (req, res) => {
  try {
    const stats = await analyticsService.getLatencyStats();
    res.json(stats);
  } catch (err) {
    console.error('[Analytics] Latency failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch latency stats' });
  }
});

module.exports = router;
