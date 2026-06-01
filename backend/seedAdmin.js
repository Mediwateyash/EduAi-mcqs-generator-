import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@eduai.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin already exists!');
            process.exit(0);
        }
        

        const admin = await User.create({
            name: 'System Admin',
            email: adminEmail,
            password: 'admin123',
            role: 'admin',
            isApproved: true
        });

        console.log('Admin user created successfully!');
        console.log('Email: admin@eduai.com');
        console.log('Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
