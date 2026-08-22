import Quiz from '../models/Quiz.js';
import MCQ from '../models/MCQ.js';

export const createQuiz = async (req, res) => {
    try {
        const { title, mcqIds, timer, courseId } = req.body;

        if (!title || !mcqIds || mcqIds.length === 0 || !timer) {
            return res.status(400).json({ message: 'Please provide title, mcqs, and timer' });
        }

        const quiz = await Quiz.create({
            title,
            mcqIds,
            timer,
            course: courseId || null,
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
        const quizzes = await Quiz.find(filter).populate('course', 'name').sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getQuizById = async (req, res) => {
    try {
        let quizQuery = Quiz.findById(req.params.id).populate('course', 'name');
        
        // Show correct answers and explanations for teachers and admins, but hide them for students
        if (req.user.role === 'teacher' || req.user.role === 'admin') {
            quizQuery = quizQuery.populate('mcqIds');
        } else {
            quizQuery = quizQuery.populate('mcqIds', '-correctAnswer -explanation'); 
        }

        const quiz = await quizQuery;
        if (quiz) {
            res.json(quiz);
        } else {
            res.status(404).json({ message: 'Quiz not found' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        const isOwner = quiz.createdBy && quiz.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        const isTeacher = req.user.role === 'teacher';

        if (!isOwner && !isAdmin && !isTeacher) {
            return res.status(403).json({ message: 'Not authorized to edit this quiz' });
        }

        const { title, timer, mcqIds } = req.body;

        if (title !== undefined) quiz.title = title;
        if (timer !== undefined) quiz.timer = timer;
        if (mcqIds !== undefined) quiz.mcqIds = mcqIds;

        // Fallback for legacy quizzes missing createdBy property
        if (!quiz.createdBy) {
            quiz.createdBy = req.user._id;
        }

        await quiz.save();
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        
        const isOwner = quiz.createdBy && quiz.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        const isTeacher = req.user.role === 'teacher';

        if (!isOwner && !isAdmin && !isTeacher) {
            return res.status(403).json({ message: 'Not authorized to delete this quiz' });
        }

        await Quiz.findByIdAndDelete(req.params.id);
        res.json({ message: 'Quiz removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


