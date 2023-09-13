export enum MessageType {
  SUBSCRIPTION_CREATED = "SUBSCRIPTION_CREATED",
  SUBSCRIPTION_DELETED = "SUBSCRIPTION_DELETED",
  WELCOME = "WELCOME",
  ACK = "ACK",
  PUB_SUB_DATA = "PUB_SUB_DATA",
}

export type Message<T extends Object> = {
  /**
   * the type of message you want to send
   */
  type: MessageType;
  /**
   * data is the message body
   */
  data: T;
};

export type SubscribeMessage = {
  topicName: string;
};

export type UnSubscribeMessage = {
  topicName: string;
};

export type WelcomeMessage = {
  message: string;
};

export type PubSubData = {
  topicId: string;
  messageId: string;
  data: object;
};
