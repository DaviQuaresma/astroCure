----- Docker:

# Força o shutdown do WSL (resolve travamentos do Docker Desktop)
wsl --shutdown

# Verifica se o Docker está rodando
docker info

# Lista os containers ativos
docker ps

# Lista todos os containers (ativos e parados)
docker ps -a

# Inicia os containers em segundo plano
docker compose up -d

# Exibe os logs de um container
docker logs <nome_ou_id_do_container>

# Subir e reconstruir os containers (mantém cache)
docker compose up -d --build

# Forçar rebuild total sem cache
docker compose build --no-cache

# Comando pra rodar caso tenha mudado o arquivo e queira testar sem compilar:
docker-compose restart worker

# Se precisar rebuildar com tudo parado
docker compose down
docker compose up -d --build

# Limpa tudo que não está mais sendo usado (⚠️ cuidado!)
docker system prune -af

# Remove volumes e containers órfãos
docker compose down --volumes --remove-orphans

# Ver variável de ambiente de um container
docker compose exec <serviço> env | grep VARIAVEL

# Entrar no container para testar
docker exec -it <nome_do_container> bash

# Dentro do container, conectar no banco PostgreSQL
psql -U <usuario> -d <nome_do_banco>

# Ver containers usando rede específica
docker ps -a --filter network=<nome_da_rede>

# Remover todos os containers forçando
docker rm -f $(docker ps -aq)

# Reset geral dentro da VPS
docker compose down -v
docker compose build --no-cache
docker compose up -d


----- NGINX:
# Editar config default
sudo nano /etc/nginx/sites-available/default

# Exemplo de bloco server para proxy reverso:
server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3002/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Testa config
sudo nginx -t

# Reinicia o serviço
sudo systemctl restart nginx



------ Redis:

# Entra no cliente Redis (se tiver instalado)
redis-cli

# Lista todas as chaves (evite usar em produção!)
KEYS *

# Ver o conteúdo de uma chave (string)
GET nome_da_chave

# Ver jobs pendentes na fila do BullMQ
LRANGE bull:profile-jobs:wait 0 -1

# Remover tudo do Redis (⚠️ perigo em produção)
FLUSHALL

# Dica extra para inspeção visual via Docker
docker exec -it redis redis-cli