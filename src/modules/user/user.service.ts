import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto, UpdateRoleDto } from './dto';
import { genSalt, hash } from 'bcryptjs';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    user.password = await this.hashPassword(user.password);
    const userSaved = await this.userRepository.save(user);
    userSaved.accessToken = await this.authService.generateAccessToken(user);
    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    if (updateUserDto.password) {
      user.password = await this.hashPassword(updateUserDto.password);
    }
    return this.userRepository.save(user);
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDto): Promise<User> {
    const user = await this.findOne(id);
    user.role = updateRoleDto.role;
    return this.userRepository.save(user);
  }

  async deleteUser(id: number, currentUserId: number): Promise<void> {
    if (id === currentUserId)
      throw new ForbiddenException('Cannot delete yourself');
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
  private async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(10);
    return hash(password, salt);
  }
}
