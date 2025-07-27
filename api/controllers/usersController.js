import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().optional(),
    admin: z.boolean().optional().default(false),
});

export const criarUser = async (req, res) => {
    try {
        const body = userSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({
            where: { email: body.email },
        });

        if (existingUser) {
            return res.status(409).json({ error: 'Usuário já existe' });
        }

        const hashedPassword = await bcrypt.hash(body.password, 10);

        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: hashedPassword,
                name: body.name,
                admin: body.admin,
            },
        });

        return res.status(201).json({ message: 'Usuário criado com sucesso', user });
    } catch (err) {
        console.error(err);
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: err.errors });
        }
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                admin: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return res.status(200).json({
            message: 'Usuários encontrados com sucesso',
            count: users.length,
            data: users,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
};
