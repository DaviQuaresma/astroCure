import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import logJob from '../scheduler/utils/logger.js';

const connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
});

const queue = new Queue('profile-jobs', { connection });
const prisma = new PrismaClient();

export const runSchedulerNow = async (req, res) => {
    try {
        const profiles = await prisma.profile.findMany();

        if (!profiles.length) return res.status(204).send();

        const grupos = {};
        for (const perfil of profiles) {
            const grupo = perfil.group || 'default';
            if (!grupos[grupo]) grupos[grupo] = [];
            grupos[grupo].push(perfil);
        }

        for (const grupo in grupos) {
            const groupProfiles = grupos[grupo];

            if (groupProfiles.length === 0) continue;

            const job = await queue.add(
                `group-${grupo}`,
                { profiles: groupProfiles.map((p) => ({ ...p })) },
                { jobId: `group-${grupo}-${Date.now()}` }
            );

            logJob({
                type: 'scheduler',
                jobId: job.id,
                status: 'enqueued',
                total: groupProfiles.length,
                group: grupo,
            });

            console.log(`[SCHEDULER] Job criado manualmente para grupo ${grupo}: ${job.id}`);
        }

        res.status(200).json({ message: 'Jobs agendados manualmente com sucesso' });
    } catch (err) {
        console.error('[SCHEDULER] Erro ao rodar manualmente:', err);
        res.status(500).json({ error: 'Erro ao rodar o scheduler manualmente' });
    }
};
