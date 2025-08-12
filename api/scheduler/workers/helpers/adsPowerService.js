import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getActiveAdsPowerEndpoint() {
  const row = await prisma.adsPower.findFirst({
    where: { active: true },
    select: { endPoint: true },
  });
  if (!row) throw new Error('Nenhum endpoint ativo encontrado');
  return row.endPoint;
}
