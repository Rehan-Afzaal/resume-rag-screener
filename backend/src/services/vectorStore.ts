import { DocumentChunk } from '../types';

interface StoredChunk {
    chunk: DocumentChunk;
    embedding: number[];
}

/**
 * Simple in-memory vector store for demo purposes
 * In production, you'd use ChromaDB, Pinecone, or similar
 */
export class VectorStore {
    private store: Map<string, StoredChunk[]> = new Map();

    /**
     * Store document chunks with embeddings
     */
    async storeChunks(
        sessionId: string,
        chunks: DocumentChunk[],
        embeddings: number[][]
    ): Promise<void> {
        try {
            const existing = this.store.get(sessionId) || [];

            const newChunks: StoredChunk[] = chunks.map((chunk, index) => ({
                chunk,
                embedding: embeddings[index]
            }));

            this.store.set(sessionId, [...existing, ...newChunks]);
        } catch (error) {
            throw new Error(`Failed to store chunks: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Query for similar chunks using cosine similarity
     */
    async querySimilar(
        sessionId: string,
        queryEmbedding: number[],
        topK: number = 5
    ): Promise<DocumentChunk[]> {
        try {
            const chunks = this.store.get(sessionId) || [];

            if (chunks.length === 0) {
                return [];
            }

            // Calculate cosine similarity for each chunk
            const similarities = chunks.map(stored => ({
                chunk: stored.chunk,
                similarity: this.cosineSimilarity(queryEmbedding, stored.embedding)
            }));

            // Sort by similarity (highest first) and take top K
            const topChunks = similarities
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, topK)
                .map(item => item.chunk);

            return topChunks;
        } catch (error) {
            throw new Error(`Failed to query: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) {
            throw new Error('Vectors must have the same length');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        if (denominator === 0) {
            return 0;
        }

        return dotProduct / denominator;
    }

    /**
     * Delete a session's data
     */
    async deleteCollection(sessionId: string): Promise<void> {
        this.store.delete(sessionId);
    }

    /**
     * Clear all data (useful for testing)
     */
    clear(): void {
        this.store.clear();
    }
}

export const vectorStore = new VectorStore();
