import { defineConfig, type ViteDevServer } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { Server } from 'socket.io'

const websocketServer = {
	name: 'websocketServer',
	configureServer(server: ViteDevServer) {
		if (!server.httpServer) return;
        const port = Number(process.env.PUBLIC_SOCKET_PORT) || 3000;
        console.log("Initializing Dev WS " + port)
        server.config.server.port = port;

		const io = new Server(server.httpServer)
		io.on('connection', (socket) => {
			console.log(`New WS Connection ${socket.id}`);

            socket.on("senko+", (senkos) => {
                console.log("add ", senkos)
            })
		})
	}
}

export default defineConfig({
  plugins: [sveltekit(), websocketServer]
});
