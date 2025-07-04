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

    // Agrupar perfis por grupo
    const grupos = {}
    for (const perfil of profiles) {
      const grupo = perfil.group || 'default'
      if (!grupos[grupo]) grupos[grupo] = []
      grupos[grupo].push(perfil)
    }

    // Criar um job por grupo
    for (const grupo in grupos) {
      const groupProfiles = grupos[grupo]

      if (groupProfiles.length === 0) continue

      const job = await queue.add(
        `group-${grupo}`,
        {
          profiles: groupProfiles.map(p => ({ ...p }))
        },
        {
          jobId: `group-${grupo}-${Date.now()}`
        }
      )

      logJob({
        type: 'scheduler',
        jobId: job.id,
        status: 'enqueued',
        total: groupProfiles.length,
        group: grupo,
      })

      console.log(`[SCHEDULER] Job criado para grupo ${grupo}: ${job.id}`)
    }

  }, 10000)
}

startScheduler()
