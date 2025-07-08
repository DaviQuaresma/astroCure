import { Queue } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
})

const queue = new Queue('profile-jobs', { connection })

export const addProfileToQueue = async (profiles) => {
    const payload = Array.isArray(profiles) ? profiles : [profiles]

    return await queue.add(
        `manual-${Date.now()}`,
        { profiles: payload },
        {
            attempts: 3,
            removeOnComplete: true,
            removeOnFail: false,
        }
    )
}
