/**
 * Incident Service — enterprise AI governance and safety analysis.
 */

const Incident = require('../models/Incident');

const HALLUCINATION_INDICATORS = [
  'i made that up',
  "i don't actually know",
  'i was just guessing',
  'that is not accurate',
  'i fabricated',
  'this information may not be correct',
  'i cannot verify',
  'i just invented',
];

const REFUSAL_INDICATORS = [
  'i cannot',
  "i'm unable",
  'i refuse',
  'i will not',
  "i can't help with",
  "i'm not able to",
  'i must decline',
  'as an ai, i cannot',
];

const TOXIC_INDICATORS = [
  'kill',
  'harm',
  'attack',
  'hate',
  'racist',
  'sexist',
  'violent',
  'illegal',
  'exploit',
];

const DATA_LEAK_INDICATORS = [
  'social security',
  'credit card',
  'password',
  'api key',
  'secret key',
  'private key',
  'ssn',
  'bank account',
];

const ENTERPRISE_RISK_SIGNALS = [
  'compliance',
  'gdpr',
  'hipaa',
  'healthcare',
  'enterprise',
  'financial',
  'legal',
  'governance',
  'audit',
  'security',
  'privacy',
  'risk',
  'regulation',
  'breach',
  'cybersecurity',
];

/**
 * Analyze AI response and operational risk.
 */
function analyzeResponse(
  query,
  response,
  latencyMs,
  model,
  routing = null
) {
  const incidents = [];
  let riskScore = 0;

  const lowerResponse = (response || '').toLowerCase();
  const lowerQuery = (query || '').toLowerCase();

  // -----------------------------------------
  // Hallucination Detection
  // -----------------------------------------
  const hallucinationHits =
    HALLUCINATION_INDICATORS.filter((h) =>
      lowerResponse.includes(h)
    );

  if (hallucinationHits.length > 0) {
    riskScore +=
      30 + hallucinationHits.length * 10;

    incidents.push({
      type: 'hallucination',
      severity:
        hallucinationHits.length > 1
          ? 'high'
          : 'medium',
      description:
        `Potential hallucination detected: ` +
        hallucinationHits.join(', '),
      modelUsed: model,
    });
  }

  // -----------------------------------------
  // Refusal Detection
  // -----------------------------------------
  const refusalHits =
    REFUSAL_INDICATORS.filter((r) =>
      lowerResponse.includes(r)
    );

  if (refusalHits.length > 0) {
    riskScore += 15;

    incidents.push({
      type: 'refusal',
      severity: 'low',
      description:
        `Model refusal detected: ${refusalHits[0]}`,
      modelUsed: model,
    });
  }

  // -----------------------------------------
  // High Latency Detection
  // -----------------------------------------
  if (latencyMs > 5000) {
    const severity =
      latencyMs > 15000
        ? 'high'
        : latencyMs > 10000
        ? 'medium'
        : 'low';

    riskScore +=
      latencyMs > 15000
        ? 25
        : latencyMs > 10000
        ? 15
        : 10;

    incidents.push({
      type: 'high_latency',
      severity,
      description:
        `Response latency ${latencyMs}ms exceeded threshold`,
      modelUsed: model,
    });
  }

  // -----------------------------------------
  // Empty / Weak Response Detection
  // -----------------------------------------
  if (!response || response.trim().length === 0) {
    riskScore += 40;

    incidents.push({
      type: 'empty_response',
      severity: 'high',
      description:
        'Model returned empty response',
      modelUsed: model,
    });
  } else if (
    response.trim().length < 20 &&
    query.length > 100
  ) {
    riskScore += 20;

    incidents.push({
      type: 'weak_response',
      severity: 'medium',
      description:
        'Complex query produced weak response',
      modelUsed: model,
    });
  }

  // -----------------------------------------
  // Toxic Content Detection
  // -----------------------------------------
  const toxicHits =
    TOXIC_INDICATORS.filter(
      (t) =>
        lowerResponse.includes(t) &&
        !lowerQuery.includes(t)
    );

  if (toxicHits.length > 2) {
    riskScore += 25;

    incidents.push({
      type: 'toxic_content',
      severity:
        toxicHits.length > 4
          ? 'critical'
          : 'high',
      description:
        'Potential toxic content detected',
      modelUsed: model,
    });
  }

  // -----------------------------------------
  // Sensitive Data Leakage Detection
  // -----------------------------------------
  const leakHits =
    DATA_LEAK_INDICATORS.filter((d) =>
      lowerResponse.includes(d)
    );

  if (leakHits.length > 0) {
    riskScore += 35;

    incidents.push({
      type: 'data_leak',
      severity: 'critical',
      description:
        'Potential sensitive data leakage detected',
      modelUsed: model,
    });
  }

  // -----------------------------------------
  // Enterprise Governance Risk
  // -----------------------------------------
  const hasEnterpriseRisk =
    ENTERPRISE_RISK_SIGNALS.some((kw) =>
      lowerQuery.includes(kw)
    );

  if (hasEnterpriseRisk) {
    const riskSignalCount = ENTERPRISE_RISK_SIGNALS.filter((kw) => lowerQuery.includes(kw)).length;
    const govSeverity = riskSignalCount >= 3 ? 'high' : riskSignalCount >= 2 ? 'medium' : 'medium';
    riskScore += 15 + riskSignalCount * 5;

    incidents.push({
      type: 'enterprise_governance_risk',
      severity: govSeverity,
      description:
        `Enterprise governance query detected (${riskSignalCount} risk signals: ${ENTERPRISE_RISK_SIGNALS.filter((kw) => lowerQuery.includes(kw)).join(', ')})`,
      modelUsed: model,
    });
  }

  // -----------------------------------------
  // Model Mismatch Detection
  // -----------------------------------------
  if (
    hasEnterpriseRisk &&
    model === 'llama-3.1-8b-instant'
  ) {
    riskScore += 45;

    incidents.push({
      type: 'model_mismatch',
      severity: 'critical',
      description:
        'CRITICAL: High-risk enterprise governance query routed to lightweight model — requires escalation',
      modelUsed: model,
    });
  }

  // -----------------------------------------
  // Routing Failure Detection
  // -----------------------------------------
  if (
    routing &&
    routing.complexity &&
    routing.complexity.score >= 60 &&
    model === 'llama-3.1-8b-instant'
  ) {
    riskScore += 30;

    incidents.push({
      type: 'routing_failure',
      severity: 'high',
      description:
        'Complexity analysis indicates underpowered model selection',
      modelUsed: model,
    });
  }

  // -----------------------------------------
  // Advanced Governance Escalation
  // -----------------------------------------
  if (
    routing &&
    routing.complexity &&
    routing.complexity.score >= 75
  ) {
    riskScore += 15;

    incidents.push({
      type: 'critical_governance_query',
      severity: 'medium',
      description:
        'Critical enterprise governance query detected',
      modelUsed: model,
    });
  }

  // -----------------------------------------
  // Final Risk Clamp
  // -----------------------------------------
  const incidentRisk =
    Math.max(0, Math.min(100, riskScore));

  return {
    incidentRisk,
    incidents,
  };
}

/**
 * Save incident to MongoDB.
 */
async function createIncident(
  interactionId,
  incident
) {
  try {
    const doc = new Incident({
      interactionId,
      ...incident,
    });

    return await doc.save();
  } catch (err) {
    console.error(
      '[Incident] Failed to save incident:',
      err.message
    );

    return null;
  }
}

module.exports = {
  analyzeResponse,
  createIncident,
};