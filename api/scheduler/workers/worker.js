import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import logJob from '../utils/logger.js';
import {
    startSession,
    stopSession,
    connectToBrowser,
} from './helpers/adsPowerSession.js';
import { simulateUserActions } from './helpers/simulatedActions.js';
import { queue } from '../utils/jobQueue.js';
import { postVideo } from './helpers/postVideoTiktok.js';
import { postVideoYouTube } from './helpers/postVideoYoutube.js';
import { PrismaClient } from '@prisma/client';
import { postVideoInstagram } from './helpers/postVideoInstagram.js';

const prisma = new PrismaClient();
const connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
});

console.log('[WORKER] Iniciando...');

async function processProfile(profile) {
    const start = Date.now();
    let browser = null;

    const userId = profile?.user_id;
    if (!userId) {
        console.error('[WORKER] Perfil inválido recebido no job:', profile);
        return;
    }

    const dbProfile = await prisma.profile.findUnique({ where: { user_id: userId } });
    if (!dbProfile) {
        console.error(`[WORKER] Perfil ${userId} não encontrado no banco de dados`);
        return;
    }

    const { email, password } = dbProfile.tiktok || {};

    const fullProfile = {
        ...profile,
        email: email || '',
    };

    let tentativas = 0;
    const maxTentativas = 2;

    while (tentativas < maxTentativas) {
        try {
            if (browser) {
                await browser.close().catch(() => { });
                browser = null;
            }

            const ws = await startSession(userId);
            const { page, browser: b } = await connectToBrowser(ws.replace('127.0.0.1', 'host.docker.internal'));
            browser = b;

            console.log(`[WORKER] Conectado via CDP: ${email} (tentativa ${tentativas + 1})`);

            await simulateUserActions(page, { email, password });

            const jobs = await queue.getJobs(['waiting', 'delayed']);
            const postJobs = jobs.filter(j => j.name === 'video-post' && j.data.profileId === userId);

            for (const job of postJobs) {
                const { videoPath, description } = job.data;
                console.log(`[QUEUE] Postando vídeo do job ${job.id} para profile ${userId}`);
                const success = await postVideo(page, { email, password }, videoPath, description);
                if (success) await job.moveToCompleted();
                else await job.moveToFailed({ message: 'Erro no postVideo' });
            }

            await logJob({
                type: 'worker',
                profile: fullProfile,
                status: 'ok',
                duration: Date.now() - start,
            });

            break;

        } catch (err) {
            tentativas++;
            const shouldRestart = err.message === 'restart-session';
            console.warn(`[WORKER] Tentativa ${tentativas} falhou: ${err.message}`);

            if (!shouldRestart || tentativas >= maxTentativas) {
                await logJob({
                    type: 'worker',
                    profile: fullProfile,
                    status: 'erro',
                    duration: Date.now() - start,
                    error: err.message,
                });
                break;
            }

            console.log('[WORKER] Reiniciando sessão...');
        } finally {
            if (browser) {
                await browser.close().catch(() => { });
                browser = null;
            }

            await stopSession(userId);
        }
    }
}

new Worker(
    'profile-jobs',
    async (job) => {
        console.log('[WORKER] Novo job recebido:', job.name);

        if (job.name === 'video-post') {
            const { profileId, videoPath, description } = job.data;

            const dbProfile = await prisma.profile.findUnique({ where: { user_id: profileId } });

            if (!dbProfile) {
                console.error(`[WORKER] Perfil ${profileId} não encontrado`);
                await logJob({
                    type: 'worker',
                    profile: { user_id: profileId },
                    status: 'erro',
                    context: 'Perfil não encontrado para video-post',
                });
                return await job.moveToFailed({ message: 'Perfil não encontrado' });
            }

            const { email = '', password = '' } = dbProfile.tiktok || {};

            let page, browser;
            try {
                const ws = await startSession(profileId);
                ({ page, browser } = await connectToBrowser(ws.replace('127.0.0.1', 'host.docker.internal')));

                const postingStrategies = [
                    // { name: 'TikTok', fn: postVideo },
                    // { name: 'YouTube', fn: postVideoYouTube },
                    { name: 'Instagram', fn: postVideoInstagram },
                ];

                for (const { name, fn } of postingStrategies) {
                    try {
                        console.log(`[WORKER] Postando em ${name}...`);
                        const success = await fn(page, { email, password }, videoPath, description);
                        if (!success) {
                            throw new Error(`Erro no postVideo${name}`);
                        }
                        console.log(`[WORKER] Postagem concluída em ${name}.`);
                    } catch (err) {
                        console.warn(`[WORKER] Falha ao postar em ${name}: ${err.message}`);
                        await logJob({
                            type: 'worker',
                            profile: { user_id: profileId },
                            status: 'erro',
                            context: `Erro na rede ${name}`,
                            error: err.message,
                        });
                    }
                }

                await logJob({
                    type: 'worker',
                    profile: { user_id: profileId },
                    status: 'ok',
                    context: 'Postagem de vídeo concluída com sucesso',
                });

            } catch (err) {
                console.error(`[WORKER] Erro no processamento do job ${job.id}:`, err);
                await job.moveToFailed({ message: err.message || 'Erro inesperado no worker' });

                await logJob({
                    type: 'worker',
                    profile: { user_id: profileId },
                    status: 'erro',
                    context: 'Erro no video-post',
                    error: err.message,
                });
            } finally {
                if (browser) await browser.close().catch(() => { });
                await stopSession(profileId);
            }

            return;
        }

        try {
            const profiles = job.data.profiles || [];
            console.log('[DEBUG] Perfis recebidos no job:', profiles.map(p => p?.user_id || 'undefined'));

            for (const profile of profiles) {
                await processProfile(profile);
            }

            await job.moveToCompleted();
        } catch (err) {
            console.error('[WORKER] Erro no job orgânico:', err);
            await job.moveToFailed({ message: err.message || 'Erro no job orgânico' });

            await logJob({
                type: 'worker',
                status: 'erro',
                context: 'Erro no job orgânico',
                error: err.message,
            });
        }
    },
    {
        connection,
        concurrency: 1,
    }
);
