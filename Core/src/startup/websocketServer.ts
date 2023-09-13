import WebSocket, { WebSocketServer } from "ws";
import Redis from "ioredis";
import { IncomingMessage } from "http";

export class AngelosWebSockerServer extends WebSocketServer {
  private readonly publisherClient: Redis;
  constructor(
    options?:
      | WebSocket.ServerOptions<typeof WebSocket, typeof IncomingMessage>
      | undefined
  ) {
    super({ ...options });
    this.publisherClient = new Redis(process.env.REDIS_PUBSUB_URL ?? "", {
      autoResubscribe: true,
    });

    setTimeout(() => {
      console.log(
        "REDIS PUBLISHER CONNECTION STATUS:",
        this.publisherClient.status.toUpperCase()
      );
    }, 2000);
  }

  async publish(topic: string, message: any) {
    await this.publisherClient.publish(topic, JSON.stringify(message), (err) =>
      err ? console.log("error publishing", err) : ""
    );
  }
}
