import WebSocket from "ws";
import Redis from "ioredis";
// import { getAssignedTopics } from "../Data/queries";
// import { IncomingMessage } from "http";
interface AngelosCoreApi {
  angelosCoreUrl: string;
  angelosCoreApiKey: string;
  angelosCoreApiToken: string;
}

export class AngelosPublisherForwarder extends WebSocket {
  private readonly subscriptionClient: Redis;
  private readonly messageQueueClient: Redis;
  constructor(server: AngelosCoreApi) {
    super(server.angelosCoreUrl, {
      headers: {
        "x-api-key": server.angelosCoreApiKey,
        Authorization: `Bearer ${server.angelosCoreApiToken}`,
        ANGELOS_APPID: process.env.ANGELOS_APPID,
      },
    });
    this.subscriptionClient = new Redis(process.env.REDIS_PUBSUB_URL ?? "", {
      autoResubscribe: true,
    });
    this.messageQueueClient = new Redis(process.env.REDIS_QUEUE_URL ?? "");

    // getAssignedTopics(process.env.ANGELOS_APPID!).then((topics) => {
    //   if (topics && topics.length) {
    //     topics.map(async (topic) => {
    //       await this.subscriptionClient.subscribe(topic.name);
    //     });
    //   }
    // });

    setTimeout(async () => {
      console.log(
        "REDIS PUBSUB CONNECTION STATUS:",
        this.subscriptionClient.status.toUpperCase()
      );
      console.log(
        "REDIS QUEUE CONNECTION STATUS:",
        this.messageQueueClient.status.toUpperCase()
      );
    }, 2000);
  }

  getSubscriber() {
    return this.subscriptionClient;
  }
}
