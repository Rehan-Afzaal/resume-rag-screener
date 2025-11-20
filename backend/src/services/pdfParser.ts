import pdfParse from 'pdf-parse';
import { promises as fs } from 'fs';

export class PDFParser {
    /**
     * Parse PDF file and extract text content
     */
    async parsePDF(filePath: string): Promise<string> {
        try {
            const dataBuffer = await fs.readFile(filePath);
            const pdfData = await pdfParse(dataBuffer);
            return pdfData.text;
        } catch (error) {
            throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Parse TXT file and extract text content
     */
    async parseTXT(filePath: string): Promise<string> {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return content;
        } catch (error) {
            throw new Error(`Failed to parse TXT: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Parse file based on extension
     */
    async parseFile(filePath: string): Promise<string> {
        const extension = filePath.toLowerCase().split('.').pop();

        if (extension === 'pdf') {
            return this.parsePDF(filePath);
        } else if (extension === 'txt') {
            return this.parseTXT(filePath);
        } else {
            throw new Error(`Unsupported file type: ${extension}`);
        }
    }

    /**
     * Clean and normalize text
     */
    cleanText(text: string): string {
        return text
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }
}

export const pdfParser = new PDFParser();
