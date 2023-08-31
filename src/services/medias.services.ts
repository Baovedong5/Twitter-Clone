import { Request } from "express";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import "dotenv/config";

import {
  getNameFromFullname,
  handleUploadImage,
  handleUploadVideo,
} from "~/utils/file";
import { UPLOAD_IMAGE_DIR } from "~/constants/dir";
import { isProduction } from "~/constants/config";
import { MediaType } from "~/constants/enum";
import { Media } from "~/models/Other";

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req);

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename);
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`);
        await sharp(file.filepath).jpeg().toFile(newPath);
        fs.unlinkSync(file.filepath);
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`,
          type: MediaType.Image,
        };
      })
    );

    return result;
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req);
    const result: Media[] = files.map((file) => {
      return {
        url: isProduction
          ? `${process.env.HOST}/static/video/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        type: MediaType.Video,
      };
    });
    return result;
  }
}

const mediasService = new MediasService();
export default mediasService;
