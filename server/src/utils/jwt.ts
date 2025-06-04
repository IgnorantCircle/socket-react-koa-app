import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User';

interface JwtPayload {
  userId: string;
  username: string;
  email: string;
}

class JWTUtils {
  private static readonly JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';
  private static readonly REFRESH_TOKEN_EXPIRES_IN: string = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

  // 生成访问令牌
  static generateAccessToken(user: IUser): string {
    const payload: JwtPayload = {
      userId: (user as any)._id.toString(),
      username: user.username,
      email: user.email
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: '7d',
      issuer: 'chat-app',
      audience: 'chat-app-users'
    });
  }

  // 生成刷新令牌
  static generateRefreshToken(user: IUser): string {
    const payload: JwtPayload = {
      userId: (user as any)._id.toString(),
      username: user.username,
      email: user.email
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: '30d',
      issuer: 'chat-app',
      audience: 'chat-app-users'
    });
  }

  // 验证令牌
  static verifyToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'chat-app',
        audience: 'chat-app-users'
      }) as JwtPayload;
      return decoded;
    } catch (error) {
      console.error('Token验证失败:', error);
      return null;
    }
  }

  // 从请求头中提取token
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }

  // 生成token对
  static generateTokenPair(user: IUser) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
      expiresIn: this.JWT_EXPIRES_IN
    };
  }
}

export default JWTUtils;
export { JwtPayload };