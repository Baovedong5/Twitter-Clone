import express from "express";
import "dotenv/config";

import userRouter from "./routes/users.routes";
import databaseService from "./database/database";
const app = express();

const port = process.env.PORT || 8080;

app.use(express.json());
app.use("/users", userRouter);

databaseService.connect();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
