import express from "express";
import { registerView } from "../controller/videoController";

const apiRouter = express.Router();

apiRouter.route("/video/:id([0-9a-f]{24})/view").post(registerView);

export default apiRouter;
