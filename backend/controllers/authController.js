import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import dotenv from 'dotenv';
dotenv.config();

// JWT Token Generation
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Check if it's the Admin logging in
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            return res.json({
                id: 'admin',
                username: process.env.ADMIN_USERNAME,
                role: 'admin',
                token: generateToken('admin', 'admin'),
            });
        }

        // 2. Otherwise, check if it's a Student
        const student = await Student.findOne({ username });

        // In a real application, passwords should be hashed using bcrypt!
        // For this simple tuition tracker, we are comparing plain text as requested by the simple "username/password given by admin" logic
        if (student && student.password === password) {
            return res.json({
                id: student._id,
                username: student.username,
                role: student.role,
                token: generateToken(student._id, student.role),
            });
        }

        res.status(401).json({ message: 'Invalid credentials' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
