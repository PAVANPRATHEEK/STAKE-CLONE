import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  betAmount: {
    type: Number,
    required: true,
  },
  minesCount: {
    type: Number,
    required: true,
  },
  board: {
    type: [String],
    required: true,
  },
  revealed: {
    type: [Number],
    default: [],
  },
  status: {
    type: String,
    enum: ['playing', 'cashed_out', 'bust'],
    default: 'playing',
  },
}, { timestamps: true });

export default mongoose.models.Game || mongoose.model('Game', GameSchema);
