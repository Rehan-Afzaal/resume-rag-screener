import { ResumeData, JobDescriptionData, AnalysisResult } from '../types';

export class ResumeAnalyzer {
    /**
     * Extract structured data from resume text
     */
    extractResumeData(text: string): ResumeData {
        const skills = this.extractSkills(text);
        const experienceYears = this.extractExperienceYears(text);
        const education = this.extractEducation(text);
        const summary = this.extractSummary(text);

        return {
            skills,
            experienceYears,
            education,
            summary,
            rawText: text
        };
    }

    /**
     * Extract job description requirements
     */
    extractJobDescriptionData(text: string): JobDescriptionData {
        const requiredSkills = this.extractRequiredSkills(text);
        const preferredSkills = this.extractPreferredSkills(text);
        const experienceRequired = this.extractRequiredExperience(text);
        const education = this.extractEducation(text);

        return {
            requiredSkills,
            preferredSkills,
            experienceRequired,
            education,
            rawText: text
        };
    }

    /**
     * Calculate match score between resume and job description
     */
    calculateMatchScore(resume: ResumeData, jd: JobDescriptionData): AnalysisResult {
        let totalScore = 0;
        const strengths: string[] = [];
        const gaps: string[] = [];
        const insights: string[] = [];

        // Skills matching (40% weight)
        const { matchedSkills, missingSkills, skillScore } = this.compareSkills(
            resume.skills,
            jd.requiredSkills,
            jd.preferredSkills
        );
        totalScore += skillScore * 0.4;

        if (matchedSkills.length > 0) {
            strengths.push(`Strong match in ${matchedSkills.slice(0, 3).join(', ')}`);
        }
        if (missingSkills.length > 0) {
            gaps.push(`Missing: ${missingSkills.slice(0, 3).join(', ')}`);
        }

        // Experience matching (30% weight)
        const experienceScore = this.compareExperience(
            resume.experienceYears,
            jd.experienceRequired
        );
        totalScore += experienceScore * 0.3;

        if (resume.experienceYears >= 5) {
            strengths.push(`${resume.experienceYears}+ years of experience`);
        } else if (experienceScore < 0.5) {
            gaps.push(`May need more experience (${resume.experienceYears} years)`);
        }

        // Education matching (20% weight)
        const educationScore = this.compareEducation(resume.education, jd.education);
        totalScore += educationScore * 0.2;

        if (resume.education.some(e => e.toLowerCase().includes('bachelor') || e.toLowerCase().includes('master'))) {
            strengths.push(`${resume.education[0]}`);
        }

        // Additional factors (10% weight)
        totalScore += 0.1;

        // Generate insights
        if (totalScore >= 0.7) {
            insights.push('Strong candidate for this position');
        } else if (totalScore >= 0.5) {
            insights.push('Moderate match with some development potential');
        } else {
            insights.push('May require significant training or development');
        }

        const matchScore = Math.round(totalScore * 100);

        return {
            matchScore,
            strengths: strengths.slice(0, 5),
            gaps: gaps.slice(0, 5),
            insights
        };
    }

    private extractSkills(text: string): string[] {
        const skills: string[] = [];
        const skillKeywords = [
            'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Node.js', 'React', 'Angular', 'Vue',
            'Express', 'Django', 'Flask', 'Spring', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB',
            'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'CI/CD', 'Agile', 'Scrum',
            'REST', 'GraphQL', 'Redis', 'Elasticsearch', 'Microservices', 'System Design'
        ];

        const lowerText = text.toLowerCase();
        for (const skill of skillKeywords) {
            if (lowerText.includes(skill.toLowerCase())) {
                skills.push(skill);
            }
        }

        return [...new Set(skills)];
    }

    private extractExperienceYears(text: string): number {
        const yearPattern = /(\d+)\+?\s*years?/i;
        const match = text.match(yearPattern);
        return match ? parseInt(match[1]) : 0;
    }

    private extractEducation(text: string): string[] {
        const education: string[] = [];
        const eduPatterns = [
            /bachelor'?s?\s+(?:of\s+)?(?:science|arts|engineering)?\s+(?:in\s+)?([^\n,]+)/i,
            /master'?s?\s+(?:of\s+)?(?:science|arts|engineering)?\s+(?:in\s+)?([^\n,]+)/i,
            /phd|doctorate/i,
            /B\.?S\.?|M\.?S\.?|Ph\.?D\.?/i
        ];

        for (const pattern of eduPatterns) {
            const match = text.match(pattern);
            if (match) {
                education.push(match[0]);
            }
        }

        return education.length > 0 ? education : ['Not specified'];
    }

    private extractSummary(text: string): string {
        const lines = text.split('\n');
        return lines.slice(0, 3).join(' ').substring(0, 200);
    }

    private extractRequiredSkills(text: string): string[] {
        return this.extractSkills(text);
    }

    private extractPreferredSkills(text: string): string[] {
        const preferredSection = text.match(/preferred[:\s]+([\s\S]*?)(?=required|responsibilities|$)/i);
        if (preferredSection) {
            return this.extractSkills(preferredSection[1]);
        }
        return [];
    }

    private extractRequiredExperience(text: string): string {
        const expMatch = text.match(/(\d+)\+?\s*years?\s+(?:of\s+)?experience/i);
        return expMatch ? expMatch[0] : 'Not specified';
    }

    private compareSkills(
        resumeSkills: string[],
        requiredSkills: string[],
        preferredSkills: string[]
    ): { matchedSkills: string[]; missingSkills: string[]; skillScore: number } {
        const resumeSet = new Set(resumeSkills.map(s => s.toLowerCase()));
        const requiredSet = new Set(requiredSkills.map(s => s.toLowerCase()));
        const preferredSet = new Set(preferredSkills.map(s => s.toLowerCase()));

        const matchedSkills = resumeSkills.filter(s =>
            requiredSet.has(s.toLowerCase()) || preferredSet.has(s.toLowerCase())
        );

        const missingSkills = requiredSkills.filter(s =>
            !resumeSet.has(s.toLowerCase())
        );

        const requiredMatchCount = requiredSkills.filter(s =>
            resumeSet.has(s.toLowerCase())
        ).length;

        const skillScore = requiredSkills.length > 0
            ? requiredMatchCount / requiredSkills.length
            : 0.5;

        return { matchedSkills, missingSkills, skillScore };
    }

    private compareExperience(resumeYears: number, requiredExp: string): number {
        const reqYears = parseInt(requiredExp.match(/(\d+)/)?.[1] || '0');
        if (reqYears === 0) return 0.7;

        if (resumeYears >= reqYears) return 1.0;
        if (resumeYears >= reqYears * 0.7) return 0.7;
        return 0.4;
    }

    private compareEducation(resumeEdu: string[], jdEdu: string[]): number {
        if (jdEdu.length === 0) return 0.8;

        const resumeStr = resumeEdu.join(' ').toLowerCase();
        const hasRelevantDegree = resumeStr.includes('bachelor') ||
            resumeStr.includes('master') ||
            resumeStr.includes('phd');

        return hasRelevantDegree ? 1.0 : 0.5;
    }
}

export const resumeAnalyzer = new ResumeAnalyzer();
