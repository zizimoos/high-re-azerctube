import express from "express";
import {
  handleWatch,
  handleGetEdit,
  handleDelete,
  handleSearch,
  handlePostEdit,
  getUpload,
  postUpload,
} from "../controller/videoController";
import {
  protectorMiddleware,
  videoUpload,
  sharedbufferMiddleware,
} from "../middlewares";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", handleWatch);
videoRouter.get("/:id([0-9a-f]{24})/search", handleSearch);
videoRouter
  .route("/upload")
  .all(protectorMiddleware, sharedbufferMiddleware)
  .get(getUpload)
  .post(
    videoUpload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumb", maxCount: 1 },
    ]),
    postUpload
  );
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(handleGetEdit)
  .post(handlePostEdit);
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware)
  .get(handleDelete);

export default videoRouter;
