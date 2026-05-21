const express = require('express');
const router = express.Router();

const groqService = require('../services/groqService');
const routingService = require('../services/routingService');
const memoryService = require('../services/memoryService');
const incidentService = require('../services/incidentService');
const Interaction = require('../models/Interaction');
const RoutingHistory = require('../models/RoutingHistory');

/* ------------------------------------------------------------------ */
/*  Domain Detection                                                    */
/* ------------------------------------------------------------------ */
const DOMAIN_KEYWORDS = {
  healthcare: ['hipaa', 'patient', 'clinical', 'medical', 'hospital', 'diagnosis', 'treatment', 'pharma', 'ehr', 'health', 'doctor', 'drug', 'fda', 'compliance', 'phi'],
  finance: ['revenue', 'profit', 'investment', 'stock', 'budget', 'financial', 'banking', 'loan', 'risk', 'portfolio', 'trading', 'fiscal', 'roi', 'forecast', 'valuation'],
  cybersecurity: ['breach', 'vulnerability', 'firewall', 'malware', 'phishing', 'ransomware', 'encryption', 'zero-day', 'threat', 'attack', 'siem', 'soc', 'penetration', 'cve', 'exploit'],
  devops: ['deploy', 'pipeline', 'kubernetes', 'docker', 'ci/cd', 'infrastructure', 'monitoring', 'uptime', 'sla', 'incident', 'rollback', 'terraform', 'scaling', 'latency', 'microservice'],
  product_strategy: ['product', 'roadmap', 'feature', 'user', 'market', 'launch', 'mvp', 'competitor', 'growth', 'retention', 'churn', 'engagement', 'adoption', 'pricing', 'strategy'],
  supply_chain: ['supply', 'logistics', 'inventory', 'warehouse', 'shipping', 'procurement', 'vendor', 'lead time', 'fulfillment', 'distribution', 'sourcing', 'demand'],
  sales_operations: ['sales', 'pipeline', 'crm', 'quota', 'conversion', 'lead', 'deal', 'revenue', 'forecast', 'territory', 'commission', 'prospect', 'funnel'],
  compliance: ['compliance', 'regulation', 'audit', 'governance', 'policy', 'gdpr', 'sox', 'iso', 'nist', 'framework', 'control', 'risk management', 'due diligence'],
};

function detectDomain(query) {
  const lower = query.toLowerCase();
  const scores = {};

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    scores[domain] = keywords.filter((kw) => lower.includes(kw)).length;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0][1] > 0 ? sorted[0][0] : 'general';
}

/* ------------------------------------------------------------------ */
/*  Decision Intelligence System Prompt                                 */
/* ------------------------------------------------------------------ */
const DECISION_SYSTEM_PROMPT = `You are SentinelOps AI — an Enterprise Decision Intelligence Agent.

You do NOT behave like a chatbot. You are an operational decision advisor for enterprise leaders.

For EVERY query, you MUST respond with ONLY a valid JSON object (no markdown, no code fences, no explanation outside JSON) using this exact structure:

{
  "decisionSummary": "One-paragraph executive summary of the decision analysis",
  "riskLevel": "low | medium | high | critical",
  "recommendedAction": "Specific, actionable recommendation",
  "tradeoffs": ["tradeoff 1", "tradeoff 2", "tradeoff 3"],
  "costImpact": "Brief cost/resource impact statement",
  "governanceConcerns": ["concern 1", "concern 2"],
  "confidenceScore": 0.85,
  "domain": "detected domain area"
}

Rules:
- Be concise, executive-level, operational
- Never give verbose explanations
- Always quantify risk when possible
- Always provide actionable recommendations
- If governance/compliance implications exist, flag them
- confidenceScore is 0.0 to 1.0
- riskLevel must be exactly one of: low, medium, high, critical
- tradeoffs and governanceConcerns are arrays of short strings
- Respond ONLY with the JSON object, nothing else`;

/* ------------------------------------------------------------------ */
/*  JSON Response Parser                                                */
/* ------------------------------------------------------------------ */
function parseDecisionResponse(content, domain) {
  try {
    // Try to extract JSON from the response
    let jsonStr = content.trim();

    // Remove markdown code fences if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(jsonStr);

    // Validate and ensure all fields exist
    return {
      decisionSummary: parsed.decisionSummary || parsed.decision_summary || 'Analysis complete.',
      riskLevel: ['low', 'medium', 'high', 'critical'].includes(parsed.riskLevel?.toLowerCase())
        ? parsed.riskLevel.toLowerCase()
        : 'medium',
      recommendedAction: parsed.recommendedAction || parsed.recommended_action || 'Review and assess.',
      tradeoffs: Array.isArray(parsed.tradeoffs) ? parsed.tradeoffs : [],
      costImpact: parsed.costImpact || parsed.cost_impact || 'Not assessed',
      governanceConcerns: Array.isArray(parsed.governanceConcerns || parsed.governance_concerns)
        ? (parsed.governanceConcerns || parsed.governance_concerns)
        : [],
      confidenceScore: typeof parsed.confidenceScore === 'number'
        ? Math.max(0, Math.min(1, parsed.confidenceScore))
        : typeof parsed.confidence_score === 'number'
          ? Math.max(0, Math.min(1, parsed.confidence_score))
          : 0.7,
      domain: parsed.domain || domain,
      _parsed: true,
    };
  } catch (err) {
    // Fallback for non-JSON responses
    return {
      decisionSummary: content.slice(0, 500),
      riskLevel: 'medium',
      recommendedAction: 'Review the analysis above and determine next steps.',
      tradeoffs: [],
      costImpact: 'Not assessed',
      governanceConcerns: [],
      confidenceScore: 0.6,
      domain,
      _parsed: false,
    };
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/chat                                                      */
/* ------------------------------------------------------------------ */
router.post('/', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'query is required and must be a non-empty string' });
    }

    // 1. Detect domain
    const domain = detectDomain(query);

    // 2. Route the query
    const routing = routingService.routeQuery(query);
    const { model, reason: routingReason, complexity } = routing;

    // 3. Recall memory context
    let memoryContext = [];
    let memoryReferences = [];
    try {
      const recalled = await memoryService.recall(memoryService.BANK_NAME, query);
      const raw = Array.isArray(recalled)
        ? recalled
        : Array.isArray(recalled?.results)
          ? recalled.results
          : Array.isArray(recalled?.memories)
            ? recalled.memories
            : [];

      memoryContext = raw;
      memoryReferences = raw.map((m) => {
        if (typeof m === 'string') return m;
        return m?.content || m?.text || m?.detail || JSON.stringify(m);
      }).slice(0, 5);
    } catch (_) {
      // Memory unavailable — continue
    }

    // 4. Build messages
    let systemContent = DECISION_SYSTEM_PROMPT;
    systemContent += `\n\nDetected Domain: ${domain}`;

    if (memoryReferences.length > 0) {
      systemContent += `\n\nHistorical Decision Context:\n${memoryReferences.map((m) => `- ${m}`).join('\n')}`;
      systemContent += `\nReference these previous analyses where relevant.`;
    }

    const messages = [
      { role: 'system', content: systemContent },
      { role: 'user', content: query },
    ];

    // 5. Call Groq
    const result = await groqService.chat(model, messages);

    // 6. Parse structured decision response
    const decision = parseDecisionResponse(result.content, domain);

    // 7. Analyse for governance incidents
    const analysis = incidentService.analyzeResponse(
      query,
      result.content,
      result.latencyMs,
      model
    );

    // Additional governance checks
    if (decision.confidenceScore < 0.5) {
      analysis.incidents.push({
        type: 'low_confidence',
        severity: 'medium',
        description: `Decision confidence below threshold: ${(decision.confidenceScore * 100).toFixed(0)}%`,
      });
      analysis.incidentRisk = Math.max(analysis.incidentRisk, 60);
    }

    if (decision.governanceConcerns.length > 0) {
      analysis.incidents.push({
        type: 'governance_flag',
        severity: decision.riskLevel === 'critical' ? 'high' : 'medium',
        description: `Governance concerns flagged: ${decision.governanceConcerns.join('; ')}`,
      });
    }

    // 8. Cost estimate
    const costEstimate = groqService.estimateCost(model, result.usage);

    // 9. Persist Interaction
    let interactionId = null;
    try {
      const interaction = new Interaction({
        query,
        response: result.content,
        modelUsed: model,
        routingReason,
        tokenEstimate: result.usage,
        latencyMs: result.latencyMs,
        incidentRisk: analysis.incidentRisk,
        memoryUsed: memoryReferences.map((m) =>
          typeof m === 'string' ? m.slice(0, 200) : JSON.stringify(m).slice(0, 200)
        ),
        complexity,
      });
      const saved = await interaction.save();
      interactionId = saved._id;
    } catch (err) {
      console.warn('[Chat] Failed to save interaction:', err.message);
    }

    // 10. Persist RoutingHistory
    try {
      await new RoutingHistory({
        query,
        complexityScore: complexity.score,
        modelSelected: model,
        routingReason,
        latencyMs: result.latencyMs,
        costEstimate,
        success: true,
      }).save();
    } catch (err) {
      console.warn('[Chat] Failed to save routing history:', err.message);
    }

    // 11. Retain structured decision in memory
    try {
      const memoryEntry = `[${domain.toUpperCase()}] Risk:${decision.riskLevel} | "${query.slice(0, 100)}" → ${decision.recommendedAction.slice(0, 150)}`;
      await memoryService.retain(memoryService.BANK_NAME, memoryEntry);
    } catch (_) {
      // Non-critical
    }

    // 12. Persist governance incidents
    const savedIncidents = [];
    if (interactionId && analysis.incidents.length > 0) {
      for (const incident of analysis.incidents) {
        const saved = await incidentService.createIncident(interactionId, incident);
        if (saved) savedIncidents.push(saved);
      }
    }

    // 13. Respond with decision intelligence
    res.json({
      response: result.content,
      decision,
      domain,
      model,
      routingReason,
      latencyMs: result.latencyMs,
      tokenEstimate: result.usage,
      costEstimate,
      incidentRisk: analysis.incidentRisk,
      complexity,
      memoryContext,
      memoryReferences,
      interactionId,
      incidents: savedIncidents,
    });
  } catch (err) {
    console.error('[Chat] Error:', err);
    const errorMsg =
      err && err.error ? err.error : err.message || 'Internal server error';
    res.status(500).json({
      error: errorMsg,
      latencyMs: err.latencyMs || null,
      model: err.model || null,
    });
  }
});

module.exports = router;
