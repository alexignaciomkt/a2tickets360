
import { Hono } from 'hono';
import { db } from '../db';
import { aiChatLogs } from '../db/schema';

const router = new Hono();

// Endpoint para chat de suporte (placeholder para integração Gemini)
router.post('/chat', async (c) => {
    const { message, context, userId, sessionToken } = await c.req.json();

    // Aqui entrará a integração real com Gemini
    const response = `Olá! Sou o assistente da A2 Tickets 360. Recebi sua mensagem: "${message}". No momento estou em modo de manutenção, mas logo estarei 100% online!`;

    await db.insert(aiChatLogs).values({
        userId,
        sessionToken,
        message,
        response,
        context
    });

    return c.json({ response });
});

export default router;
