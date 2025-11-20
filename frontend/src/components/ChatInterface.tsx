import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (message: string) => Promise<void>;
    isLoading: boolean;
}

const SUGGESTED_QUESTIONS = [
    "Does this candidate have a degree from a state university?",
    "Can they handle backend architecture?",
    "What's their experience with cloud technologies?",
    "Do they have team leadership experience?"
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        // Call API
        try {
            await onSendMessage(userMessage);
        } catch (error) {
            // Error handling is done in parent component
        }
    };

    const handleSuggestedQuestion = (question: string) => {
        setInput(question);
    };

    return (
        <div className="chat-section card fade-in-up">
            <h2>💬 Ask Questions About This Candidate</h2>

            {messages.length === 0 && (
                <div className="suggested-questions">
                    <p className="suggestions-label">Try asking:</p>
                    <div className="suggestions-grid">
                        {SUGGESTED_QUESTIONS.map((question, index) => (
                            <button
                                key={index}
                                className="suggestion-btn"
                                onClick={() => handleSuggestedQuestion(question)}
                                disabled={isLoading}
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="messages-container">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                        <div className="message-avatar">
                            {message.role === 'user' ? '👤' : '🤖'}
                        </div>
                        <div className="message-content">
                            <div className="message-text">{message.content}</div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message assistant">
                        <div className="message-avatar">🤖</div>
                        <div className="message-content">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="chat-input-form">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question..."
                    className="chat-input"
                    disabled={isLoading}
                />
                <button type="submit" className="btn-primary send-btn" disabled={isLoading || !input.trim()}>
                    {isLoading ? <div className="loading" /> : '📤'}
                </button>
            </form>
        </div>
    );
};
