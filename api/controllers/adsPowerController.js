import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const endpointId = Number(id);

    if (!Number.isInteger(endpointId)) {
        return res.status(400).json({ message: "id inválido" });
    }

    try {
        const exists = await prisma.adsPower.findUnique({
            where: { id: endpointId },
            select: { id: true, endPoint: true },
        });
        if (!exists) {
            return res.status(404).json({ message: "Endpoint não encontrado" });
        }

        const result = await prisma.$transaction(async (tx) => {
            const unset = await tx.adsPower.updateMany({
                where: { active: true },
                data: { active: false },
            });

            const updated = await tx.adsPower.update({
                where: { id: endpointId },
                data: { active: true },
            });

            return { unsetCount: unset.count, updated };
        });

        return res.status(200).json({
            id: result.updated.id,
            endPoint: result.updated.endPoint,
            active: result.updated.active,
        });
    } catch (err) {
        if (err?.code === "P2025") {
            return res.status(404).json({ message: "Endpoint não encontrado" });
        }
        console.error("Erro ao ativar endpoint AdsPower:", err);
        return res.status(500).json({ message: "Internal server error" });
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