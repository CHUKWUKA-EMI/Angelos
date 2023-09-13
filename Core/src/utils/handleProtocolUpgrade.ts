import { IncomingMessage, Server, ServerResponse } from "http";
import { WebSocketServer } from "ws";
import { authenticateWebSocketRequest } from "./authenticate";

export function handleProtocolUpgrade(
  server: Server<typeof IncomingMessage, typeof ServerResponse>,
  wss: WebSocketServer
) {
  server.on("upgrade", (req, socket, head) => {
    socket.on("error", console.error);
    const { isAuthenticated, reason } = authenticateWebSocketRequest(req);
    if (!isAuthenticated) {
      socket.write(`HTTP/1.1 401 ${reason}\r\n\r\n`);
      socket.destroy();
      return;
    }

    socket.removeListener("error", console.error);

    wss.handleUpgrade(req, socket, head, function done(ws) {
      wss.emit("connection", ws, req);
    });
  });
}
