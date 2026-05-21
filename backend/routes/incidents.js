const express = require('express');
const router = express.Router();

const Incident = require('../models/Incident');

/**
 * GET /api/incidents
 * List incidents with optional filters.
 */
router.get('/', async (req, res) => {
  try {
    const filter = {};

    if (req.query.type) filter.type = req.query.type;
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.resolved !== undefined) {
      filter.resolved = req.query.resolved === 'true';
    }

    const incidents = await Incident.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json({ incidents, total: incidents.length });
  } catch (err) {
    console.error('[Incidents] List failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

/**
 * GET /api/incidents/stats
 * Incident statistics — counts by type and severity.
 */
router.get('/stats', async (req, res) => {
  try {
    const [total, resolved, byType, bySeverity] = await Promise.all([
      Incident.countDocuments(),
      Incident.countDocuments({ resolved: true }),
      Incident.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Incident.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
    ]);

    res.json({
      total,
      resolved,
      unresolved: total - resolved,
      byType: byType.map((t) => ({ type: t._id, count: t.count })),
      bySeverity: bySeverity.map((s) => ({ severity: s._id, count: s.count })),
    });
  } catch (err) {
    console.error('[Incidents] Stats failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch incident stats' });
  }
});

/**
 * PATCH /api/incidents/:id/resolve
 * Mark an incident as resolved.
 */
router.patch('/:id/resolve', async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { resolved: true, resolvedAt: new Date() },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json(incident);
  } catch (err) {
    console.error('[Incidents] Resolve failed:', err.message);
    res.status(500).json({ error: 'Failed to resolve incident' });
  }
});

module.exports = router;
