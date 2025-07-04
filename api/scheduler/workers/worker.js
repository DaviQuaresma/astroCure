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

    const auth = match.data?.tiktok || {}
    const email = auth.email
    const password = auth.password

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

            await simulateUserActions(page, {
                email,
                password
            })

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
            console.warn(`[WORKER] Tentativa ${tentativas} falhou. Motivo: ${err.message}`)

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

            console.log('[WORKER] Reiniciando sessão e navegador para tentar novamente...')
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
        console.log('[WORKER] Novo job recebido')
        const profiles = job.data.profiles || []

        console.log('[DEBUG] Perfis recebidos no job:', profiles.map(p => p?.user_id || p?.data?.user_id || 'undefined'))

        for (const profile of profiles) {
            await processProfile(profile)
        }
    },
    {
        connection,
        concurrency: 1,
    }
)
