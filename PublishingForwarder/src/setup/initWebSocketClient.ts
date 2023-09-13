import { handlePubSubData } from "../utils/handlePubSubData";
import handleMessage from "../utils/handleMessage";
import { AngelosPublisherForwarder } from "./websocketClient";
import { getAssignedTopics } from "../Data/queries";

const RECONNECTION_TIMEOUT = 10 * 1000;

function heartbeat(this: any) {
  clearTimeout(this.pingTimeout);
  this.pingTimeout = setTimeout(() => {
    this.terminate();
  }, 30000 + 1000);
}

export default function initializeWebSocketConnection() {
  let wClient: AngelosPublisherForwarder;

  const angelosCoreUrl = process.env.ANGELOS_CORE_URL!;
  const angelosCoreApiKey = process.env.ANGELOS_CORE_API_KEY!;
  const angelosCoreApiToken = process.env.ANGELOS_CORE_API_TOKEN!;

  if (!angelosCoreUrl || !angelosCoreApiToken || !angelosCoreApiKey) {
    console.log("ANGELOS-CORE API CREDENTIALS ARE NOT SET...");
  }

  wClient = new AngelosPublisherForwarder({
    angelosCoreUrl,
    angelosCoreApiKey,
    angelosCoreApiToken,
  });

  wClient.on("message", async (data) => {
    handleMessage(wClient, data);
  });

  wClient.on("error", (err) => {
    if ((err as any).code === "ECONNREFUSED") {
      console.log("Connecction refused. Reconnecting...");
      // initializeWebSocketConnection()
    } else {
      console.error;
    }
  });

  wClient.on("unexpected-response", (_, res) => {
    console.log("Error Message from Angelos-core server:", res.statusMessage);
  });

  wClient.on("open", heartbeat);
  wClient.on("ping", heartbeat);
  wClient.on("close", function clear() {
    clearTimeout((this as any).pingTimeout);
    console.log("Socket is closed. It will attempt reconnecting in 10s");
    setTimeout(() => {
      initializeWebSocketConnection();
    }, RECONNECTION_TIMEOUT);
  });

  // resubscribe on reconnect/connect
  wClient.getSubscriber().on("connecting", () => {
    getAssignedTopics(process.env.ANGELOS_APPID!).then((topics) => {
      if (topics && topics.length) {
        topics.map(async (topic) => {
          await wClient.getSubscriber().subscribe(topic.name);
        });
      }
    });
  });

  wClient.getSubscriber().on("message", handlePubSubData);
}
