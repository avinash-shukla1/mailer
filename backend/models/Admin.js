import mongoose from 'mongoose';
// import Admin from '../models/Admin.js';

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: {
        type: String,
        default: null // OTP store karne ke liye
    },
    otpExpires: {
        type: Date,
        default: null // OTP expiration time
    }
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;