import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./src/routes/user.routes.js";
import routerM from "./src/routes/movie.routes.js";
import routerS from "./src/routes/Seating.routes.js";
import routerSh from "./src/routes/show.routes.js";
const app = express();

app.use(
  cors({
    origin: "*", // Allow access from everywhere
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
app.use("/api/v1/movies",routerM)
app.use("/api/v1/seating", routerS)
app.use("/api/v1/shows", routerSh)

export { app };
