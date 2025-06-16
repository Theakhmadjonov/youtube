import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies.token;
    const handler = context.getHandler();
    const handlerClass = context.getClass();
    const isFreeAuthClass = this.reflector.get('isFreeAuth', handlerClass);
    const isFreeAuth = this.reflector.get('isFreeAuth', handler);
    if (isFreeAuth || isFreeAuthClass) return true;
    try {
      let { userId } = await this.jwtService.verifyAsync(token);
      request.userId = userId;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token invalid');
    }
  }
}
