import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center text-primary font-bold text-xl gap-2">
                            <BookOpen className="w-6 h-6" />
                            <span>EduAI MCQ</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link 
                                    to="/profile" 
                                    className="text-gray-750 hover:text-indigo-600 font-semibold flex items-center gap-2 transition-colors duration-200 hidden sm:flex py-1.5 px-3 hover:bg-slate-50 rounded-xl"
                                    title="View / Edit Profile"
                                >
                                    {user.profileImage ? (
                                        <img 
                                            src={user.profileImage} 
                                            alt="Profile" 
                                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-sm" 
                                        />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-[11px] font-bold border border-indigo-100 uppercase">
                                            {user.name ? user.name[0] : 'U'}
                                        </div>
                                    )}
                                    <span>{user.name}</span>
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                        {user.role}
                                    </span>
                                </Link>
                                {(user.role === 'teacher' || user.role === 'admin') && (
                                    <Link to="/teacher" className="text-gray-600 hover:text-primary font-medium">Teacher</Link>
                                )}
                                {(user.role === 'student' || user.role === 'admin') && (
                                    <Link to="/student" className="text-gray-600 hover:text-primary font-medium">Student</Link>
                                )}
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="text-indigo-600 hover:text-indigo-800 font-bold">Admin Panel</Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-600 hover:text-red-500 flex items-center gap-1 font-medium transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-primary font-medium">Login</Link>
                                <Link to="/register" className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors border border-transparent">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
