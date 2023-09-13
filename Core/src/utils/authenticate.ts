import { NextFunction, Request, Response } from "express";
import { IncomingMessage } from "http";
import jwt, { JwtPayload } from "jsonwebtoken";

export const authenticateWebSocketRequest = (
  request: IncomingMessage
): { isAuthenticated: boolean; reason?: string } => {
  const headers = request.headers;
  const authorization = headers.authorization;
  if (
    !headers["x-api-key"] ||
    headers["x-api-key"] !== process.env.API_KEY ||
    !authorization
  ) {
    return {
      isAuthenticated: false,
      reason: "Invalid request headers or API Key",
    };
  }

  if (!headers["angelos_appid"]) {
    return {
      isAuthenticated: false,
      reason: "angelos_appid was not sent in request headers",
    };
  }

  const token = authorization.split(" ")[1];

  if (!token)
    return {
      isAuthenticated: false,
      reason: "No auth token provided in headers",
    };

  if (token !== process.env.TOKEN) {
    return {
      isAuthenticated: false,
      reason: "Invalid token provided",
    };
  }

  return {
    isAuthenticated: true,
  };
};

export const authenticateHttpRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const headers = req.headers;
  const authorization = headers.authorization;
  if (!authorization)
    return res
      .status(401)
      .json({ message: "No valid authorization header found" });

  const token = authorization.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Authentication token not found" });
  try {
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const dateNow = new Date();
    if (decodedToken.exp && decodedToken.exp < dateNow.getTime() / 1000) {
      return res.status(401).json({ message: "Token has expired" });
    }

    (req as any).userId = decodedToken.userId;
    (req as any).userSignUpdate = decodedToken.userSignUpdate;
    next();
  } catch (error: any) {
    console.log("JWT VERIFICATION ERROR", error.message);
    return res.status(401).json({ message: error.message });
  }
};
