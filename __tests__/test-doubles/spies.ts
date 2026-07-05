import { usersService } from '../../src/users/application/users.service';
import { authService } from '../../src/auth/application/auth.service';
import { authRepository } from '../../src/auth/repositories/auth.repository';
import { usersRepository } from '../../src/users/repositories/users.repository';

/*Шпион для метода "usersService.create()".*/
export const createUsersServiceCreateSpy = (): jest.SpyInstance => jest.spyOn(usersService, 'create');
export const createUsersServiceConfirmByCodeSpy = (): jest.SpyInstance => jest.spyOn(usersService, 'confirmByCode');

export const createUsersServiceUpdatePasswordByRecoveryCodeSpy = (): jest.SpyInstance => {
  return jest.spyOn(usersService, 'updatePasswordByRecoveryCode');
};

export const createUsersRepositoryUpdatePasswordHashByIdSpy = (): jest.SpyInstance => {
  return jest.spyOn(usersRepository, 'updatePasswordHashById');
};

export const createAuthServiceUpdateEmailConfirmationByUserIdSpy = (): jest.SpyInstance => {
  return jest.spyOn(authService, 'updateEmailConfirmationByUserId');
};

export const createAuthServiceDeleteRecoveryCodeDataSpy = (): jest.SpyInstance => {
  return jest.spyOn(authService, 'deleteRecoveryCodeDataByCode');
};

export const createAuthServiceRevokeAllSessionsByUserIdSpy = (): jest.SpyInstance => {
  return jest.spyOn(authService, 'revokeAllSessionsByUserId');
};

export const createAuthRepositoryCreateRecoveryPasswordCodeDataSpy = (): jest.SpyInstance => {
  return jest.spyOn(authRepository, 'createRecoveryPasswordCodeData');
};

export const createAuthRepositoryDeleteAllRecoveryCodesDataByUserIdSpy = (): jest.SpyInstance => {
  return jest.spyOn(authRepository, 'deleteAllRecoveryCodesDataByUserId');
};
