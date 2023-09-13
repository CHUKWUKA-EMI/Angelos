import { Router } from "express";
import { AngelosWebSockerServer } from "../startup/websocketServer";
import { publishData } from "../Controllers/Data";

export function initDataPublisherRoute(
  websocketServer: AngelosWebSockerServer
) {
  const router = Router();

  router.post("/", (req, res) => publishData(websocketServer)(req, res));

  return router;
}
