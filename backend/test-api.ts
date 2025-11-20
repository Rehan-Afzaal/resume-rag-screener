// Simple test to verify OpenAI API key works
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Testing OpenAI API...');
console.log('API Key present:', !!process.env.OPENAI_API_KEY);
console.log('API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function test() {
    try {
        // Test 1: Simple completion
        console.log('\n✓ Testing chat completion...');
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Say hello!' }],
            max_tokens: 10
        });
        console.log('✓ Chat completion works!');
        console.log('Response:', completion.choices[0].message.content);

        // Test 2: Embeddings
        console.log('\n✓ Testing embeddings...');
        const embedding = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: 'Test text'
        });
        console.log('✓ Embeddings work!');
        console.log('Embedding dimensions:', embedding.data[0].embedding.length);

        console.log('\n✅ All tests passed! Your API key is working correctly.\n');
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
        }
    }
}

test();
