import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import logJob from '../utils/logger.js'
import {
    startSession,
    stopSession,
    connectToBrowser,
} from './helpers/adsPowerSession.js'
import { simulateUserActions } from './helpers/simulatedActions.js'
import { generateProfiles } from '../jobs/generateProfiles.js'
import { queue } from '../../services/jobQueue.js'
import { postVideo } from './helpers/postVideoActions.js'

const connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
})

console.log('[WORKER] Iniciando...')

async function processProfile(profile) {
    const start = Date.now()
    let browser = null

    const userId = profile?.user_id || profile?.data?.user_id
    if (!userId) {
        console.error('[WORKER] Perfil inválido recebido no job:', profile)
        return
    }

    const allProfiles = generateProfiles()
    const match = allProfiles.find(p => p.data?.user_id === userId)
    if (!match) {
        console.error(`[WORKER] Perfil ${userId} não encontrado no generateProfiles()`)
        return
    }

    const { email, password } = match.data?.tiktok || {}
    if (!email || !password) {
        console.error(`[WORKER] Credenciais ausentes para o perfil ${userId}`)
        return
    }

    const fullProfile = {
        ...profile,
        email,
    }

    let tentativas = 0
    const maxTentativas = 2

    while (tentativas < maxTentativas) {
        try {
            if (browser) {
                await browser.close().catch(() => { })
                browser = null
            }

            const ws = await startSession(userId)
            const { page, browser: b } = await connectToBrowser(ws.replace('127.0.0.1', 'host.docker.internal'))
            browser = b

            console.log(`[WORKER] Conectado via CDP: ${email} (tentativa ${tentativas + 1})`)

            // Executa simulação
            await simulateUserActions(page, { email, password })

            // Processa fila de postagens pendentes
            const jobs = await queue.getJobs(['waiting', 'delayed'])
            const postJobs = jobs.filter(j => j.name === 'video-post' && j.data.profileId === userId)

            for (const job of postJobs) {
                const { videoPath, description } = job.data
                console.log(`[QUEUE] Postando vídeo do job ${job.id} para profile ${userId}`)
                const success = await postVideo(page, { email, password }, videoPath, description)
                if (success) await job.moveToCompleted()
                else await job.moveToFailed({ message: 'Erro no postVideo' })
            }

            await logJob({
                type: 'worker',
                profile: fullProfile,
                status: 'ok',
                duration: Date.now() - start,
            })

            break

        } catch (err) {
            tentativas++
            const shouldRestart = err.message === 'restart-session'
            console.warn(`[WORKER] Tentativa ${tentativas} falhou: ${err.message}`)

            if (!shouldRestart || tentativas >= maxTentativas) {
                await logJob({
                    type: 'worker',
                    profile: fullProfile,
                    status: 'erro',
                    duration: Date.now() - start,
                    error: err.message,
                })
                break
            }

            console.log('[WORKER] Reiniciando sessão...')
        } finally {
            if (browser) {
                await browser.close().catch(() => { })
                browser = null
            }

            await stopSession(userId)
        }
    }
}

new Worker(
    'profile-jobs',
    async (job) => {
        console.log('[WORKER] Novo job recebido:', job.name);

        if (job.name === 'video-post') {
            const { profileId, videoPath, description } = job.data;
            const allProfiles = generateProfiles();
            const match = allProfiles.find(p => p.data?.user_id === profileId);

            if (!match) {
                console.error(`[WORKER] Perfil ${profileId} não encontrado`);
                return await job.moveToFailed({ message: 'Perfil não encontrado' });
            }

            const { email, password } = match.data?.tiktok || {};
            if (!email || !password) {
                console.error(`[WORKER] Credenciais ausentes para o perfil ${profileId}`);
                return await job.moveToFailed({ message: 'Credenciais ausentes' });
            }

            let page, browser;
            try {
                const ws = await startSession(profileId);
                ({ page, browser } = await connectToBrowser(ws.replace('127.0.0.1', 'host.docker.internal')));

                const success = await postVideo(page, { email, password }, videoPath, description);

                if (!success) {
                    throw new Error('Erro no postVideo');
                }

            } catch (err) {
                console.error(`[WORKER] Erro no processamento do job ${job.id}:`, err);
                await job.moveToFailed({ message: err.message || 'Erro inesperado no worker' });

            } finally {
                if (browser) await browser.close().catch(() => { });
                await stopSession(profileId);
            }

            return;
        }

        // fallback para jobs orgânicos
        try {
            const profiles = job.data.profiles || [];
            console.log('[DEBUG] Perfis recebidos no job:', profiles.map(p => p?.user_id || p?.data?.user_id || 'undefined'));

            for (const profile of profiles) {
                await processProfile(profile);
            }

            await job.moveToCompleted();
        } catch (err) {
            console.error('[WORKER] Erro no job orgânico:', err);
            await job.moveToFailed({ message: err.message || 'Erro no job orgânico' });
        }
    },
    {
        connection,
        concurrency: 1,
    }
);
