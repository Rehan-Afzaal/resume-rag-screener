import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: API_URL
});

export interface UploadResponse {
    sessionId: string;
    preview: string;
    message: string;
}

export interface AnalysisResponse {
    sessionId: string;
    analysis: {
        matchScore: number;
        strengths: string[];
        gaps: string[];
        insights: string[];
    };
    resumeHighlights: {
        skills: string[];
        experience: string;
        education: string;
    };
}

export interface ChatResponse {
    answer: string;
    sources: string[];
    timestamp: string;
}

export const uploadResume = async (file: File, sessionId?: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (sessionId) {
        formData.append('sessionId', sessionId);
    }

    const response = await api.post('/api/upload/resume', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
};

export const uploadJobDescription = async (file: File, sessionId: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);

    const response = await api.post('/api/upload/job-description', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
};

export const analyzeResume = async (sessionId: string): Promise<AnalysisResponse> => {
    const response = await api.post('/api/analyze', { sessionId });
    return response.data;
};

export const sendChatMessage = async (sessionId: string, question: string): Promise<ChatResponse> => {
    const response = await api.post('/api/chat', { sessionId, question });
    return response.data;
};

export default api;
