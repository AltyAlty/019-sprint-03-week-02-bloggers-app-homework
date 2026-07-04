import { getCreateUserInputDTO } from '../../utils/users/input-dto-utils/get-create-user-input-dto.test-util';
import { doBeforeTestsWithMongoMemoryServer } from '../../utils/common/do-before-tests.test-util';
import { CreateUserInputDTO } from '../../../src/users/routes/input-dto/create-user.input-dto';
import { nodemailerAdapter } from '../../../src/auth/adapters/nodemailer.adapter';
import { authService } from '../../../src/auth/application/auth.service';
import { ResultStatuses } from '../../../src/core/types/result/result-statuses';
import { emailExamples } from '../../../src/auth/email/email-examples';
import { usersRepository } from '../../../src/users/repositories/users.repository';
import { UserDBType } from '../../../src/users/repositories/types/user-db.type';
import { confirmUserByCode } from '../../utils/auth/confirm-user-by-code.test-util';
import { Result } from '../../../src/core/types/result/result.type';
import { createMockEmailAdapter } from '../../test-doubles/mocks';
import {
  createUsersServiceConfirmByCodeSpy,
  createUsersServiceCreateSpy,
  createAuthServiceUpdateEmailConfirmationByUserIdSpy,
} from '../../test-doubles/spies';
import { validUserAgents, validUUIDRegExp } from '../../test-data/auth.test-data';
import { EmailConfirmationDBType } from '../../../src/auth/repositories/types/email-сonfirmation-db.type';
import { authRepository } from '../../../src/auth/repositories/auth.repository';

describe('Auth', () => {
  const app = doBeforeTestsWithMongoMemoryServer();

  it('✅ 001 should register a user when a valid body passed; 003. POST /api/auth/registration', async () => {
    const mockEmailAdapter: jest.Mocked<typeof nodemailerAdapter> = createMockEmailAdapter();
    const usersServiceCreateSpy: jest.SpyInstance = createUsersServiceCreateSpy();
    const usersServiceConfirmByCodeSpy: jest.SpyInstance = createUsersServiceConfirmByCodeSpy();
    const authServiceUpdateEmailConfirmationByUserIdSpy: jest.SpyInstance =
      createAuthServiceUpdateEmailConfirmationByUserIdSpy();

    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();

    const registerUserResult: Result<{ createdUserId: string }> = await authService.registerUser(
      createUserData,
      mockEmailAdapter
    );

    const createdUserId: string = registerUserResult.data.createdUserId;
    const createdUserDB: UserDBType | null = await usersRepository.findById(createdUserId);
    expect(typeof createdUserId).toBe('string');
    expect(createdUserDB?.login).toEqual(createUserData.login);
    expect(createdUserDB?.email).toEqual(createUserData.email);
    expect(createdUserDB?.isConfirmed).toBeFalsy();
    expect(registerUserResult.status).toBe(ResultStatuses.Created);
    expect(registerUserResult.extensions).toBeInstanceOf(Array);
    expect(mockEmailAdapter.sendMail).toHaveBeenCalledTimes(1);
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();

    expect(mockEmailAdapter.sendMail).toHaveBeenCalledWith(
      createUserData.email,
      'Complete Registration',
      expect.stringMatching(validUUIDRegExp),
      emailExamples.completeRegistrationEmail
    );

    /*Приводим шпионов в изначальное состояния для использования их в других тестах.*/
    usersServiceCreateSpy.mockRestore();
    usersServiceConfirmByCodeSpy.mockRestore();
    authServiceUpdateEmailConfirmationByUserIdSpy.mockRestore();
  });

  it('✅ 002 should confirm user registration when a correct confirmation code passed; 004. POST /api/auth/registration-confirmation', async () => {
    const mockEmailAdapter: jest.Mocked<typeof nodemailerAdapter> = createMockEmailAdapter();
    const usersServiceCreateSpy: jest.SpyInstance = createUsersServiceCreateSpy();
    const usersServiceConfirmByCodeSpy: jest.SpyInstance = createUsersServiceConfirmByCodeSpy();
    const authServiceUpdateEmailConfirmationByUserIdSpy: jest.SpyInstance =
      createAuthServiceUpdateEmailConfirmationByUserIdSpy();

    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();

    const registerUserResult: Result<{ createdUserId: string }> = await authService.registerUser(
      createUserData,
      mockEmailAdapter
    );

    const createdUserId: string = registerUserResult.data.createdUserId;
    const createdUserDB: UserDBType | null = await usersRepository.findById(createdUserId);

    const emailConfirmationDB: EmailConfirmationDBType | null =
      await authRepository.findEmailConfirmationByUserId(createdUserId);

    await confirmUserByCode(app, validUserAgents.userAgent_01, emailConfirmationDB?.confirmationCode);

    const confirmedUserDB: UserDBType | null = await usersRepository.findById(createdUserId);
    expect(createdUserDB?.isConfirmed).toBeFalsy();
    expect(confirmedUserDB?.isConfirmed).toBeTruthy();
    expect(mockEmailAdapter.sendMail).toHaveBeenCalledTimes(1);
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceConfirmByCodeSpy).toHaveBeenCalledTimes(1);
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();

    usersServiceCreateSpy.mockRestore();
    usersServiceConfirmByCodeSpy.mockRestore();
    authServiceUpdateEmailConfirmationByUserIdSpy.mockRestore();
  });

  it('✅ 003 should resend a confirmation mail when a correct email passed; 005. POST /api/auth/registration-email-resending', async () => {
    const mockEmailAdapter: jest.Mocked<typeof nodemailerAdapter> = createMockEmailAdapter();
    const usersServiceCreateSpy: jest.SpyInstance = createUsersServiceCreateSpy();
    const usersServiceConfirmByCodeSpy: jest.SpyInstance = createUsersServiceConfirmByCodeSpy();
    const authServiceUpdateEmailConfirmationByUserIdSpy: jest.SpyInstance =
      createAuthServiceUpdateEmailConfirmationByUserIdSpy();

    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();

    const registerUserResult: Result<{ createdUserId: string }> = await authService.registerUser(
      createUserData,
      mockEmailAdapter
    );

    const createdUserId: string = registerUserResult.data.createdUserId;
    const createdUserDBBeforeResending: UserDBType | null = await usersRepository.findById(createdUserId);

    const emailConfirmationDBBeforeResending: EmailConfirmationDBType | null =
      await authRepository.findEmailConfirmationByUserId(createdUserId);

    const resendConfirmationEmailResult: Result<{} | null> = await authService.resendConfirmationEmail(
      createUserData.email,
      mockEmailAdapter
    );

    const createdUserDBAfterResending: UserDBType | null = await usersRepository.findById(createdUserId);

    const emailConfirmationDBAfterResending: EmailConfirmationDBType | null =
      await authRepository.findEmailConfirmationByUserId(createdUserId);

    expect(createdUserDBBeforeResending?.isConfirmed).toBeFalsy();
    expect(createdUserDBAfterResending?.isConfirmed).toBeFalsy();

    expect(emailConfirmationDBBeforeResending?.confirmationCode).not.toBe(
      emailConfirmationDBAfterResending?.confirmationCode
    );

    expect(emailConfirmationDBBeforeResending?.expirationDate).not.toBe(
      emailConfirmationDBAfterResending?.expirationDate
    );

    expect(resendConfirmationEmailResult.status).toBe(ResultStatuses.NoContent);
    expect(resendConfirmationEmailResult.extensions).toBeInstanceOf(Array);
    expect(mockEmailAdapter.sendMail).toHaveBeenCalledTimes(2);
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).toHaveBeenCalledTimes(1);

    expect(mockEmailAdapter.sendMail).toHaveBeenCalledWith(
      createUserData.email,
      'Complete Registration',
      expect.stringMatching(validUUIDRegExp),
      emailExamples.completeRegistrationEmail
    );

    expect(mockEmailAdapter.sendMail).toHaveBeenCalledWith(
      createUserData.email,
      'Resending Complete Registration Email',
      expect.stringMatching(validUUIDRegExp),
      emailExamples.completeRegistrationEmail
    );

    usersServiceCreateSpy.mockRestore();
    usersServiceConfirmByCodeSpy.mockRestore();
    authServiceUpdateEmailConfirmationByUserIdSpy.mockRestore();
  });

  it('✅ 004 should confirm user registration after resending a confirmation email when a correct confirmation code passed; 004. POST /api/auth/registration-confirmation', async () => {
    const mockEmailAdapter: jest.Mocked<typeof nodemailerAdapter> = createMockEmailAdapter();
    const usersServiceCreateSpy: jest.SpyInstance = createUsersServiceCreateSpy();
    const usersServiceConfirmByCodeSpy: jest.SpyInstance = createUsersServiceConfirmByCodeSpy();
    const authServiceUpdateEmailConfirmationByUserIdSpy: jest.SpyInstance =
      createAuthServiceUpdateEmailConfirmationByUserIdSpy();

    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();

    const registerUserResult: Result<{ createdUserId: string }> = await authService.registerUser(
      createUserData,
      mockEmailAdapter
    );

    const createdUserId: string = registerUserResult.data.createdUserId;
    await authService.resendConfirmationEmail(createUserData.email, mockEmailAdapter);

    const emailConfirmationDBAfterResending: EmailConfirmationDBType | null =
      await authRepository.findEmailConfirmationByUserId(createdUserId);

    await confirmUserByCode(app, validUserAgents.userAgent_01, emailConfirmationDBAfterResending?.confirmationCode);

    const confirmedUserDB: UserDBType | null = await usersRepository.findById(createdUserId);
    expect(confirmedUserDB?.isConfirmed).toBeTruthy();
    expect(mockEmailAdapter.sendMail).toHaveBeenCalledTimes(2);
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceConfirmByCodeSpy).toHaveBeenCalledTimes(1);
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).toHaveBeenCalledTimes(1);

    expect(mockEmailAdapter.sendMail).toHaveBeenCalledWith(
      createUserData.email,
      'Complete Registration',
      expect.stringMatching(validUUIDRegExp),
      emailExamples.completeRegistrationEmail
    );

    expect(mockEmailAdapter.sendMail).toHaveBeenCalledWith(
      createUserData.email,
      'Resending Complete Registration Email',
      expect.stringMatching(validUUIDRegExp),
      emailExamples.completeRegistrationEmail
    );

    usersServiceCreateSpy.mockRestore();
    usersServiceConfirmByCodeSpy.mockRestore();
    authServiceUpdateEmailConfirmationByUserIdSpy.mockRestore();
  });
});
