import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: {
    data: Buffer,
    contentType: String
  },
  pdf: {
    data: Buffer,
    contentType: String
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('History', historySchema);
