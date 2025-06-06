// scheduler/utils/logger.js
import fs from 'fs'
import path from 'path'

const logFile = path.resolve('./scheduler/logs.json')

export function logJob(jobId, data) {
    const entry = {
        timestamp: new Date().toISOString(),
        jobId,
        data,
    }

    let logs = []

    try {
        if (fs.existsSync(logFile)) {
            const content = fs.readFileSync(logFile, 'utf-8')
            logs = JSON.parse(content)
        }
    } catch (err) {
        console.error('Erro ao ler logs:', err)
    }

    logs.push(entry)

    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2))
}
