/**
 * Analytics Service — aggregation queries over Interaction, Incident, and
 * RoutingHistory collections.
 */

const Interaction = require('../models/Interaction');
const Incident = require('../models/Incident');
const RoutingHistory = require('../models/RoutingHistory');
const { MODEL_COSTS } = require('./groqService');

/**
 * Dashboard overview stats.
 */
async function getOverview() {
  try {
    const [totalQueries, incidentCount, interactions] = await Promise.all([
      Interaction.countDocuments(),
      Incident.countDocuments(),
      Interaction.find().lean(),
    ]);

    const avgLatency =
      interactions.length > 0
        ? Math.round(
            interactions.reduce((sum, i) => sum + (i.latencyMs || 0), 0) /
              interactions.length
          )
        : 0;

    // Total cost estimate
    let totalCost = 0;
    const modelCounts = {};
    let complexitySum = 0;
    let complexityCount = 0;

    for (const interaction of interactions) {
      const model = interaction.modelUsed || 'llama-3.1-8b-instant';
      modelCounts[model] = (modelCounts[model] || 0) + 1;

      if (interaction.tokenEstimate) {
        const costs = MODEL_COSTS[model] || MODEL_COSTS['llama-3.1-8b-instant'];
        totalCost +=
          ((interaction.tokenEstimate.prompt || 0) / 1000000) * costs.input +
          ((interaction.tokenEstimate.completion || 0) / 1000000) * costs.output;
      }

      if (interaction.complexity && typeof interaction.complexity.score === 'number') {
        complexitySum += interaction.complexity.score;
        complexityCount++;
      }
    }

    const modelBreakdown = Object.entries(modelCounts).map(([model, count]) => ({
      model,
      count,
      percentage: totalQueries > 0 ? Number(((count / totalQueries) * 100).toFixed(1)) : 0,
    }));

    const domainBreakdown = await getDomainBreakdown();
    const riskDistribution = await getRiskDistribution();

    return {
      totalQueries,
      avgLatency,
      totalCost: Number(totalCost.toFixed(6)),
      incidentCount,
      modelBreakdown,
      avgComplexity:
        complexityCount > 0
          ? Number((complexitySum / complexityCount).toFixed(1))
          : 0,
      domainBreakdown,
      riskDistribution,
    };
  } catch (err) {
    console.error('[Analytics] getOverview failed:', err.message);
    return {
      totalQueries: 0,
      avgLatency: 0,
      totalCost: 0,
      incidentCount: 0,
      modelBreakdown: [],
      avgComplexity: 0,
    };
  }
}

/**
 * Daily cost breakdown for the last N days.
 */
async function getCostBreakdown(days = 30) {
  try {
    const since = new Date();
    since.setDate(since.getDate() - Number(days));

    const interactions = await Interaction.find({ createdAt: { $gte: since } })
      .sort({ createdAt: 1 })
      .lean();

    const dailyMap = {};

    for (const interaction of interactions) {
      const dateKey = interaction.createdAt.toISOString().slice(0, 10);
      const model = interaction.modelUsed || 'llama-3.1-8b-instant';
      const key = `${dateKey}|${model}`;

      if (!dailyMap[key]) {
        dailyMap[key] = { date: dateKey, model, cost: 0 };
      }

      if (interaction.tokenEstimate) {
        const costs = MODEL_COSTS[model] || MODEL_COSTS['llama-3.1-8b-instant'];
        dailyMap[key].cost +=
          ((interaction.tokenEstimate.prompt || 0) / 1000000) * costs.input +
          ((interaction.tokenEstimate.completion || 0) / 1000000) * costs.output;
      }
    }

    return Object.values(dailyMap).map((d) => ({
      ...d,
      cost: Number(d.cost.toFixed(6)),
    }));
  } catch (err) {
    console.error('[Analytics] getCostBreakdown failed:', err.message);
    return [];
  }
}

/**
 * Recent routing decisions.
 */
async function getRoutingTimeline(limit = 50) {
  try {
    return await RoutingHistory.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();
  } catch (err) {
    console.error('[Analytics] getRoutingTimeline failed:', err.message);
    return [];
  }
}

/**
 * Model usage distribution.
 */
async function getModelDistribution() {
  try {
    const total = await Interaction.countDocuments();
    if (total === 0) return [];

    const counts = await Interaction.aggregate([
      { $group: { _id: '$modelUsed', count: { $sum: 1 } } },
    ]);

    return counts.map((c) => ({
      model: c._id || 'unknown',
      count: c.count,
      percentage: Number(((c.count / total) * 100).toFixed(1)),
    }));
  } catch (err) {
    console.error('[Analytics] getModelDistribution failed:', err.message);
    return [];
  }
}

/**
 * Latency percentile statistics.
 */
async function getLatencyStats() {
  try {
    const interactions = await Interaction.find({ latencyMs: { $exists: true } })
      .select('latencyMs')
      .lean();

    if (interactions.length === 0) {
      return { p50: 0, p95: 0, p99: 0, avg: 0, min: 0, max: 0 };
    }

    const latencies = interactions
      .map((i) => i.latencyMs)
      .filter((l) => typeof l === 'number')
      .sort((a, b) => a - b);

    const len = latencies.length;
    const percentile = (p) => {
      const idx = Math.ceil((p / 100) * len) - 1;
      return latencies[Math.max(0, idx)];
    };

    const sum = latencies.reduce((s, v) => s + v, 0);

    return {
      p50: percentile(50),
      p95: percentile(95),
      p99: percentile(99),
      avg: Math.round(sum / len),
      min: latencies[0],
      max: latencies[len - 1],
    };
  } catch (err) {
    console.error('[Analytics] getLatencyStats failed:', err.message);
    return { p50: 0, p95: 0, p99: 0, avg: 0, min: 0, max: 0 };
  }
}

/**
 * Domain distribution.
 */
async function getDomainBreakdown() {
  try {
    const result = await Interaction.aggregate([
      { $match: { domain: { $exists: true, $ne: null } } },
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const total = result.reduce((sum, r) => sum + r.count, 0);
    return result.map(r => ({
      domain: r._id,
      count: r.count,
      percentage: total > 0 ? ((r.count / total) * 100).toFixed(1) : 0
    }));
  } catch (err) {
    console.error('[Analytics] getDomainBreakdown failed:', err.message);
    return [];
  }
}

/**
 * Risk distribution.
 */
async function getRiskDistribution() {
  try {
    const interactions = await Interaction.find({ incidentRisk: { $exists: true } }).select('incidentRisk').lean();
    const buckets = { low: 0, medium: 0, high: 0, critical: 0 };
    interactions.forEach(i => {
      if (i.incidentRisk >= 75) buckets.critical++;
      else if (i.incidentRisk >= 50) buckets.high++;
      else if (i.incidentRisk >= 25) buckets.medium++;
      else buckets.low++;
    });
    return Object.entries(buckets).map(([level, count]) => ({ level, count }));
  } catch (err) {
    console.error('[Analytics] getRiskDistribution failed:', err.message);
    return [];
  }
}

module.exports = {
  getOverview,
  getCostBreakdown,
  getRoutingTimeline,
  getModelDistribution,
  getLatencyStats,
  getDomainBreakdown,
  getRiskDistribution,
};
