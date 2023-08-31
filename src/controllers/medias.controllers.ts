import { NextFunction, Request, Response } from "express";
import path from "path";
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_TEMP_DIR } from "~/constants/dir";
import { usersMessage } from "~/constants/messages";
import mediasService from "~/services/medias.services";

export const uploadImageController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const url = await mediasService.uploadImage(req);

  return res.json({
    message: usersMessage.UPLOAD_SUCCESS,
    data: url,
  });
};

export const serverImageController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.params;
  console.log(name);
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send("Not found");
    }
  });
};

export const uploadVideoController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const url = await mediasService.uploadVideo(req);

  return res.json({
    message: usersMessage.UPLOAD_SUCCESS,
    data: url,
  });
};

export const serverVideoController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.params;

  return res.sendFile(path.resolve(UPLOAD_VIDEO_TEMP_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send("Not found");
    }
  });
};
