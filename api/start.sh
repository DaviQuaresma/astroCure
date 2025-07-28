#!/bin/sh

echo "Aguardando o banco iniciar..."
# Espera até o banco estar disponível
until nc -z postgres 5432; do
  sleep 1
done

echo "Banco disponível, rodando migrations e seed..."
npx prisma migrate deploy
npm run seed

echo "Iniciando servidor..."
npm run dev
