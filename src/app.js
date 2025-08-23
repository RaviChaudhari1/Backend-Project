import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000", // Allow requests from this origin, "*" allows all origins
    credentials: true, // Allow cookies to be sent with requests
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// routes importing

import userRouter from "./routes/user.route.js";


// route declaration
app.use("/api/v1/users", userRouter)





export default app;
