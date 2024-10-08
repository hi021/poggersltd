import { PUBLIC_SOCKET_PORT } from "$env/static/public";
import { Server } from "socket.io";

// TODO waiting for official socket.io support... would have to use express atm

const io = new Server(Number(PUBLIC_SOCKET_PORT));
let senko = 0;

io.on("connection", (socket) => {
  socket.emit("senko", senko);
  console.log("emitting");

  // Receive incoming messages and broadcast them
  socket.on("senko", (msg) => {
    console.log("senko", msg);
    ++senko;
  });
});
