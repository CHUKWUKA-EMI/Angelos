import { Message, SubscribeMessage } from "../../types/message";
import { AngelosPublisherForwarder } from "../../setup/websocketClient";

export async function handleSubscribeMessage(
  payload: Message<SubscribeMessage>,
  wClient?: AngelosPublisherForwarder
) {
  if (wClient) {
    try {
      await wClient.getSubscriber().subscribe(payload.data.topicName);
      console.log("SUBSCRIBED TO TOPIC:", payload.data.topicName);
    } catch (error) {
      console.log("ERROR SUBSCRIBING TO TOPIC: ", payload.data.topicName);
    }
  }
}
