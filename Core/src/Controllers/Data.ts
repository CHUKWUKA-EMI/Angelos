import { Request, Response } from "express";
import { AngelosWebSockerServer } from "../startup/websocketServer";
import { PublishDataPayload } from "../interfaces/publishData";
import { Topic } from "../Entities/Topic";
import { Message, MessageType, PubSubData } from "../types/message";
import { v4 as uuid } from "uuid";

export function publishData(websocketServer: AngelosWebSockerServer) {
  return async (req: Request, res: Response) => {
    const payload = req.body as PublishDataPayload;
    if (!payload.topicName || !payload.topicName.trim().length) {
      return res.status(400).json({
        message: "Topic name is missing. Please specify a topic name",
      });
    }
    if (!payload.data) {
      return res
        .status(400)
        .json({ message: "You have not passed a valid data to be published." });
    }
    if (typeof payload.data !== "object") {
      return res.status(400).json({ message: "Data must be a valid object." });
    }
    try {
      const topic = await Topic.findOne({
        where: { name: payload.topicName, owner: { id: (req as any).userId } },
        relations: { owner: true },
      });
      if (!topic) {
        return res.status(404).json({ message: "No records found." });
      }
      const messageId = uuid();
      const pubsubMessage: Message<PubSubData> = {
        type: MessageType.PUB_SUB_DATA,
        data: {
          topicId: topic.id,
          messageId,
          data: payload.data,
        },
      };

      await websocketServer.publish(payload.topicName, pubsubMessage);
      return res.status(200).json({ messageId });
    } catch (error) {
      console.log("error publishing", JSON.stringify(error));
      return res.status(500).json({ message: "Error publishing message" });
    }
  };
}
