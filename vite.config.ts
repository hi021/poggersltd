import { defineConfig, type ViteDevServer } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { Server } from "socket.io";

// dev websocket server that doesn't connect to the database (production server in api/socket/index.js)
const websocketServer = {
  name: "websocketServer",
  configureServer(server: ViteDevServer) {
    if (!server.httpServer) return;

    const port = Number(process.env.PUBLIC_SOCKET_PORT) || 3000;

    console.log("Initializing Dev WS " + port);
    server.config.server.port = port;

    let senkosLocal = 0;
    const io = new Server(server.httpServer);

    io.on("connection", (socket) => {
      console.log(`New WS connection (${socket.id})`);
      socket.on("senko-add", (toAdd) => (senkosLocal += toAdd));
      socket.on("senko-get", () => io.to(socket.id).emit("senko-count", senkosLocal));
    });
  }
};

export default defineConfig({
  plugins: [sveltekit(), websocketServer]
});
