const express = require('express');
const router = express.Router();
const Interaction = require('../models/Interaction');

/**
 * POST /api/reports/generate
 * Generate an executive decision report from an interaction.
 */
router.post('/generate', async (req, res) => {
  try {
    const { interactionId, query, decision, model, routingReason, latencyMs, costEstimate, complexity, memoryReferences, incidents } = req.body;

    // Try to load from DB if interactionId provided
    let interaction = null;
    if (interactionId) {
      try {
        interaction = await Interaction.findById(interactionId).lean();
      } catch (_) {}
    }

    const reportData = {
      title: 'SentinelOps AI — Executive Decision Report',
      generatedAt: new Date().toISOString(),
      query: query || interaction?.query || 'N/A',
      domain: decision?.domain || 'general',

      decisionAnalysis: {
        summary: decision?.decisionSummary || interaction?.response?.slice(0, 500) || 'N/A',
        riskLevel: decision?.riskLevel || 'medium',
        recommendedAction: decision?.recommendedAction || 'N/A',
        tradeoffs: decision?.tradeoffs || [],
        costImpact: decision?.costImpact || 'Not assessed',
        governanceConcerns: decision?.governanceConcerns || [],
        confidenceScore: decision?.confidenceScore ?? 0.7,
      },

      routingPath: {
        model: model || interaction?.modelUsed || 'N/A',
        reason: routingReason || interaction?.routingReason || 'N/A',
        complexityScore: complexity?.score ?? interaction?.complexity?.score ?? 0,
        complexityLevel: complexity?.level ?? interaction?.complexity?.level ?? 'N/A',
      },

      costAnalysis: {
        estimatedCost: costEstimate ?? 0,
        latencyMs: latencyMs ?? interaction?.latencyMs ?? 0,
        tokensUsed: interaction?.tokenEstimate || { prompt: 0, completion: 0, total: 0 },
      },

      governanceFindings: {
        incidentRisk: interaction?.incidentRisk ?? decision?.riskLevel === 'critical' ? 80 : decision?.riskLevel === 'high' ? 60 : 30,
        concerns: decision?.governanceConcerns || [],
        incidents: (incidents || []).map((inc) => ({
          type: inc.type,
          severity: inc.severity,
          description: inc.description,
        })),
      },

      historicalReferences: (memoryReferences || []).slice(0, 5),
    };

    res.json(reportData);
  } catch (err) {
    console.error('[Reports] Generate failed:', err.message);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
