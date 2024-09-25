import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./src/routes/user.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.static("public"));
app.use(cookieParser());

app.use(express.json());


app.get("/", (req, res) => {
  res.send("Hello from the server!");
});


app.use("/api/v1/users",router)
export { app };
