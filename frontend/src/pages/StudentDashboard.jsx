import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Activity, Clock, CheckCircle, Trash2, Key, Unlock, GraduationCap, ArrowLeft, BookOpen } from 'lucide-react';


const StudentDashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null); // null (grid), 'general' or Course object
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clickCount, setClickCount] = useState(0);
    const [isDevMode, setIsDevMode] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [inputPassword, setInputPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [activeView, setActiveView] = useState('courses'); // 'courses' or 'performance'

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Fetch basic analytics
            const analyticsRes = await axios.get('http://localhost:5000/api/analytics/student', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalytics(analyticsRes.data);

            // Fetch all available quizzes
            const quizzesRes = await axios.get('http://localhost:5000/api/quiz', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuizzes(quizzesRes.data);

            // Fetch all courses
            const coursesRes = await axios.get('http://localhost:5000/api/course', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(coursesRes.data);
            
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);


    const getQuizzesForCourse = (courseId) => {
        return quizzes.filter(q => q.course?._id === courseId || (courseId === null && !q.course));
    };

    const handleScoreClick = () => {
        if (isDevMode) return;
        const newCount = clickCount + 1;
        setClickCount(newCount);
        if (newCount >= 5) {
            setShowPasswordModal(true);
            setClickCount(0);
        }
    };

    const handleVerifyPassword = (e) => {
        e.preventDefault();
        if (inputPassword === 'yashdiwate8799903365') {
            setIsDevMode(true);
            setShowPasswordModal(false);
            setInputPassword('');
            setPasswordError('');
        } else {
            setPasswordError('Incorrect Developer Password!');
        }
    };

    const handleDeleteResult = async (resultId) => {
        if (!window.confirm("Developer Tool: Are you sure you want to delete this test result?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/result/${resultId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchDashboardData();
        } catch (error) {
            alert('Failed to delete test result: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return <div className="p-8 text-center">Loading your dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Dashboard</h1>
                {isDevMode && (
                    <span className="flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full border border-amber-300">
                        <Unlock className="w-3.5 h-3.5" /> Developer Tools Unlocked
                    </span>
                )}
            </div>

            {/* Navigation & Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Enrolled Courses Card */}
                <div 
                    onClick={() => { setActiveView('courses'); setSelectedCourse(null); }}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between group ${
                        activeView === 'courses' 
                        ? 'bg-indigo-50/40 border-indigo-600 shadow-md ring-2 ring-indigo-600/10' 
                        : 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-lg'
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-xl transition-colors ${
                            activeView === 'courses' ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                        }`}>
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-950">Enrolled Courses</div>
                            <div className="text-sm text-gray-500 font-medium mt-0.5">Explore courses & start learning</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-extrabold text-indigo-600">{courses.length}</div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Available</div>
                    </div>
                </div>

                {/* Recent Performance Card */}
                <div 
                    onClick={() => setActiveView('performance')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between group ${
                        activeView === 'performance' 
                        ? 'bg-emerald-50/40 border-emerald-600 shadow-md ring-2 ring-emerald-600/10' 
                        : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-lg'
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-xl transition-colors ${
                            activeView === 'performance' ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
                        }`}>
                            <Activity className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-955">Recent Performance</div>
                            <div className="text-sm text-gray-500 font-medium mt-0.5 font-sans">Check quiz results & scores</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-extrabold text-emerald-600">{analytics?.averageScore || 0}%</div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Avg Score</div>
                    </div>
                </div>

                {/* Total Tests Given Card */}
                <div 
                    onClick={() => setActiveView('performance')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between group ${
                        activeView === 'performance'
                        ? 'bg-amber-50/40 border-amber-600 shadow-md ring-2 ring-amber-600/10'
                        : 'bg-white border-gray-100 hover:border-amber-200 hover:shadow-lg'
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-xl transition-colors ${
                            activeView === 'performance' ? 'bg-amber-600 text-white shadow-md' : 'bg-amber-50 text-amber-600 group-hover:bg-amber-100'
                        }`}>
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-955">Total Tests Given</div>
                            <div className="text-sm text-gray-500 font-medium mt-0.5 font-sans">Total completed quiz attempts</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-extrabold text-amber-600">{analytics?.totalAttempts || 0}</div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Attempts</div>
                    </div>
                </div>
            </div>

            {/* View Conditional Render */}
            {activeView === 'courses' ? (
                selectedCourse === null ? (
                    /* Course Cards Grid View */
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900">Your Learning Courses</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map(course => {
                                const courseQuizzes = getQuizzesForCourse(course._id);
                                return (
                                    <div 
                                        key={course._id} 
                                        onClick={() => setSelectedCourse(course)}
                                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                                    >
                                        <div className="space-y-3">
                                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit group-hover:bg-emerald-100 transition-colors">
                                                <GraduationCap className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{course.name}</h4>
                                                {course.description && (
                                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{course.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-6 pt-4 border-t border-gray-50 flex flex-col gap-3">
                                            <div className="flex justify-between items-center text-xs text-gray-400 font-semibold uppercase tracking-wider">
                                                <span>{courseQuizzes.length} Quizzes Available</span>
                                                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedCourse(course);
                                                }}
                                                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm text-center animate-none"
                                            >
                                                Explore Course
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* General Quizzes Card */}
                            {getQuizzesForCourse(null).length > 0 && (
                                <div 
                                    onClick={() => setSelectedCourse('general')}
                                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                                >
                                    <div className="space-y-3">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit group-hover:bg-blue-100 transition-colors">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">General Quizzes</h4>
                                            <p className="text-sm text-gray-500 mt-1">General learning assessments not grouped under specific courses.</p>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-gray-50 flex flex-col gap-3">
                                        <div className="flex justify-between items-center text-xs text-gray-400 font-semibold uppercase tracking-wider">
                                            <span>{getQuizzesForCourse(null).length} Quizzes Available</span>
                                            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">General</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedCourse('general');
                                            }}
                                            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm text-center"
                                        >
                                            Explore Course
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Inside a Course: Show Quiz List */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setSelectedCourse(null)}
                                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-808 uppercase tracking-wide">
                                        {selectedCourse === 'general' ? 'General Quizzes' : selectedCourse.name}
                                    </h3>
                                    {selectedCourse !== 'general' && selectedCourse.description && (
                                        <p className="text-xs text-gray-500 mt-0.5">{selectedCourse.description}</p>
                                    )}
                                </div>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 w-fit">
                                {getQuizzesForCourse(selectedCourse === 'general' ? null : selectedCourse._id).length} Quizzes
                            </span>
                        </div>

                        {getQuizzesForCourse(selectedCourse === 'general' ? null : selectedCourse._id).length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No quizzes available in this course.</div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {getQuizzesForCourse(selectedCourse === 'general' ? null : selectedCourse._id).map(quiz => (
                                    <li key={quiz._id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-950">{quiz.title}</h4>
                                            <div className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                                                <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {quiz.timer} mins</span>
                                                <span>• {quiz.mcqIds.length} Questions</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Link 
                                                to={`/student/quiz/${quiz._id}`} 
                                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                                            >
                                                Attempt Quiz
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )
            ) : (
                /* Recent Performance View */
                analytics?.scoresHistory?.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-808 mb-4">Recent Performance</h3>
                        <div className="space-y-3">
                            {analytics.scoresHistory.map((sh, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3.5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div>
                                        <span className="font-semibold text-gray-900">{sh.quizTitle}</span>
                                        <span className="text-xs text-gray-500 block mt-0.5">{new Date(sh.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div 
                                            onClick={handleScoreClick} 
                                            className={`font-bold cursor-pointer select-none px-3 py-1 rounded-lg text-sm transition-colors ${
                                                sh.score >= 70 ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-amber-700 bg-amber-50 border border-amber-100'
                                            }`}
                                            title={isDevMode ? "Developer Mode Active" : `Click ${5 - clickCount} more times for developer option`}
                                        >
                                            {sh.score}%
                                        </div>
                                        {sh.id && (
                                            <Link 
                                                to={`/student/results/${sh.id}`}
                                                className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                                            >
                                                View Result
                                            </Link>
                                        )}
                                        {isDevMode && sh.id && (
                                            <button 
                                                onClick={() => handleDeleteResult(sh.id)} 
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                                                title="Delete this test result and recalculate averages"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Delete Result
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-lg font-bold text-gray-900">No Attempts Yet</h4>
                            <p className="text-sm text-gray-500">You haven't completed any quizzes yet. Start learning to see your stats!</p>
                        </div>
                        <button 
                            onClick={() => setActiveView('courses')}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Browse Courses
                        </button>
                    </div>
            ))}`

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                        <div className="flex items-center gap-3 text-amber-600">
                            <Key className="w-6 h-6" />
                            <h3 className="text-lg font-bold text-gray-900">Developer Access Required</h3>
                        </div>
                        <p className="text-sm text-gray-600">Enter the developer password to unlock test deletion tools.</p>
                        <form onSubmit={handleVerifyPassword} className="space-y-4">
                            <div>
                                <input 
                                    type="password" 
                                    value={inputPassword}
                                    onChange={(e) => setInputPassword(e.target.value)}
                                    placeholder="Enter developer password" 
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                    autoFocus
                                />
                                {passwordError && <p className="text-xs text-red-600 mt-1">{passwordError}</p>}
                            </div>
                            <div className="flex justify-end gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => { setShowPasswordModal(false); setInputPassword(''); setPasswordError(''); }}
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 text-sm bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700"
                                >
                                    Unlock Developer Tool
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;

