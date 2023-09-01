import { Router } from "express";
import {
  serverImageController,
  serverVideoStreamController,
  severM3U8Controller,
  severSegmentController,
} from "~/controllers/medias.controllers";

const staticRouter = Router();

staticRouter.get("/image/:name", serverImageController);
staticRouter.get("/video-stream/:name", serverVideoStreamController);
staticRouter.get("/video-hls/:id/master.m3u8", severM3U8Controller);
staticRouter.get("/video-hls/:id/:v/:segment", severSegmentController);

export default staticRouter;
