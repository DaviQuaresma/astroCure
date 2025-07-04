import { Queue } from 'bullmq'
import { generateProfiles } from './jobs/generateProfiles.js'
import IORedis from 'ioredis'
import logJob from './utils/logger.js'

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
})

const queue = new Queue('profile-jobs', { connection })

async function startScheduler() {
  console.log('[SCHEDULER] Iniciando...')

  setInterval(async () => {
    const profiles = generateProfiles()

    if (!profiles.length) {
      console.log('[SCHEDULER] Nenhum perfil encontrado, pulando...')
      return
    }

    const data = profiles.map((p) => p.data)
    const job = await queue.add('generate-profiles', { profiles: data })

    logJob({
      type: 'scheduler',
      jobId: job.id,
      status: 'enqueued',
      total: data.length,
    })

    console.log(`[SCHEDULER] Novo job enviado: ${job.id}`)
  }, 10000)
}

startScheduler()
