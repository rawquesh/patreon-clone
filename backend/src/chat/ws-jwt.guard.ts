import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token =
      client.handshake.auth.token ||
      client.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      return true;
    } catch (error) {
      console.log(error);
      throw new WsException('Invalid token');
    }
  }
}
