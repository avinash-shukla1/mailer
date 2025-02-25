import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  mainImage: {
    data: Buffer,
    contentType: String
  },
  subImages: [{
    data: Buffer,
    contentType: String
  }]
}, {
  timestamps: true
});

export default mongoose.model('Photo', photoSchema);