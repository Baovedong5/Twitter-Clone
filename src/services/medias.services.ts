import { Request } from "express";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import "dotenv/config";

import { getNameFromFullname, handleUploadImage } from "~/utils/file";
import { UPLOAD_DIR } from "~/constants/dir";
import { isProduction } from "~/constants/config";
import { MediaType } from "~/constants/enum";
import { Media } from "~/models/Other";

class MediasService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req);

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename);
        const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`);
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
}

const mediasService = new MediasService();
export default mediasService;
