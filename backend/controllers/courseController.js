import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';

export const createCourse = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Course name is required' });
        }

        const course = await Course.create({
            name,
            description: description || '',
            createdBy: req.user._id
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCourses = async (req, res) => {
    try {
        // Exclude legacy courses that have a name of "undefined" or are missing a name
        let filter = { name: { $ne: 'undefined', $exists: true } };
        if (req.user.role === 'teacher' || req.user.role === 'admin') {
            filter = { createdBy: req.user._id, name: { $ne: 'undefined', $exists: true } };
        }
        const courses = await Course.find(filter).sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
        }

        // Dissociate this course from quizzes
        await Quiz.updateMany({ course: req.params.id }, { $set: { course: null } });

        await course.deleteOne();
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addQuizToCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { quizId } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        quiz.course = courseId;
        await quiz.save();

        res.json({ message: 'Quiz added to course successfully', quiz });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeQuizFromCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { quizId } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        quiz.course = null;
        await quiz.save();

        res.json({ message: 'Quiz removed from course successfully', quiz });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

