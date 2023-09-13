import { createServer } from "http";
import express from "express";
import cors from "cors";
import initializeWebSocketConnection from "./initWebSocketClient";

export default function setupApplication() {
  const app = express();
  const server = createServer(app);

  // connectDB;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false, limit: "2mb" }));

  initializeWebSocketConnection();

  app.get("/health", (_, res) => res.send("Ok!"));

  return server;
}
