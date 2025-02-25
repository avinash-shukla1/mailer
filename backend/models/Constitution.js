import mongoose from 'mongoose';

const constitutionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pdf: {
    data: Buffer,        // PDF को binary format में store करेगा
    contentType: String  // PDF का MIME type store करेगा
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Constitution', constitutionSchema);
