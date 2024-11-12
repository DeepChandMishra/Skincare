const bcrypt = require('bcrypt');
const User = require('../models/User'); 
const Doctor = require('../models/Doctor'); 
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring')
const {sendMail}=require('../email/sendMail')
const {JWT_SECRET}=process.env;

// Registration
const register = async (req, res) => {
    const { email, username, password, role, specialization, contact } = req.body;

    if (!email || !username || !password || !role) {
        return res.status(400).json({ error: 'Email, name, password, and role are required' });
    }

    if (!['doctor', 'patient'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    if (role === 'doctor' && (!specialization || !contact)) {
        return res.status(400).json({ error: 'Specialization and contact are required for doctors' });
    }

    try {
        // Check if email or username already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already used' });
        }

        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username already used' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, username, password: hashedPassword, role });

        // Create doctor record if role is doctor
        if (role === 'doctor') {
            // Create doctor record
            await Doctor.create({ specialization, contactDetails: contact, userId: user.id });

            // Generate a JWT token for email verification
            const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '10m' }); // Replace 'ourSecretKey' with your actual secret key
            user.emailVerificationToken=token;
            await user.save();
            // Send the verification email to the doctor
            let mailSubject = 'Doctor Email Verification';
            let mailBody = `<p>Click <a href="http://localhost:3000/verify-email?token=${token}">here</a> to verify your email.</p>`;            await sendMail(email, mailSubject, mailBody);

        } else if (role === 'patient') {
            // For patient, generate OTP for email verification
            const otp = randomstring.generate({ length: 6, charset: 'numeric' });
            user.otp = otp;
            await user.save();

            // Send OTP email to patient
            let mailSubject = 'Patient Email Verification';
            let mailBody = `<p>Your OTP for email verification is: <strong>${otp}</strong></p>`;
            sendMail(email, mailSubject, mailBody);
        }

        res.status(201).json({ userId: user.id, message: 'User registered successfully. Please verify your email.' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Internal error', error });
    }
};


//verify otp
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });

        if (!user || user.role !== 'patient') {
            return res.status(404).json({ error: 'User not found or not a patient' });
        }

        // Check if the OTP matches
        if (user.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Mark the email as verified and clear OTP
        user.isEmailVerified = true;
        user.otp = null; // OTP is cleared after verification
        await user.save();

        // Send the success response
        return res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error during OTP verification:', error);
        return res.status(500).json({ error: 'Internal error during OTP verification' });
    }
};


//verify email
const verifyEmail = async (req, res) => {
    const { token } = req.params; // Token will be in the URL params
    console.log('Received token:', token); // Log token to verify it's coming correctly
    if (!token) {
        return res.status(400).json({ error: 'Verification token is required' });
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, JWT_SECRET); // 'ourSecretKey' should be your secret key used for JWT signing
        console.log('Decoded JWT:', decoded); // Log decoded JWT payload
        const { userId } = decoded;

        // Find the user by ID
        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Mark the email as verified
        user.isEmailVerified = true;
        user.emailVerificationToken=null;
        await user.save();

        return res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error during email verification:', error);
        res.status(500).json({ error: 'Internal error during email verification' });
    }
};

// Login function
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        console.log('User found during login:', user);
        if (!user.isEmailVerified) {
            return res.status(400).json({ error: 'Please verify your email before logging in' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            let doctorId = null;
            if (user.role === 'doctor') {
                const doctor = await Doctor.findOne({ where: { UserId: user.id } });
                doctorId = doctor ? doctor.id : null;
            }
            const token = jwt.sign(
                { userId: user.id, role: user.role, doctorId },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            res.json({
                token,
                userId: user.id,
                username: user.username,
                role: user.role,
                doctorId, 
                emailVerified: user.isEmailVerified,
                message: 'Login successful'
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal error' });
    }
};

module.exports = {
    register,
    login,
    verifyEmail,
    verifyOtp
};
