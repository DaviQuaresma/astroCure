import { Worker } from 'bullmq'
import { faker } from '@faker-js/faker'
import IORedis from 'ioredis'
import { chromium } from 'playwright'
import logJob from "../utils/logger.js"

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null, //
})

console.log('[WORKER] Iniciando...')

const simulateBehavior = async (profile) => {
    const browser = await chromium.launch({ headless: false }) // pode usar true depois
    const page = await browser.newPage()

    try {
        // Acessa um site de simulação (pode trocar por outro real)
        await page.goto('https://example.com')

        // Simula scroll
        for (let i = 0; i < 5; i++) {
            await page.mouse.wheel(0, 500)
            await delay(randomBetween(1000, 2000))
        }

        // Simula clique em botão (se existir)
        // await page.click('button#like') // opcional, depende da página

        // Simula ação: print no console
        console.log(`[WORKER] Perfil: ${profile.email} finalizou simulação.`)

        await logJob({
            type: 'worker',
            profile,
            status: 'ok',
            timestamp: new Date().toISOString(),
        })

        await browser.close()
    } catch (err) {
        console.error('[WORKER] Erro:', err)

        await logJob({
            type: 'worker',
            profile,
            status: 'erro',
            error: err.message,
            timestamp: new Date().toISOString(),
        })

        await browser.close()
    }
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms))
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

// Worker escutando jobs
new Worker(
    'profile-jobs',
    async (job) => {
        console.log('[WORKER] Novo job recebido')
        const profiles = job.data.profiles || []
        for (const profile of profiles) {
            await simulateBehavior(profile)
        }
    },
    { connection }
)
