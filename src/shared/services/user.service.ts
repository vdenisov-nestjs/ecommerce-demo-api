import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { IUser, IPayload } from './../../shared/types';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterDTO, LoginDTO } from '../../modules/auth/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<IUser>,
  ) {}

  private sanitizeUser(user: IUser) {
    return user.depopulate('password');
  }

  async create(userDto: RegisterDTO) {
    const { username } = userDto;
    const user = await this.userModel.findOne({ username });
    if (user) {
      throw new BadRequestException('User already exists !');
    }

    const createdUser = new this.userModel(userDto);
    await createdUser.save();
    return this.sanitizeUser(createdUser);
  }

  async findByLogin(userDto: LoginDTO) {
    const { username, password } = userDto;
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials !');
    }

    const isPassMatch = await bcrypt.compare(password, user.password);

    if (isPassMatch) {
      return this.sanitizeUser(user);
    } else {
      throw new UnauthorizedException('Invalid credentials !');
    }
  }

  async findByPayload(payload: IPayload) {
    const { username } = payload;
    return await this.userModel.findOne({ username });
  }

  async findAll(): Promise<IUser[]> {
    return await this.userModel.find({});
  }
}
