import fs from 'fs'
import path from 'path'

const logsDir = path.resolve('./scheduler')
const logFile = path.join(logsDir, 'logs.jsonl') // formato .jsonl: um JSON por linha (escalável)

/**
 * Salva uma entrada de log no formato JSONL (1 linha por log)
 * @param {Object} entry - Exemplo:
 * {
 *   jobId: 101,
 *   type: 'worker',
 *   profile: { user_id, email },
 *   status: 'ok' | 'error',
 *   duration: 3500,
 *   error: 'Descrição do erro (se houver)'
 * }
 */
export default function logJob(entry) {
    try {
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true })
        }

        const logLine = JSON.stringify({
            timestamp: new Date().toISOString(),
            ...entry
        })

        fs.appendFileSync(logFile, logLine + '\n')
    } catch (err) {
        console.error('[LOGGER] Falha ao registrar log:', err.message)
    }
}
