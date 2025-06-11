import { Worker } from 'bullmq'
import { faker } from '@faker-js/faker'
import IORedis from 'ioredis'
import { chromium } from 'playwright'
import axios from 'axios'
import logJob from "../utils/logger.js"

const connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
})

const ADSPOWER_URL = 'http://host.docker.internal:50325'

console.log('[WORKER] Iniciando...')

const simulateBehavior = async (profile) => {
    let browser

    try {
        // Requisição ao AdsPower para abrir o perfil
        const response = await axios.get(`${ADSPOWER_URL}/api/v1/browser/start?user_id=${profile.user_id}`)
        const { code, data } = response.data

        if (code !== 0 || !data.ws.puppeteer) {
            throw new Error('Falha ao obter WebSocket do AdsPower.')
        }

        const wsEndpoint = data.ws.puppeteer.replace('127.0.0.1', 'host.docker.internal')

        browser = await chromium.connectOverCDP(wsEndpoint)
        const [page] = await browser.contexts()[0].pages()

        console.log(`[WORKER] Navegador conectado via CDP para o perfil ${profile.email}`)

        // Simula navegação
        await page.goto('https://example.com')

        for (let i = 0; i < 5; i++) {
            await page.mouse.wheel(0, 500)
            await delay(randomBetween(1000, 2000))
        }

        console.log(`[WORKER] Perfil: ${profile.email} finalizou simulação.`)

        await logJob({
            type: 'worker',
            profile,
            status: 'ok',
            timestamp: new Date().toISOString(),
        })

        await browser.close()

    } catch (err) {
        console.error('[WORKER] Erro:', err.message)

        await logJob({
            type: 'worker',
            profile,
            status: 'erro',
            error: err.message,
            timestamp: new Date().toISOString(),
        })

        if (browser) await browser.close()
    }
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms))
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

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
