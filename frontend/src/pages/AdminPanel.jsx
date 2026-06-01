import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, BookOpen, CheckCircle, XCircle, Trash2, Search, Filter, ShieldCheck, Mail, Calendar, AlertTriangle } from 'lucide-react';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [mcqs, setMcqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const endpoint = activeTab === 'users' ? 'users' : 'mcqs';
            
            // Use relative URL or handle both localhost and network access
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const res = await axios.get(`${baseUrl}/api/admin/${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (activeTab === 'users') setUsers(Array.isArray(res.data) ? res.data : []);
            else setMcqs(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
            setError(error.response?.data?.message || "Connection to server failed. Please check if the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            await axios.put(`${baseUrl}/api/admin/users/approve/${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.map(u => u._id === userId ? { ...u, isApproved: true } : u));
        } catch (error) {
            const errMsg = error.response?.data?.message || error.message || "Failed to approve teacher";
            alert(`Failed to approve teacher: ${errMsg}`);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const token = localStorage.getItem('token');
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            await axios.delete(`${baseUrl}/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(u => u._id !== userId));
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete user");
        }
    };

    const filteredUsers = users.filter(u => {
        const name = u.name || '';
        const email = u.email || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const filteredMcqs = mcqs.filter(m => 
        (m.question || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.topic || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                        Admin Control Center
                    </h1>
                    <p className="text-gray-500 mt-1">Manage users, approvals, and platform content</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg self-start">
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        User Management
                    </button>
                    <button 
                        onClick={() => setActiveTab('mcqs')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'mcqs' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        MCQ Repository
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" />
                    <div>
                        <p className="font-semibold">Error Loading Data</p>
                        <p className="text-sm">{error}</p>
                    </div>
                    <button 
                        onClick={fetchData}
                        className="ml-auto bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-xs font-bold transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder={activeTab === 'users' ? "Search users by name or email..." : "Search MCQs by question or topic..."}
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {activeTab === 'users' && (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select 
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="teacher">Teachers</option>
                            <option value="student">Students</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-500">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    Loading platform data...
                </div>
            ) : activeTab === 'users' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">User Info</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Joined Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((u) => (
                                        <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${u.role === 'admin' ? 'bg-red-100 text-red-600' : u.role === 'teacher' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                                                        {u.name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{u.name}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'admin' ? 'text-red-700 bg-red-50' : u.role === 'teacher' ? 'text-indigo-700 bg-indigo-50' : 'text-green-700 bg-green-50'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {u.isApproved ? (
                                                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                                        <CheckCircle className="w-4 h-4" /> Approved
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                                                        <XCircle className="w-4 h-4" /> Pending Approval
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" /> {new Date(u.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {!u.isApproved && u.role === 'teacher' && (
                                                        <button 
                                                            onClick={() => handleApprove(u._id)}
                                                            className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 transition-colors shadow-sm"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    {u.role !== 'admin' && (
                                                        <button 
                                                            onClick={() => handleDeleteUser(u._id)}
                                                            className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="px-6 py-20 text-center text-gray-500">No users found in the system.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredMcqs.length > 0 ? (
                        filteredMcqs.map((m, idx) => (
                            <div key={m._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start gap-4 mb-3">
                                    <h4 className="font-semibold text-lg text-gray-900">
                                        <span className="text-primary mr-2">#{idx+1}</span> {m.question}
                                    </h4>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium whitespace-nowrap">
                                        {m.materialId?.chapterName || m.materialId?.fileName || 'Unknown Material'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                    {m.options.map((opt, i) => (
                                        <div key={i} className={`p-2 rounded border text-sm ${opt === m.correctAnswer ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                            {String.fromCharCode(65 + i)}. {opt}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-50">
                                    <div className="flex gap-4">
                                        <span className="capitalize font-medium text-gray-700">Difficulty: {m.difficulty}</span>
                                        <span>Topic: {m.topic || 'General'}</span>
                                    </div>
                                    <span>Created {new Date(m.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-20 text-center text-gray-500 rounded-xl border border-gray-100">
                            No MCQs have been generated on the platform yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
