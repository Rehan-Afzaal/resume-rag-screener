import { Router, Request, Response } from 'express';
import { sessions } from './upload';
import { ragService } from '../services/ragService';

const router = Router();

// Chat with RAG
router.post('/', async (req: Request, res: Response) => {
    try {
        const { sessionId, question } = req.body;

        if (!sessionId || !sessions.has(sessionId)) {
            return res.status(400).json({ error: 'Invalid session ID' });
        }

        if (!question || typeof question !== 'string' || question.trim() === '') {
            return res.status(400).json({ error: 'Question is required' });
        }

        const session = sessions.get(sessionId)!;

        if (!session.resumeText) {
            return res.status(400).json({ error: 'No resume uploaded for this session' });
        }

        // Add user message to history
        session.chatHistory.push({
            role: 'user',
            content: question,
            timestamp: new Date()
        });

        // Get answer using RAG
        const response = await ragService.answerQuestion(
            sessionId,
            question,
            session.chatHistory
        );

        // Add assistant response to history
        session.chatHistory.push({
            role: 'assistant',
            content: response.answer,
            timestamp: new Date()
        });

        res.json({
            answer: response.answer,
            sources: response.sources,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to process question'
        });
    }
});

// Get chat history
router.get('/history/:sessionId', (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId);

    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
        chatHistory: session.chatHistory
    });
});

export { router as chatRouter };
