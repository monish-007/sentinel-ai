const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    interactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interaction',
    },
    type: {
      type: String,
      enum: [
        'hallucination',
        'refusal',
        'high_latency',
        'error',
        'toxic_content',
        'data_leak',
        'empty_response',
        'weak_response',
        'low_confidence',
        'governance_flag',
        'enterprise_governance_risk',
        'model_mismatch',
        'routing_failure',
        'critical_governance_query',
        'compliance_violation',
        'escalation_required',
      ],
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
    },
    description: { type: String },
    modelUsed: { type: String },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Incident', incidentSchema);
