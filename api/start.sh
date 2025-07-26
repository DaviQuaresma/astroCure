#!/bin/sh

echo "Aguardando banco de dados em ${PG_HOST}:${PG_PORT}..."

# Espera o banco subir (simples)
until nc -z $PG_HOST $PG_PORT; do
  echo "Aguardando PostgreSQL subir..."
  sleep 2
done

echo "Banco disponível! Executando Prisma Migrate..."
npx prisma migrate deploy

echo "Iniciando aplicação..."
node index.js
