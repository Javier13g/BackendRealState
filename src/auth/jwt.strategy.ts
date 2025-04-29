import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { UserRespondePayload } from 'src/users/dto/users.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'yourSecretKey',
    });
  }

  async validate(payload: UserRespondePayload): Promise<UserRespondePayload> {
    const user = await this.authService.validateUser(payload.email);
    if (!user || !user.id || !user.email) {
      throw new UnauthorizedException('Usuario no autorizado');
    }
    return { id: user.id, email: user.email, role: user.role ?? undefined };
  }
}
