import { createServer } from "http";
import { MongoClient } from "mongodb";
import { handler } from "../../../../build/handler.js";
import { Server } from "socket.io";
import express from "express";

const dbClient = await MongoClient.connect(process.env.DB_URI ?? "");
const dbMisc = dbClient.db(process.env.DB_NAME).collection("misc");
const app = express();
const server = createServer(app);
const io = new Server(server);

// @ts-ignore
const fetchSenkos = async () => (await dbMisc.findOne({ _id: "senkos" }))?.TOTAL || 0;

/**
 * @param {number} toAdd
 */
async function setSenkos(toAdd) {
  const now = new Date().toISOString().slice(0, 10);
  // @ts-ignore
  await dbMisc.updateOne(
    { _id: "senkos" },
    { $inc: { TOTAL: toAdd, [now]: toAdd } },
    { upsert: true }
  );
}

let senkosDb = await fetchSenkos();
let senkosLocal = senkosDb;

io.on("connection", (socket) => {
  console.log(`New WS connection (${socket.id})`);

  socket.on("senko-add", (toAdd) => (senkosLocal += toAdd));

  socket.on("senko-get", () => io.to(socket.id).emit("senko-count", senkosLocal));
});

setInterval(() => {
  const toAdd = senkosLocal - senkosDb;
  if (!toAdd) return;

  senkosDb += toAdd;
  setSenkos(toAdd);
  io.emit("senko-count", senkosLocal);
}, 20000);

app.use(handler);
server.listen(process.env.PUBLIC_SOCKET_PORT);
console.log("WS probably listening on " + process.env.PUBLIC_SOCKET_PORT);
