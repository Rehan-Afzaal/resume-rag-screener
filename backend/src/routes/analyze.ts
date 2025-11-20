import { Router, Request, Response } from 'express';
import { sessions } from './upload';
import { resumeAnalyzer } from '../services/resumeAnalyzer';
import { ragService } from '../services/ragService';

const router = Router();

// Analyze resume against job description
router.post('/', async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId || !sessions.has(sessionId)) {
            return res.status(400).json({ error: 'Invalid session ID' });
        }

        const session = sessions.get(sessionId)!;

        if (!session.resumeText) {
            return res.status(400).json({ error: 'No resume uploaded' });
        }

        if (!session.jobDescriptionText) {
            return res.status(400).json({ error: 'No job description uploaded' });
        }

        // Extract structured data
        const resumeData = resumeAnalyzer.extractResumeData(session.resumeText);
        const jdData = resumeAnalyzer.extractJobDescriptionData(session.jobDescriptionText);

        // Calculate match score
        const analysis = resumeAnalyzer.calculateMatchScore(resumeData, jdData);

        // Store in session
        session.resumeData = resumeData;
        session.jobDescriptionData = jdData;
        session.analysis = analysis;

        // Index documents for RAG (run in background)
        Promise.all([
            ragService.indexResume(sessionId, session.resumeText),
            ragService.indexJobDescription(sessionId, session.jobDescriptionText)
        ]).catch(error => {
            console.error('Failed to index documents:', error);
        });

        res.json({
            sessionId,
            analysis: {
                matchScore: analysis.matchScore,
                strengths: analysis.strengths,
                gaps: analysis.gaps,
                insights: analysis.insights
            },
            resumeHighlights: {
                skills: resumeData.skills.slice(0, 10),
                experience: `${resumeData.experienceYears} years`,
                education: resumeData.education[0] || 'Not specified'
            }
        });
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to analyze resume'
        });
    }
});

export { router as analyzeRouter };
