import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import logJob from '../utils/logger.js'
import {
    startSession,
    stopSession,
    connectToBrowser
} from './helpers/adsPowerSession.js'
import { simulateUserActions } from './helpers/simulatedActions.js'
import { delay, randomBetween } from './utils/timer.js'

const connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
})

console.log('[WORKER] Iniciando...')

async function processProfile(profile) {
    const start = Date.now()
    let browser = null

    try {
        const ws = await startSession(profile.user_id)
        const { page, browser: b } = await connectToBrowser(ws.replace('127.0.0.1', 'host.docker.internal'))
        browser = b

        console.log(`[WORKER] Conectado via CDP: ${profile.email}`)

        await simulateUserActions(page)

        await logJob({
            type: 'worker',
            profile,
            status: 'ok',
            duration: Date.now() - start,
        })
    } catch (err) {
        console.error('[WORKER] Erro:', err.message)

        await logJob({
            type: 'worker',
            profile,
            status: 'erro',
            duration: Date.now() - start,
            error: err.message,
        })
    } finally {
        if (browser) await browser.close()
        await stopSession(profile.user_id)
    }
}

new Worker(
    'profile-jobs',
    async (job) => {
        console.log('[WORKER] Novo job recebido')
        const profiles = job.data.profiles || []

        for (const profile of profiles) {
            await processProfile(profile)
        }
    },
    { connection }
)
