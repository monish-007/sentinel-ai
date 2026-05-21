const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema(
  {
    query: { type: String, required: true },
    response: { type: String },
    modelUsed: {
      type: String,
      enum: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
    },
    routingReason: { type: String },
    tokenEstimate: {
      prompt: { type: Number },
      completion: { type: Number },
      total: { type: Number },
    },
    latencyMs: { type: Number },
    incidentRisk: { type: Number, min: 0, max: 100 },
    memoryUsed: [{ type: String }],
    complexity: {
      score: { type: Number },
      level: { type: String, enum: ['low', 'medium', 'high'] },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interaction', interactionSchema);
