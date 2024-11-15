import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) throw new ForbiddenException('Unauthorized');

    try {
      const user = this.jwtService.verify(token);
      request.user = user;
      return true;
    } catch {
      throw new ForbiddenException('Invalid token');
    }
  }
}

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
