import express, { Request, Response, NextFunction, Application } from "express";
import jwt from "jsonwebtoken";
import path from "path";
import config from "./config";

// Define interface for JWT payload
interface JwtPayload {
  username: string;
}

// Define interface for authenticated request
interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const app: Application = express();
const PORT = 3000;
const SECRET_KEY = config.server.password;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// JWT Authentication Middleware
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

// Home route that renders an EJS template
app.get("/", (req: Request, res: Response): void => {
  res.render("index", { title: "Express Example" });
});

// Define interface for login request body
interface LoginRequest {
  username: string;
  password: string;
}

// Login Route to generate JWT
app.post("/login", (req: Request, res: Response): void => {
  const { username, password } = req.body as LoginRequest;

  // Dummy user validation
  if (username === "admin" && password === "password") {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
    return;
  }
  res.status(401).send("Invalid Credentials");
});

// Protected Route Example
app.get(
  "/protected",
  authenticateToken,
  (req: AuthenticatedRequest, res: Response): void => {
    res.render("protected", { user: req.user });
  }
);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
