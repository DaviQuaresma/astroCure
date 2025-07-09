import { addPostToQueue } from '../services/jobQueue.js';

export const uploadVideo = (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado.' });

    const videoPath = req.file.path;
    return res.json({ message: 'Vídeo salvo com sucesso!', path: videoPath });
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
        console.error('[ERROR] Falha ao enfileirar vídeo:', err);
        return res.status(500).json({ error: 'Erro ao enfileirar a postagem.' });
    }
};
