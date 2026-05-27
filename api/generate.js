import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { Redis } from '@upstash/redis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3456;

app.use(cors());
app.use(express.json());

// Initialize Anthropic (Requires ANTHROPIC_API_KEY in .env)
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Initialize Upstash Redis (Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env)
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

app.post(['/', '/api/generate'], async (req, res) => {
    try {
        const { systemPrompt, chatHistory, maxModules } = req.body;

        if (!systemPrompt || !chatHistory) {
            return res.status(400).json({ error: 'Missing systemPrompt or chatHistory' });
        }

        // Get user IP for rate limiting
        const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
        const redisKey = `archon7_usage_${userIp}`;

        if (userIp !== 'unknown-ip' && process.env.UPSTASH_REDIS_REST_URL) {
            // Check Redis for usage count
            const usageCount = await redis.get(redisKey);
            
            // Allow 1 free trial. If usage is >= 1, block them.
            if (usageCount !== null && parseInt(usageCount.toString()) >= 1) {
                return res.status(429).json({ 
                    error: 'Limit Reached',
                    message: 'You have reached the limit of 1 free masterclass generation.' 
                });
            }

            // Increment usage count
            await redis.incr(redisKey);
        }

        // Generate response with Anthropic
        const msg = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            system: systemPrompt,
            messages: chatHistory,
            max_tokens: 4096,
        });

        const rawText = msg.content[0].text;
        res.json({ text: rawText });
        
    } catch (error) {
        console.error('Error generating response:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Reset rate limit for testing
app.post('/api/reset', async (req, res) => {
    try {
        const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
        const redisKey = `archon7_usage_${userIp}`;
        await redis.del(redisKey);
        res.json({ message: 'Rate limit reset successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Reset failed' });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`ARCHON-7 Secure Backend listening on http://localhost:${PORT}`);
    });
}

export default app;
