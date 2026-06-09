import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyJwt } from './crypto.utils';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token format');
    }

    const token = authHeader.split(' ')[1];
    const secret = this.configService.get<string>('JWT_SECRET') || 'notes-app-default-jwt-secret-key-998877';
    
    const payload = verifyJwt(token, secret);
    if (!payload) {
      throw new UnauthorizedException('Token is expired or invalid');
    }

    // Attach user payload (containing userId, username, email) to request
    request.user = payload;
    return true;
  }
}
