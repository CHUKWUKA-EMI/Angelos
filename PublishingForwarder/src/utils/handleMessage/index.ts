import { Message } from "../../types/message";
import { AngelosPublisherForwarder } from "../../setup/websocketClient";
import WebSocket from "ws";
import { functionsMap } from "./functionsMap";

export default function handleMessage(
  wClient: AngelosPublisherForwarder,
  data: WebSocket.RawData
) {
  const { isValid, parsedData } = validateData(data);
  if (isValid && parsedData) {
    const messageType = parsedData.type;

    const handler = functionsMap.get(messageType);
    if (handler) handler(parsedData, wClient);
  }
}

function validateData(data: WebSocket.RawData): {
  isValid: boolean;
  parsedData?: Message<any>;
} {
  try {
    const dataReceived = JSON.parse(data.toString("utf-8")) as Message<any>;
    return {
      isValid: true,
      parsedData: dataReceived,
    };
  } catch (error) {
    console.log("Invalid data format");
    return {
      isValid: false,
    };
  }
}
