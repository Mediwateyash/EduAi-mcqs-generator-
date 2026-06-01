import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MaterialUpload from '../components/MaterialUpload';
import MaterialsList from '../components/MaterialsList';
import { BarChart3, Users, BookOpen, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [analytics, setAnalytics] = useState(null);

    const handleUploadSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <MaterialUpload onUploadSuccess={handleUploadSuccess} />
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                         <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                             Quick Links
                         </h3>
                         <div className="space-y-2 flex flex-col">
                             <Link to="/teacher/quizzes" className="text-primary hover:text-indigo-700 font-medium p-2 hover:bg-indigo-50 rounded-md transition-colors">Manage Quizzes</Link>
                             <Link to="/teacher/results" className="text-primary hover:text-indigo-700 font-medium p-2 hover:bg-indigo-50 rounded-md transition-colors">View All Results</Link>
                         </div>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <MaterialsList refreshTrigger={refreshTrigger} />
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
