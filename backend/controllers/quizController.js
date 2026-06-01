import Quiz from '../models/Quiz.js';
import MCQ from '../models/MCQ.js';

export const createQuiz = async (req, res) => {
    try {
        const { title, mcqIds, timer } = req.body;

        if (!title || !mcqIds || mcqIds.length === 0 || !timer) {
            return res.status(400).json({ message: 'Please provide title, mcqs, and timer' });
        }

        const quiz = await Quiz.create({
            title,
            mcqIds,
            timer,
            createdBy: req.user._id
        });

        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getQuizzes = async (req, res) => {
    try {
        // Teacher sees their own, Students see all or assigned
        let filter = {};
        if (req.user.role === 'teacher') {
            filter = { createdBy: req.user._id };
        }
        const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('mcqIds', '-correctAnswer -explanation'); 
        // Hide correct answer and explanation from the quiz view for safety!
        if (quiz) {
            res.json(quiz);
        } else {
            res.status(404).json({ message: 'Quiz not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        
        if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this quiz' });
        }

        await Quiz.findByIdAndDelete(req.params.id);
        res.json({ message: 'Quiz removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
