import OpenAI from 'openai';
import { embeddingService } from './embeddingService';
import { vectorStore } from './vectorStore';
import { documentChunker } from './documentChunker';
import { ChatMessage, ChatResponse } from '../types';

export class RAGService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    /**
     * Process and index resume document for RAG
     */
    async indexResume(sessionId: string, resumeText: string): Promise<void> {
        // Chunk the resume
        const chunks = documentChunker.chunkResume(resumeText);

        // Generate embeddings for all chunks
        const embeddings = await embeddingService.generateEmbeddings(
            chunks.map(c => c.content)
        );

        // Store in vector database
        await vectorStore.storeChunks(sessionId, chunks, embeddings);
    }

    /**
     * Process and index job description for RAG
     */
    async indexJobDescription(sessionId: string, jdText: string): Promise<void> {
        // Chunk the job description
        const chunks = documentChunker.chunkJobDescription(jdText);

        // Generate embeddings for all chunks
        const embeddings = await embeddingService.generateEmbeddings(
            chunks.map(c => c.content)
        );

        // Store in vector database
        await vectorStore.storeChunks(sessionId, chunks, embeddings);
    }

    /**
     * Answer a question using RAG pipeline
     */
    async answerQuestion(
        sessionId: string,
        question: string,
        chatHistory: ChatMessage[] = []
    ): Promise<ChatResponse> {
        try {
            // Generate embedding for the question
            const queryEmbedding = await embeddingService.generateEmbedding(question);

            // Retrieve relevant chunks
            const relevantChunks = await vectorStore.querySimilar(
                sessionId,
                queryEmbedding,
                5
            );

            // Build context from retrieved chunks
            const context = relevantChunks
                .map(chunk => `[${chunk.metadata.section}]\n${chunk.content}`)
                .join('\n\n---\n\n');

            // Prepare messages for LLM
            const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
                {
                    role: 'system',
                    content: `You are an AI assistant helping recruiters evaluate candidates. 
You have access to the candidate's resume through the provided context.
Answer questions accurately based ONLY on the information in the context.
If the information is not in the context, say "I don't have that information in the resume."
Be concise and specific, citing relevant details from the resume.`
                }
            ];

            // Add chat history (last 4 messages for context)
            const recentHistory = chatHistory.slice(-4);
            for (const msg of recentHistory) {
                messages.push({
                    role: msg.role,
                    content: msg.content
                });
            }

            // Add current question with context
            messages.push({
                role: 'user',
                content: `Context from resume:\n${context}\n\nQuestion: ${question}`
            });

            // Get response from LLM using Chat Completions API
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages,
                temperature: 0.3,
                max_tokens: 500
            });

            const answer = completion.choices[0].message.content || 'No response generated.';

            return {
                answer,
                sources: relevantChunks.map(c => c.metadata.section)
            };
        } catch (error) {
            throw new Error(`Failed to answer question: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export const ragService = new RAGService();
