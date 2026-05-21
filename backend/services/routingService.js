/**
 * Routing Service — enterprise AI governance routing engine.
 */

const COMPLEX_KEYWORDS = [
  // Enterprise / governance
  'compliance',
  'gdpr',
  'hipaa',
  'governance',
  'risk',
  'audit',
  'regulation',
  'legal',
  'financial',
  'security',
  'privacy',
  'cybersecurity',
  'enterprise',
  'breach',
  'incident',
  'healthcare',
  'policy',
  'liability',
  'regulatory',

  // Technical / architecture
  'architecture',
  'distributed',
  'scalability',
  'infrastructure',
  'microservice',
  'pipeline',
  'ci/cd',
  'optimization',
  'performance',
  'migration',
  'deployment',
  'kubernetes',
  'docker',
  'parallel',
  'async',
  'concurrency',

  // Analysis verbs
  'analyze',
  'evaluate',
  'compare',
  'synthesize',
  'design',
  'implement',
  'refactor',
  'optimize',
  'tradeoff',
  'trade-off',
];

const CODE_KEYWORDS = [
  'code',
  'function',
  'class',
  'api',
  'endpoint',
  'database',
  'query',
  'sql',
  'javascript',
  'python',
  'typescript',
  'react',
  'node',
  'express',
  'mongodb',
  'redis',
  'graphql',
  'rest',
  'bug',
  'error',
  'exception',
  'stack trace',
  'lint',
];

/**
 * Analyze query complexity.
 */
function analyzeComplexity(query) {
  if (!query) {
    return {
      score: 0,
      level: 'low',
    };
  }

  const lower = query.toLowerCase();

  const words = query
    .split(/\s+/)
    .filter(Boolean);

  const sentences = query
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0);

  const questionMarks =
    (query.match(/\?/g) || []).length;

  let score = 0;

  // Query length
  if (words.length > 50) score += 25;
  else if (words.length > 30) score += 18;
  else if (words.length > 15) score += 10;

  // Multi-sentence reasoning
  if (sentences.length > 3) score += 12;
  else if (sentences.length > 1) score += 6;

  // Multiple questions
  if (questionMarks > 2) score += 15;
  else if (questionMarks > 0) score += 5;

  // Enterprise complexity signals
  const complexHits =
    COMPLEX_KEYWORDS.filter((kw) =>
      lower.includes(kw)
    ).length;

  score += Math.min(complexHits * 10, 45);

  // Technical signals
  const codeHits =
    CODE_KEYWORDS.filter((kw) =>
      lower.includes(kw)
    ).length;

  score += Math.min(codeHits * 6, 20);

  // Code block detection
  if (
    query.includes('```') ||
    query.includes('  ')
  ) {
    score += 12;
  }

  // Clamp
  score = Math.max(0, Math.min(100, score));

  let level = 'low';

  if (score >= 65) {
    level = 'high';
  } else if (score >= 35) {
    level = 'medium';
  }

  return {
    score,
    level,
  };
}

/**
 * Route query to optimal model.
 */
function routeQuery(query, memoryMatch = false) {
  const complexity =
    analyzeComplexity(query);

  const lower = (query || '').toLowerCase();

  // Memory-assisted escalation
  if (memoryMatch) {
    return {
      model: 'llama-3.3-70b-versatile',
      reason:
        'Historical memory match triggered adaptive escalation to high-capability model',
      complexity,
    };
  }

  // High complexity
  if (complexity.level === 'high') {
    return {
      model: 'llama-3.3-70b-versatile',
      reason:
        'High-risk enterprise query routed to advanced reasoning model',
      complexity,
    };
  }

  // Medium complexity
  if (complexity.level === 'medium') {
    const hasEnterpriseSignal =
      COMPLEX_KEYWORDS.some((kw) =>
        lower.includes(kw)
      );

    const hasCodeSignal =
      CODE_KEYWORDS.some((kw) =>
        lower.includes(kw)
      );

    if (
      hasEnterpriseSignal ||
      hasCodeSignal
    ) {
      return {
        model: 'llama-3.3-70b-versatile',
        reason:
          'Enterprise/technical medium-complexity query routed to advanced model for accuracy',
        complexity,
      };
    }

    return {
      model: 'llama-3.1-8b-instant',
      reason:
        'Medium-complexity general query routed to efficient model',
      complexity,
    };
  }

  // Low complexity
  return {
    model: 'llama-3.1-8b-instant',
    reason:
      'Simple query routed to fast low-cost model',
    complexity,
  };
}

module.exports = {
  analyzeComplexity,
  routeQuery,
};