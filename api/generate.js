import Anthropic from '@anthropic-ai/sdk';
import { Redis } from '@upstash/redis';

// Initialize Anthropic (Requires ANTHROPIC_API_KEY in .env)
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Initialize Upstash Redis (Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env)
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

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
            
            // Allow 5 free trials for testing. If usage is >= 5, block them.
            if (usageCount !== null && parseInt(usageCount.toString()) >= 5) {
                return res.status(429).json({ 
                    error: 'Limit Reached',
                    message: 'You have reached the limit of 5 free masterclass generations.' 
                });
            }
        }

        // Generate response with Anthropic
        const msg = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            system: systemPrompt,
            messages: chatHistory,
            max_tokens: 4096,
        });

        const rawText = msg.content[0].text;
        
        // Increment usage count ONLY after a successful generation
        if (userIp !== 'unknown-ip' && process.env.UPSTASH_REDIS_REST_URL) {
            await redis.incr(redisKey);
        }

        return res.status(200).json({ text: rawText });
        
    } catch (error) {
        console.error('Error generating response:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
