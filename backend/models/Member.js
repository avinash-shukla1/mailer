import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  description2: { type: String, required: true },
  image: {
    data: Buffer,
    contentType: String
  }
}, { timestamps: true });

export default mongoose.model('Member', memberSchema); 