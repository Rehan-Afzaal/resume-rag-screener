import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';

export class EmbeddingService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    /**
     * Generate embeddings for a single text
     */
    async generateEmbedding(text: string): Promise<number[]> {
        try {
            const response = await this.openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: text
            });

            return response.data[0].embedding;
        } catch (error) {
            throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Generate embeddings for multiple texts in batch
     */
    async generateEmbeddings(texts: string[]): Promise<number[][]> {
        try {
            // Process in batches of 20 to avoid rate limits
            const batchSize = 20;
            const embeddings: number[][] = [];

            for (let i = 0; i < texts.length; i += batchSize) {
                const batch = texts.slice(i, i + batchSize);
                const response = await this.openai.embeddings.create({
                    model: 'text-embedding-3-small',
                    input: batch
                });

                embeddings.push(...response.data.map(d => d.embedding));
            }

            return embeddings;
        } catch (error) {
            throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export const embeddingService = new EmbeddingService();
