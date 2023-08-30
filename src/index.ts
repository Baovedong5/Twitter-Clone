import express from "express";
import "dotenv/config";

import userRouter from "./routes/users.routes";
import databaseService from "./database/database";
import { defaultErrorHandler } from "./middlewares/error.middlewares";
import mediasRouter from "./routes/medias.routes";
import { initFolder } from "./utils/file";

const app = express();
const port = process.env.PORT || 8080;

//Tạo folder upload
initFolder();

app.use(express.json());
app.use("/users", userRouter);
app.use("/medias", mediasRouter);
app.use(defaultErrorHandler);

databaseService.connect();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
