import fs from 'fs';
import path from 'path';
import { addProfileToQueue } from '../services/jobQueue.js';
import { generateProfiles } from '../scheduler/jobs/generateProfiles.js';
import logJob from '../scheduler/utils/logger.js';
import readline from 'readline';

// GET /api/profiles
export const listarProfiles = async (req, res) => {
    try {
        const profiles = generateProfiles(); // sem await porque não é async
        res.status(200).json(profiles);
    } catch (error) {
        logJob({
            type: 'controller',
            status: 'erro',
            context: 'Erro ao listar perfis',
            error: error.message,
        })

        res.status(500).json({ error: 'Erro ao listar perfis' });
    }
};

// POST /api/profiles/:id/start
export const startProfile = async (req, res) => {
    const { id } = req.params;
    const profiles = generateProfiles();
    const profile = profiles.find((p) => String(p.id) === String(id));

    if (!profile) {
        return res.status(404).json({ error: `Perfil com ID ${id} não encontrado` });
    }

    try {
        const result = await addProfileToQueue(profile); // envia o objeto inteiro
        res.status(200).json({ message: `Perfil ${id} adicionado à fila`, result });
    } catch (error) {
        logJob({
            type: 'controller',
            status: 'erro',
            context: `Erro ao iniciar perfil ${id}`,
            error: error.message,
        })
        res.status(500).json({ error: 'Erro ao iniciar simulação' });
    }
};

// GET /api/profiles/:id/logs
export const getLogs = async (req, res) => {
    const { id } = req.params;
    const logsPath = path.join(process.cwd(), 'scheduler', 'logs.jsonl');

    try {
        if (!fs.existsSync(logsPath)) {
            return res.status(404).json({ error: 'Arquivo de log não encontrado' });
        }

        const fileStream = fs.createReadStream(logsPath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });

        const logs = [];

        for await (const line of rl) {
            try {
                const entry = JSON.parse(line);
                const profileId = entry?.profile?.user_id || entry?.profile?.data?.user_id;

                if (String(profileId) === String(id)) {
                    logs.push(entry);
                }
            } catch (err) {
                console.warn('[LOGS] Linha inválida no log JSONL:', err.message);
            }
        }

        res.status(200).json(logs);
    } catch (error) {
        console.error(`[LOGS] Erro ao ler logs para perfil ${id}:`, error.message);
        res.status(500).json({ error: 'Erro ao ler logs' });
    }
};
