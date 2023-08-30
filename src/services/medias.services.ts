import { Request } from "express";
import path from "path";
import fs from "fs";
import sharp from "sharp";

import { getNameFromFullname, handleUploadSingleImage } from "~/utils/file";
import { UPLOAD_DIR } from "~/constants/dir";

class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req);
    const newName = getNameFromFullname(file.newFilename);
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`);
    await sharp(file.filepath).jpeg().toFile(newPath);
    fs.unlinkSync(file.filepath);
    return `http://localhost:8000/src/uploads/${newName}.jpg`;
  }
}

const mediasService = new MediasService();
export default mediasService;
