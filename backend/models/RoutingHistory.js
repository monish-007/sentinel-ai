const mongoose = require('mongoose');

const routingHistorySchema = new mongoose.Schema(
  {
    query: { type: String },
    complexityScore: { type: Number },
    modelSelected: { type: String },
    routingReason: { type: String },
    latencyMs: { type: Number },
    costEstimate: { type: Number },
    success: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RoutingHistory', routingHistorySchema);
