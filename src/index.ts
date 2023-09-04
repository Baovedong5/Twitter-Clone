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

const app = express();
const port = process.env.PORT || 8080;
const httpServer = createServer(app);

//config cors
app.use(cors());

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

io.on("connection", (socket) => {
  console.log(`user ${socket.id} connected`);
  socket.on("disconnect", () => {
    console.log(`user ${socket.id} disconnected`);
  });
});

databaseService.connect();

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
