import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, BookOpen, Plus, Trash2, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';


const ManageCourses = () => {
    const [courses, setCourses] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courseName, setCourseName] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const coursesRes = await axios.get('http://localhost:5000/api/course', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(coursesRes.data);

            const quizzesRes = await axios.get('http://localhost:5000/api/quiz', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuizzes(quizzesRes.data);
            
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        if (!courseName.trim()) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/course', {
                name: courseName,
                description: courseDescription
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourseName('');
            setCourseDescription('');
            setError('');
            await fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create course');
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Are you sure you want to delete this course? Associated quizzes will remain but will be moved to 'General' (No Course).")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/course/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchData();
        } catch (err) {
            alert('Failed to delete course');
        }
    };

    const getQuizzesForCourse = (courseId) => {
        return quizzes.filter(q => q.course?._id === courseId || (courseId === null && !q.course));
    };

    if (loading && courses.length === 0) return <div className="p-8 text-center text-gray-500">Loading courses...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex items-center gap-4">
                <Link to="/teacher" className="text-gray-500 hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Courses</h1>
                    <p className="text-sm text-gray-500 mt-1">Organize your quizzes into specialized courses like Python, Web Development, etc.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Course Form */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-3">
                        <GraduationCap className="w-5 h-5 text-indigo-600" />
                        Create New Course
                    </h3>
                    
                    <form onSubmit={handleCreateCourse} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Course Name</label>
                            <input 
                                required
                                type="text"
                                value={courseName}
                                onChange={e => setCourseName(e.target.value)}
                                placeholder="e.g. Python Programming"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                            <textarea
                                value={courseDescription}
                                onChange={e => setCourseDescription(e.target.value)}
                                placeholder="e.g. Introduction to python syntax, data structures, and OOP concepts."
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm shadow-sm h-24 resize-none"
                            />
                        </div>
                        {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
                        <button
                            type="submit"
                            disabled={!courseName.trim()}
                            className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Create Course
                        </button>
                    </form>
                </div>

                {/* Courses list */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800">Your Courses ({courses.length})</h3>
                    
                    {courses.length === 0 ? (
                        <div className="bg-white p-8 text-center text-gray-500 rounded-xl border border-gray-100">
                            No courses created yet. Create your first course on the left to start grouping quizzes.
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Course Card Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {courses.map(course => {
                                    const courseQuizzes = getQuizzesForCourse(course._id);
                                    return (
                                        <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-start gap-4">
                                                    <h4 className="text-xl font-bold text-gray-900 line-clamp-1">{course.name}</h4>
                                                    <button
                                                        onClick={() => handleDeleteCourse(course._id)}
                                                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                        title="Delete Course"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {course.description && (
                                                    <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                                                )}
                                                <div className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 w-fit font-bold uppercase tracking-wider">
                                                    {courseQuizzes.length} Quizzes
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6 pt-4 border-t border-gray-50 flex justify-end">
                                                <Link 
                                                    to={`/teacher/courses/${course._id}`} 
                                                    className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-center"
                                                >
                                                    Open Course ➔
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* General / Unassigned Quizzes Section */}
                            {getQuizzesForCourse(null).length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-6 py-4 bg-gray-50/30 border-b border-gray-100">
                                        <h4 className="text-lg font-bold text-gray-700">General Quizzes (No Course)</h4>
                                        <p className="text-sm text-gray-500 mt-0.5">Quizzes that have not been assigned to a specific course.</p>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {getQuizzesForCourse(null).map(quiz => (
                                                <div key={quiz._id} className="p-3 border border-gray-100 rounded-lg flex justify-between items-center bg-gray-50/30">
                                                    <div>
                                                        <span className="text-sm font-semibold text-gray-800 block">{quiz.title}</span>
                                                        <span className="text-xs text-gray-500">{quiz.mcqIds.length} Questions • {quiz.timer}m</span>
                                                    </div>
                                                    <Link 
                                                        to={`/student/quiz/${quiz._id}`} 
                                                        className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded"
                                                    >
                                                        Preview
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageCourses;
