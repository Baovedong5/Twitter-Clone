import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { createServer } from "http";

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

import conversationsRouter from "./routes/conversations.routes";
import initSocket from "./utils/socket";

const app = express();
const port = process.env.PORT || 8080;
const httpServer = createServer(app);

//Use rate limmit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});
app.use(limiter);

// Use Helmet!
app.use(helmet());

//config cors
app.use(
  cors({
    origin: "*",
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
app.use("/conversations", conversationsRouter);
app.use("/static/video", express.static(UPLOAD_VIDEO_DIR));

app.use(defaultErrorHandler);

initSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
