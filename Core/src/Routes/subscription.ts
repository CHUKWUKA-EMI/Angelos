import { Router } from "express";
import { Subscription } from "../Controllers/Subscription";
import { AngelosWebSockerServer } from "../startup/websocketServer";

export default function getSubscriptionRoutes(
  websocketServer: AngelosWebSockerServer
) {
  const router = Router();

  const subscription = new Subscription(websocketServer);

  router.post("/create", (req, res) => subscription.create(req, res));
  router.put("/update", (req, res) => subscription.update(req, res));
  router.get("/:id", (req, res) => subscription.get(req, res));
  router.post("/getAllforTopic", (req, res) =>
    subscription.getAllForTopic(req, res)
  );
  router.delete("/:id", (req, res) => subscription.remove(req, res));

  return router;
}
