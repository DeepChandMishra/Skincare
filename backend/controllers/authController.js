const bcrypt = require('bcrypt');
const User = require('../models/User'); 
const Doctor = require('../models/Doctor'); 
const jwt = require('jsonwebtoken');
const Email=require('../email/sendMail')

// Registration
const register= async (req, res) => {
    const { email, username, password, role, specialization, contact } = req.body;

    console.log('Received registration data:', req.body);

    if (!email || !username || !password || !role) {
        return res.status(400).json({ error: 'email, name, password,role required' });
    }

    if (!['doctor', 'patient'].includes(role)) {
        return res.status(400).json({ error: 'Invalid' });
    }

    if (role === 'doctor') {
        if (!specialization || !contact) {
            return res.status(400).json({ error: 'specialization,contact require for doctors' });
        }
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'email used' });
        }

        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            return res.status(400).json({ error: 'username used' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, username, password: hashedPassword, role });

        if (role === 'doctor') {
            try {
                await Doctor.create({ specialization, contactDetails: contact, userId: user.id });
            } catch (error) {
                return res.status(500).json({ error: 'Failed creatiung record' });
            }
        }

        res.status(201).json({ userId: user.id, message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal error', error });
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
};
