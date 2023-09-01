import { Router } from "express";
import {
  uploadImageController,
  uploadVideoController,
  uploadVideoHLSController,
} from "~/controllers/medias.controllers";
import {
  accessTokenValidator,
  verifiedUserValidator,
} from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";
import { validate } from "~/utils/validation";

const mediasRouter = Router();

mediasRouter.post(
  "/upload-image",
  validate(accessTokenValidator),
  verifiedUserValidator,
  wrapRequestHandler(uploadImageController)
);

mediasRouter.post(
  "/upload-video",
  validate(accessTokenValidator),
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoController)
);

mediasRouter.post(
  "/upload-video-hls",
  validate(accessTokenValidator),
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoHLSController)
);

export default mediasRouter;
