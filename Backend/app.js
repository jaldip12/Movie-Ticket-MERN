import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";

dotenv.config();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "UPDATE", "PUT"],
  })
);
app.use(limiter);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

app.use(express.json());

import userrouter from "./src/routes/user.routes.js";
import movierouter from "./src/routes/movie.routes.js";
import seatingrouter from "./src/routes/Seating.routes.js";
import showrouter from "./src/routes/show.routes.js";
import AdminRouter from "./src/routes/admin.routes.js";

app.get("/", (req, res) => {
  res.send("Hello from the server!");
});


app.use("/api/v1/users",userrouter)
app.use("/api/v1/movies",movierouter)
app.use("/api/v1/seating", seatingrouter)
app.use("/api/v1/shows", showrouter)
app.use("/api/v1/admin", AdminRouter);

export { app };
