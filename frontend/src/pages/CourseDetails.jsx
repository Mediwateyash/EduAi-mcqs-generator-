import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, BookOpen, Clock, Trash2, Plus, Sparkles, FolderPlus, ArrowUp, ArrowDown, Edit2, Save, X, Trash } from 'lucide-react';

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [courseQuizzes, setCourseQuizzes] = useState([]);
    const [unassignedQuizzes, setUnassignedQuizzes] = useState([]);
    const [selectedQuizToAdd, setSelectedQuizToAdd] = useState('');
    const [loading, setLoading] = useState(true);

    // Edit Quiz States
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editTimer, setEditTimer] = useState(0);
    const [editMcqs, setEditMcqs] = useState([]);
    const [expandedMcqId, setExpandedMcqId] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // 1. Fetch course details
            const courseRes = await axios.get(`http://localhost:5000/api/course/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourse(courseRes.data);

            // 2. Fetch all quizzes to split them
            const quizzesRes = await axios.get('http://localhost:5000/api/quiz', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Quizzes in this course
            const currentQuizzes = quizzesRes.data.filter(q => q.course?._id === id);
            setCourseQuizzes(currentQuizzes);

            // Unassigned quizzes (no course or course is null)
            const availableQuizzes = quizzesRes.data.filter(q => !q.course);
            setUnassignedQuizzes(availableQuizzes);

        } catch (error) {
            console.error("Error fetching course details data", error);
            alert("Failed to load course details.");
            navigate('/teacher/courses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleAddQuiz = async (e) => {
        e.preventDefault();
        if (!selectedQuizToAdd) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/course/${id}/add-quiz`, {
                quizId: selectedQuizToAdd
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedQuizToAdd('');
            await fetchData();
        } catch (error) {
            alert('Failed to add quiz to course');
        }
    };

    const handleRemoveQuiz = async (quizId) => {
        if (!window.confirm("Remove this quiz from this course? The quiz itself won't be deleted.")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/course/${id}/remove-quiz`, {
                quizId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchData();
        } catch (error) {
            alert('Failed to remove quiz from course');
        }
    };

    const handleEditClick = async (quizId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/quiz/${quizId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const fullQuiz = res.data;
            setEditingQuiz(fullQuiz);
            setEditTitle(fullQuiz.title);
            setEditTimer(fullQuiz.timer);
            setEditMcqs(fullQuiz.mcqIds || []);
            setExpandedMcqId(null);
        } catch (error) {
            alert("Failed to load quiz details for editing");
        }
    };

    const moveMcqUp = (index) => {
        if (index === 0) return;
        const newMcqs = [...editMcqs];
        const temp = newMcqs[index];
        newMcqs[index] = newMcqs[index - 1];
        newMcqs[index - 1] = temp;
        setEditMcqs(newMcqs);
    };

    const moveMcqDown = (index) => {
        if (index === editMcqs.length - 1) return;
        const newMcqs = [...editMcqs];
        const temp = newMcqs[index];
        newMcqs[index] = newMcqs[index + 1];
        newMcqs[index + 1] = temp;
        setEditMcqs(newMcqs);
    };

    const handleSaveMcq = async (mcqId, index) => {
        try {
            const token = localStorage.getItem('token');
            const targetMcq = editMcqs[index];
            await axios.put(`http://localhost:5000/api/mcq/${mcqId}`, {
                question: targetMcq.question,
                options: targetMcq.options,
                correctAnswer: targetMcq.correctAnswer,
                explanation: targetMcq.explanation
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Question updated successfully!");
        } catch (error) {
            alert("Failed to update question: " + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        if (!window.confirm("WARNING: Are you sure you want to permanently delete this quiz from the database? This action cannot be undone.")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/quiz/${quizId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchData();
            alert("Quiz deleted successfully!");
        } catch (error) {
            alert("Failed to delete quiz: " + (error.response?.data?.message || error.message));
        }
    };

    const handleMcqFieldChange = (index, field, value) => {
        const newMcqs = [...editMcqs];
        newMcqs[index] = { ...newMcqs[index], [field]: value };
        setEditMcqs(newMcqs);
    };

    const handleMcqOptionChange = (index, optIndex, value) => {
        const newMcqs = [...editMcqs];
        const newOptions = [...newMcqs[index].options];
        newOptions[optIndex] = value;
        newMcqs[index] = { ...newMcqs[index], options: newOptions };
        setEditMcqs(newMcqs);
    };

    const handleSaveQuiz = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const mcqIdsList = editMcqs.map(q => q._id);
            await axios.put(`http://localhost:5000/api/quiz/${editingQuiz._id}`, {
                title: editTitle,
                timer: editTimer,
                mcqIds: mcqIdsList
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingQuiz(null);
            await fetchData();
            alert("Quiz updated successfully!");
        } catch (error) {
            alert("Failed to update quiz: " + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading && !course) return <div className="p-8 text-center text-gray-500">Loading course...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex items-center gap-4">
                <Link to="/teacher/courses" className="text-gray-500 hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{course?.name}</h1>
                    {course?.description && <p className="text-sm text-gray-500 mt-1">{course.description}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Course Quizzes List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        Quizzes in Course ({courseQuizzes.length})
                    </h3>

                    {courseQuizzes.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
                            No quizzes added to this course yet. Use the option on the right to add quizzes!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {courseQuizzes.map(quiz => (
                                <div key={quiz._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 line-clamp-1">{quiz.title}</h4>
                                        <div className="text-xs text-gray-500 mt-2 flex items-center gap-4">
                                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {quiz.timer} mins</span>
                                            <span>• {quiz.mcqIds.length} Questions</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-gray-50 flex flex-wrap gap-2 justify-end">
                                        <Link 
                                            to={`/student/quiz/${quiz._id}`} 
                                            className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150 rounded-lg transition-colors"
                                        >
                                            Preview
                                        </Link>
                                        <button 
                                            onClick={() => handleEditClick(quiz._id)}
                                            className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button 
                                            onClick={() => handleRemoveQuiz(quiz._id)}
                                            className="px-3 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteQuiz(quiz._id)}
                                            className="px-3 py-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <Trash className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Quiz Form */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit space-y-4">
                    <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-3">
                        <FolderPlus className="w-5 h-5 text-indigo-600" />
                        Add Quiz to Course
                    </h3>

                    {unassignedQuizzes.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No unassigned quizzes available. Create a new quiz first or remove it from another course.</p>
                    ) : (
                        <form onSubmit={handleAddQuiz} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Quiz</label>
                                <select 
                                    value={selectedQuizToAdd}
                                    onChange={e => setSelectedQuizToAdd(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm shadow-sm"
                                    required
                                >
                                    <option value="">-- Choose Quiz --</option>
                                    {unassignedQuizzes.map(q => (
                                        <option key={q._id} value={q._id}>{q.title} ({q.mcqIds.length} MCQs)</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={!selectedQuizToAdd}
                                className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add to Course
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Edit Quiz Modal */}
            {editingQuiz && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Edit2 className="w-6 h-6 text-indigo-600" /> Edit Quiz Details
                            </h2>
                            <button 
                                onClick={() => setEditingQuiz(null)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-808 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveQuiz} className="space-y-6">
                            {/* Quiz title and timer in a grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quiz Title</label>
                                    <input 
                                        type="text" 
                                        value={editTitle}
                                        onChange={e => setEditTitle(e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm shadow-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration (Minutes)</label>
                                    <input 
                                        type="number" 
                                        value={editTimer}
                                        onChange={e => setEditTimer(Number(e.target.value))}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm shadow-sm"
                                        required
                                        min="1"
                                    />
                                </div>
                            </div>

                            {/* Reorder and Edit MCQs section */}
                            <div className="space-y-4">
                                <h3 className="text-md font-bold text-gray-800 border-b border-gray-50 pb-2">
                                    Arrange & Edit Questions (Sequence Order)
                                </h3>

                                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                                    {editMcqs.map((mcq, index) => {
                                        const isExpanded = expandedMcqId === mcq._id;
                                        return (
                                            <div 
                                                key={mcq._id} 
                                                className={`p-4 rounded-xl border transition-all ${
                                                    isExpanded 
                                                    ? 'bg-indigo-50/20 border-indigo-200 shadow-sm' 
                                                    : 'bg-white border-gray-150 hover:bg-gray-50/50'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center gap-4">
                                                    {/* MCQ Index and Question preview */}
                                                    <div 
                                                        onClick={() => setExpandedMcqId(isExpanded ? null : mcq._id)}
                                                        className="flex-1 cursor-pointer select-none"
                                                    >
                                                        <div className="flex items-start gap-2.5">
                                                            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold font-mono mt-0.5">
                                                                #{index + 1}
                                                            </span>
                                                            <p className="font-semibold text-gray-800 text-sm line-clamp-1">{mcq.question}</p>
                                                        </div>
                                                    </div>

                                                    {/* Action buttons (Up, Down, Expand/Collapse, Delete from Quiz) */}
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            disabled={index === 0}
                                                            onClick={() => moveMcqUp(index)}
                                                            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                                            title="Move Question Up"
                                                        >
                                                            <ArrowUp className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={index === editMcqs.length - 1}
                                                            onClick={() => moveMcqDown(index)}
                                                            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                                            title="Move Question Down"
                                                        >
                                                            <ArrowDown className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setExpandedMcqId(isExpanded ? null : mcq._id)}
                                                            className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                                        >
                                                            {isExpanded ? 'Collapse' : 'Edit MCQ'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (window.confirm("Remove this MCQ from this quiz?")) {
                                                                    setEditMcqs(editMcqs.filter(q => q._id !== mcq._id));
                                                                }
                                                            }}
                                                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                            title="Remove Question from Quiz"
                                                        >
                                                            <Trash className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Expanded MCQ Editor */}
                                                {isExpanded && (
                                                    <div className="mt-4 pt-4 border-t border-indigo-100 space-y-4 animate-fadeIn">
                                                        {/* Question Input */}
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Question Text</label>
                                                            <input 
                                                                type="text" 
                                                                value={mcq.question}
                                                                onChange={e => handleMcqFieldChange(index, 'question', e.target.value)}
                                                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm shadow-sm"
                                                            />
                                                        </div>

                                                        {/* Options grid */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {mcq.options.map((opt, oIdx) => (
                                                                <div key={oIdx}>
                                                                    <label className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-1">
                                                                        Option {String.fromCharCode(65 + oIdx)}
                                                                    </label>
                                                                    <input 
                                                                        type="text" 
                                                                        value={opt}
                                                                        onChange={e => handleMcqOptionChange(index, oIdx, e.target.value)}
                                                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm shadow-sm"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Correct Answer Selection & Explanation */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Correct Answer</label>
                                                                <select 
                                                                    value={mcq.correctAnswer}
                                                                    onChange={e => handleMcqFieldChange(index, 'correctAnswer', e.target.value)}
                                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm shadow-sm"
                                                                >
                                                                    {mcq.options.map((opt, oIdx) => (
                                                                        <option key={oIdx} value={opt}>Option {String.fromCharCode(65 + oIdx)}: {opt}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Explanation</label>
                                                                <textarea 
                                                                    value={mcq.explanation}
                                                                    onChange={e => handleMcqFieldChange(index, 'explanation', e.target.value)}
                                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm shadow-sm h-14"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Save MCQ button */}
                                                        <div className="flex justify-end pt-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSaveMcq(mcq._id, index)}
                                                                className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                                                            >
                                                                <Save className="w-3.5 h-3.5" /> Save Question Changes
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Submit & Cancel Buttons */}
                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingQuiz(null)}
                                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {saving ? 'Saving...' : 'Save Quiz Sequence & Info'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetails;
