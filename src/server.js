import express from "express";
import morgan from "morgan";
import session from "express-session";

import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import apiRouter from "./routers/apiRouter";
import { localsMiddleware } from "./middlewares";
import MongoStore from "connect-mongo";
import { connection } from "mongoose";

const app = express();

app.use(morgan("dev"));
app.set("view engine", "pug");
app.set("views", "src/views");
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
    store: MongoStore.create({ client: connection.client }),
  })
);

app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets"));

// app.use("/convert", express.static("node_modules/@ffmpeg/core/dist"));

app.use("/", rootRouter);
app.use("/user", userRouter);
app.use("/video", videoRouter);
app.use("/api", apiRouter);

export default app;
