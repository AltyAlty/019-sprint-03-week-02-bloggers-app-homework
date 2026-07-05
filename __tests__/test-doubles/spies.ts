import { container } from '../../src/ioc/container';
import { TYPES } from '../../src/ioc/types';
import { UsersService } from '../../src/users/application/users.service';
import { AuthService } from '../../src/auth/application/auth.service';
import { AuthRepository } from '../../src/auth/repositories/auth.repository';
import { UsersRepository } from '../../src/users/repositories/users.repository';

/*Шпион для метода "authService.updateEmailConfirmationByUserId()".*/
export const createAuthServiceUpdateEmailConfirmationByUserIdSpy = (): jest.SpyInstance => {
  const authService = container.get<AuthService>(TYPES.AuthService);
  return jest.spyOn(authService, 'updateEmailConfirmationByUserId');
};

export const createAuthServiceDeleteRecoveryCodeDataSpy = (): jest.SpyInstance => {
  const authService = container.get<AuthService>(TYPES.AuthService);
  return jest.spyOn(authService, 'deleteRecoveryCodeDataByCode');
};

export const createAuthServiceRevokeAllSessionsByUserIdSpy = (): jest.SpyInstance => {
  const authService = container.get<AuthService>(TYPES.AuthService);
  return jest.spyOn(authService, 'revokeAllSessionsByUserId');
};

export const createUsersServiceCreateSpy = (): jest.SpyInstance => {
  const usersService = container.get<UsersService>(TYPES.UsersService);
  return jest.spyOn(usersService, 'create');
};

export const createUsersServiceConfirmByCodeSpy = (): jest.SpyInstance => {
  const usersService = container.get<UsersService>(TYPES.UsersService);
  return jest.spyOn(usersService, 'confirmByCode');
};

export const createUsersServiceUpdatePasswordByRecoveryCodeSpy = (): jest.SpyInstance => {
  const usersService = container.get<UsersService>(TYPES.UsersService);
  return jest.spyOn(usersService, 'updatePasswordByRecoveryCode');
};

export const createAuthRepositoryCreateRecoveryPasswordCodeDataSpy = (): jest.SpyInstance => {
  const authRepository = container.get<AuthRepository>(TYPES.AuthRepository);
  return jest.spyOn(authRepository, 'createRecoveryPasswordCodeData');
};

export const createAuthRepositoryDeleteAllRecoveryCodesDataByUserIdSpy = (): jest.SpyInstance => {
  const authRepository = container.get<AuthRepository>(TYPES.AuthRepository);
  return jest.spyOn(authRepository, 'deleteAllRecoveryCodesDataByUserId');
};

export const createUsersRepositoryUpdatePasswordHashByIdSpy = (): jest.SpyInstance => {
  const usersRepository = container.get<UsersRepository>(TYPES.UsersRepository);
  return jest.spyOn(usersRepository, 'updatePasswordHashById');
};
