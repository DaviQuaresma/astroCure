import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'minhaChaveSuperSecreta';

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    jwt.verify(token, secret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }

        req.user = user;
        next();
    });
}
