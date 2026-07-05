import { UsersService } from '../../src/users/application/users.service';
import { AuthService } from '../../src/auth/application/auth.service';
import { AuthRepository } from '../../src/auth/repositories/auth.repository';
import { UsersRepository } from '../../src/users/repositories/users.repository';

/*Шпион для метода "usersService.create()".*/
export const createUsersServiceCreateSpy = (): jest.SpyInstance => jest.spyOn(UsersService, 'create');
export const createUsersServiceConfirmByCodeSpy = (): jest.SpyInstance => jest.spyOn(UsersService, 'confirmByCode');

export const createUsersServiceUpdatePasswordByRecoveryCodeSpy = (): jest.SpyInstance => {
  return jest.spyOn(UsersService, 'updatePasswordByRecoveryCode');
};

export const createUsersRepositoryUpdatePasswordHashByIdSpy = (): jest.SpyInstance => {
  return jest.spyOn(UsersRepository, 'updatePasswordHashById');
};

export const createAuthServiceUpdateEmailConfirmationByUserIdSpy = (): jest.SpyInstance => {
  return jest.spyOn(AuthService, 'updateEmailConfirmationByUserId');
};

export const createAuthServiceDeleteRecoveryCodeDataSpy = (): jest.SpyInstance => {
  return jest.spyOn(AuthService, 'deleteRecoveryCodeDataByCode');
};

export const createAuthServiceRevokeAllSessionsByUserIdSpy = (): jest.SpyInstance => {
  return jest.spyOn(AuthService, 'revokeAllSessionsByUserId');
};

export const createAuthRepositoryCreateRecoveryPasswordCodeDataSpy = (): jest.SpyInstance => {
  return jest.spyOn(AuthRepository, 'createRecoveryPasswordCodeData');
};

export const createAuthRepositoryDeleteAllRecoveryCodesDataByUserIdSpy = (): jest.SpyInstance => {
  return jest.spyOn(AuthRepository, 'deleteAllRecoveryCodesDataByUserId');
};
