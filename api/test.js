import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.user.findMany();
    console.log('✅ Conexão com o banco funcionando');
  } catch (err) {
    console.error('❌ Erro ao conectar com o banco:', err);
  }
}

testConnection();
