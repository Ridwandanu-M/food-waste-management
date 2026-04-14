import express from "express";
import cors from "cors";
import router from "./routes/testRoute.ts";

const app = express();
const PORT = 3000;
const host = "localhost";

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/", router);

app.listen(PORT, () => {
  console.log(`Server running at http://${host}:${PORT}`);
});
