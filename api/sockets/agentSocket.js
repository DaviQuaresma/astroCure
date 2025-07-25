import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

const PORT = 5050;
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const agents = new Map();

io.on("connection", (socket) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    socket.disconnect(true);
    return;
  }

  socket.isAlive = true;

  agents.set(token, socket);
  console.log(`✅ Agente registrado: ${token}`);

  // custom pong listener
  socket.on("agent:pong", () => {
    socket.isAlive = true;
    console.log(`🏓 agent:pong recebido de ${token}`);
  });

  socket.on("disconnect", () => {
    agents.delete(token);
    console.log(`❌ Agente desconectado: ${token}`);
  });

  // outros eventos se quiser
});

// ping automático com evento customizado
setInterval(() => {
  for (const [token, socket] of agents.entries()) {
    if (!socket.isAlive) {
      console.log(`⛔ Agente sem resposta: ${token}`);
      agents.delete(token);
      socket.disconnect();
      continue;
    }

    socket.isAlive = false;
    socket.emit("agent:ping");
  }
}, 10000);

server.listen(PORT, () => {
  console.log(`🚀 WebSocket de agentes (socket.io) escutando na porta ${PORT}`);
});
