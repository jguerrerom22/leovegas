import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { Role } from './enums/role.enum';
import {
  CreateUserDto,
  ReadUserDto,
  UpdateRoleDto,
  UpdateUserDto,
} from './dto';
import { UserService } from './user.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from './decorators/role.decorator';

@Controller('users')
export class UserController {
  constructor(private usersService: UserService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const userExists = await this.usersService.findByEmail(createUserDto.email);
    if (userExists) {
      throw new BadRequestException('User already exists');
    }
    return plainToInstance(
      ReadUserDto,
      this.usersService.createUser(createUserDto),
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(ValidationPipe)
  async findOne(@Param('id') id: number, @Req() req) {
    if (req.user.id !== Number(id) && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('Access denied');
    }
    const user = await this.usersService.findOne(id);
    return plainToInstance(ReadUserDto, user);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) => plainToInstance(ReadUserDto, user));
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(ValidationPipe)
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ) {
    if (req.user.id !== id && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('Access denied');
    }
    return plainToInstance(
      ReadUserDto,
      this.usersService.updateUser(id, updateUserDto),
    );
  }

  @Patch(':id/role')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @UsePipes(ValidationPipe)
  async updateRole(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return plainToInstance(
      ReadUserDto,
      this.usersService.updateRole(id, updateRoleDto),
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async deleteUser(@Param('id') id: number, @Req() req) {
    if (Number(id) === req.user.id) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    return this.usersService.deleteUser(id, req.user.id);
  }
}
