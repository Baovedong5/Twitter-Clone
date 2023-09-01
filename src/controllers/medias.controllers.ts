import { NextFunction, Request, Response } from "express";
import path from "path";
import fs from "fs";
import mime from "mime";

import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from "~/constants/dir";
import httpStatus from "~/constants/httpStatus";
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

export const serverVideoStreamController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const range = req.headers.range;
  if (!range) {
    res.status(httpStatus.BAD_REQUEST).send("Requires range header");
  }
  const { name } = req.params;
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name);
  //1MB = 10^6 bytes (Tính theo hệ 10)
  //Tính dung lượng video (bytes)
  const videoSize = fs.statSync(videoPath).size;
  //Dung lượng video cho mỗi phân đoạn stream
  const chunkSize = 10 ** 6; //1MB
  //Lấy giá trị byte bắt đầu từ header Range
  const start = Number(range?.replace(/\D/g, ""));
  //Lấy giá trị byte kết thúc, vượt quá dung lượng video thì lấy giá trị videoSize
  const end = Math.min(start + chunkSize, videoSize - 1);
  //Dung lượng thực tế cho mỗi đoạn video stream
  //Thường sẽ là chunkSize, trừ đoạn cuối
  const contentLength = end - start + 1;
  const contentType = mime.getType(videoPath) || "video/*";
  const headers = {
    "Content-Range": `bytes ${start} - ${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": contentType,
  };
  res.writeHead(httpStatus.PARTIAL_CONTENT, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
};

export const uploadVideoHLSController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const url = await mediasService.uploadVideoHLS(req);

  return res.json({
    message: usersMessage.UPLOAD_SUCCESS,
    data: url,
  });
};

export const severM3U8Controller = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  return res.sendFile(
    path.resolve(UPLOAD_VIDEO_DIR, id, "master.m3u8"),
    (err) => {
      if (err) {
        res.status((err as any).status).send("Not Found");
      }
    }
  );
};

export const severSegmentController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id, v, segment } = req.params;

  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, v, segment), (err) => {
    if (err) {
      res.status((err as any).status).send("Not Found");
    }
  });
};

export const videoStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const result = await mediasService.getVideoStatus(id as string);

  return res.json({
    message: usersMessage.GET_VIDEO_STATUS_SUCCESS,
    data: result,
  });
};
