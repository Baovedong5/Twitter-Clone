import express from "express";
import userRouter from "./routes/users.routes";
import { run } from "./database/database";
const app = express();

const port = 8000;

app.use(express.json());
app.use("/users", userRouter);

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
