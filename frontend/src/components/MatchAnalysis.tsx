import React from 'react';
import './MatchAnalysis.css';

interface MatchAnalysisProps {
    matchScore: number;
    strengths: string[];
    gaps: string[];
    insights: string[];
    resumeHighlights?: {
        skills: string[];
        experience: string;
        education: string;
    };
}

export const MatchAnalysis: React.FC<MatchAnalysisProps> = ({
    matchScore,
    strengths,
    gaps,
    insights,
    resumeHighlights
}) => {
    const getScoreColor = (score: number) => {
        if (score >= 75) return '#4facfe';
        if (score >= 50) return '#f5576c';
        return '#f093fb';
    };

    return (
        <div className="analysis-section scale-in">
            {/* Match Score Circle */}
            <div className="card score-card">
                <h2>🎯 Match Analysis</h2>
                <div className="score-container">
                    <div className="score-circle" style={{ '--score': matchScore, '--color': getScoreColor(matchScore) } as any}>
                        <svg viewBox="0 0 200 200">
                            <circle cx="100" cy="100" r="90" className="score-bg" />
                            <circle
                                cx="100"
                                cy="100"
                                r="90"
                                className="score-progress"
                                style={{
                                    stroke: getScoreColor(matchScore),
                                    strokeDasharray: `${matchScore * 5.65} 565`
                                }}
                            />
                        </svg>
                        <div className="score-value">
                            <span className="score-number">{matchScore}%</span>
                            <span className="score-label">Match</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strengths and Gaps */}
            <div className="insights-grid">
                <div className="card strengths-card">
                    <h3>✅ Strengths</h3>
                    <ul className="insights-list">
                        {strengths.map((strength, index) => (
                            <li key={index} className="insight-item strength-item">
                                <span className="bullet">•</span>
                                {strength}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card gaps-card">
                    <h3>❌ Gaps</h3>
                    <ul className="insights-list">
                        {gaps.length > 0 ? (
                            gaps.map((gap, index) => (
                                <li key={index} className="insight-item gap-item">
                                    <span className="bullet">•</span>
                                    {gap}
                                </li>
                            ))
                        ) : (
                            <li className="insight-item">No significant gaps identified</li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Key Insights */}
            <div className="card insights-card">
                <h3>💡 Key Insights</h3>
                <div className="insights-content">
                    {insights.map((insight, index) => (
                        <div key={index} className="insight-block">
                            <span className="insight-icon">→</span>
                            <span>{insight}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resume Highlights */}
            {resumeHighlights && (
                <div className="card highlights-card">
                    <h3>📋 Resume Highlights</h3>
                    <div className="highlights-grid">
                        <div className="highlight-item">
                            <span className="highlight-label">Experience</span>
                            <span className="highlight-value">{resumeHighlights.experience}</span>
                        </div>
                        <div className="highlight-item">
                            <span className="highlight-label">Education</span>
                            <span className="highlight-value">{resumeHighlights.education}</span>
                        </div>
                        <div className="highlight-item skills-highlight">
                            <span className="highlight-label">Top Skills</span>
                            <div className="skills-tags">
                                {resumeHighlights.skills.slice(0, 8).map((skill, index) => (
                                    <span key={index} className="skill-tag">{skill}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
