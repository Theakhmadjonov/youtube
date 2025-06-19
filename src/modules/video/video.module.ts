import { Global, Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { fileFilter, multerConfig } from "./multer.config";
import { VideoController } from "./video.controller";
import { VideoService } from "./video.service";

@Global()
@Module({
    imports: [
        MulterModule.register({
            storage: multerConfig.storage,
            fileFilter: fileFilter,
        }),
    ],
    providers: [VideoService],
    controllers: [VideoController],
    exports: [VideoService]
})
export class VideoModule{ }
