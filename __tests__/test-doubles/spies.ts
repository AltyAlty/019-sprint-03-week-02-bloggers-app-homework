import { usersService } from '../../src/users/application/users.service';
import { authService } from '../../src/auth/application/auth.service';

/*Шпион для метода "usersService.create()".*/
export const createUsersServiceCreateSpy = (): jest.SpyInstance => jest.spyOn(usersService, 'create');
export const createUsersServiceConfirmByCodeSpy = (): jest.SpyInstance => jest.spyOn(usersService, 'confirmByCode');

export const createAuthServiceUpdateEmailConfirmationByUserIdSpy = (): jest.SpyInstance => {
  return jest.spyOn(authService, 'updateEmailConfirmationByUserId');
};
