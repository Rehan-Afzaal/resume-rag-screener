import React, { useState } from 'react';
import './FileUpload.css';

interface FileUploadProps {
    onResumeUpload: (file: File) => void;
    onJobDescriptionUpload: (file: File) => void;
    isLoading: boolean;
    hasResume: boolean;
    hasJobDescription: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onResumeUpload,
    onJobDescriptionUpload,
    isLoading,
    hasResume,
    hasJobDescription
}) => {
    const [resumeDragging, setResumeDragging] = useState(false);
    const [jdDragging, setJdDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent, setDragging: (value: boolean) => void) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (setDragging: (value: boolean) => void) => {
        setDragging(false);
    };

    const handleDrop = (
        e: React.DragEvent,
        onUpload: (file: File) => void,
        setDragging: (value: boolean) => void
    ) => {
        e.preventDefault();
        setDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            onUpload(files[0]);
        }
    };

    const handleFileSelect = (
        e: React.ChangeEvent<HTMLInputElement>,
        onUpload: (file: File) => void
    ) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onUpload(files[0]);
        }
    };

    return (
        <div className="upload-section card fade-in-up">
            <h2>📄 Upload Documents</h2>

            <div className="upload-grid">
                {/* Resume Upload */}
                <div
                    className={`upload-zone ${resumeDragging ? 'dragging' : ''} ${hasResume ? 'uploaded' : ''}`}
                    onDragOver={(e) => handleDragOver(e, setResumeDragging)}
                    onDragLeave={() => handleDragLeave(setResumeDragging)}
                    onDrop={(e) => handleDrop(e, onResumeUpload, setResumeDragging)}
                >
                    <input
                        type="file"
                        id="resume-upload"
                        accept=".pdf,.txt"
                        onChange={(e) => handleFileSelect(e, onResumeUpload)}
                        disabled={isLoading}
                        hidden
                    />
                    <label htmlFor="resume-upload">
                        {hasResume ? (
                            <>
                                <span className="upload-icon">✅</span>
                                <span className="upload-text">Resume Uploaded</span>
                                <span className="upload-hint">Click to change</span>
                            </>
                        ) : (
                            <>
                                <span className="upload-icon">📋</span>
                                <span className="upload-text">Upload Resume</span>
                                <span className="upload-hint">PDF or TXT • Drag & drop or click</span>
                            </>
                        )}
                    </label>
                </div>

                {/* Job Description Upload */}
                <div
                    className={`upload-zone ${jdDragging ? 'dragging' : ''} ${hasJobDescription ? 'uploaded' : ''} ${!hasResume ? 'disabled' : ''}`}
                    onDragOver={(e) => hasResume && handleDragOver(e, setJdDragging)}
                    onDragLeave={() => handleDragLeave(setJdDragging)}
                    onDrop={(e) => hasResume && handleDrop(e, onJobDescriptionUpload, setJdDragging)}
                >
                    <input
                        type="file"
                        id="jd-upload"
                        accept=".pdf,.txt"
                        onChange={(e) => handleFileSelect(e, onJobDescriptionUpload)}
                        disabled={isLoading || !hasResume}
                        hidden
                    />
                    <label htmlFor="jd-upload">
                        {hasJobDescription ? (
                            <>
                                <span className="upload-icon">✅</span>
                                <span className="upload-text">Job Description Uploaded</span>
                                <span className="upload-hint">Click to change</span>
                            </>
                        ) : (
                            <>
                                <span className="upload-icon">📝</span>
                                <span className="upload-text">Upload Job Description</span>
                                <span className="upload-hint">
                                    {hasResume ? 'PDF or TXT • Drag & drop or click' : 'Upload resume first'}
                                </span>
                            </>
                        )}
                    </label>
                </div>
            </div>
        </div>
    );
};
