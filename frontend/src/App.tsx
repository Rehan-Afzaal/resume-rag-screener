import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { MatchAnalysis } from './components/MatchAnalysis';
import { ChatInterface } from './components/ChatInterface';
import { uploadResume, uploadJobDescription, analyzeResume, sendChatMessage } from './services/api';
import type { AnalysisResponse } from './services/api';
import './index.css';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [sessionId, setSessionId] = useState<string>('');
  const [hasResume, setHasResume] = useState(false);
  const [hasJobDescription, setHasJobDescription] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleResumeUpload = async (file: File) => {
    setIsUploading(true);
    setError('');
    try {
      const response = await uploadResume(file, sessionId);
      setSessionId(response.sessionId);
      setHasResume(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  const handleJobDescriptionUpload = async (file: File) => {
    setIsUploading(true);
    setError('');
    try {
      await uploadJobDescription(file, sessionId);
      setHasJobDescription(true);
      // Automatically trigger analysis
      await handleAnalyze();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload job description');
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError('');
    try {
      const response = await analyzeResume(sessionId);
      setAnalysisData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (question: string) => {
    setIsChatLoading(true);
    setError('');

    // Add user message
    setChatMessages(prev => [...prev, { role: 'user', content: question }]);

    try {
      const response = await sendChatMessage(sessionId, question);
      // Add assistant response
      setChatMessages(prev => [...prev, { role: 'assistant', content: response.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove the user message if failed
      setChatMessages(prev => prev.slice(0, -1));
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🎯 Resume Screening Tool</h1>
          <p>AI-Powered Resume Analysis with RAG Technology</p>
        </header>

        {error && (
          <div className="card" style={{ background: 'rgba(245, 87, 108, 0.1)', borderColor: '#f5576c', marginBottom: '2rem' }}>
            <p style={{ color: '#f5576c', margin: 0 }}>❌ {error}</p>
          </div>
        )}

        <FileUpload
          onResumeUpload={handleResumeUpload}
          onJobDescriptionUpload={handleJobDescriptionUpload}
          isLoading={isUploading || isAnalyzing}
          hasResume={hasResume}
          hasJobDescription={hasJobDescription}
        />

        {isAnalyzing && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loading" style={{ width: '40px', height: '40px', borderWidth: '4px', margin: '0 auto 1rem' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Analyzing resume and job description...</p>
          </div>
        )}

        {analysisData && !isAnalyzing && (
          <>
            <MatchAnalysis
              matchScore={analysisData.analysis.matchScore}
              strengths={analysisData.analysis.strengths}
              gaps={analysisData.analysis.gaps}
              insights={analysisData.analysis.insights}
              resumeHighlights={analysisData.resumeHighlights}
            />

            <ChatInterface
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
            />
          </>
        )}

        {!hasResume && !isUploading && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', background: 'rgba(102, 126, 234, 0.05)' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>👆</p>
            <h3 style={{ marginBottom: '0.5rem' }}>Get Started</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Upload a resume and job description to see AI-powered matching analysis and ask questions about the candidate
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
