import express from "express";
import { createServer } from "http";
import cors from "cors";
import connectDB from "../../ormconfig";
import userRoutes from "../Routes/user";
import topicRoutes from "../Routes/topic";
import getSubscriptionRoutes from "../Routes/subscription";
import { authenticateHttpRequest } from "../utils/authenticate";
import initWebsocketServer from "./initWebSocketServer";
import { initDataPublisherRoute } from "../Routes/publish";

export default function setupApplication() {
  const app = express();
  const server = createServer(app);

  const wss = initWebsocketServer(server);

  connectDB;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false, limit: "2mb" }));

  app.get("/health", (_, res) => {
    res.send("Server Ok!");
  });

  app.use("/account", userRoutes);

  app.use(authenticateHttpRequest);

  app.use("/topic", topicRoutes);
  app.use("/subscription", getSubscriptionRoutes(wss));
  app.use("/publish", initDataPublisherRoute(wss));

  return server;
}
