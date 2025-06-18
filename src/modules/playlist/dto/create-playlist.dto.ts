import { Visibility } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePlaylistDto {
    @IsString()
    title: string;
    
    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    @IsEnum(Visibility)
    visibility: Visibility
}

export class CreatePlaylistVideoDto {
    @IsNumber()
    position: number;
    
    @IsString()
    playlistId: string
}

