import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || 'sua_chave_secreta';

export async function login(req, res) {
    const { username, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email: username },
        });

        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, admin: user.admin },
            secret,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                admin: user.admin,
            },
        });
    } catch (err) {
        console.error('Erro no login:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
