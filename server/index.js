import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 5000;

app.use(
  cors({
    origin: true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "twitter-dapp" });
});

app.get("/api/contract", (_req, res) => {
  const addr = process.env.CONTRACT_ADDRESS;
  if (!addr || addr.length < 2) {
    return res
      .status(503)
      .json({ error: "CONTRACT_ADDRESS is not set on the server" });
  }
  res.json({ address: addr });
});

app.get("/", (_req, res) => {
  res.type("text/plain").send("Twitter dapp API — use /api/health and /api/contract");
});

app.listen(port, () => {
  console.log(`Server listening on http://127.0.0.1:${port}`);
});
