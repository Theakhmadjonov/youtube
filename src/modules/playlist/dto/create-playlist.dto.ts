import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePlaylistDto {
    @IsString()
    title: string;
    
    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    visibility: string
}

export class CreatePlaylistVideoDto {
    @IsNumber()
    position: number;
    
    @IsString()
    playlistId: string
}

