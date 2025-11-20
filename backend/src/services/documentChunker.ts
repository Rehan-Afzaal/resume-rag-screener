import { DocumentChunk } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class DocumentChunker {
    /**
     * Chunk resume into logical sections
     */
    chunkResume(text: string): DocumentChunk[] {
        const chunks: DocumentChunk[] = [];
        const sections = this.identifySections(text);

        Object.entries(sections).forEach(([section, content], index) => {
            if (content.trim()) {
                chunks.push({
                    id: uuidv4(),
                    content: content.trim(),
                    metadata: {
                        section,
                        position: index,
                        documentType: 'resume'
                    }
                });
            }
        });

        return chunks;
    }

    /**
     * Chunk job description into logical sections
     */
    chunkJobDescription(text: string): DocumentChunk[] {
        const chunks: DocumentChunk[] = [];
        const sections = this.identifyJDSections(text);

        Object.entries(sections).forEach(([section, content], index) => {
            if (content.trim()) {
                chunks.push({
                    id: uuidv4(),
                    content: content.trim(),
                    metadata: {
                        section,
                        position: index,
                        documentType: 'job_description'
                    }
                });
            }
        });

        return chunks;
    }

    /**
     * Identify sections in resume using heuristics
     */
    private identifySections(text: string): Record<string, string> {
        const sections: Record<string, string> = {
            summary: '',
            skills: '',
            experience: '',
            education: '',
            other: ''
        };

        const lines = text.split('\n');
        let currentSection = 'summary';

        for (const line of lines) {
            const lowerLine = line.toLowerCase().trim();

            // Detect section headers
            if (lowerLine.match(/^(skills?|technical skills?|core competencies)/)) {
                currentSection = 'skills';
                continue;
            } else if (lowerLine.match(/^(experience|work experience|professional experience|employment)/)) {
                currentSection = 'experience';
                continue;
            } else if (lowerLine.match(/^(education|academic|qualifications)/)) {
                currentSection = 'education';
                continue;
            }

            sections[currentSection] += line + '\n';
        }

        return sections;
    }

    /**
     * Identify sections in job description
     */
    private identifyJDSections(text: string): Record<string, string> {
        const sections: Record<string, string> = {
            overview: '',
            requirements: '',
            responsibilities: '',
            qualifications: '',
            other: ''
        };

        const lines = text.split('\n');
        let currentSection = 'overview';

        for (const line of lines) {
            const lowerLine = line.toLowerCase().trim();

            if (lowerLine.match(/^(requirements?|required skills?|what we need)/)) {
                currentSection = 'requirements';
                continue;
            } else if (lowerLine.match(/^(responsibilities|duties|what you'll do)/)) {
                currentSection = 'responsibilities';
                continue;
            } else if (lowerLine.match(/^(qualifications?|preferred|nice to have)/)) {
                currentSection = 'qualifications';
                continue;
            }

            sections[currentSection] += line + '\n';
        }

        return sections;
    }
}

export const documentChunker = new DocumentChunker();
