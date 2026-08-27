import Result from '../models/Result.js';
import Quiz from '../models/Quiz.js';
import Material from '../models/Material.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

export const getTeacherAnalytics = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ createdBy: req.user._id });
        const quizIds = quizzes.map(q => q._id);

        const results = await Result.find({ quizId: { $in: quizIds } });

        const totalQuizzes = quizzes.length;
        const totalAttempts = results.length;
        const averageScore = results.length > 0 
            ? (results.reduce((acc, curr) => acc + curr.score, 0) / results.length).toFixed(2)
            : 0;

        res.json({
            totalQuizzes,
            totalAttempts,
            averageScore,
            recentResults: results.slice('-5').reverse() // Last 5 results
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStudentAnalytics = async (req, res) => {
    try {
        const results = await Result.find({ studentId: req.user._id }).populate('quizId', 'title');

        const totalAttempts = results.length;
        const averageScore = results.length > 0 
            ? (results.reduce((acc, curr) => acc + curr.score, 0) / results.length).toFixed(2)
            : 0;

        // Data for a chart: scores over time
        const scoresHistory = results.map(r => ({
            id: r._id,
            quizId: r.quizId ? r.quizId._id : null,
            quizTitle: r.quizId ? r.quizId.title : 'Deleted Quiz',
            score: r.score,
            date: r.createdAt
        }));


        res.json({
            totalAttempts,
            averageScore,
            scoresHistory
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getLeaderboard = async (req, res) => {
    try {
        // 1. Fetch all student users and all courses
        const students = await User.find({ role: 'student', isApproved: true }).select('name email showOnLeaderboard leaderboardPreferenceSet');
        const courses = await Course.find({}).select('name description');

        // 2. Fetch all test results populated with quiz and course details
        const results = await Result.find({}).populate({
            path: 'quizId',
            select: 'title course',
            populate: {
                path: 'course',
                select: 'name'
            }
        });

        // 3. Build statistics for each student
        const studentStats = [];

        for (const student of students) {
            const studentResults = results.filter(r => r.studentId && r.studentId.toString() === student._id.toString());

            const isCurrentUser = req.user && req.user._id.toString() === student._id.toString();
            const displayName = (student.showOnLeaderboard || isCurrentUser) ? student.name : 'Anonymous Student';
            const displayEmail = (student.showOnLeaderboard || isCurrentUser) ? student.email : undefined;

            if (studentResults.length === 0) {
                studentStats.push({
                    studentId: student._id,
                    name: displayName,
                    showOnLeaderboard: student.showOnLeaderboard,
                    email: displayEmail,
                    overall: {
                        totalAttempts: 0,
                        averageScore: 0,
                        percentile: 0,
                        rank: null
                    },
                    courses: []
                });
                continue;
            }

            const overallAttempts = studentResults.length;
            const overallSum = studentResults.reduce((sum, r) => sum + r.score, 0);
            const overallAvg = Number((overallSum / overallAttempts).toFixed(2));

            // Course-specific grouping
            const courseMap = {};
            for (const r of studentResults) {
                const quiz = r.quizId;
                if (quiz && quiz.course) {
                    const courseId = quiz.course._id.toString();
                    const courseName = quiz.course.name;
                    if (!courseMap[courseId]) {
                        courseMap[courseId] = {
                            courseId,
                            courseName,
                            totalAttempts: 0,
                            sumScore: 0
                        };
                    }
                    courseMap[courseId].totalAttempts += 1;
                    courseMap[courseId].sumScore += r.score;
                } else {
                    const courseId = 'general';
                    const courseName = 'General Quizzes';
                    if (!courseMap[courseId]) {
                        courseMap[courseId] = {
                            courseId,
                            courseName,
                            totalAttempts: 0,
                            sumScore: 0
                        };
                    }
                    courseMap[courseId].totalAttempts += 1;
                    courseMap[courseId].sumScore += r.score;
                }
            }

            const coursesStats = Object.values(courseMap).map(c => ({
                courseId: c.courseId,
                courseName: c.courseName,
                totalAttempts: c.totalAttempts,
                averageScore: Number((c.sumScore / c.totalAttempts).toFixed(2)),
                percentile: 0,
                rank: null
            }));

            studentStats.push({
                studentId: student._id,
                name: displayName,
                showOnLeaderboard: student.showOnLeaderboard,
                email: displayEmail,
                overall: {
                    totalAttempts: overallAttempts,
                    averageScore: overallAvg,
                    percentile: 0,
                    rank: null
                },
                courses: coursesStats
            });
        }

        // 4. Calculate Overall Rankings & Percentiles (among active overall students)
        const activeOverall = studentStats.filter(s => s.overall.totalAttempts > 0);
        
        activeOverall.sort((a, b) => {
            if (b.overall.averageScore !== a.overall.averageScore) {
                return b.overall.averageScore - a.overall.averageScore;
            }
            if (b.overall.totalAttempts !== a.overall.totalAttempts) {
                return b.overall.totalAttempts - a.overall.totalAttempts;
            }
            return a.name.localeCompare(b.name);
        });

        const N = activeOverall.length;
        if (N > 0) {
            let currentRank = 1;
            for (let i = 0; i < N; i++) {
                if (i > 0) {
                    const prev = activeOverall[i - 1].overall;
                    const curr = activeOverall[i].overall;
                    if (curr.averageScore < prev.averageScore) {
                        currentRank = i + 1;
                    }
                }
                activeOverall[i].overall.rank = currentRank;
            }

            for (const student of activeOverall) {
                const score = student.overall.averageScore;
                const lessCount = activeOverall.filter(s => s.overall.averageScore < score).length;
                const equalCount = activeOverall.filter(s => s.overall.averageScore === score).length;
                student.overall.percentile = Number((((lessCount + 0.5 * equalCount) / N) * 100).toFixed(1));
            }
        }

        // 5. Calculate Rankings & Percentiles within each course (including general)
        const courseIds = ['general', ...courses.map(c => c._id.toString())];
        for (const cId of courseIds) {
            const activeInCourse = [];
            for (const s of studentStats) {
                const cStat = s.courses.find(c => c.courseId === cId);
                if (cStat && cStat.totalAttempts > 0) {
                    activeInCourse.push({ student: s, stat: cStat });
                }
            }

            activeInCourse.sort((a, b) => {
                if (b.stat.averageScore !== a.stat.averageScore) {
                    return b.stat.averageScore - a.stat.averageScore;
                }
                if (b.stat.totalAttempts !== a.stat.totalAttempts) {
                    return b.stat.totalAttempts - a.stat.totalAttempts;
                }
                return a.student.name.localeCompare(b.student.name);
            });

            const Nc = activeInCourse.length;
            if (Nc > 0) {
                let currentCourseRank = 1;
                for (let i = 0; i < Nc; i++) {
                    if (i > 0) {
                        const prev = activeInCourse[i - 1].stat;
                        const curr = activeInCourse[i].stat;
                        if (curr.averageScore < prev.averageScore) {
                            currentCourseRank = i + 1;
                        }
                    }
                    activeInCourse[i].stat.rank = currentCourseRank;
                }

                for (const entry of activeInCourse) {
                    const score = entry.stat.averageScore;
                    const lessCount = activeInCourse.filter(e => e.stat.averageScore < score).length;
                    const equalCount = activeInCourse.filter(e => e.stat.averageScore === score).length;
                    entry.stat.percentile = Number((((lessCount + 0.5 * equalCount) / Nc) * 100).toFixed(1));
                }
            }
        }

        res.json({
            students: studentStats,
            courses
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

