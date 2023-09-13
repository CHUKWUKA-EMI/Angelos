import { Request, Response } from "express";
import { AngelosWebSockerServer } from "../startup/websocketServer";
import {
  CreateSubscription,
  UpdateSubscription,
} from "../interfaces/ISubscription";
import { Topic } from "../Entities/Topic";
import { Subscription as SubscriptionEntity } from "../Entities/Subscription";
import WebSocket from "ws";
import { validate } from "class-validator";
import {
  Message,
  MessageType,
  SubscribeMessage,
  UnSubscribeMessage,
} from "../types/message";

export class Subscription {
  private readonly websocketServer: AngelosWebSockerServer;

  constructor(websocketServer: AngelosWebSockerServer) {
    this.websocketServer = websocketServer;
  }

  async create(req: Request, res: Response) {
    const body = req.body as CreateSubscription;
    const missingParameters = (
      ["name", "topicId", "endpointUrl"] as Array<keyof CreateSubscription>
    ).filter((param) => !body[param]);
    if (missingParameters.length) {
      return res.status(400).json({
        message: `Subscription data is missing the following required parameters: ${missingParameters.join(
          ","
        )}`,
      });
    }

    try {
      const topic = await Topic.findOne({
        where: { id: body.topicId },
        relations: { owner: true },
      });
      if (!topic) {
        return res
          .status(400)
          .json({ message: `Topic with id ${body.topicId} does not exist` });
      }
      const { name, endpointUrl, messageRetentionDuration } = body;
      if (
        messageRetentionDuration &&
        (messageRetentionDuration < 0 || messageRetentionDuration > 30)
      ) {
        return res.status(400).json({
          message:
            "messageRetentionDuration value must be a positive integer less then or equal to 30 (in minutes)",
        });
      }

      const wsClient = this.selectClientAtRandom(this.websocketServer.clients);
      if (!wsClient) {
        return res.status(503).json({
          message:
            "Sorry, we can't handle your request at this time. Please try again later.",
        });
      }
      const subscriptionInstance = SubscriptionEntity.create({
        name,
        endpointUrl,
        topic,
        publisherAppId: (wsClient as any).headers["angelos_appid"],
      });

      if (body.messageRetentionDuration) {
        subscriptionInstance.messageRetentionDuration =
          body.messageRetentionDuration;
      }

      const errors = await validate(subscriptionInstance);
      if (errors.length > 0) {
        return res.status(400).json({
          errors: errors.map((e) => ({
            property: e.property,
            value: e.value,
            constraints: e.constraints,
          })),
        });
      }
      const subscription = await subscriptionInstance.save();
      const message: Message<SubscribeMessage> = {
        type: MessageType.SUBSCRIPTION_CREATED,
        data: {
          topicName: topic.name,
        },
      };

      wsClient.send(JSON.stringify(message), { binary: true });
      return res.status(201).json({
        message: "Subscription created successfully",
        data: subscription,
      });
    } catch (error) {
      console.log("WSS clients size", this.websocketServer.clients.size);
      console.log(`Error creating subscription: ${error}`);
      return res
        .status(500)
        .json({ message: "An error occured while creating subscription" });
    }
  }

  async update(req: Request, res: Response) {
    const body = req.body as UpdateSubscription;
    if (!body.subscriptionId) {
      return res.status(400).json({ message: "subscriptionId is required" });
    }

    try {
      const subscription = await SubscriptionEntity.findOneBy({
        id: body.subscriptionId,
      });
      if (!subscription) {
        return res.status(404).json({
          message: `Subscription with id ${body.subscriptionId} does not exist`,
        });
      }

      const { name, endpointUrl, messageRetentionDuration } = body;
      if (
        messageRetentionDuration &&
        (messageRetentionDuration < 0 || messageRetentionDuration > 30)
      ) {
        return res.status(400).json({
          message:
            "messageRetentionDuration value must be a positive integer less then or equal to 30 (in minutes)",
        });
      }

      if (messageRetentionDuration) {
        subscription.messageRetentionDuration = messageRetentionDuration;
      }

      if (name) subscription.name = name;

      if (endpointUrl) subscription.endpointUrl = endpointUrl;

      const errors = await validate(subscription);
      if (errors.length > 0) {
        return {
          success: false,
          errors,
        };
      }

      const updatedSubscription = await subscription.save();
      return res.status(200).json({
        message: "Subscription updated successfully",
        data: updatedSubscription,
      });
    } catch (error) {
      console.log(`Error updating subscription: ${JSON.stringify(error)}`);
      return res
        .status(500)
        .json({ message: "An error occured while updating subscription" });
    }
  }

  async get({ params }: Request, res: Response) {
    if (!params.id) {
      return res.status(200).json({ message: "id missing in parameters" });
    }
    try {
      const subscription = await SubscriptionEntity.findOneBy({
        id: params.id,
      });
      if (!subscription) {
        return res.status(404).json({
          message: `Subscription with id ${params.id} does not exist`,
        });
      }
      return res.status(200).json(subscription);
    } catch (error) {
      console.log("Error getting subscription", error);
      return res
        .status(500)
        .json({ message: "Error occured while getting subscription" });
    }
  }

  async getAllForTopic(req: Request, res: Response) {
    if (!req.body.topicId) {
      return res.status(400).json({ message: "topicId is required" });
    }
    try {
      const subscriptions = await SubscriptionEntity.find({
        where: { id: req.body.topicId },
      });
      return res.status(200).json({ subscriptions });
    } catch (error) {
      console.log("Error getting subscriptions", error);
      return res
        .status(500)
        .json({ message: "Error occured while getting subscriptions" });
    }
  }

  async remove({ params, query }: Request, res: Response) {
    if (!params.id) {
      return res
        .status(400)
        .json({ message: "id is missing in path parameters" });
    }
    if (!query.topicId?.toString()) {
      return res
        .status(400)
        .json({ message: "topicId is missing in query parameters" });
    }
    try {
      const topic = await Topic.findOneBy({ id: query.topicId.toString() });
      if (!topic) {
        return res
          .status(400)
          .json({ message: `topic with id ${query.topicId} does not exist.` });
      }
      const deleteResult = await SubscriptionEntity.createQueryBuilder("s")
        .delete()
        .where("s.id = :id", { id: params.id })
        .returning("*")
        .execute();
      //   await SubscriptionEntity.delete({ id: params.id });
      const deletedSubscription = deleteResult.raw[0];
      console.log("Deleted Sub", deletedSubscription);
      this.websocketServer.clients.forEach((ws) => {
        if (
          (ws as any).headers["ANGELOS_APPID"] ===
          deletedSubscription.publisherAppId
        ) {
          const message: Message<UnSubscribeMessage> = {
            type: MessageType.SUBSCRIPTION_DELETED,
            data: {
              topicName: topic.name,
            },
          };
          ws.send(JSON.stringify(message));
        }
      });
      return res
        .status(200)
        .json({ message: "subscription deleted", subscriptionId: params.id });
    } catch (error) {
      console.log("Error getting subscription", error);
      return res
        .status(500)
        .json({ message: "Error occured while getting subscription" });
    }
  }

  private selectClientAtRandom(clients: Set<WebSocket>) {
    const connectedClients = [...clients.values()].filter(
      (ws) => ws.readyState === ws.OPEN
    );

    const randomIndex = Math.floor(Math.random() * connectedClients.length);
    const selectedClient = connectedClients[randomIndex];
    return selectedClient;
  }
}
