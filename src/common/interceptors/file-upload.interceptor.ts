import { Injectable } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { fileFilter, multerConfig } from "src/video/multer.config";


@Injectable()
export class FileUploadInterceptor extends FileInterceptor('file', {
    storage: multerConfig.storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 *1024 },
}) { }
