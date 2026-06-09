import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { hashPassword, verifyPassword, signJwt } from './crypto.utils';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const { username, email, password } = dto;

    const existingUserByEmail = await this.usersService.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException('Email is already registered');
    }

    const existingUserByUsername = await this.usersService.findByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictException('Username is already taken');
    }

    const { salt, hash } = hashPassword(password);
    const user = await this.usersService.create(username, email, hash, salt) as UserDocument;

    const secret = this.configService.get<string>('JWT_SECRET') || 'notes-app-default-jwt-secret-key-998877';
    const token = signJwt(
      { userId: user._id, username: user.username, email: user.email },
      secret,
      86400, // 24 hours
    );

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async login(dto: LoginDto) {
    const { identifier, password } = dto; // identifier can be username or email

    let user = await this.usersService.findByEmail(identifier);
    if (!user) {
      user = await this.usersService.findByUsername(identifier);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = verifyPassword(password, user.salt, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const secret = this.configService.get<string>('JWT_SECRET') || 'notes-app-default-jwt-secret-key-998877';
    const token = signJwt(
      { userId: user._id, username: user.username, email: user.email },
      secret,
      86400, // 24 hours
    );

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };
  }
}
