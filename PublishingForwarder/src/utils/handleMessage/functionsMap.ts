import { MessageType } from "../../types/message";
import { handleSubscribeMessage } from "./handleSubscribeMessage";
import { handleUnSubscribeMessage } from "./handleUnScribeMessage";
import { handleWelcomeMessage } from "./handleWelcomeMessage";

type FunctionSignature =
  | typeof handleSubscribeMessage
  | typeof handleUnSubscribeMessage
  | typeof handleWelcomeMessage;

export const functionsMap = new Map<MessageType, FunctionSignature>();

functionsMap.set(MessageType.SUBSCRIPTION_CREATED, handleSubscribeMessage);
functionsMap.set(MessageType.SUBSCRIPTION_DELETED, handleUnSubscribeMessage);
functionsMap.set(MessageType.WELCOME, handleWelcomeMessage);
