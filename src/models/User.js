import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 1000,
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
