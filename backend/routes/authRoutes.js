import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import Admin from '../models/Admin.js'; // ⚠️ .js extension is important
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const router = express.Router();

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ Step 1: Send OTP
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    let admin = await Admin.findOne({ email });

    if (!admin) {
        return res.status(400).json({ message: "Only registered admin can login" });
    }

    // OTP update karein
    admin.otp = otp;
    admin.otpExpires = otpExpires;
    await admin.save();

    // Email bhejne ka setup
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Your Admin OTP",
        text: `Your OTP is ${otp}. It will expire in 10 minutes.`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "OTP sent successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Failed to send OTP" });
    }
});

// ✅ Step 2: Verify OTP and Login
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin || admin.otp !== otp || new Date() > admin.otpExpires) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: "OTP verified!", token });
});

export default router;
