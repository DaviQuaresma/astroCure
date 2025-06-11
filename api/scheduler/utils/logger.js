import fs from 'fs'
import path from 'path'

const logFile = path.resolve('./scheduler/logs.json')

/**
 * Salva uma entrada de log no arquivo JSON local.
 * @param {Object} entry - Objeto contendo os dados do log.
 * Exemplo:
 * {
 *   jobId: 101,
 *   type: 'worker',
 *   profile: { user_id, email },
 *   status: 'ok' | 'error',
 *   duration: '3.5s',
 *   error: 'Descrição do erro (se houver)'
 * }
 */
export default function logJob(entry) {
    let logs = []

    try {
        if (fs.existsSync(logFile)) {
            const content = fs.readFileSync(logFile, 'utf-8')
            logs = JSON.parse(content)
        }
    } catch (err) {
        console.error('[LOGGER] Erro ao ler arquivo de log:', err.message)
    }

    const newLog = {
        timestamp: new Date().toISOString(),
        ...entry,
    }

    logs.push(newLog)

    try {
        fs.writeFileSync(logFile, JSON.stringify(logs, null, 2))
    } catch (err) {
        console.error('[LOGGER] Erro ao escrever arquivo de log:', err.message)
    }
}
