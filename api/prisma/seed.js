import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('admin12345', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@painel.com' },
        update: {},
        create: {
            email: 'admin@painel.com',
            password,
            name: 'Administrador',
            admin: true,
        },
    });

    console.log('Admin seed criado:', admin);
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });

// This script seeds the database with an admin user if it doesn't already exist.
// It uses Prisma to interact with the database and bcrypt to hash the password.