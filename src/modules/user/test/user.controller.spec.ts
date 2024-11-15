import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UpdateRoleDto } from '../dto';
import { ReadUserDto } from '../dto/read-user.dto';
import { Role } from '../enums/role.enum';
import { User } from '../user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';

jest.mock('../user.service');

const editionUserDto: CreateUserDto = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password',
  role: Role.USER,
};
const user: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: Role.USER,
  password: 'password',
  accessToken: '',
};
const userResult: ReadUserDto = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: Role.USER,
};

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '60s' },
        }),
        ConfigModule.forRoot(),
      ],
      controllers: [UserController],
      providers: [UserService, AuthService],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should throw an error if the user already exists', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce(user);

      await expect(
        userController.createUser(editionUserDto),
      ).rejects.toThrowError(BadRequestException);
    });

    it('should create a new user successfully', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce(null);
      jest.spyOn(userService, 'createUser').mockResolvedValueOnce(user);

      const result = await userController.createUser(editionUserDto);
      expect(result).toEqual(userResult);
    });
  });

  describe('findOne', () => {
    it("should throw an error if the user tries to access another user's data without being an admin", async () => {
      const req = { user: { id: 2, role: Role.USER } };
      const userId = 1;

      await expect(userController.findOne(userId, req)).rejects.toThrowError(
        ForbiddenException,
      );
    });

    it('should return user data if the user is an admin or trying to access their own data', async () => {
      const req = { user: { id: 1, role: Role.USER } };
      const userId = 1;

      jest.spyOn(userService, 'findOne').mockResolvedValueOnce(user);

      const result = await userController.findOne(userId, req);
      expect(result).toEqual(userResult);
    });
  });

  describe('findAll', () => {
    it('should return an array of users if the user is an admin', async () => {
      const req = { user: { id: 1, role: Role.ADMIN } };
      const users = [user];
      const usersResult = [userResult];
      jest.spyOn(userService, 'findAll').mockResolvedValueOnce(users);

      const result = await userController.findAll();
      expect(result).toEqual(usersResult);
    });
  });

  describe('updateUser', () => {
    it("should throw an error if the user tries to update another user's data without being an admin", async () => {
      const req = { user: { id: 2, role: Role.USER } };
      const userId = 1;
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };

      await expect(
        userController.updateUser(userId, updateUserDto, req),
      ).rejects.toThrowError(ForbiddenException);
    });

    it("should update the user's data if the user is updating their own data or is an admin", async () => {
      const req = { user: { id: 1, role: Role.USER } };
      const userId = 1;
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };

      jest.spyOn(userService, 'updateUser').mockResolvedValueOnce(user);

      const result = await userController.updateUser(
        userId,
        updateUserDto,
        req,
      );
      expect(result).toEqual(userResult);
    });
  });

  describe('updateRole', () => {
    it("should update the user's role if the user is an admin", async () => {
      const updateRoleDto: UpdateRoleDto = { role: Role.ADMIN };
      const userId = 1;
      jest.spyOn(userService, 'updateRole').mockResolvedValueOnce(user);

      const result = await userController.updateRole(userId, updateRoleDto);
      expect(result).toEqual(userResult);
    });
  });

  describe('deleteUser', () => {
    it('should throw an error if the user tries to delete their own account', async () => {
      const req = { user: { id: 1 } };
      const userId = 1;

      await expect(userController.deleteUser(userId, req)).rejects.toThrowError(
        ForbiddenException,
      );
    });

    it('should delete the user if the user is an admin', async () => {
      const req = { user: { id: 2, role: Role.ADMIN } };
      const userId = 1;

      jest.spyOn(userService, 'deleteUser').mockResolvedValueOnce(null);

      await expect(userController.deleteUser(userId, req)).resolves.toBeNull();
    });
  });
});
