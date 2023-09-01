import { Router } from "express";
import {
  uploadImageController,
  uploadVideoController,
  uploadVideoHLSController,
  videoStatusController,
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

mediasRouter.get(
  "/video-status/:id",
  validate(accessTokenValidator),
  verifiedUserValidator,
  wrapRequestHandler(videoStatusController)
);

export default mediasRouter;
