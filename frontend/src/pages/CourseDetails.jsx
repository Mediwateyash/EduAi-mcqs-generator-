import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, BookOpen, Clock, Trash2, Plus, Sparkles, FolderPlus } from 'lucide-react';

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [courseQuizzes, setCourseQuizzes] = useState([]);
    const [unassignedQuizzes, setUnassignedQuizzes] = useState([]);
    const [selectedQuizToAdd, setSelectedQuizToAdd] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // 1. Fetch course details
            const courseRes = await axios.get(`http://localhost:5000/api/course/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourse(courseRes.data);

            // 2. Fetch all quizzes to split them
            const quizzesRes = await axios.get('http://localhost:5000/api/quiz', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Quizzes in this course
            const currentQuizzes = quizzesRes.data.filter(q => q.course?._id === id);
            setCourseQuizzes(currentQuizzes);

            // Unassigned quizzes (no course or course is null)
            const availableQuizzes = quizzesRes.data.filter(q => !q.course);
            setUnassignedQuizzes(availableQuizzes);

        } catch (error) {
            console.error("Error fetching course details data", error);
            alert("Failed to load course details.");
            navigate('/teacher/courses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleAddQuiz = async (e) => {
        e.preventDefault();
        if (!selectedQuizToAdd) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/course/${id}/add-quiz`, {
                quizId: selectedQuizToAdd
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedQuizToAdd('');
            await fetchData();
        } catch (error) {
            alert('Failed to add quiz to course');
        }
    };

    const handleRemoveQuiz = async (quizId) => {
        if (!window.confirm("Remove this quiz from this course? The quiz itself won't be deleted.")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/course/${id}/remove-quiz`, {
                quizId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchData();
        } catch (error) {
            alert('Failed to remove quiz from course');
        }
    };

    if (loading && !course) return <div className="p-8 text-center text-gray-500">Loading course...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex items-center gap-4">
                <Link to="/teacher/courses" className="text-gray-500 hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{course?.name}</h1>
                    {course?.description && <p className="text-sm text-gray-500 mt-1">{course.description}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Course Quizzes List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        Quizzes in Course ({courseQuizzes.length})
                    </h3>

                    {courseQuizzes.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
                            No quizzes added to this course yet. Use the option on the right to add quizzes!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {courseQuizzes.map(quiz => (
                                <div key={quiz._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 line-clamp-1">{quiz.title}</h4>
                                        <div className="text-xs text-gray-500 mt-2 flex items-center gap-4">
                                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {quiz.timer} mins</span>
                                            <span>• {quiz.mcqIds.length} Questions</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-gray-50 flex gap-2 justify-end">
                                        <Link 
                                            to={`/student/quiz/${quiz._id}`} 
                                            className="px-3 py-1.5 text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg transition-colors"
                                        >
                                            Preview
                                        </Link>
                                        <button 
                                            onClick={() => handleRemoveQuiz(quiz._id)}
                                            className="px-3 py-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Quiz Form */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit space-y-4">
                    <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-3">
                        <FolderPlus className="w-5 h-5 text-indigo-600" />
                        Add Quiz to Course
                    </h3>

                    {unassignedQuizzes.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No unassigned quizzes available. Create a new quiz first or remove it from another course.</p>
                    ) : (
                        <form onSubmit={handleAddQuiz} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Quiz</label>
                                <select 
                                    value={selectedQuizToAdd}
                                    onChange={e => setSelectedQuizToAdd(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm shadow-sm"
                                    required
                                >
                                    <option value="">-- Choose Quiz --</option>
                                    {unassignedQuizzes.map(q => (
                                        <option key={q._id} value={q._id}>{q.title} ({q.mcqIds.length} MCQs)</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={!selectedQuizToAdd}
                                className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add to Course
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
