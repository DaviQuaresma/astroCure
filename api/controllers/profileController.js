import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { addProfileToQueue } from '../scheduler/utils/jobQueue.js';
import { PrismaClient } from '@prisma/client';
import logJob from '../scheduler/utils/logger.js';
import readline from 'readline';
import { z } from 'zod';

const prisma = new PrismaClient();

const profileSchema = z.object({
    group: z.number(),
    user_id: z.string().min(1),
    tiktok: z.object({
        email: z.string().email().optional(),
        password: z.string().optional(),
    }).optional(),
    instagram: z.object({
        email: z.string().email().optional(),
        password: z.string().optional(),
    }).optional(),
    youtube: z.object({
        email: z.string().email().optional(),
        password: z.string().optional(),
    }).optional(),
    kwai: z.object({
        email: z.string().email().optional(),
        password: z.string().optional(),
    }).optional(),
});

export const criarProfile = async (req, res) => {
    try {
        const parsed = profileSchema.parse(req.body);

        const profile = await prisma.profile.create({
            data: {
                group: parsed.group,
                user_id: parsed.user_id,
                tiktok: parsed.tiktok || {},
                instagram: parsed.instagram || {},
                youtube: parsed.youtube || {},
                kwai: parsed.kwai || {},
            },
        });

        logJob({
            type: 'controller',
            status: 'ok',
            context: 'Perfil criado com sucesso',
            profile: { user_id: profile.user_id }
        });

        return res.status(201).json({ message: 'Perfil criado com sucesso', profile });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Dados inválidos', issues: error.errors });
        }

        console.error('[ERROR] Falha ao criar perfil:', error.message);
        return res.status(500).json({ error: 'Erro interno ao criar perfil' });
    }
};

export const listarProfiles = async (req, res) => {
    try {
        const profiles = await prisma.profile.findMany();

        logJob({
            type: 'controller',
            status: 'ok',
            context: 'Listagem de perfis realizada',
            count: profiles.length
        });

        res.status(200).json(profiles);
    } catch (error) {
        logJob({
            type: 'controller',
            status: 'erro',
            context: 'Erro ao listar perfis',
            error: error.message,
        });
        res.status(500).json({ error: 'Erro ao listar perfis' });
    }
};

export const startProfile = async (req, res) => {
    const { id } = req.params;

    try {
        const profile = await prisma.profile.findFirst({
            where: { user_id: id },
        });

        if (!profile) {
            return res.status(404).json({ error: `Perfil com user_id ${id} não encontrado` });
        }

        const result = await addProfileToQueue(profile);

        logJob({
            type: 'controller',
            status: 'ok',
            context: `Perfil ${id} adicionado à fila com sucesso`,
            profile: { user_id: id },
        });

        res.status(200).json({ message: `Perfil ${id} adicionado à fila`, result });
    } catch (error) {
        console.error('[startProfile ERROR]', error);
        logJob({
            type: 'controller',
            status: 'erro',
            context: `Erro ao iniciar perfil ${id}`,
            error: error.message,
        });
        res.status(500).json({ error: 'Erro ao iniciar simulação' });
    }
};

export const atualizarProfile = async (req, res) => {
    const { id } = req.params;

    try {
        const parsed = profileSchema.parse(req.body);

        const profile = await prisma.profile.update({
            where: { id: parseInt(id) },
            data: {
                group: parsed.group,
                user_id: parsed.user_id,
                tiktok: parsed.tiktok || {},
                instagram: parsed.instagram || {},
                youtube: parsed.youtube || {},
                kwai: parsed.kwai || {},
            },
        });

        logJob({
            type: 'controller',
            status: 'ok',
            context: `Perfil ${id} atualizado com sucesso`,
            profile: { user_id: profile.user_id }
        });

        return res.status(200).json({ message: 'Perfil atualizado com sucesso', profile });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Dados inválidos', issues: error.errors });
        }

        if (error.code === 'P2025') {
            return res.status(404).json({ error: `Perfil com ID ${id} não encontrado` });
        }

        console.error('[ERROR] Falha ao atualizar perfil:', error.message);
        return res.status(500).json({ error: 'Erro interno ao atualizar perfil' });
    }
};

export const deletarProfile = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.profile.delete({
            where: { id: parseInt(id) },
        });

        logJob({
            type: 'controller',
            status: 'ok',
            context: `Perfil ${id} deletado com sucesso`,
            profile: { user_id: id }
        });

        return res.status(200).json({ message: `Perfil com ID ${id} deletado com sucesso` });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: `Perfil com ID ${id} não encontrado` });
        }

        console.error('[ERROR] Falha ao deletar perfil:', error.message);
        return res.status(500).json({ error: 'Erro interno ao deletar perfil' });
    }
};

export const getLogs = async (req, res) => {
    const { id } = req.params;
    const logsPath = path.join(__dirname, '../scheduler/logs.jsonl');

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

export const getAllLogs = async (req, res) => {
  const { user_id } = req.query;
  const logsPath = path.join(__dirname, '../scheduler/logs.jsonl');

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

        if (!user_id || String(profileId) === String(user_id)) {
          logs.push(entry);
        }
      } catch (err) {
        console.warn('[LOGS] Linha inválida no log JSONL:', err.message);
      }
    }

    res.status(200).json(logs);
  } catch (error) {
    console.error(`[LOGS] Erro ao ler logs:`, error.message);
    res.status(500).json({ error: 'Erro ao ler logs' });
  }
};
