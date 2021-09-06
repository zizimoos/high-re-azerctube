import express from "express";
import { handleHome, handleSearch } from "../controller/videoController";
import {
  handlePostJoin,
  handleGetJoin,
  handlePostLogin,
  handleGetLogin,
} from "../controller/userController";
import { publicOnlyMiddleware } from "../middlewares";

const rootRouter = express.Router();

rootRouter.get("/", handleHome);
rootRouter
  .route("/join")
  .all(publicOnlyMiddleware)
  .get(handleGetJoin)
  .post(handlePostJoin);
rootRouter
  .route("/login")
  .all(publicOnlyMiddleware)
  .get(handleGetLogin)
  .post(handlePostLogin);
rootRouter.get("/search", handleSearch);

export default rootRouter;
