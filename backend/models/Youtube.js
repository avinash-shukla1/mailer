import mongoose from 'mongoose';

const youtubeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  embedUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Youtube', youtubeSchema);
