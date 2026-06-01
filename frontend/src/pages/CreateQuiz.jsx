import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';

const CreateQuiz = () => {
    const [materials, setMaterials] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState('');
    const [mcqs, setMcqs] = useState([]);
    
    // Form State
    const [title, setTitle] = useState('');
    const [timer, setTimer] = useState(15);
    const [selectedMcqs, setSelectedMcqs] = useState(new Set());
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/material', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // only keep completed materials
                setMaterials(res.data.filter(m => m.status === 'completed'));
            } catch (error) {
                console.error(error);
            }
        };
        fetchMaterials();
    }, []);

    useEffect(() => {
        if (!selectedMaterial) {
            setMcqs([]);
            return;
        }
        const fetchMcqs = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/mcq/material/${selectedMaterial}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMcqs(res.data);
                // Auto select all initially
                setSelectedMcqs(new Set(res.data.map(m => m._id)));
            } catch (error) {
                console.error(error);
            }
        };
        fetchMcqs();
    }, [selectedMaterial]);

    const toggleSelection = (id) => {
        const newSet = new Set(selectedMcqs);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedMcqs(newSet);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/quiz/create', {
                title,
                timer,
                mcqIds: Array.from(selectedMcqs)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/teacher');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create quiz');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/teacher" className="text-gray-500 hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Create New Quiz</h1>
            </div>

            <form onSubmit={handleCreate} className="space-y-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Quiz Details</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                            <input 
                                required
                                type="text" 
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-primary focus:border-primary shadow-sm"
                                placeholder="e.g. Midterm History"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Timer (Minutes)</label>
                            <input 
                                required
                                type="number" 
                                min="1"
                                value={timer}
                                onChange={e => setTimer(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-primary focus:border-primary shadow-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source Material</label>
                        <select 
                            value={selectedMaterial}
                            onChange={e => setSelectedMaterial(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-primary focus:border-primary shadow-sm"
                        >
                            <option value="">-- Select Processed Material --</option>
                            {materials.map(m => (
                                <option key={m._id} value={m._id}>{m.fileName} ({new Date(m.createdAt).toLocaleDateString()})</option>
                            ))}
                        </select>
                    </div>
                </div>

                {mcqs.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Select Questions</h2>
                            <span className="text-sm text-gray-500">{selectedMcqs.size} of {mcqs.length} selected</span>
                        </div>
                        
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {mcqs.map((mcq, idx) => (
                                <label key={mcq._id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedMcqs.has(mcq._id) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                    <input 
                                        type="checkbox"
                                        className="mt-1 flex-shrink-0 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                        checked={selectedMcqs.has(mcq._id)}
                                        onChange={() => toggleSelection(mcq._id)}
                                    />
                                    <div className="flex-1">
                                        <div className="flex gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                mcq.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                mcq.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {mcq.difficulty || 'medium'}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                                                {mcq.topic || 'General'}
                                            </span>
                                        </div>
                                        <p className="font-medium text-gray-800 text-sm"><span className="text-gray-500 mr-2">Q{idx+1}.</span>{mcq.question}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <button 
                        type="submit" 
                        disabled={selectedMcqs.size === 0 || !title}
                        className="px-6 py-3 bg-primary text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 shadow flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5"/>
                        Create Quiz
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateQuiz;
