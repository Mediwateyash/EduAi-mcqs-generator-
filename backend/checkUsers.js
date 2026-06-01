import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import MCQ from './models/MCQ.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const checkData = async () => {
    try {
        const userCount = await User.countDocuments();
        const mcqCount = await MCQ.countDocuments();
        const users = await User.find({}).select('name email role isApproved');
        
        console.log(`Total Users: ${userCount}`);
        console.log(`Total MCQs: ${mcqCount}`);
        console.log('--- User List ---');
        users.forEach(u => console.log(`${u.name} | ${u.email} | ${u.role} | Approved: ${u.isApproved}`));
        
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

checkData();
