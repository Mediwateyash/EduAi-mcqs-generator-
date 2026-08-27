import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Activity, Clock, CheckCircle, Trash2, Key, Unlock, GraduationCap, ArrowLeft, BookOpen, Trophy, Medal, Award, TrendingUp, Users, ChevronDown, ChevronUp, Shield, Eye, EyeOff, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';


const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
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
    
    // Leaderboard state
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(true);
    const [leaderboardScope, setLeaderboardScope] = useState('overall');
    const [expandedStudentId, setExpandedStudentId] = useState(null);

    // Privacy Preference Modal state
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    
    // Standing Notification Modal state
    const [showStandingModal, setShowStandingModal] = useState(false);

    // Profile Completion Reminder Modal state
    const [showProfileReminderModal, setShowProfileReminderModal] = useState(false);

    // Local state to track preference set reactively
    const [preferenceSet, setPreferenceSet] = useState(false);

    // Sync preferenceSet when user loaded
    useEffect(() => {
        if (user) {
            setPreferenceSet(user.leaderboardPreferenceSet || false);
            if (user.leaderboardPreferenceSet === false) {
                setShowPrivacyModal(true);
            }
        }
    }, [user]);

    // Initial Standing popup trigger (5 seconds after load or preference configuration)
    useEffect(() => {
        if (preferenceSet && !showPrivacyModal) {
            const initialTimer = setTimeout(() => {
                setShowStandingModal(true);
            }, 5000);
            return () => clearTimeout(initialTimer);
        }
    }, [preferenceSet, showPrivacyModal]);

    // Recurring Standing popup trigger (every 1 minute)
    useEffect(() => {
        if (preferenceSet && !showPrivacyModal) {
            const interval = setInterval(() => {
                setShowStandingModal(true);
            }, 60000); // 1 minute
            return () => clearInterval(interval);
        }
    }, [preferenceSet, showPrivacyModal]);

    // Profile Completion Popup trigger (10 seconds after load if profile details are missing)
    useEffect(() => {
        if (user && preferenceSet && !showPrivacyModal) {
            const isProfileIncomplete = !user.profileImage || !user.course;
            if (isProfileIncomplete) {
                const reminderTimer = setTimeout(() => {
                    setShowProfileReminderModal(true);
                }, 10000); // 10 seconds
                return () => clearTimeout(reminderTimer);
            }
        }
    }, [user, preferenceSet, showPrivacyModal]);

    const handleSavePrivacyPreference = async (allow) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/auth/leaderboard-preference', 
                { showOnLeaderboard: allow },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setShowPrivacyModal(false);
            setPreferenceSet(true);
            
            // Re-fetch dashboard data so leaderboard updates immediately
            await fetchDashboardData();
        } catch (error) {
            console.error("Failed to save privacy preference", error);
        }
    };

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

            // Fetch leaderboard data
            setLeaderboardLoading(true);
            const leaderboardRes = await axios.get('http://localhost:5000/api/analytics/leaderboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeaderboardData(leaderboardRes.data.students);
            
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
            setLeaderboardLoading(false);
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
                    /* Dashboard Homepage Grid: Main Content + Leaderboard Sidebar */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Column: Learning Courses */}
                        <div className="lg:col-span-8 space-y-6">
                            <h3 className="text-xl font-bold text-gray-900">Your Learning Courses</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                        {/* Right Column: Leaderboard Sidebar */}
                        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <Trophy className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Student Community</h3>
                                        <p className="text-xs text-gray-500">Live rankings & percentiles</p>
                                    </div>
                                </div>
                                <span className="flex items-center gap-1 text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    <Users className="w-3 h-3" />
                                    {leaderboardData.filter(s => {
                                        if (leaderboardScope === 'overall') return s.overall.totalAttempts > 0;
                                        const cStat = s.courses.find(c => c.courseId === leaderboardScope);
                                        return cStat && cStat.totalAttempts > 0;
                                    }).length} Active
                                </span>
                            </div>

                            {/* Leaderboard Scope Selection */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Leaderboard Category</label>
                                <select
                                    value={leaderboardScope}
                                    onChange={(e) => {
                                        setLeaderboardScope(e.target.value);
                                        setExpandedStudentId(null); // reset expanded details
                                    }}
                                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-gray-700 shadow-sm cursor-pointer hover:border-gray-300 transition-colors"
                                >
                                    <option value="overall">🌍 Overall Ranking</option>
                                    <option value="general">📚 General Quizzes</option>
                                    {courses.map(c => (
                                        <option key={c._id} value={c._id}>🎓 {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Privacy quick settings toggle */}
                            {(() => {
                                const mySettings = leaderboardData.find(s => s.studentId === user?._id);
                                if (!mySettings) return null;
                                const isPublic = mySettings.showOnLeaderboard;
                                return (
                                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            {isPublic ? (
                                                <Eye className="w-4 h-4 text-emerald-600" />
                                            ) : (
                                                <EyeOff className="w-4 h-4 text-amber-600" />
                                            )}
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-900">Privacy Status</div>
                                                <div className="text-[9px] text-gray-500 font-medium">
                                                    {isPublic ? 'Real Name Shared' : 'Anonymous Mode'}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSavePrivacyPreference(!isPublic);
                                            }}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm transition-colors ${
                                                isPublic 
                                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' 
                                                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                                            }`}
                                        >
                                            {isPublic ? 'Go Anonymous' : 'Show My Name'}
                                        </button>
                                    </div>
                                );
                            })()}

                            {/* Leaderboard List */}
                            {leaderboardLoading ? (
                                <div className="py-12 text-center text-sm text-gray-400 font-medium">Loading rankings...</div>
                            ) : (
                                <div className="space-y-3.5 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
                                    {(() => {
                                        // Sort and filter active students based on scope
                                        const activeStudents = leaderboardData
                                            .map(student => {
                                                if (leaderboardScope === 'overall') {
                                                    return {
                                                        ...student,
                                                        activeStat: student.overall
                                                    };
                                                }
                                                const cStat = student.courses.find(c => c.courseId === leaderboardScope);
                                                return {
                                                    ...student,
                                                    activeStat: cStat || null
                                                };
                                            })
                                            .filter(s => s.activeStat && s.activeStat.totalAttempts > 0)
                                            .sort((a, b) => a.activeStat.rank - b.activeStat.rank);

                                        if (activeStudents.length === 0) {
                                            return (
                                                <div className="py-12 text-center space-y-3">
                                                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                                                        <Award className="w-6 h-6" />
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-medium max-w-[200px] mx-auto leading-relaxed">
                                                        No attempts in this category yet. Be the first to take a quiz!
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return activeStudents.map((student) => {
                                            const { rank, averageScore, totalAttempts, percentile } = student.activeStat;
                                            const isExpanded = expandedStudentId === student.studentId;

                                            // Determine rank styling and icon
                                            let rankBadge = null;
                                            let rankBg = 'bg-gray-50 text-gray-600';
                                            if (rank === 1) {
                                                rankBadge = <Trophy className="w-4 h-4 text-amber-500" />;
                                                rankBg = 'bg-amber-50 border border-amber-200 text-amber-800 font-bold';
                                            } else if (rank === 2) {
                                                rankBadge = <Medal className="w-4 h-4 text-slate-400" />;
                                                rankBg = 'bg-slate-50 border border-slate-200 text-slate-700 font-bold';
                                            } else if (rank === 3) {
                                                rankBadge = <Medal className="w-4 h-4 text-amber-600" />;
                                                rankBg = 'bg-amber-50/50 border border-amber-100 text-amber-700 font-bold';
                                            }

                                            // Handle anonymous display name and initials
                                            const isMe = student.studentId === user?._id;
                                            let displayName = student.name;
                                            if (isMe) {
                                                displayName = student.showOnLeaderboard ? 'You' : 'You (Anonymous)';
                                            } else if (!student.showOnLeaderboard) {
                                                displayName = `Student ${rank}`;
                                            }

                                            const initials = isMe ? 'YOU' : (displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ST');

                                            // Color palette for student avatars based on their name
                                            const avatarColors = [
                                                'bg-indigo-100 text-indigo-700',
                                                'bg-purple-100 text-purple-700',
                                                'bg-pink-100 text-pink-700',
                                                'bg-emerald-100 text-emerald-700',
                                                'bg-teal-100 text-teal-700',
                                                'bg-sky-100 text-sky-700'
                                            ];
                                            const colorIndex = (displayName ? displayName.charCodeAt(0) : 0) % avatarColors.length;
                                            const avatarColor = avatarColors[colorIndex];

                                            return (
                                                <div 
                                                    key={student.studentId}
                                                    onClick={() => setExpandedStudentId(isExpanded ? null : student.studentId)}
                                                    className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                                                        isMe 
                                                        ? 'bg-indigo-50/40 border-indigo-200 shadow-sm hover:bg-indigo-50/60 ring-1 ring-indigo-200/30' 
                                                        : 'bg-white border-gray-100 hover:border-indigo-100 hover:shadow-sm'
                                                    } ${
                                                        isExpanded ? 'border-indigo-300 ring-2 ring-indigo-50' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            {/* Rank Number / Badge */}
                                                            <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold shrink-0 ${rankBg}`}>
                                                                {rankBadge || rank}
                                                            </div>
                                                            {/* Avatar */}
                                                            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${avatarColor}`}>
                                                                {initials}
                                                            </div>
                                                            {/* Name & Attempt Count */}
                                                            <div className="min-w-0">
                                                                <h4 className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1.5">
                                                                    {displayName}
                                                                    {isMe && (
                                                                        <span className="text-[9px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">Me</span>
                                                                    )}
                                                                </h4>
                                                                <p className="text-[11px] text-gray-400 font-medium mt-0.5 flex items-center gap-1.5">
                                                                    <span>{totalAttempts} {totalAttempts === 1 ? 'test' : 'tests'}</span>
                                                                    <span>•</span>
                                                                    <span className="flex items-center gap-0.5 text-indigo-600 font-semibold bg-indigo-50/50 px-1 py-0.2 rounded text-[10px]">
                                                                        {percentile}%ile
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Avg Score Badge & Expand Chevron */}
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-right shrink-0">
                                                                <div className="text-sm font-bold text-gray-900">{averageScore}%</div>
                                                                <div className="text-[10px] text-gray-400 font-medium">Avg Score</div>
                                                            </div>
                                                            {isExpanded ? (
                                                                <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                                                            ) : (
                                                                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Expanded Course Breakdown details */}
                                                    {isExpanded && (
                                                        <div className="mt-3.5 pt-3 border-t border-gray-100 space-y-2 animate-fadeIn">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Course Performance Breakdown:</span>
                                                            <div className="space-y-1.5">
                                                                {/* Print overall breakdown */}
                                                                <div className="flex justify-between items-center text-xs bg-indigo-50/30 hover:bg-indigo-50/50 px-2.5 py-1.5 rounded-lg border border-indigo-50">
                                                                    <span className="font-semibold text-indigo-800 flex items-center gap-1">
                                                                        <TrendingUp className="w-3.5 h-3.5" /> Overall
                                                                    </span>
                                                                    <span className="text-indigo-700 font-semibold">
                                                                        {student.overall.averageScore}% avg ({student.overall.totalAttempts} tests) • {student.overall.percentile}th%
                                                                    </span>
                                                                </div>

                                                                {/* Print individual courses */}
                                                                {student.courses && student.courses.length > 0 ? (
                                                                    student.courses.map((c, i) => (
                                                                        <div key={i} className="flex justify-between items-center text-xs bg-gray-50/40 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                                                                            <span className="font-medium text-gray-600">{c.courseName}</span>
                                                                            <span className="text-gray-500 font-medium">
                                                                                {c.averageScore}% avg ({c.totalAttempts} tests) • {c.percentile}th%
                                                                            </span>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <p className="text-xs text-gray-400 italic py-1 pl-1">No other course attempts.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        });
                                    })()}
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
                                {getQuizzesForCourse(selectedCourse === 'general' ? null : selectedCourse._id).map(quiz => {
                                    const quizAttempts = analytics?.scoresHistory?.filter(sh => sh.quizId === quiz._id) || [];
                                    const hasAttempted = quizAttempts.length > 0;
                                    const latestAttempt = hasAttempted ? [...quizAttempts].sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;
                                    const latestScore = latestAttempt ? latestAttempt.score : null;

                                    return (
                                        <li key={quiz._id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-950">{quiz.title}</h4>
                                                <div className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-4">
                                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {quiz.timer} mins</span>
                                                    <span>• {quiz.mcqIds.length} Questions</span>
                                                    {hasAttempted && (
                                                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-xs">
                                                            Last Score: {latestScore}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Link 
                                                    to={`/student/quiz/${quiz._id}`} 
                                                    className={`px-6 py-2 rounded-lg font-medium transition-colors shadow-sm ${
                                                        hasAttempted 
                                                        ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200' 
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                    }`}
                                                >
                                                    {hasAttempted ? 'Reattempt Quiz' : 'Attempt Quiz'}
                                                </Link>
                                            </div>
                                        </li>
                                    );
                                })}
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

            {/* Leaderboard Privacy Consent Modal */}
            {showPrivacyModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6 border border-slate-100">
                        <div className="flex items-center gap-3.5 text-indigo-600">
                            <div className="p-3 bg-indigo-50 rounded-xl">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Leaderboard Privacy</h3>
                                <p className="text-xs text-gray-500">Choose how you appear on the board</p>
                            </div>
                        </div>
                        <div className="space-y-4 text-sm text-gray-600">
                            <p className="leading-relaxed">
                                Compete and track your performance relative to the student community! Would you like to share your real name on the leaderboard?
                            </p>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                                <div className="flex gap-2">
                                    <span className="text-indigo-600 font-bold">✓</span>
                                    <span><strong>Compete:</strong> Others can see your rank, average score, and percentile.</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-indigo-600 font-bold">✓</span>
                                    <span><strong>Option to Hide Name:</strong> Keep your name hidden as <strong>Anonymous Student</strong> or show it publicly.</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-indigo-600 font-bold">✓</span>
                                    <span><strong>Change Anytime:</strong> You can toggle your privacy mode at any time directly from the dashboard sidebar.</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2.5 pt-2">
                            <button 
                                onClick={() => handleSavePrivacyPreference(true)}
                                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center gap-2"
                            >
                                <Eye className="w-4 h-4" /> Yes, Show My Name & Score
                            </button>
                            <button 
                                onClick={() => handleSavePrivacyPreference(false)}
                                className="w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <EyeOff className="w-4 h-4" /> Keep Me Anonymous
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Standing Notification Modal Popup */}
            {showStandingModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6 border border-slate-100 relative overflow-hidden">
                        {/* Decorative background accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-8 -mt-8" />
                        
                        <div className="flex items-center gap-3.5 text-indigo-600">
                            <div className="p-3 bg-indigo-50 rounded-xl">
                                <Trophy className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Community Standing</h3>
                                <p className="text-xs text-gray-500">Your latest leaderboard stats</p>
                            </div>
                        </div>

                        {(() => {
                            const myStats = leaderboardData.find(s => s.studentId === user?._id);
                            const hasAttempts = myStats && myStats.overall && myStats.overall.totalAttempts > 0;
                            
                            if (hasAttempts) {
                                const { rank, averageScore, totalAttempts, percentile } = myStats.overall;
                                
                                // Rank styling
                                let rankLabel = `#${rank}`;
                                let rankIcon = "🏆";
                                if (rank === 1) rankIcon = "🥇";
                                else if (rank === 2) rankIcon = "🥈";
                                else if (rank === 3) rankIcon = "🥉";

                                return (
                                    <div className="space-y-5">
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Here is how you are performing right now compared to all other students in the community:
                                        </p>
                                        
                                        {/* Scorecard Grid */}
                                        <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                            <div className="space-y-1">
                                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Rank</div>
                                                <div className="text-2xl font-extrabold text-indigo-600 flex items-center justify-center gap-0.5">
                                                    <span>{rankIcon}</span>
                                                    <span>{rankLabel}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1 border-x border-gray-200">
                                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Average</div>
                                                <div className="text-2xl font-extrabold text-gray-900">{averageScore}%</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Percentile</div>
                                                <div className="text-2xl font-extrabold text-emerald-600">{percentile}%</div>
                                            </div>
                                        </div>

                                        <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl text-xs text-indigo-800 leading-relaxed">
                                            {percentile >= 75 ? (
                                                <span>✨ <strong>Incredible performance!</strong> You are in the top 25% of students. Keep up the high standard!</span>
                                            ) : percentile >= 50 ? (
                                                <span>👍 <strong>Good job!</strong> You are performing better than {percentile}% of students. Take a few more quizzes to rank higher!</span>
                                            ) : (
                                                <span>📈 <strong>Keep practicing!</strong> Take more quizzes and review materials to boost your rank and percentile!</span>
                                            )}
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button 
                                                onClick={() => setShowStandingModal(false)}
                                                className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md text-sm"
                                            >
                                                Awesome!
                                            </button>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="space-y-5">
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            You haven't attempted any quizzes yet, so you don't have a ranking or percentile standing.
                                        </p>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center py-6 text-sm text-gray-505 font-medium">
                                            No statistics calculated yet 📊
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button 
                                                onClick={() => {
                                                    setShowStandingModal(false);
                                                    setActiveView('courses');
                                                    setSelectedCourse(null);
                                                }}
                                                className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md text-sm"
                                            >
                                                Start Learning Now
                                            </button>
                                            <button 
                                                onClick={() => setShowStandingModal(false)}
                                                className="py-3 px-6 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                );
                            }
                        })()}
                    </div>
                </div>
            )}

            {/* Profile Completion Reminder Modal */}
            {showProfileReminderModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6 border border-slate-100 relative overflow-hidden">
                        {/* Decorative background circle */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-8 -mt-8" />
                        
                        <div className="flex items-center gap-3.5 text-indigo-600">
                            <div className="p-3 bg-indigo-50 rounded-xl">
                                <User className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Complete Your Profile!</h3>
                                <p className="text-xs text-gray-500">EduAI personalization setup</p>
                            </div>
                        </div>

                        <div className="space-y-4 text-sm text-gray-600">
                            <p className="leading-relaxed">
                                To get the best learning experience on EduAI MCQ, please take a moment to update your profile details.
                            </p>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5 text-xs text-gray-600">
                                <div className="flex gap-2">
                                    <span className="text-indigo-600 font-bold">✓</span>
                                    <span><strong>Select Course:</strong> Specify your learning course to get filtered quizzes immediately.</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-indigo-600 font-bold">✓</span>
                                    <span><strong>Upload Avatar:</strong> Set a profile picture so you can spot yourself easily on the leaderboard!</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Link
                                to="/profile"
                                onClick={() => setShowProfileReminderModal(false)}
                                className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md text-sm text-center"
                            >
                                Go to Profile
                            </Link>
                            <button 
                                onClick={() => setShowProfileReminderModal(false)}
                                className="py-3 px-6 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                            >
                                Later
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

