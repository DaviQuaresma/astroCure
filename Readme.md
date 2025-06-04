----- docker:

-resetar o docker forçado:
wsl --shutdown

-validar o se o docker ta rodando:
docker info

-Checar os serviços docker rodando:
docker ps
docker ps -a

-Iniciar os containers:
docker-compose up -d

-Chegar o log do docker:
docker logs id(pego no docker ps)

-Subir/atualizar containers:
docker compose up -d --build

-Atualizar em caso de estiver rodando:
docker compose down
docker compose up -d --build

-Limpar cache:
docker system prune -af