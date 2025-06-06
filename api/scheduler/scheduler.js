// scheduler/scheduler.js
import { Queue } from 'bullmq'
import { generateProfiles } from './jobs/generateProfiles.js'
import { logJob } from './utils/logger.js'
import IORedis from 'ioredis'

const connection = new IORedis({
  host: 'redis',
  port: 6379,
})

const queue = new Queue('profile-jobs', { connection })

async function startScheduler() {
  console.log('[SCHEDULER] Iniciando...')

  // Simula a criação de lotes a cada 10 segundos
  setInterval(async () => {
    const profiles = generateProfiles(5) // 5 perfis mock por vez

    const job = await queue.add('generate-profiles', { profiles })

    logJob(job.id, profiles)

    console.log(`[SCHEDULER] Novo job enviado: ${job.id}`)
  }, 10000)
}

startScheduler()
