import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class CreateAuthDto {
  @IsString()
  @IsPhoneNumber()
  phone: string;
}

export class verifyOtp {
  @IsString()
  @IsPhoneNumber()
  phone: string;

  @IsString()
  code: string;
}

export class RegisterDto {
  @IsString()
  username: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(3)
  lastName: string;

  @IsString()
  @IsPhoneNumber()
  phone: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsString()
  session_token: string;
}
