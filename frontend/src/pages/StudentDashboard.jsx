import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Activity, Clock, CheckCircle } from 'lucide-react';

const StudentDashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
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
                
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Helper to see if a quiz is completed based on analytics history
    const isQuizCompleted = (quizId) => {
        if (!analytics || !analytics.scoresHistory) return false;
        // In a real app we'd query if a specific result exists, but testing title/match is quick here 
        // Or we just check user's results explicitly. Let's assume we fetch `my-results` and match IDs.
        // For now, let's keep it simple.
        // Actually, we should fetch /api/result/my-results to bind the Exact ID
        return false; // we'll simplify and just allow re-taking for this prototype unless specified
    };

    if (loading) return <div className="p-8 text-center">Loading your dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Dashboard</h1>

            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-primary rounded-lg">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900">{analytics?.totalAttempts || 0}</div>
                        <div className="text-sm text-gray-500 font-medium">Quizzes Completed</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <Activity className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900">{analytics?.averageScore || 0}%</div>
                        <div className="text-sm text-gray-500 font-medium">Average Score</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-800">Available Quizzes</h3>
                </div>
                
                {quizzes.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No quizzes available right now.</div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {quizzes.map(quiz => (
                            <li key={quiz._id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">{quiz.title}</h4>
                                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {quiz.timer} mins</span>
                                        <span>• {quiz.mcqIds.length} Questions</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link 
                                        to={`/student/quiz/${quiz._id}`} 
                                        className="px-6 py-2 bg-primary text-white rounded-md font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                                    >
                                        Attempt Quiz
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            {/* Display Past Scores */}
            {analytics?.scoresHistory?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Performance</h3>
                    <div className="space-y-3">
                        {analytics.scoresHistory.map((sh, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                                <div>
                                    <span className="font-medium text-gray-800">{sh.quizTitle}</span>
                                    <span className="text-xs text-gray-500 block">{new Date(sh.date).toLocaleDateString()}</span>
                                </div>
                                <div className={`font-bold ${sh.score >= 70 ? 'text-green-600' : 'text-orange-500'}`}>
                                    {sh.score}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
