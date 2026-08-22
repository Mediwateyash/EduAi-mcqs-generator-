import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Users, BookOpen, Activity, Wand2, ClipboardList, ArrowRight, UploadCloud, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/analytics/teacher', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAnalytics(res.data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            }
        };
        fetchAnalytics();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Teacher Dashboard</h1>
                <Link to="/teacher/quizzes/create" className="bg-primary hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                    + Create New Quiz
                </Link>
            </div>

            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900">{analytics?.totalQuizzes || 0}</div>
                        <div className="text-sm text-gray-500 font-medium">Total Quizzes</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900">{analytics?.totalAttempts || 0}</div>
                        <div className="text-sm text-gray-500 font-medium">Student Attempts</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <Activity className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900">{analytics?.averageScore || 0}%</div>
                        <div className="text-sm text-gray-500 font-medium">Avg. Accuracy</div>
                    </div>
                </div>
            </div>

            {/* Dashboard Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Upload Documents */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="space-y-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-fit">
                            <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-md font-bold text-gray-900">Upload & Materials</h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-3">
                                Upload PDFs, DOCX, or presentation slides. The AI will extract content to generate custom study questions.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Link to="/teacher/materials" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm text-xs w-full justify-center">
                            Upload Document <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Card 2: Manage Courses */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="space-y-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-md font-bold text-gray-900">Manage Courses</h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-3">
                                Create and customize learning categories (e.g. Python Course) to organize your generated quizzes.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Link to="/teacher/courses" className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-sm text-xs w-full justify-center">
                            Manage Courses <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Card 3: Generate Quiz */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="space-y-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl w-fit">
                            <Wand2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-md font-bold text-gray-900">Generate Quiz</h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-3">
                                Create a new customized quiz from your study materials, select questions, set a timer, and invite students.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Link to="/teacher/quizzes/create" className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm text-xs w-full justify-center">
                            Generate Now <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Card 4: Manage Quizzes & Results */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="space-y-3">
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl w-fit">
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-md font-bold text-gray-900">Manage & Results</h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-3">
                                Monitor student performance, view quiz records, edit active quizzes, and view results.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                        <Link to="/teacher/quizzes" className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg font-semibold transition-colors text-xs text-center">
                            Manage Quizzes
                        </Link>
                        <Link to="/teacher/results" className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-semibold transition-colors text-xs text-center">
                            View All Results
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;

