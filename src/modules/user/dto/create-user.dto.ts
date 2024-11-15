import { IsNotEmpty, IsEmail, MinLength, IsEnum } from 'class-validator';
import { Role } from '../enums/role.enum';

export class CreateUserDto {
  @IsNotEmpty() name: string;
  @IsEmail() email: string;
  @MinLength(6) password: string;

  @IsEnum(Role)
  role: Role;
}
