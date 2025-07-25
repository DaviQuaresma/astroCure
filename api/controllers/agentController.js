import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Cria ou atualiza um agente
export const registerOrUpdateAgent = async (req, res) => {
    const { name, token } = req.body;

    if (!name || !token) return res.status(400).json({ error: 'Nome e token são obrigatórios' });

    try {
        const agent = await prisma.agent.upsert({
            where: { token },
            update: { name, status: 'online', lastPing: new Date() },
            create: { name, token, status: 'online' }
        });

        return res.json({ success: true, agent });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao registrar ou atualizar o agente' });
    }
};

// Endpoint para ping
export const agentPing = async (req, res) => {
    const token = req.headers['x-agent-token'];

    if (!token) return res.status(400).json({ error: 'Token não informado' });

    try {
        const agent = await prisma.agent.update({
            where: { token },
            data: { lastPing: new Date(), status: 'online' }
        });

        return res.json({ success: true, agent });
    } catch (err) {
        return res.status(404).json({ error: 'Agente não encontrado' });
    }
};
