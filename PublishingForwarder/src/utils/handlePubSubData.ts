import { Message, PubSubData } from "../types/message";
import { getSubscriptionDetails } from "../Data/queries";
import axios from "axios";

export async function handlePubSubData(_: string, message: string) {
  const messagePayload = JSON.parse(message) as Message<PubSubData>;

  const messageId = messagePayload.data.messageId;
  const messageData = messagePayload.data.data;
  const topicId = messagePayload.data.topicId;

  getSubscriptionDetails(topicId, process.env.ANGELOS_APPID!)
    .then(async (subscription) => {
      const payload = {
        messageId,
        ...messageData,
      };
      try {
        const response = await axios.post(subscription.endpointUrl, {
          ...payload,
        });
        if (response.status === 200) {
          console.log("Message delivered to client!");
        }
      } catch (error) {
        console.log("Error forwarding data to client's endpoint", error);
      }
    })
    .catch((err) => console.log("error getting subscription details", err));
}
