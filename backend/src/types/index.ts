export interface DocumentChunk {
    id: string;
    content: string;
    metadata: {
        section: string;
        position: number;
        documentType: 'resume' | 'job_description';
    };
}

export interface AnalysisResult {
    matchScore: number;
    strengths: string[];
    gaps: string[];
    insights: string[];
}

export interface ResumeData {
    skills: string[];
    experienceYears: number;
    education: string[];
    summary: string;
    rawText: string;
}

export interface JobDescriptionData {
    requiredSkills: string[];
    preferredSkills: string[];
    experienceRequired: string;
    education: string[];
    rawText: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ChatResponse {
    answer: string;
    sources: string[];
}

export interface Session {
    id: string;
    resumeText?: string;
    resumeData?: ResumeData;
    jobDescriptionText?: string;
    jobDescriptionData?: JobDescriptionData;
    analysis?: AnalysisResult;
    chatHistory: ChatMessage[];
    createdAt: Date;
}
