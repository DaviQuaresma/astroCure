import { addPostToQueue } from '../scheduler/utils/jobQueue.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let usedVideosPerGroup = {}; // Memória temporária: { [groupId]: Set<path> }

export const uploadVideo = (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado.' });

    return res.json({
        message: 'Vídeo salvo com sucesso!',
        path: req.file.path,
    });
};

export const triggerVideoPost = async (req, res) => {
    try {
        const { path: videoPath, description, profileId } = req.body;

        if (!videoPath || !description || !profileId) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
        }

        await addPostToQueue({ profileId, videoPath, description });

        return res.json({ message: 'Postagem enfileirada com sucesso!' });
    } catch (err) {
        console.error('[ERROR] triggerVideoPost:', err);
        return res.status(500).json({ error: 'Erro ao enfileirar a postagem.' });
    }
};

export const uploadMultipleVideos = (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const savedVideos = req.files.map(file => ({
        filename: file.filename,
        path: file.path,
    }));

    return res.json({
        message: 'Vídeos salvos com sucesso!',
        files: savedVideos,
    });
};

// NOVO: postagem em massa por grupo de perfis usando banco
export const triggerGroupPostMultiple = async (req, res) => {
    try {
        const { videos, description, group } = req.body;

        if (!Array.isArray(videos) || videos.length === 0 || !description || group === undefined) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes ou inválidos.' });
        }

        const profiles = await prisma.profile.findMany({
            where: { group: parseInt(group) },
        });

        if (profiles.length === 0) {
            return res.status(404).json({ error: 'Nenhum perfil encontrado para o grupo informado.' });
        }

        if (!usedVideosPerGroup[group]) usedVideosPerGroup[group] = new Set();

        let remainingVideos = videos.filter(v => !usedVideosPerGroup[group].has(v));
        if (remainingVideos.length === 0) {
            usedVideosPerGroup[group].clear();
            remainingVideos = [...videos];
        }

        let videoIndex = 0;
        const results = [];

        for (const profile of profiles) {
            const selectedVideo = remainingVideos[videoIndex];

            try {
                await addPostToQueue({
                    profileId: profile.user_id,
                    videoPath: selectedVideo,
                    description,
                });

                usedVideosPerGroup[group].add(selectedVideo);
                results.push({ profile: profile.user_id, video: selectedVideo, status: 'ok' });
                videoIndex = (videoIndex + 1) % remainingVideos.length;
            } catch (err) {
                results.push({
                    profile: profile.user_id,
                    video: selectedVideo,
                    status: 'erro',
                    message: err.message,
                });
            }
        }

        return res.json({
            message: `Postagens enfileiradas para grupo ${group}`,
            results,
        });
    } catch (err) {
        console.error('[ERROR] triggerGroupPostMultiple:', err);
        return res.status(500).json({ error: 'Erro ao processar postagens por grupo.' });
    }
};
