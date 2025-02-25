import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    data: Buffer,
    contentType: String
  },
  newsUrl: {
    type: String,
    required: true
  },
  socialLinks: {
    twitter: String,
    facebook: String,
    instagram: String
  }
}, { timestamps: true });

export default mongoose.model('Media', mediaSchema);
