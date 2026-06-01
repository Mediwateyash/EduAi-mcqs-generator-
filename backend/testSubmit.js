import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import Result from './models/Result.js';
import MCQ from './models/MCQ.js';
import connectDB from './config/db.js';

dotenv.config();

const runTest = async () => {
    try {
        await connectDB();

        // 1. Find the student
        const student = await User.findOne({ email: 'student@eduai.com' });
        if (!student) {
            console.error('Student student@eduai.com not found');
            process.exit(1);
        }

        // 2. Find any quiz
        const quiz = await Quiz.findOne({});
        if (!quiz) {
            console.error('No quiz found in database to submit to');
            process.exit(1);
        }

        console.log(`Testing with student: ${student.name} (${student._id})`);
        console.log(`Testing with quiz: ${quiz.title} (${quiz._id}), containing ${quiz.mcqIds.length} MCQs`);

        // 3. Prepare mock request body
        const answers = [];
        for (const mcqId of quiz.mcqIds) {
            answers.push({
                mcqId: mcqId.toString(),
                selected: 'Mock Option'
            });
        }

        // 4. Run the submission logic
        let score = 0;
        const evaluatedAnswers = [];

        for (const answer of answers) {
            const mcq = await MCQ.findById(answer.mcqId);
            if (!mcq) {
                console.warn(`MCQ with ID ${answer.mcqId} not found`);
                continue;
            }
            const isCorrect = mcq && mcq.correctAnswer === answer.selected;
            if (isCorrect) score++;

            evaluatedAnswers.push({
                mcqId: answer.mcqId,
                selected: answer.selected
            });
        }

        const percentage = quiz.mcqIds.length > 0 ? Math.round((score / quiz.mcqIds.length) * 100) : 0;

        console.log(`Calculated Score: ${percentage}%`);

        // Try creating the Result document
        console.log('Creating Result document in DB...');
        const result = await Result.create({
            studentId: student._id,
            quizId: quiz._id,
            score: percentage,
            answers: evaluatedAnswers
        });

        console.log(`SUCCESS! Result document created successfully with ID: ${result._id}`);

        // Clean up the test result
        await Result.findByIdAndDelete(result._id);
        console.log('Test Result document cleaned up.');

        process.exit(0);
    } catch (error) {
        console.error('ERROR OCCURRED IN SUBMISSION LOGIC:');
        console.error(error.stack);
        process.exit(1);
    }
};

runTest();
