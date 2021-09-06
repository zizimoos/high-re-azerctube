import express from "express";
import {
  handleRemove,
  handleSee,
  handleLogout,
  startGithubLogin,
  finishGithubLogin,
  handleGetEdit,
  handlePostEdit,
  handleGetChangePassword,
  handlePostChangePassword,
  handleGetProfile,
} from "../controller/userController";
import {
  protectorMiddleware,
  publicOnlyMiddleware,
  avatarUpload,
} from "../middlewares";

const userRouter = express.Router();

userRouter
  .route("/editProfile")
  .all(protectorMiddleware)
  .get(handleGetEdit)
  .post(avatarUpload.single("avatar"), handlePostEdit);
userRouter.get("/logout", handleLogout);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(handleGetChangePassword)
  .post(handlePostChangePassword);

userRouter.get("/delete", handleRemove);
userRouter.get("/:id", handleGetProfile);

export default userRouter;
