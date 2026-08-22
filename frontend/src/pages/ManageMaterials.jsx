import React, { useState } from 'react';
import MaterialUpload from '../components/MaterialUpload';
import MaterialsList from '../components/MaterialsList';

const ManageMaterials = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUploadSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Study Materials Manager</h1>
                    <p className="text-sm text-gray-500 mt-1">Upload study documents to extract topics and automatically generate MCQs.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <MaterialUpload onUploadSuccess={handleUploadSuccess} />
                </div>
                <div className="lg:col-span-2">
                    <MaterialsList refreshTrigger={refreshTrigger} />
                </div>
            </div>
        </div>
    );
};

export default ManageMaterials;
