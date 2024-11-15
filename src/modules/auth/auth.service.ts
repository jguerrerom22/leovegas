import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(user: User): Promise<string> {
    const payload = {
      userId: user.id,
    };

    const tokenExpiration = '30d';
    return this.jwtService.sign(payload, {
      expiresIn: tokenExpiration,
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }
}
