import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let activeAdsPowerEndpoint = null;

export async function addAdsPowerEndpoint(req, res) {
    const { endPoint } = req.body;

    try {
        if (!endPoint || typeof endPoint !== 'string' || !endPoint.startsWith('http')) {
            return res.status(400).json({ error: 'EndPoint inválido' });
        }

        const existingEndpoint = await prisma.adsPower.findUnique({
            where: { endPoint: endPoint },
        });

        if (existingEndpoint) {
            return res.status(409).json({ error: 'Endpoint já existe' });
        }

        const newEndpoint = await prisma.adsPower.create({
            data: {
                endPoint,
            },
        });

        return res.status(201).json({ message: 'Endpoint do AdsPower criado com sucesso', newEndpoint });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno ao adicionar o endpoint' });
    }
}

export async function setActiveAdsPowerEndpoint(req, res) {
    const { id } = req.params;

    try {
        const activeEndpoint = await prisma.adsPower.update({
            where: { id: parseInt(id) },
            data: { active: true}
        });

        if (!activeEndpoint) {
            return res.status(404).json({ error: 'Nenhum endpoint ativo encontrado' });
        }

        activeAdsPowerEndpoint = activeEndpoint.endPoint;

        return res.json(activeEndpoint);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno ao buscar o endpoint' });
    }
}

export async function allAdsPowerEndpoint(req, res) {
    try {
        const allEndpoints = await prisma.adsPower.findMany({});

        if (allEndpoints.length === 0) {
            return res.status(404).json({ error: 'Nenhum endpoint ativo encontrado' });
        }

        return res.json(allEndpoints);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno ao buscar os endpoints' });
    }
}