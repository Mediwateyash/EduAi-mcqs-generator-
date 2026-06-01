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
                                <span className="text-gray-700 font-medium flex items-center gap-1.5 hidden sm:flex">
                                    <UserIcon className="w-4 h-4" />
                                    {user.name} ({user.role})
                                </span>
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
