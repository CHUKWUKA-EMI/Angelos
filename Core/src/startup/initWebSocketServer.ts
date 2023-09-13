import { IncomingMessage, Server, ServerResponse } from "http";
import { AngelosWebSockerServer } from "./websocketServer";
import { handleProtocolUpgrade } from "../utils/handleProtocolUpgrade";
import { Message, MessageType, WelcomeMessage } from "../types/message";

function heartbeat(this: any) {
  this.isAlive = true;
}

export default function initWebsocketServer(
  server: Server<typeof IncomingMessage, typeof ServerResponse>
) {
  const wss = new AngelosWebSockerServer({
    noServer: true,
    clientTracking: true,
  });

  handleProtocolUpgrade(server, wss);

  wss.on("connection", (socket, req) => {
    (socket as any).headers = req.headers;

    const welcomeMessage: Message<WelcomeMessage> = {
      type: MessageType.WELCOME,
      data: {
        message: "Welcome",
      },
    };
    socket.send(JSON.stringify(welcomeMessage), { binary: true }, (err) =>
      err ? console.error(err) : {}
    );

    socket.on("message", (data) => {
      socket.send(
        JSON.stringify({
          Received: data.toString("utf-8"),
          by: `${process.env.APPID}`,
        }),
        { binary: true }
      );
    });

    (socket as any).isAlive = true;
    socket.on("pong", heartbeat);
  });

  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      if ((ws as any).isAlive === false) return ws.terminate();

      (ws as any).isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", function close() {
    clearInterval(interval);
  });

  return wss;
}
