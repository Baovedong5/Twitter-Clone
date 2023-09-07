import express from "express";
import "dotenv/config";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import userRouter from "./routes/users.routes";
import databaseService from "./database/database";
import { defaultErrorHandler } from "./middlewares/error.middlewares";
import mediasRouter from "./routes/medias.routes";
import { initFolder } from "./utils/file";
import staticRouter from "./routes/static.routes";
import tweetRouter from "./routes/tweets.routes";
import bookmarksRouter from "./routes/bookmarks.routes";
import searchRouter from "./routes/search.routes";
import { UPLOAD_VIDEO_DIR } from "./constants/dir";
import Conversation from "./models/schemas/Conversations.schema";

const app = express();
const port = process.env.PORT || 8080;
const httpServer = createServer(app);

//config cors
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

databaseService.connect();

//Tạo folder upload
initFolder();

app.use(express.json());
app.use("/users", userRouter);
app.use("/medias", mediasRouter);
app.use("/static", staticRouter);
app.use("/tweets", tweetRouter);
app.use("/bookmarks", bookmarksRouter);
app.use("/search", searchRouter);
app.use("/static/video", express.static(UPLOAD_VIDEO_DIR));

app.use(defaultErrorHandler);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const users: {
  [key: string]: {
    socket_id: string;
  };
} = {};

io.on("connection", (socket) => {
  console.log(`user ${socket.id} connected`);
  const user_id = socket.handshake.auth._id;
  users[user_id] = { socket_id: socket.id };
  console.log(users);
  socket.on("private message", async (data) => {
    const receiver_socket_id = users[data.to]?.socket_id;
    if (!receiver_socket_id) return;

    await databaseService.conversations.insertOne(
      new Conversation({
        sender_id: data.from,
        receiver_id: data.to,
        content: data.content,
      })
    );

    socket.to(receiver_socket_id).emit("receiver private message", {
      content: data.content,
      from: user_id,
    });
  });

  socket.on("disconnect", () => {
    delete users[user_id];
    console.log(`user ${socket.id} disconnected`);
    console.log(users);
  });
});

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
