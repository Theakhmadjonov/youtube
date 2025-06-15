import { Global, Module } from "@nestjs/common";
import { VideoService } from "./video.service";
import { VideosController } from "./video.controller";
import { MulterModule } from "@nestjs/platform-express";
import { fileFilter, multerConfig } from "./multer.config";


@Global()
@Module({
    imports: [
        MulterModule.register({
            storage: multerConfig.storage,
            fileFilter: fileFilter,
        }),
    ],
    providers: [VideoService],
    controllers: [VideosController],
    exports: [VideoService]
})
export class VideoModule{ }
