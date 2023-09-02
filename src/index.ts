import express from "express";
import "dotenv/config";
import cors from "cors";

import userRouter from "./routes/users.routes";
import databaseService from "./database/database";
import { defaultErrorHandler } from "./middlewares/error.middlewares";
import mediasRouter from "./routes/medias.routes";
import { initFolder } from "./utils/file";
import staticRouter from "./routes/static.routes";
import tweetRouter from "./routes/tweets.routes";
import bookmarksRouter from "./routes/bookmarks.routes";

const app = express();
const port = process.env.PORT || 8080;

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

app.use(defaultErrorHandler);

databaseService.connect();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
