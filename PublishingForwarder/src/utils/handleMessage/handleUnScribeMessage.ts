import { Message, UnSubscribeMessage } from "../../types/message";
import { AngelosPublisherForwarder } from "../../setup/websocketClient";

export async function handleUnSubscribeMessage(
  payload: Message<UnSubscribeMessage>,
  wClient?: AngelosPublisherForwarder
) {
  if (wClient) {
    try {
      await wClient
        .getSubscriber()
        .unsubscribe(payload.data.topicName, (err) => err);
      console.log("REMOVED SUBSCRIPTION FROM TOPIC:", payload.data.topicName);
    } catch (error) {
      console.log(
        "ERROR REMOVING SUBSCRIPTION FROM TOPIC: ",
        payload.data.topicName
      );
    }
  }
}
