import mongoose from 'mongoose';

const sliderImageSchema = new mongoose.Schema({
  image: {
    data: Buffer,
    contentType: String
  },
  description: { type: String }
}, { timestamps: true });

export default mongoose.model('SliderImage', sliderImageSchema); 