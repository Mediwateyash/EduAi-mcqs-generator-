import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Camera, Shield, Eye, EyeOff, Save, GraduationCap, User } from 'lucide-react';

const Profile = () => {
    const { user, refreshUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // Form state
    const [name, setName] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [showOnLeaderboard, setShowOnLeaderboard] = useState(false);
    
    // Courses list
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [saving, setSaving] = useState(false);

    // Cropper modal state
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState('');
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const cropperContainerRef = useRef(null);
    const fileInputRef = useRef(null);

    // Load user data and available courses
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setSelectedCourseId(user.course?._id || user.course || '');
            setProfileImage(user.profileImage || '');
            setShowOnLeaderboard(user.showOnLeaderboard || false);
        }
    }, [user]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/course', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourses(res.data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, []);

    // File input handler
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result);
            setZoom(1);
            setOffset({ x: 0, y: 0 });
            setCropModalOpen(true);
        };
        reader.readAsDataURL(file);
    };

    // Drag handling for cropping
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch event handlers for mobile cropping support
    const handleTouchStart = (e) => {
        if (e.touches.length !== 1) return;
        setIsDragging(true);
        const touch = e.touches[0];
        setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
    };

    const handleTouchMove = (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        const touch = e.touches[0];
        setOffset({
            x: touch.clientX - dragStart.x,
            y: touch.clientY - dragStart.y
        });
    };

    // Crop executor using offscreen canvas math
    const handleCrop = () => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            // Target canvas 150x150
            const canvas = document.createElement('canvas');
            canvas.width = 150;
            canvas.height = 150;
            const ctx = canvas.getContext('2d');

            if (!ctx) return;

            // Screen scale calculations
            const displayWidth = 250;
            const displayHeight = (img.naturalHeight / img.naturalWidth) * 250;
            
            const screenScale = (displayWidth / img.naturalWidth) * zoom;
            
            // Calculate center of crop area relative to screen image top-left
            const screenCenterX = displayWidth / 2 - offset.x / zoom;
            const screenCenterY = displayHeight / 2 - offset.y / zoom;
            
            // Map back to original image dimensions
            const naturalCenterX = img.naturalWidth / 2 - offset.x / screenScale;
            const naturalCenterY = img.naturalHeight / 2 - offset.y / screenScale;
            
            // Crop circle screen radius is 90px (180px diameter circle)
            const naturalRadius = 90 / screenScale;
            
            // Define source rectangle
            const sx = naturalCenterX - naturalRadius;
            const sy = naturalCenterY - naturalRadius;
            const sWidth = naturalRadius * 2;
            const sHeight = naturalRadius * 2;

            // Draw and compress to DataURL
            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 150, 150);
            const croppedBase64 = canvas.toDataURL('image/jpeg', 0.85);

            setProfileImage(croppedBase64);
            setCropModalOpen(false);
            
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
    };

    // Form submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/auth/profile', {
                name,
                course: selectedCourseId || null,
                profileImage,
                showOnLeaderboard
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Synchronize the AuthContext state
            await refreshUser();
            
            alert('Profile updated successfully!');
            
            // Redirect based on role
            if (user?.role === 'teacher') {
                navigate('/teacher');
            } else {
                navigate('/student');
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            alert('Failed to update profile: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(user?.role === 'teacher' ? '/teacher' : '/student')}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Profile</h1>
                    <p className="text-sm text-gray-500">Update your account information, course, and photo</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {/* Photo Side Column */}
                <div className="p-8 md:col-span-4 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        {profileImage ? (
                            <img 
                                src={profileImage} 
                                alt="Profile Avatar" 
                                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-50 shadow-md group-hover:opacity-85 transition-opacity" 
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center border-4 border-indigo-50 shadow-md group-hover:bg-indigo-100 transition-colors">
                                <User className="w-16 h-16" />
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg border-2 border-white hover:bg-indigo-700 transition-colors">
                            <Camera className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-950 text-sm">Profile Avatar</h4>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">Click photo to upload and crop a new picture.</p>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                    />
                </div>

                {/* Form Inputs Column */}
                <form onSubmit={handleSubmit} className="p-8 md:col-span-8 space-y-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                        <input 
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-gray-808 shadow-sm"
                        />
                    </div>

                    {/* Course Selection */}
                    {user?.role === 'student' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Learning Course</label>
                            {loadingCourses ? (
                                <div className="text-sm text-gray-400 py-2">Loading courses...</div>
                            ) : (
                                <select
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold text-gray-700 shadow-sm cursor-pointer"
                                >
                                    <option value="">-- Choose Course --</option>
                                    {courses.map(c => (
                                        <option key={c._id} value={c._id}>🎓 {c.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {/* Leaderboard Privacy setting */}
                    {user?.role === 'student' && (
                        <div className="flex items-start justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl space-x-4">
                            <div className="flex gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl h-fit">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold text-gray-900">Leaderboard Anonymity</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Show your real name on the community standing board, allowing you to compete openly with other students.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowOnLeaderboard(!showOnLeaderboard)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 shadow-sm flex items-center gap-1.5 ${
                                    showOnLeaderboard 
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                                        : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                                }`}
                            >
                                {showOnLeaderboard ? (
                                    <>
                                        <Eye className="w-3.5 h-3.5" /> Public Name
                                    </>
                                ) : (
                                    <>
                                        <EyeOff className="w-3.5 h-3.5" /> Anonymous
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={() => navigate(user?.role === 'teacher' ? '/teacher' : '/student')}
                            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Custom Canvas-based Cropper Modal Overlay */}
            {cropModalOpen && (
                <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 border border-slate-100">
                        <div className="flex items-center gap-3 text-indigo-600 pb-2 border-b border-gray-100">
                            <Camera className="w-5 h-5" />
                            <h3 className="font-bold text-gray-900 text-lg">Crop Profile Picture</h3>
                        </div>

                        {/* Interactive Drag Crop Area */}
                        <div className="flex flex-col items-center space-y-4">
                            <div 
                                ref={cropperContainerRef}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleMouseUp}
                                className="w-[250px] h-[250px] bg-slate-950 relative overflow-hidden rounded-xl cursor-move select-none border border-slate-800 shadow-inner"
                            >
                                {/* Panned Image element */}
                                <img 
                                    src={imageSrc} 
                                    alt="Source" 
                                    draggable="false"
                                    className="absolute origin-center max-w-none pointer-events-none"
                                    style={{
                                        width: '250px',
                                        left: '50%',
                                        top: '50%',
                                        transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`
                                    }}
                                />
                                {/* Circular Crop Mask Overlay */}
                                <div className="absolute inset-0 pointer-events-none ring-[100px] ring-black/60 flex items-center justify-center">
                                    <div className="w-[180px] h-[180px] rounded-full border-2 border-white shadow-lg shadow-black/40" />
                                </div>
                            </div>

                            {/* Zoom range controller */}
                            <div className="w-full space-y-1">
                                <div className="flex justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                                    <span>Zoom Scale</span>
                                    <span>{(zoom * 100).toFixed(0)}%</span>
                                </div>
                                <input 
                                    type="range"
                                    min="1"
                                    max="3"
                                    step="0.05"
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => { setCropModalOpen(false); setImageSrc(''); }}
                                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCrop}
                                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                Apply Crop
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
