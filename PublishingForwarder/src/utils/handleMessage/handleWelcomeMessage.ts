import { Message, WelcomeMessage } from "../../types/message";

export function handleWelcomeMessage(data: Message<WelcomeMessage>) {
  console.log("Message from Angelos Core: ", data.data.message);
}
