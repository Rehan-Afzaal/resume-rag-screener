import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { pdfParser } from '../services/pdfParser';
import { Session } from '../types';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.txt'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and TXT files are allowed'));
        }
    }
});

const router = Router();

// In-memory session storage (use database in production)
const sessions = new Map<string, Session>();

// Upload resume
router.post('/resume', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Parse the file
        const text = await pdfParser.parseFile(req.file.path);
        const cleanedText = pdfParser.cleanText(text);

        // Create or update session
        let sessionId = req.body.sessionId;
        if (!sessionId || !sessions.has(sessionId)) {
            sessionId = uuidv4();
            sessions.set(sessionId, {
                id: sessionId,
                chatHistory: [],
                createdAt: new Date()
            });
        }

        const session = sessions.get(sessionId)!;
        session.resumeText = cleanedText;

        res.json({
            sessionId,
            preview: cleanedText.substring(0, 200) + '...',
            message: 'Resume uploaded successfully'
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to upload resume'
        });
    }
});

// Upload job description
router.post('/job-description', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const sessionId = req.body.sessionId;
        if (!sessionId || !sessions.has(sessionId)) {
            return res.status(400).json({ error: 'Invalid session ID. Please upload resume first.' });
        }

        // Parse the file
        const text = await pdfParser.parseFile(req.file.path);
        const cleanedText = pdfParser.cleanText(text);

        const session = sessions.get(sessionId)!;
        session.jobDescriptionText = cleanedText;

        res.json({
            sessionId,
            preview: cleanedText.substring(0, 200) + '...',
            message: 'Job description uploaded successfully'
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to upload job description'
        });
    }
});

// Get session data
router.get('/session/:sessionId', (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId);

    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
        sessionId: session.id,
        hasResume: !!session.resumeText,
        hasJobDescription: !!session.jobDescriptionText,
        hasAnalysis: !!session.analysis
    });
});

export { router as uploadRouter, sessions };
