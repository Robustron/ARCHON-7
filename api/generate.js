import Anthropic from '@anthropic-ai/sdk';
import { Redis } from '@upstash/redis';

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

        // Initialize API clients inside the handler to ensure process.env is populated by Vercel
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            console.error('ANTHROPIC_API_KEY is missing in environment variables.');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const anthropic = new Anthropic({ apiKey });
        
        let redis = null;
        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            redis = new Redis({
                url: process.env.UPSTASH_REDIS_REST_URL,
                token: process.env.UPSTASH_REDIS_REST_TOKEN,
            });
        }

        // Get user IP for rate limiting
        const forwardedFor = req.headers['x-forwarded-for'];
        const userIp = forwardedFor ? forwardedFor.split(',')[0] : 'unknown-ip';
        const redisKey = `archon7_usage_${userIp}`;

        if (userIp !== 'unknown-ip' && redis) {
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
        if (userIp !== 'unknown-ip' && redis) {
            await redis.incr(redisKey);
        }

        return res.status(200).json({ text: rawText });
        
    } catch (error) {
        console.error('Error generating response:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

