import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import logJob from '../utils/logger.js'
import { simulateUserActions } from './helpers/simulatedActionsMobile.js'
import { parseRemark } from '../utils/parseRemark.js'
import { delay, randomBetween } from '../utils/timer.js'
import { remote } from 'webdriverio'

const connection = new IORedis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    maxRetriesPerRequest: null,
})

console.log('[WORKER] Iniciando...')

async function processProfile(profile) {
    const start = Date.now()
    let driver = null

    try {
        const credentials = parseRemark(profile.observacao || '')

        const caps = {
            platformName: 'Android',
            'appium:deviceName': 'emulator-5554',
            'appium:automationName': 'UiAutomator2',
            'appium:appPackage': 'com.android.settings',
            'appium:appActivity': '.Settings',
            'appium:noReset': true,
            'appium:newCommandTimeout': 300
        }

        driver = await remote({
            protocol: 'http',
            hostname: process.env.APPIUM_HOST || 'localhost',
            port: parseInt(process.env.APPIUM_PORT || '4723', 10),
            path: '/',
            capabilities: caps,
        })

        console.log(`[WORKER] Iniciando simulação no dispositivo: ${profile.user_id}`)
        await simulateUserActions(driver, credentials)

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
        if (driver) await driver.deleteSession()
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
