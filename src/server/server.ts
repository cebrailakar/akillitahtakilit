import express, { Request, Response, NextFunction, Application } from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import path from "path";
import config from "../config";

interface JwtPayload {
  username: string;
}
interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const app: Application = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 3000;
const SECRET_KEY = config.server.password;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers["authorization"];

  if (!token) {
    res.status(401).send("Access Denied");
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).send("Invalid Token");
    return;
  }
};

app.get("/", (req: Request, res: Response): void => {
  res.render("index", { title: "WebSocket Example" });
});
interface LoginRequest {
  username: string;
  password: string;
}

app.post("/login", (req: Request, res: Response): void => {
  const { username, password } = req.body as LoginRequest;

  if (username === "admin" && password === "password") {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
    return;
  }
  res.status(401).send("Invalid Credentials");
});

app.get(
  "/protected",
  authenticateToken,
  (req: AuthenticatedRequest, res: Response): void => {
    res.render("protected", { user: req.user });
  }
);

interface WebSocketMessage {
  type: string;
  data: any;
}

wss.on("connection", (ws: WebSocket) => {
  ws.on("message", (message: Buffer | string) => {
    const messageStr = message.toString();
    console.log("Message received:", messageStr);

    const response: WebSocketMessage = {
      type: "response",
      data: "Message received",
    };
    ws.send(JSON.stringify(response));
  });

  ws.on("close", () => {
    console.log("A user disconnected");
  });

  // Send a welcome message
  const welcomeMessage: WebSocketMessage = {
    type: "info",
    data: "Welcome to the WebSocket server",
  };
  ws.send(JSON.stringify(welcomeMessage));
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
