import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {}

export class sendOtpEmail {
  @IsString()
  @IsEmail()
  email: string;
}
export class verifyOtpEmail {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  code: string;
}

