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
     * Answer a question using RAG pipeline with strong anti-hallucination measures
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

            // Prepare messages for LLM with STRONG anti-hallucination prompt
            const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
                {
                    role: 'system',
                    content: `You are a resume screening assistant. You MUST follow these rules strictly:

CRITICAL RULES:
1. ONLY use information that is EXPLICITLY stated in the "Context from resume" provided below
2. If information is NOT in the context, you MUST say: "I don't have that information in the resume"
3. DO NOT make assumptions or infer information not explicitly stated
4. DO NOT use your general knowledge about skills or technologies
5. If asked about a skill/experience NOT mentioned in the context, clearly state it's NOT in the resume
6. Be factual and cite specific sections from the resume when answering

VERIFICATION PROCESS:
Before answering, verify:
- Is this information explicitly stated in the context?
- Can I quote the exact text from the resume?
- If NO to either: respond with "I don't have that information in the resume" or "This is not mentioned in the resume"

Answer concisely and accurately based ONLY on the provided context.`
                }
            ];

            // Do NOT include chat history to avoid context confusion
            // Each question should be answered fresh from the resume context only

            // Add current question with context - make it very clear what the context is
            messages.push({
                role: 'user',
                content: `Context from resume:
---
${context}
---

Question: ${question}

IMPORTANT: Answer ONLY using information explicitly stated in the context above. If the information is not in the context, say "I don't have that information in the resume."`
            });

            // Get response from LLM using Chat Completions API
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages,
                temperature: 0.0,  // Set to 0 for maximum factual accuracy, no creativity
                max_tokens: 500,
                presence_penalty: 0.0,  // No penalty for repetition
                frequency_penalty: 0.0  // Focus on accuracy over variety
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
