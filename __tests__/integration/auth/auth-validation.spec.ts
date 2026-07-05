import { getCreateUserInputDTO } from '../../utils/users/input-dto-utils/get-create-user-input-dto.test-util';
import { doBeforeTestsWithMongoMemoryServer } from '../../utils/common/do-before-tests.test-util';
import { CreateUserInputDTO } from '../../../src/users/routes/input-dto/create-user.input-dto';
import { PaginatedUserListOutputDTO } from '../../../src/users/routes/output-dto/paginated-user-list.output-dto';
import { getUserList } from '../../utils/users/get-user-list.test-util';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { registerUser } from '../../utils/auth/register-user.test-util';
import { UserOutputDTO } from '../../../src/users/routes/output-dto/user.output-dto';
import { createUser } from '../../utils/users/create-user.test-util';
import { UsersService } from '../../../src/users/application/users.service';
import { Result } from '../../../src/core/types/result/result.type';
import { UserDBType } from '../../../src/users/repositories/types/user-db.type';
import { UsersRepository } from '../../../src/users/repositories/users.repository';
import { confirmUserByCode } from '../../utils/auth/confirm-user-by-code.test-util';
import { resendConfirmationEmail } from '../../utils/auth/resend-confirmation-email.test-util';
import {
  createAuthRepositoryCreateRecoveryPasswordCodeDataSpy,
  createAuthRepositoryDeleteAllRecoveryCodesDataByUserIdSpy,
  createAuthServiceDeleteRecoveryCodeDataSpy,
  createAuthServiceRevokeAllSessionsByUserIdSpy,
  createAuthServiceUpdateEmailConfirmationByUserIdSpy,
  createUsersRepositoryUpdatePasswordHashByIdSpy,
  createUsersServiceConfirmByCodeSpy,
  createUsersServiceCreateSpy,
  createUsersServiceUpdatePasswordByRecoveryCodeSpy,
} from '../../test-doubles/spies';
import {
  expiredRecoveryCodeData,
  expiredUserEmailConfirmationData,
  invalidConfirmationCodes,
  invalidRecoveryCodes,
  invalidUserAgents,
  validUserAgents,
  validUUIDs,
} from '../../test-data/auth.test-data';
import {
  invalidUserEmails,
  invalidUserLogins,
  invalidUserPasswords,
  validUserEmails,
  validUserLogins,
  validUserPasswords,
} from '../../test-data/users.test-data';
import { delay } from '../../utils/common/delay.test-util';
import { setTimeout } from 'timers/promises';
import { createNodemailerAdapterSendMailSpyAndMock } from '../../test-doubles/spies-mocks';
import { EmailConfirmationDBType } from '../../../src/auth/repositories/types/email-сonfirmation-db.type';
import { AuthRepository } from '../../../src/auth/repositories/auth.repository';
import { AuthService } from '../../../src/auth/application/auth.service';
import { loginUserReturnAccessAndRefreshTokens } from '../../utils/auth/login-user-return-access-and-refresh-tokens.test-util';
import { RecoveryCodeDataDBType } from '../../../src/auth/repositories/types/recovery-code-data-db.type';
import { SessionDBType } from '../../../src/auth/repositories/types/session-db.type';
import { SecurityDeviceListOutputDTO } from '../../../src/security-devices/routes/output-dto/security-device-list.output-dto';
import { getSecurityDeviceList } from '../../utils/security-devices/get-security-device-list.test-util';
import { sendRecoveryPasswordCode } from '../../utils/auth/send-recovery-password-code.test-util';
import { setNewPasswordByRecoveryCode } from '../../utils/auth/set-new-password-by-recovery-code.test-util';
import { container } from '../../../src/ioc/container';
import { TYPES } from '../../../src/ioc/types';

describe('Auth Validation', () => {
  const app = doBeforeTestsWithMongoMemoryServer();
  const nodemailerAdapterSendMailSpyAndMock: jest.SpyInstance = createNodemailerAdapterSendMailSpyAndMock();
  const usersServiceCreateSpy: jest.SpyInstance = createUsersServiceCreateSpy();
  const usersServiceConfirmByCodeSpy: jest.SpyInstance = createUsersServiceConfirmByCodeSpy();

  const authServiceUpdateEmailConfirmationByUserIdSpy: jest.SpyInstance =
    createAuthServiceUpdateEmailConfirmationByUserIdSpy();

  const authRepositoryDeleteAllRecoveryCodesDataByUserIdSpy: jest.SpyInstance =
    createAuthRepositoryDeleteAllRecoveryCodesDataByUserIdSpy();

  const authRepositoryCreateRecoveryPasswordCodeSpy: jest.SpyInstance =
    createAuthRepositoryCreateRecoveryPasswordCodeDataSpy();

  const usersServiceUpdatePasswordByRecoveryCodeSpy: jest.SpyInstance =
    createUsersServiceUpdatePasswordByRecoveryCodeSpy();

  const usersRepositoryUpdatePasswordHashByIdSpy: jest.SpyInstance = createUsersRepositoryUpdatePasswordHashByIdSpy();
  const authServiceDeleteRecoveryCodeSpy: jest.SpyInstance = createAuthServiceDeleteRecoveryCodeDataSpy();
  const authServiceRevokeAllSessionsByUserIdSpy: jest.SpyInstance = createAuthServiceRevokeAllSessionsByUserIdSpy();

  const authService = container.get<AuthService>(TYPES.AuthService);
  const usersService = container.get<UsersService>(TYPES.UsersService);
  const authRepository = container.get<AuthRepository>(TYPES.AuthRepository);
  const usersRepository = container.get<UsersRepository>(TYPES.UsersRepository);

  it('❌ 001 should not register a user when an invalid body passed; 003. POST /api/auth/registration', async () => {
    const testUserAgent: string = validUserAgents.userAgent_01;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const registerUserResponse_01: any = await registerUser(
      app,
      testUserAgent,
      { login: invalidUserLogins.login_01 },
      testStatus
    );

    const registerUserResponse_02: any = await registerUser(
      app,
      testUserAgent,
      { login: invalidUserLogins.login_02 },
      testStatus
    );

    const registerUserResponse_03: any = await registerUser(
      app,
      testUserAgent,
      { login: invalidUserLogins.login_03 },
      testStatus
    );

    const registerUserResponse_04: any = await registerUser(
      app,
      testUserAgent,
      { login: invalidUserLogins.login_04 },
      testStatus
    );

    const registerUserResponse_05: any = await registerUser(
      app,
      testUserAgent,
      { login: invalidUserLogins.login_05 },
      testStatus
    );

    await delay(5000);
    await setTimeout(5000);

    const registerUserResponse_06: any = await registerUser(
      app,
      testUserAgent,
      { login: invalidUserLogins.login_06 },
      testStatus
    );

    const registerUserResponse_07: any = await registerUser(
      app,
      testUserAgent,
      { password: invalidUserPasswords.password_01 },
      testStatus
    );

    const registerUserResponse_08: any = await registerUser(
      app,
      testUserAgent,
      { password: invalidUserPasswords.password_02 },
      testStatus
    );

    const registerUserResponse_09: any = await registerUser(
      app,
      testUserAgent,
      { password: invalidUserPasswords.password_03 },
      testStatus
    );

    const registerUserResponse_10: any = await registerUser(
      app,
      testUserAgent,
      { password: invalidUserPasswords.password_04 },
      testStatus
    );

    await delay(5000);
    await setTimeout(5000);

    const registerUserResponse_11: any = await registerUser(
      app,
      testUserAgent,
      { password: invalidUserPasswords.password_05 },
      testStatus
    );

    const registerUserResponse_12: any = await registerUser(
      app,
      testUserAgent,
      { password: invalidUserPasswords.password_06 },
      testStatus
    );

    const registerUserResponse_13: any = await registerUser(
      app,
      testUserAgent,
      { email: invalidUserEmails.email_01 },
      testStatus
    );

    const registerUserResponse_14: any = await registerUser(
      app,
      testUserAgent,
      { email: invalidUserEmails.email_02 },
      testStatus
    );

    const registerUserResponse_15: any = await registerUser(
      app,
      testUserAgent,
      { email: invalidUserEmails.email_03 },
      testStatus
    );

    await delay(5000);
    await setTimeout(5000);

    const registerUserResponse_16: any = await registerUser(
      app,
      testUserAgent,
      { email: invalidUserEmails.email_04 },
      testStatus
    );

    const registerUserResponse_17: any = await registerUser(
      app,
      testUserAgent,
      { email: invalidUserEmails.email_05 },
      testStatus
    );

    const getUserListResponse: PaginatedUserListOutputDTO = await getUserList(app);
    expect(getUserListResponse.items).toBeInstanceOf(Array);
    expect(getUserListResponse.items.length).toBe(0);
    expect(getUserListResponse.totalCount).toBe(0);
    expect(registerUserResponse_01.errorsMessages[0].field).toBe('login');
    expect(registerUserResponse_01.errorsMessages[0].message).toBe('Field "login" must not be empty');
    expect(registerUserResponse_02.errorsMessages[0].field).toBe('login');
    expect(registerUserResponse_02.errorsMessages[0].message).toBe('Field "login" must not be empty');
    expect(registerUserResponse_03.errorsMessages[0].field).toBe('login');
    expect(registerUserResponse_03.errorsMessages[0].message).toBe('Field "login" must be between 3 and 10 characters');
    expect(registerUserResponse_04.errorsMessages[0].field).toBe('login');

    expect(registerUserResponse_04.errorsMessages[0].message).toBe(
      'Field "login" can only contain letters, numbers, underscores and hyphens'
    );

    expect(registerUserResponse_05.errorsMessages[0].field).toBe('login');
    expect(registerUserResponse_05.errorsMessages[0].message).toBe('Field "login" must be between 3 and 10 characters');
    expect(registerUserResponse_06.errorsMessages[0].field).toBe('login');
    expect(registerUserResponse_06.errorsMessages[0].message).toBe('Field "login" must be a string');
    expect(registerUserResponse_07.errorsMessages[0].field).toBe('password');
    expect(registerUserResponse_07.errorsMessages[0].message).toBe('Field "password" must not be empty');
    expect(registerUserResponse_08.errorsMessages[0].field).toBe('password');
    expect(registerUserResponse_08.errorsMessages[0].message).toBe('Field "password" must not be empty');
    expect(registerUserResponse_09.errorsMessages[0].field).toBe('password');

    expect(registerUserResponse_09.errorsMessages[0].message).toBe(
      'Field "password" must be between 6 and 20 characters'
    );

    expect(registerUserResponse_10.errorsMessages[0].field).toBe('password');

    expect(registerUserResponse_10.errorsMessages[0].message).toBe(
      'Field "password" must be between 6 and 20 characters'
    );

    expect(registerUserResponse_11.errorsMessages[0].field).toBe('password');

    expect(registerUserResponse_11.errorsMessages[0].message).toBe(
      'Field "password" must be between 6 and 20 characters'
    );

    expect(registerUserResponse_12.errorsMessages[0].field).toBe('password');
    expect(registerUserResponse_12.errorsMessages[0].message).toBe('Field "password" must be a string');
    expect(registerUserResponse_13.errorsMessages[0].field).toBe('email');
    expect(registerUserResponse_13.errorsMessages[0].message).toBe('Field "email" must not be empty');
    expect(registerUserResponse_14.errorsMessages[0].field).toBe('email');
    expect(registerUserResponse_14.errorsMessages[0].message).toBe('Field "email" must not be empty');
    expect(registerUserResponse_15.errorsMessages[0].field).toBe('email');
    expect(registerUserResponse_15.errorsMessages[0].message).toBe('Field "email" is invalid');
    expect(registerUserResponse_16.errorsMessages[0].field).toBe('email');
    expect(registerUserResponse_16.errorsMessages[0].message).toBe('Field "email" is invalid');
    expect(registerUserResponse_17.errorsMessages[0].field).toBe('email');
    expect(registerUserResponse_17.errorsMessages[0].message).toBe('Field "email" must be a string');
    expect(nodemailerAdapterSendMailSpyAndMock).not.toHaveBeenCalled();
    expect(usersServiceCreateSpy).not.toHaveBeenCalled();
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  }, 35000);

  it('❌ 002 should not register a user when a non-unique login/email passed; 003. POST /api/auth/registration', async () => {
    const createdUser: UserOutputDTO = await createUser(app);
    const invalidCreateUserData_01: CreateUserInputDTO = getCreateUserInputDTO({ email: validUserEmails.email_01 });
    const invalidCreateUserData_02: CreateUserInputDTO = getCreateUserInputDTO({ login: validUserLogins.login_01 });
    const testUserAgent: string = validUserAgents.userAgent_01;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const registerUserResponse_01: any = await registerUser(app, testUserAgent, invalidCreateUserData_01, testStatus);
    const registerUserResponse_02: any = await registerUser(app, testUserAgent, invalidCreateUserData_02, testStatus);

    const getUserListResponse: PaginatedUserListOutputDTO = await getUserList(app);
    expect(getUserListResponse.items).toBeInstanceOf(Array);
    expect(getUserListResponse.items.length).toBe(1);
    expect(getUserListResponse.totalCount).toBe(1);
    expect(getUserListResponse.items[0]).toEqual(createdUser);
    expect(registerUserResponse_01.errorsMessages[0].field).toBe('login');
    expect(registerUserResponse_01.errorsMessages[0].message).toBe('Field "login" must be unique');
    expect(registerUserResponse_02.errorsMessages[0].field).toBe('email');
    expect(registerUserResponse_02.errorsMessages[0].message).toBe('Field "email" must be unique');
    expect(nodemailerAdapterSendMailSpyAndMock).not.toHaveBeenCalled();
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 003 should not register a user when an invalid user agent passed; 003. POST /api/auth/registration', async () => {
    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await registerUser(app, invalidUserAgents.userAgent_01, getCreateUserInputDTO(), testStatus);
    await registerUser(app, invalidUserAgents.userAgent_02, getCreateUserInputDTO(), testStatus);

    const getUserListResponse: PaginatedUserListOutputDTO = await getUserList(app);
    expect(getUserListResponse.items).toBeInstanceOf(Array);
    expect(getUserListResponse.items.length).toBe(0);
    expect(getUserListResponse.totalCount).toBe(0);
    expect(nodemailerAdapterSendMailSpyAndMock).not.toHaveBeenCalled();
    expect(usersServiceCreateSpy).not.toHaveBeenCalled();
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 004 should not register a user when a user agent not passed; 003. POST /api/auth/registration', async () => {
    await registerUser(app, validUserAgents.userAgent_01, getCreateUserInputDTO(), HttpStatuses.Unauthorized_401, true);

    const getUserListResponse: PaginatedUserListOutputDTO = await getUserList(app);
    expect(getUserListResponse.items).toBeInstanceOf(Array);
    expect(getUserListResponse.items.length).toBe(0);
    expect(getUserListResponse.totalCount).toBe(0);
    expect(nodemailerAdapterSendMailSpyAndMock).not.toHaveBeenCalled();
    expect(usersServiceCreateSpy).not.toHaveBeenCalled();
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 005 should not register a user when more than 5 requests to the same URL during the last 10 seconds have been made; 003. POST /api/auth/registration', async () => {
    const createUserData_01: CreateUserInputDTO = getCreateUserInputDTO();

    const createUserData_02: CreateUserInputDTO = getCreateUserInputDTO({
      login: validUserLogins.login_01,
      email: validUserEmails.email_01,
    });

    const createUserData_03: CreateUserInputDTO = getCreateUserInputDTO({
      login: validUserLogins.login_02,
      email: validUserEmails.email_02,
    });

    const createUserData_04: CreateUserInputDTO = getCreateUserInputDTO({
      login: validUserLogins.login_03,
      email: validUserEmails.email_03,
    });

    const createUserData_05: CreateUserInputDTO = getCreateUserInputDTO({
      login: validUserLogins.login_04,
      email: validUserEmails.email_04,
    });

    const createUserData_06: CreateUserInputDTO = getCreateUserInputDTO({
      login: validUserLogins.login_05,
      email: validUserEmails.email_05,
    });

    const createUserData_07: CreateUserInputDTO = getCreateUserInputDTO({
      login: validUserLogins.login_06,
      email: validUserEmails.email_06,
    });

    const createUserData_08: CreateUserInputDTO = getCreateUserInputDTO({
      login: validUserLogins.login_07,
      email: validUserEmails.email_07,
    });

    const testUserAgent: string = validUserAgents.userAgent_01;
    const testStatus: HttpStatuses = HttpStatuses.TooManyRequest_429;

    await registerUser(app, testUserAgent, createUserData_01);
    await registerUser(app, testUserAgent, createUserData_02);
    await registerUser(app, testUserAgent, createUserData_03);
    await registerUser(app, testUserAgent, createUserData_04);
    await registerUser(app, testUserAgent, createUserData_05);
    await registerUser(app, testUserAgent, createUserData_06, testStatus);
    await registerUser(app, testUserAgent, createUserData_07, testStatus);
    await delay(5000);
    await setTimeout(5000);
    await registerUser(app, testUserAgent, createUserData_08);

    const getUserListResponse: PaginatedUserListOutputDTO = await getUserList(app);
    expect(getUserListResponse.items).toBeInstanceOf(Array);
    expect(getUserListResponse.items.length).toBe(6);
    expect(getUserListResponse.totalCount).toBe(6);
    expect(getUserListResponse.items[0].login).toEqual(validUserLogins.login_07);
    expect(getUserListResponse.items[0].email).toEqual(validUserEmails.email_07);
    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(6);
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(6);
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  }, 15000);

  it('❌ 006 should not confirm user registration when an invalid confirmation code passed; 004. POST /api/auth/registration-confirmation', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const testUserAgent: string = validUserAgents.userAgent_01;
    await registerUser(app, testUserAgent, createUserData);
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const confirmUserByCodeResponse_01: any = await confirmUserByCode(
      app,
      testUserAgent,
      invalidConfirmationCodes.code_01,
      testStatus
    );

    const confirmUserByCodeResponse_02: any = await confirmUserByCode(
      app,
      testUserAgent,
      invalidConfirmationCodes.code_02,
      testStatus
    );

    const confirmUserByCodeResponse_03: any = await confirmUserByCode(
      app,
      testUserAgent,
      invalidConfirmationCodes.code_03,
      testStatus
    );

    const confirmUserByCodeResponse_04: any = await confirmUserByCode(
      app,
      testUserAgent,
      invalidConfirmationCodes.code_04,
      testStatus
    );

    const confirmUserByCodeResponse_05: any = await confirmUserByCode(
      app,
      testUserAgent,
      invalidConfirmationCodes.code_05,
      testStatus
    );

    await delay(5000);
    await setTimeout(5000);

    const confirmUserByCodeResponse_06: any = await confirmUserByCode(
      app,
      testUserAgent,
      invalidConfirmationCodes.code_06,
      testStatus
    );

    const confirmUserByCodeResponse_07: any = await confirmUserByCode(
      app,
      testUserAgent,
      invalidConfirmationCodes.code_07,
      testStatus
    );

    const confirmUserByCodeResponse_08: any = await confirmUserByCode(
      app,
      testUserAgent,
      invalidConfirmationCodes.code_08,
      testStatus
    );

    const notConfirmedUserDB: UserDBType | null = await usersRepository.findByLoginOrEmail(createUserData.login);
    expect(notConfirmedUserDB?.isConfirmed).toBeFalsy();
    expect(confirmUserByCodeResponse_01.errorsMessages[0].field).toBe('code');
    expect(confirmUserByCodeResponse_01.errorsMessages[0].message).toBe('Field "code" must not be empty');
    expect(confirmUserByCodeResponse_02.errorsMessages[0].field).toBe('code');
    expect(confirmUserByCodeResponse_02.errorsMessages[0].message).toBe('Field "code" must not be empty');
    expect(confirmUserByCodeResponse_03.errorsMessages[0].field).toBe('code');
    expect(confirmUserByCodeResponse_03.errorsMessages[0].message).toBe('Field "code" is invalid');
    expect(confirmUserByCodeResponse_04.errorsMessages[0].field).toBe('code');
    expect(confirmUserByCodeResponse_04.errorsMessages[0].message).toBe('Field "code" is invalid');
    expect(confirmUserByCodeResponse_05.errorsMessages[0].field).toBe('code');
    expect(confirmUserByCodeResponse_05.errorsMessages[0].message).toBe('Field "code" is invalid');
    expect(confirmUserByCodeResponse_06.errorsMessages[0].field).toBe('code');
    expect(confirmUserByCodeResponse_06.errorsMessages[0].message).toBe('Field "code" must be a string');
    expect(confirmUserByCodeResponse_07.errorsMessages[0].field).toBe('code');
    expect(confirmUserByCodeResponse_07.errorsMessages[0].message).toBe('Field "code" is required');
    expect(confirmUserByCodeResponse_08.errorsMessages[0].field).toBe('code');
    expect(confirmUserByCodeResponse_08.errorsMessages[0].message).toBe('Field "code" must be a string');
    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(1);
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  }, 15000);

  it('❌ 007 should not confirm user registration when an incorrect confirmation code passed; 004. POST /api/auth/registration-confirmation', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const testUserAgent: string = validUserAgents.userAgent_01;
    await registerUser(app, testUserAgent, getCreateUserInputDTO());

    const confirmUserByCodeResponse: any = await confirmUserByCode(
      app,
      testUserAgent,
      validUUIDs.uuid_01,
      HttpStatuses.BadRequest_400
    );

    const notConfirmedUserDB: UserDBType | null = await usersRepository.findByLoginOrEmail(createUserData.login);
    expect(notConfirmedUserDB?.isConfirmed).toBeFalsy();
    expect(confirmUserByCodeResponse.errorsMessages[0].field).toBe('code');
    expect(confirmUserByCodeResponse.errorsMessages[0].message).toBe('Field "code" is invalid');
    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(1);
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 008 should not confirm user registration without prior registration; 004. POST /api/auth/registration-confirmation', async () => {
    const confirmUserByCodeResponse: any = await confirmUserByCode(
      app,
      validUserAgents.userAgent_01,
      validUUIDs.uuid_01,
      HttpStatuses.BadRequest_400
    );

    expect(confirmUserByCodeResponse.errorsMessages[0].field).toBe('code');
    expect(confirmUserByCodeResponse.errorsMessages[0].message).toBe('Field "code" is invalid');
    expect(nodemailerAdapterSendMailSpyAndMock).not.toHaveBeenCalled();
    expect(usersServiceCreateSpy).not.toHaveBeenCalled();
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 009 should not confirm already confirmed user registration; 004. POST /api/auth/registration-confirmation', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUserLogin: string = createUserData.login;
    await registerUser(app, createUserData);
    const createdUserDB: UserDBType | null = await usersRepository.findByLoginOrEmail(createdUserLogin);
    const createdUserId: string = String(createdUserDB?._id);

    const emailConfirmationDB_01: EmailConfirmationDBType | null =
      await authRepository.findEmailConfirmationByUserId(createdUserId);

    const testUserAgent: string = validUserAgents.userAgent_01;
    await confirmUserByCode(app, testUserAgent, emailConfirmationDB_01?.confirmationCode);

    const confirmUserByCodeResponse: any = await confirmUserByCode(
      app,
      testUserAgent,
      emailConfirmationDB_01?.confirmationCode,
      HttpStatuses.BadRequest_400
    );

    const twiceConfirmedUserDB: UserDBType | null = await usersRepository.findByLoginOrEmail(createdUserLogin);

    const emailConfirmationDB_02: EmailConfirmationDBType | null =
      await authRepository.findEmailConfirmationByUserId(createdUserId);

    expect(twiceConfirmedUserDB?.isConfirmed).toBeTruthy();
    expect(emailConfirmationDB_02).toBeNull();
    expect(confirmUserByCodeResponse.errorsMessages[0].field).toBe('code');
    expect(confirmUserByCodeResponse.errorsMessages[0].message).toBe('Field "code" is invalid');
    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(1);
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceConfirmByCodeSpy).toHaveBeenCalledTimes(1);
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 010 should not confirm user registration when an expired confirmation code passed; 004. POST /api/auth/registration-confirmation', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUserResult: Result<{ createdUserId: string }> = await usersService.create(createUserData, true);
    const createdUserId: string = createdUserResult.data.createdUserId;

    await authService.createEmailConfirmation(
      createdUserId,
      expiredUserEmailConfirmationData.confirmationCode,
      expiredUserEmailConfirmationData.expirationDate
    );

    const confirmUserByCodeResponse: any = await confirmUserByCode(
      app,
      validUserAgents.userAgent_01,
      expiredUserEmailConfirmationData.confirmationCode,
      HttpStatuses.BadRequest_400
    );

    const notConfirmedUserDB: UserDBType | null = await usersRepository.findById(createdUserId);
    expect(notConfirmedUserDB?.isConfirmed).toBeFalsy();
    expect(confirmUserByCodeResponse.errorsMessages[0].field).toBe('code');
    expect(confirmUserByCodeResponse.errorsMessages[0].message).toBe('Confirmation code is expired');
    expect(nodemailerAdapterSendMailSpyAndMock).not.toHaveBeenCalled();
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 011 should not confirm user registration when an invalid user agent passed; 004. POST /api/auth/registration-confirmation', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUserLogin: string = createUserData.login;
    await registerUser(app, validUserAgents.userAgent_01, createUserData);
    const createdUserDB: UserDBType | null = await usersRepository.findByLoginOrEmail(createdUserLogin);
    const createdUserId: string = String(createdUserDB?._id);

    const emailConfirmationDB: EmailConfirmationDBType | null =
      await authRepository.findEmailConfirmationByUserId(createdUserId);

    const confirmationCode: string | undefined = emailConfirmationDB?.confirmationCode;
    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await confirmUserByCode(app, invalidUserAgents.userAgent_01, confirmationCode, testStatus);
    await confirmUserByCode(app, invalidUserAgents.userAgent_02, confirmationCode, testStatus);

    const notConfirmedUserDB: UserDBType | null = await usersRepository.findByLoginOrEmail(createdUserLogin);
    expect(notConfirmedUserDB?.isConfirmed).toBeFalsy();
    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(1);
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 012 should not confirm user registration when a user agent not passed; 004. POST /api/auth/registration-confirmation', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUserLogin: string = createUserData.login;
    await registerUser(app, validUserAgents.userAgent_01, createUserData);
    const createdUserDB: UserDBType | null = await usersRepository.findByLoginOrEmail(createdUserLogin);
    const createdUserId: string = String(createdUserDB?._id);

    const emailConfirmationDB: EmailConfirmationDBType | null =
      await authRepository.findEmailConfirmationByUserId(createdUserId);

    await confirmUserByCode(
      app,
      validUserAgents.userAgent_01,
      emailConfirmationDB?.confirmationCode,
      HttpStatuses.Unauthorized_401,
      true
    );

    const notConfirmedUserDB: UserDBType | null = await usersRepository.findByLoginOrEmail(createdUserLogin);
    expect(notConfirmedUserDB?.isConfirmed).toBeFalsy();
    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(1);
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 013 should not confirm user registration when more than 5 requests to the same URL during the last 10 seconds have been made; 004. POST /api/auth/registration-confirmation', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUserLogin: string = createUserData.login;
    await registerUser(app, validUserAgents.userAgent_01, createUserData);
    const createdUserDB: UserDBType | null = await usersRepository.findByLoginOrEmail(createdUserLogin);
    const createdUserId: string = String(createdUserDB?._id);

    const emailConfirmationDB: EmailConfirmationDBType | null =
      await authRepository.findEmailConfirmationByUserId(createdUserId);

    const confirmationCode: string | undefined = emailConfirmationDB?.confirmationCode;
    const testStatus_01: HttpStatuses = HttpStatuses.BadRequest_400;
    const testStatus_02: HttpStatuses = HttpStatuses.TooManyRequest_429;

    await confirmUserByCode(app, validUserAgents.userAgent_01, confirmationCode);
    await confirmUserByCode(app, validUserAgents.userAgent_01, confirmationCode, testStatus_01);
    await confirmUserByCode(app, validUserAgents.userAgent_01, confirmationCode, testStatus_01);
    await confirmUserByCode(app, validUserAgents.userAgent_01, confirmationCode, testStatus_01);
    await confirmUserByCode(app, validUserAgents.userAgent_01, confirmationCode, testStatus_01);
    await confirmUserByCode(app, validUserAgents.userAgent_01, confirmationCode, testStatus_02);
    await confirmUserByCode(app, validUserAgents.userAgent_01, confirmationCode, testStatus_02);
    await delay(5000);
    await setTimeout(5000);
    await confirmUserByCode(app, validUserAgents.userAgent_01, confirmationCode, testStatus_01);

    const confirmedUserDB: UserDBType | null = await usersRepository.findByLoginOrEmail(createdUserLogin);
    expect(confirmedUserDB?.isConfirmed).toBeTruthy();
    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(1);
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceConfirmByCodeSpy).toHaveBeenCalledTimes(1);
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  }, 15000);

  it('❌ 014 should not resend a confirmation code when an invalid confirmation email passed; 005. POST /api/auth/registration-email-resending', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const testUserAgent: string = validUserAgents.userAgent_01;
    await registerUser(app, testUserAgent, createUserData);
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const resendConfirmationEmailResponse_01: any = await resendConfirmationEmail(
      app,
      testUserAgent,
      invalidUserEmails.email_01,
      testStatus
    );

    const resendConfirmationEmailResponse_02: any = await resendConfirmationEmail(
      app,
      testUserAgent,
      invalidUserEmails.email_02,
      testStatus
    );

    const resendConfirmationEmailResponse_03: any = await resendConfirmationEmail(
      app,
      testUserAgent,
      invalidUserEmails.email_03,
      testStatus
    );

    const resendConfirmationEmailResponse_04: any = await resendConfirmationEmail(
      app,
      testUserAgent,
      invalidUserEmails.email_04,
      testStatus
    );

    const resendConfirmationEmailResponse_05: any = await resendConfirmationEmail(
      app,
      testUserAgent,
      invalidUserEmails.email_05,
      testStatus
    );

    expect(resendConfirmationEmailResponse_01.errorsMessages[0].field).toBe('email');
    expect(resendConfirmationEmailResponse_01.errorsMessages[0].message).toBe('Field "email" must not be empty');
    expect(resendConfirmationEmailResponse_02.errorsMessages[0].field).toBe('email');
    expect(resendConfirmationEmailResponse_02.errorsMessages[0].message).toBe('Field "email" must not be empty');
    expect(resendConfirmationEmailResponse_03.errorsMessages[0].field).toBe('email');
    expect(resendConfirmationEmailResponse_03.errorsMessages[0].message).toBe('Field "email" is invalid');
    expect(resendConfirmationEmailResponse_04.errorsMessages[0].field).toBe('email');
    expect(resendConfirmationEmailResponse_04.errorsMessages[0].message).toBe('Field "email" is invalid');
    expect(resendConfirmationEmailResponse_05.errorsMessages[0].field).toBe('email');
    expect(resendConfirmationEmailResponse_05.errorsMessages[0].message).toBe('Field "email" must be a string');
    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(1);
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 015 should not resend a confirmation code when an incorrect confirmation email passed; 005. POST /api/auth/registration-email-resending', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const testUserAgent: string = validUserAgents.userAgent_01;
    await registerUser(app, testUserAgent, createUserData);

    const resendConfirmationEmailResponse: any = await resendConfirmationEmail(
      app,
      testUserAgent,
      validUserEmails.email_01,
      HttpStatuses.BadRequest_400
    );

    expect(resendConfirmationEmailResponse.errorsMessages[0].field).toBe('email');
    expect(resendConfirmationEmailResponse.errorsMessages[0].message).toBe('Field "email" is invalid');
    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(1);
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 016 should not resend a confirmation code without prior registration; 005. POST /api/auth/registration-email-resending', async () => {
    const resendConfirmationEmailResponse: any = await resendConfirmationEmail(
      app,
      validUserAgents.userAgent_01,
      validUserEmails.email_01,
      HttpStatuses.BadRequest_400
    );

    expect(resendConfirmationEmailResponse.errorsMessages[0].field).toBe('email');
    expect(resendConfirmationEmailResponse.errorsMessages[0].message).toBe('Field "email" is invalid');
    expect(nodemailerAdapterSendMailSpyAndMock).not.toHaveBeenCalled();
    expect(usersServiceCreateSpy).not.toHaveBeenCalled();
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 017 should not resend a confirmation code when user registration already confirmed; 005. POST /api/auth/registration-email-resending', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUserLogin: string = createUserData.login;
    const testUserAgent: string = validUserAgents.userAgent_01;
    await registerUser(app, testUserAgent, createUserData);
    const createdUserDB: UserDBType | null = await usersRepository.findByLoginOrEmail(createdUserLogin);
    const createdUserId: string = String(createdUserDB?._id);

    const emailConfirmationDB_01: EmailConfirmationDBType | null =
      await authRepository.findEmailConfirmationByUserId(createdUserId);

    await confirmUserByCode(app, testUserAgent, emailConfirmationDB_01?.confirmationCode);

    const resendConfirmationEmailResponse: any = await resendConfirmationEmail(
      app,
      testUserAgent,
      createUserData.email,
      HttpStatuses.BadRequest_400
    );

    const confirmedUserDBAfterResending: UserDBType | null = await usersRepository.findByLoginOrEmail(createdUserLogin);

    const emailConfirmationDB_02: EmailConfirmationDBType | null =
      await authRepository.findEmailConfirmationByUserId(createdUserId);

    expect(confirmedUserDBAfterResending?.isConfirmed).toBeTruthy();
    expect(emailConfirmationDB_02).toBeNull();
    expect(resendConfirmationEmailResponse.errorsMessages[0].field).toBe('email');
    expect(resendConfirmationEmailResponse.errorsMessages[0].message).toBe('Registration has already been confirmed');
    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(1);
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceConfirmByCodeSpy).toHaveBeenCalledTimes(1);
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 018 should not resend a confirmation code when an invalid user agent passed; 005. POST /api/auth/registration-email-resending', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUserLogin: string = createUserData.login;
    const createdUserEmail: string = createUserData.email;
    await registerUser(app, validUserAgents.userAgent_01, createUserData);
    const createdUserDB: UserDBType | null = await usersRepository.findByLoginOrEmail(createdUserLogin);
    const createdUserId: string = String(createdUserDB?._id);

    const emailConfirmationDB_01: EmailConfirmationDBType | null =
      await authRepository.findEmailConfirmationByUserId(createdUserId);

    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await resendConfirmationEmail(app, invalidUserAgents.userAgent_01, createdUserEmail, testStatus);
    await resendConfirmationEmail(app, invalidUserAgents.userAgent_02, createdUserEmail, testStatus);

    const createdUserDBAfterResending: UserDBType | null = await usersRepository.findByLoginOrEmail(createdUserLogin);

    const emailConfirmationDB_02: EmailConfirmationDBType | null =
      await authRepository.findEmailConfirmationByUserId(createdUserId);

    expect(createdUserDBAfterResending?.isConfirmed).toBeFalsy();
    expect(emailConfirmationDB_01?.confirmationCode).toBe(emailConfirmationDB_02?.confirmationCode);
    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(1);
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 019 should not resend a confirmation code when a user agent not passed; 005. POST /api/auth/registration-email-resending', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUserLogin: string = createUserData.login;
    const testUserAgent: string = validUserAgents.userAgent_01;
    await registerUser(app, testUserAgent, createUserData);
    const createdUserDB: UserDBType | null = await usersRepository.findByLoginOrEmail(createdUserLogin);
    const createdUserId: string = String(createdUserDB?._id);

    const emailConfirmationDB_01: EmailConfirmationDBType | null =
      await authRepository.findEmailConfirmationByUserId(createdUserId);

    await resendConfirmationEmail(app, testUserAgent, createUserData.email, HttpStatuses.Unauthorized_401, true);

    const createdUserDBAfterResending: UserDBType | null = await usersRepository.findByLoginOrEmail(createdUserLogin);

    const emailConfirmationDB_02: EmailConfirmationDBType | null =
      await authRepository.findEmailConfirmationByUserId(createdUserId);

    expect(createdUserDBAfterResending?.isConfirmed).toBeFalsy();
    expect(emailConfirmationDB_01?.confirmationCode).toBe(emailConfirmationDB_02?.confirmationCode);
    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(1);
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 020 should not resend a confirmation code when more than 5 requests to the same URL during the last 10 seconds have been made; 005. POST /api/auth/registration-email-resending', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUserEmail: string = createUserData.email;
    const testUserAgent: string = validUserAgents.userAgent_01;
    await registerUser(app, testUserAgent, createUserData);
    const testStatus: HttpStatuses = HttpStatuses.TooManyRequest_429;

    await resendConfirmationEmail(app, testUserAgent, createdUserEmail);
    await resendConfirmationEmail(app, testUserAgent, createdUserEmail);
    await resendConfirmationEmail(app, testUserAgent, createdUserEmail);
    await resendConfirmationEmail(app, testUserAgent, createdUserEmail);
    await resendConfirmationEmail(app, testUserAgent, createdUserEmail);
    await resendConfirmationEmail(app, testUserAgent, createdUserEmail, testStatus);
    await resendConfirmationEmail(app, testUserAgent, createdUserEmail, testStatus);
    await delay(5000);
    await setTimeout(5000);
    await resendConfirmationEmail(app, testUserAgent, createdUserEmail);

    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(7);
    expect(usersServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceConfirmByCodeSpy).not.toHaveBeenCalled();
    expect(authServiceUpdateEmailConfirmationByUserIdSpy).toHaveBeenCalledTimes(6);
  }, 15000);

  it('❌ 021 should not send a recovery password mail when an invalid email passed; 008. POST /api/auth/password-recovery', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const createdUserDB: UserDBType | null = await usersRepository.findById(createdUserId);
    const testUserAgent: string = validUserAgents.userAgent_01;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const sendRecoveryPasswordCodeResponse_01: any = await sendRecoveryPasswordCode(
      app,
      testUserAgent,
      { email: invalidUserEmails.email_01 },
      testStatus
    );

    const sendRecoveryPasswordCodeResponse_02: any = await sendRecoveryPasswordCode(
      app,
      testUserAgent,
      { email: invalidUserEmails.email_02 },
      testStatus
    );

    const sendRecoveryPasswordCodeResponse_03: any = await sendRecoveryPasswordCode(
      app,
      testUserAgent,
      { email: invalidUserEmails.email_03 },
      testStatus
    );

    const sendRecoveryPasswordCodeResponse_04: any = await sendRecoveryPasswordCode(
      app,
      testUserAgent,
      { email: invalidUserEmails.email_04 },
      testStatus
    );

    const sendRecoveryPasswordCodeResponse_05: any = await sendRecoveryPasswordCode(
      app,
      testUserAgent,
      { email: invalidUserEmails.email_05 },
      testStatus
    );

    const recoveryPasswordCodeDataDB: RecoveryCodeDataDBType | null =
      await authRepository.findRecoveryPasswordCodeDataByUserId(createdUserId);

    const createdUserDBAfterSendingRecoveryPasswordCode: UserDBType | null =
      await usersRepository.findById(createdUserId);

    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent,
      refreshToken
    );

    expect(createdUserDB?.passwordHash).toBe(createdUserDBAfterSendingRecoveryPasswordCode?.passwordHash);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(recoveryPasswordCodeDataDB).toBeNull();
    expect(sendRecoveryPasswordCodeResponse_01.errorsMessages[0].field).toBe('email');
    expect(sendRecoveryPasswordCodeResponse_01.errorsMessages[0].message).toBe('Field "email" must not be empty');
    expect(sendRecoveryPasswordCodeResponse_02.errorsMessages[0].field).toBe('email');
    expect(sendRecoveryPasswordCodeResponse_02.errorsMessages[0].message).toBe('Field "email" must not be empty');
    expect(sendRecoveryPasswordCodeResponse_03.errorsMessages[0].field).toBe('email');
    expect(sendRecoveryPasswordCodeResponse_03.errorsMessages[0].message).toBe('Field "email" is invalid');
    expect(sendRecoveryPasswordCodeResponse_04.errorsMessages[0].field).toBe('email');
    expect(sendRecoveryPasswordCodeResponse_04.errorsMessages[0].message).toBe('Field "email" is invalid');
    expect(sendRecoveryPasswordCodeResponse_05.errorsMessages[0].field).toBe('email');
    expect(sendRecoveryPasswordCodeResponse_05.errorsMessages[0].message).toBe('Field "email" must be a string');

    expect(nodemailerAdapterSendMailSpyAndMock).not.toHaveBeenCalled();
    expect(authRepositoryDeleteAllRecoveryCodesDataByUserIdSpy).not.toHaveBeenCalled();
    expect(authRepositoryCreateRecoveryPasswordCodeSpy).not.toHaveBeenCalled();
    expect(usersServiceUpdatePasswordByRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(usersRepositoryUpdatePasswordHashByIdSpy).not.toHaveBeenCalled();
    expect(authServiceDeleteRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(authServiceRevokeAllSessionsByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 022 should not send a recovery password mail when an incorrect email passed; 008. POST /api/auth/password-recovery', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const createdUserDB: UserDBType | null = await usersRepository.findById(createdUserId);
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    await sendRecoveryPasswordCode(app, testUserAgent, { email: validUserEmails.email_01 });

    const recoveryPasswordCodeDataDB: RecoveryCodeDataDBType | null =
      await authRepository.findRecoveryPasswordCodeDataByUserId(createdUserId);

    const createdUserDBAfterSendingRecoveryPasswordCode: UserDBType | null =
      await usersRepository.findById(createdUserId);

    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent,
      refreshToken
    );

    expect(createdUserDB?.passwordHash).toBe(createdUserDBAfterSendingRecoveryPasswordCode?.passwordHash);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(recoveryPasswordCodeDataDB).toBeNull();
    expect(nodemailerAdapterSendMailSpyAndMock).not.toHaveBeenCalled();
    expect(authRepositoryDeleteAllRecoveryCodesDataByUserIdSpy).not.toHaveBeenCalled();
    expect(authRepositoryCreateRecoveryPasswordCodeSpy).not.toHaveBeenCalled();
    expect(usersServiceUpdatePasswordByRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(usersRepositoryUpdatePasswordHashByIdSpy).not.toHaveBeenCalled();
    expect(authServiceDeleteRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(authServiceRevokeAllSessionsByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 023 should not send a recovery password mail when an invalid user agent passed; 008. POST /api/auth/password-recovery', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const createdUserDB: UserDBType | null = await usersRepository.findById(createdUserId);
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await sendRecoveryPasswordCode(app, invalidUserAgents.userAgent_01, createUserData.email, testStatus);
    await sendRecoveryPasswordCode(app, invalidUserAgents.userAgent_02, createUserData.email, testStatus);

    const recoveryPasswordCodeDataDB: RecoveryCodeDataDBType | null =
      await authRepository.findRecoveryPasswordCodeDataByUserId(createdUserId);

    const createdUserDBAfterSendingRecoveryPasswordCode: UserDBType | null =
      await usersRepository.findById(createdUserId);

    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent,
      refreshToken
    );

    expect(createdUserDB?.passwordHash).toBe(createdUserDBAfterSendingRecoveryPasswordCode?.passwordHash);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(recoveryPasswordCodeDataDB).toBeNull();
    expect(nodemailerAdapterSendMailSpyAndMock).not.toHaveBeenCalled();
    expect(authRepositoryDeleteAllRecoveryCodesDataByUserIdSpy).not.toHaveBeenCalled();
    expect(authRepositoryCreateRecoveryPasswordCodeSpy).not.toHaveBeenCalled();
    expect(usersServiceUpdatePasswordByRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(usersRepositoryUpdatePasswordHashByIdSpy).not.toHaveBeenCalled();
    expect(authServiceDeleteRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(authServiceRevokeAllSessionsByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 024 should not send a recovery password mail when a user agent not passed; 008. POST /api/auth/password-recovery', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const createdUserDB: UserDBType | null = await usersRepository.findById(createdUserId);
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await sendRecoveryPasswordCode(app, testUserAgent, createUserData.email, testStatus, true);

    const recoveryPasswordCodeDataDB: RecoveryCodeDataDBType | null =
      await authRepository.findRecoveryPasswordCodeDataByUserId(createdUserId);

    const createdUserDBAfterSendingRecoveryPasswordCode: UserDBType | null =
      await usersRepository.findById(createdUserId);

    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent,
      refreshToken
    );

    expect(createdUserDB?.passwordHash).toBe(createdUserDBAfterSendingRecoveryPasswordCode?.passwordHash);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(recoveryPasswordCodeDataDB).toBeNull();
    expect(nodemailerAdapterSendMailSpyAndMock).not.toHaveBeenCalled();
    expect(authRepositoryDeleteAllRecoveryCodesDataByUserIdSpy).not.toHaveBeenCalled();
    expect(authRepositoryCreateRecoveryPasswordCodeSpy).not.toHaveBeenCalled();
    expect(usersServiceUpdatePasswordByRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(usersRepositoryUpdatePasswordHashByIdSpy).not.toHaveBeenCalled();
    expect(authServiceDeleteRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(authServiceRevokeAllSessionsByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 025 should not send a recovery password mail when more than 5 requests to the same URL during the last 10 seconds have been made; 008. POST /api/auth/password-recovery', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const createdUserDB: UserDBType | null = await usersRepository.findById(createdUserId);
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const testStatus: HttpStatuses = HttpStatuses.TooManyRequest_429;

    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email });
    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email });
    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email });
    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email });
    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email });
    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email }, testStatus);
    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email }, testStatus);
    await delay(5000);
    await setTimeout(5000);
    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email });

    const recoveryPasswordCodeDataDB: RecoveryCodeDataDBType | null =
      await authRepository.findRecoveryPasswordCodeDataByUserId(createdUserId);

    const createdUserDBAfterSendingRecoveryPasswordCode: UserDBType | null =
      await usersRepository.findById(createdUserId);

    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent,
      refreshToken
    );

    expect(createdUserDB?.passwordHash).toBe(createdUserDBAfterSendingRecoveryPasswordCode?.passwordHash);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(recoveryPasswordCodeDataDB).not.toBeNull();
    expect(typeof recoveryPasswordCodeDataDB?.recoveryCode).toBe('string');
    expect(recoveryPasswordCodeDataDB?.userId).toBe(createdUserId);
    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(6);
    expect(authRepositoryDeleteAllRecoveryCodesDataByUserIdSpy).toHaveBeenCalledTimes(6);
    expect(authRepositoryCreateRecoveryPasswordCodeSpy).toHaveBeenCalledTimes(6);
    expect(usersServiceUpdatePasswordByRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(usersRepositoryUpdatePasswordHashByIdSpy).not.toHaveBeenCalled();
    expect(authServiceDeleteRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(authServiceRevokeAllSessionsByUserIdSpy).not.toHaveBeenCalled();
  }, 15000);

  it('❌ 026 should not set a new password when an invalid body passed; 009. POST /api/auth/new-password', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const createdUserDB: UserDBType | null = await usersRepository.findById(createdUserId);
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email });

    const recoveryPasswordCodeDataDB: RecoveryCodeDataDBType | null =
      await authRepository.findRecoveryPasswordCodeDataByUserId(createdUserId);

    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const setNewPasswordByRecoveryCodeResponse_01: any = await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      { newPassword: invalidUserPasswords.password_01, recoveryCode: recoveryPasswordCodeDataDB?.recoveryCode },
      testStatus
    );

    const setNewPasswordByRecoveryCodeResponse_02: any = await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      {
        newPassword: invalidUserPasswords.password_02,
        recoveryCode: recoveryPasswordCodeDataDB?.recoveryCode,
      },
      testStatus
    );

    const setNewPasswordByRecoveryCodeResponse_03: any = await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      { newPassword: invalidUserPasswords.password_03, recoveryCode: recoveryPasswordCodeDataDB?.recoveryCode },
      testStatus
    );

    const setNewPasswordByRecoveryCodeResponse_04: any = await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      { newPassword: invalidUserPasswords.password_04, recoveryCode: recoveryPasswordCodeDataDB?.recoveryCode },
      testStatus
    );

    const setNewPasswordByRecoveryCodeResponse_05: any = await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      { newPassword: invalidUserPasswords.password_05, recoveryCode: recoveryPasswordCodeDataDB?.recoveryCode },
      testStatus
    );

    await delay(5000);
    await setTimeout(5000);

    const setNewPasswordByRecoveryCodeResponse_06: any = await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      { newPassword: invalidUserPasswords.password_06, recoveryCode: recoveryPasswordCodeDataDB?.recoveryCode },
      testStatus
    );

    const setNewPasswordByRecoveryCodeResponse_07: any = await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      { newPassword: validUserPasswords.password_01, recoveryCode: invalidRecoveryCodes.code_01 },
      testStatus
    );

    const setNewPasswordByRecoveryCodeResponse_08: any = await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      { newPassword: validUserPasswords.password_01, recoveryCode: invalidRecoveryCodes.code_02 },
      testStatus
    );

    const setNewPasswordByRecoveryCodeResponse_09: any = await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      { newPassword: validUserPasswords.password_01, recoveryCode: invalidRecoveryCodes.code_03 },
      testStatus
    );

    const setNewPasswordByRecoveryCodeResponse_10: any = await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      { newPassword: validUserPasswords.password_01, recoveryCode: invalidRecoveryCodes.code_04 },
      testStatus
    );

    await delay(5000);
    await setTimeout(5000);

    const setNewPasswordByRecoveryCodeResponse_11: any = await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      { newPassword: validUserPasswords.password_01, recoveryCode: invalidRecoveryCodes.code_05 },
      testStatus
    );

    const setNewPasswordByRecoveryCodeResponse_12: any = await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      { newPassword: validUserPasswords.password_01, recoveryCode: invalidRecoveryCodes.code_06 },
      testStatus
    );

    const setNewPasswordByRecoveryCodeResponse_13: any = await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      { newPassword: validUserPasswords.password_01, recoveryCode: invalidRecoveryCodes.code_07 },
      testStatus
    );

    const setNewPasswordByRecoveryCodeResponse_14: any = await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      { newPassword: validUserPasswords.password_01, recoveryCode: invalidRecoveryCodes.code_08 },
      testStatus
    );

    const createdUserDBAfterSettingNewPassword: UserDBType | null = await usersRepository.findById(createdUserId);
    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent,
      refreshToken
    );

    expect(createdUserDB?.passwordHash).toBe(createdUserDBAfterSettingNewPassword?.passwordHash);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(setNewPasswordByRecoveryCodeResponse_01.errorsMessages[0].field).toBe('newPassword');

    expect(setNewPasswordByRecoveryCodeResponse_01.errorsMessages[0].message).toBe(
      'Field "newPassword" must not be empty'
    );

    expect(setNewPasswordByRecoveryCodeResponse_02.errorsMessages[0].field).toBe('newPassword');

    expect(setNewPasswordByRecoveryCodeResponse_02.errorsMessages[0].message).toBe(
      'Field "newPassword" must not be empty'
    );

    expect(setNewPasswordByRecoveryCodeResponse_03.errorsMessages[0].field).toBe('newPassword');

    expect(setNewPasswordByRecoveryCodeResponse_03.errorsMessages[0].message).toBe(
      'Field "newPassword" must be between 6 and 20 characters'
    );

    expect(setNewPasswordByRecoveryCodeResponse_04.errorsMessages[0].field).toBe('newPassword');

    expect(setNewPasswordByRecoveryCodeResponse_04.errorsMessages[0].message).toBe(
      'Field "newPassword" must be between 6 and 20 characters'
    );

    expect(setNewPasswordByRecoveryCodeResponse_05.errorsMessages[0].field).toBe('newPassword');

    expect(setNewPasswordByRecoveryCodeResponse_05.errorsMessages[0].message).toBe(
      'Field "newPassword" must be between 6 and 20 characters'
    );

    expect(setNewPasswordByRecoveryCodeResponse_06.errorsMessages[0].field).toBe('newPassword');

    expect(setNewPasswordByRecoveryCodeResponse_06.errorsMessages[0].message).toBe(
      'Field "newPassword" must be a string'
    );

    expect(setNewPasswordByRecoveryCodeResponse_07.errorsMessages[0].field).toBe('recoveryCode');

    expect(setNewPasswordByRecoveryCodeResponse_07.errorsMessages[0].message).toBe(
      'Field "recoveryCode" must not be empty'
    );

    expect(setNewPasswordByRecoveryCodeResponse_08.errorsMessages[0].field).toBe('recoveryCode');

    expect(setNewPasswordByRecoveryCodeResponse_08.errorsMessages[0].message).toBe(
      'Field "recoveryCode" must not be empty'
    );

    expect(setNewPasswordByRecoveryCodeResponse_09.errorsMessages[0].field).toBe('recoveryCode');
    expect(setNewPasswordByRecoveryCodeResponse_09.errorsMessages[0].message).toBe('Field "recoveryCode" is invalid');
    expect(setNewPasswordByRecoveryCodeResponse_10.errorsMessages[0].field).toBe('recoveryCode');
    expect(setNewPasswordByRecoveryCodeResponse_10.errorsMessages[0].message).toBe('Field "recoveryCode" is invalid');
    expect(setNewPasswordByRecoveryCodeResponse_11.errorsMessages[0].field).toBe('recoveryCode');
    expect(setNewPasswordByRecoveryCodeResponse_11.errorsMessages[0].message).toBe('Field "recoveryCode" is invalid');
    expect(setNewPasswordByRecoveryCodeResponse_12.errorsMessages[0].field).toBe('recoveryCode');

    expect(setNewPasswordByRecoveryCodeResponse_12.errorsMessages[0].message).toBe(
      'Field "recoveryCode" must be a string'
    );

    expect(setNewPasswordByRecoveryCodeResponse_13.errorsMessages[0].field).toBe('recoveryCode');
    expect(setNewPasswordByRecoveryCodeResponse_13.errorsMessages[0].message).toBe('Field "recoveryCode" is required');
    expect(setNewPasswordByRecoveryCodeResponse_14.errorsMessages[0].field).toBe('recoveryCode');

    expect(setNewPasswordByRecoveryCodeResponse_14.errorsMessages[0].message).toBe(
      'Field "recoveryCode" must be a string'
    );

    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(1);
    expect(authRepositoryDeleteAllRecoveryCodesDataByUserIdSpy).toHaveBeenCalledTimes(1);
    expect(authRepositoryCreateRecoveryPasswordCodeSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceUpdatePasswordByRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(usersRepositoryUpdatePasswordHashByIdSpy).not.toHaveBeenCalled();
    expect(authServiceDeleteRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(authServiceRevokeAllSessionsByUserIdSpy).not.toHaveBeenCalled();
  }, 35000);

  it('❌ 027 should not set a new password when an incorrect recovery code passed; 009. POST /api/auth/new-password', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const createdUserDB: UserDBType | null = await usersRepository.findById(createdUserId);
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email });

    const setNewPasswordByRecoveryCodeResponse: any = await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      { newPassword: validUserPasswords.password_01, recoveryCode: validUUIDs.uuid_01 },
      HttpStatuses.BadRequest_400
    );

    const createdUserDBAfterSettingNewPassword: UserDBType | null = await usersRepository.findById(createdUserId);
    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent,
      refreshToken
    );

    expect(createdUserDB?.passwordHash).toBe(createdUserDBAfterSettingNewPassword?.passwordHash);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(setNewPasswordByRecoveryCodeResponse.errorsMessages[0].field).toBe('recoveryCode');
    expect(setNewPasswordByRecoveryCodeResponse.errorsMessages[0].message).toBe('Field "recoveryCode" is invalid');
    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(1);
    expect(authRepositoryDeleteAllRecoveryCodesDataByUserIdSpy).toHaveBeenCalledTimes(1);
    expect(authRepositoryCreateRecoveryPasswordCodeSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceUpdatePasswordByRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(usersRepositoryUpdatePasswordHashByIdSpy).not.toHaveBeenCalled();
    expect(authServiceDeleteRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(authServiceRevokeAllSessionsByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 028 should not set a new password when an expired recovery code passed; 009. POST /api/auth/new-password', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const createdUserDB: UserDBType | null = await usersRepository.findById(createdUserId);
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    await authRepository.createRecoveryPasswordCodeData(
      createdUserId,
      expiredRecoveryCodeData.recoveryCode,
      expiredRecoveryCodeData.expirationDate
    );

    const setNewPasswordByRecoveryCodeResponse: any = await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      { newPassword: validUserPasswords.password_01, recoveryCode: expiredRecoveryCodeData.recoveryCode },
      HttpStatuses.BadRequest_400
    );

    const createdUserDBAfterSettingNewPassword: UserDBType | null = await usersRepository.findById(createdUserId);
    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent,
      refreshToken
    );

    expect(createdUserDB?.passwordHash).toBe(createdUserDBAfterSettingNewPassword?.passwordHash);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(setNewPasswordByRecoveryCodeResponse.errorsMessages[0].field).toBe('recoveryCode');
    expect(setNewPasswordByRecoveryCodeResponse.errorsMessages[0].message).toBe('Recovery code is expired');
    expect(nodemailerAdapterSendMailSpyAndMock).not.toHaveBeenCalled();
    expect(authRepositoryDeleteAllRecoveryCodesDataByUserIdSpy).not.toHaveBeenCalled();
    expect(authRepositoryCreateRecoveryPasswordCodeSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceUpdatePasswordByRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(usersRepositoryUpdatePasswordHashByIdSpy).not.toHaveBeenCalled();
    expect(authServiceDeleteRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(authServiceRevokeAllSessionsByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 029 should not set a new password when an invalid user agent passed; 009. POST /api/auth/new-password', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const createdUserDB: UserDBType | null = await usersRepository.findById(createdUserId);
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email });

    const recoveryPasswordCodeDataDB: RecoveryCodeDataDBType | null =
      await authRepository.findRecoveryPasswordCodeDataByUserId(createdUserId);

    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await setNewPasswordByRecoveryCode(
      app,
      invalidUserAgents.userAgent_01,
      { newPassword: validUserPasswords.password_01, recoveryCode: recoveryPasswordCodeDataDB?.recoveryCode },
      testStatus
    );

    await setNewPasswordByRecoveryCode(
      app,
      invalidUserAgents.userAgent_02,
      { newPassword: validUserPasswords.password_01, recoveryCode: recoveryPasswordCodeDataDB?.recoveryCode },
      testStatus
    );

    const createdUserDBAfterSettingNewPassword: UserDBType | null = await usersRepository.findById(createdUserId);
    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent,
      refreshToken
    );

    expect(createdUserDB?.passwordHash).toBe(createdUserDBAfterSettingNewPassword?.passwordHash);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(1);
    expect(authRepositoryDeleteAllRecoveryCodesDataByUserIdSpy).toHaveBeenCalledTimes(1);
    expect(authRepositoryCreateRecoveryPasswordCodeSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceUpdatePasswordByRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(usersRepositoryUpdatePasswordHashByIdSpy).not.toHaveBeenCalled();
    expect(authServiceDeleteRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(authServiceRevokeAllSessionsByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 030 should not set a new password when a user agent not passed; 009. POST /api/auth/new-password', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const createdUserDB: UserDBType | null = await usersRepository.findById(createdUserId);
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email });

    const recoveryPasswordCodeDataDB: RecoveryCodeDataDBType | null =
      await authRepository.findRecoveryPasswordCodeDataByUserId(createdUserId);

    await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      { newPassword: validUserPasswords.password_01, recoveryCode: recoveryPasswordCodeDataDB?.recoveryCode },
      HttpStatuses.Unauthorized_401,
      true
    );

    const createdUserDBAfterSettingNewPassword: UserDBType | null = await usersRepository.findById(createdUserId);
    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent,
      refreshToken
    );

    expect(createdUserDB?.passwordHash).toBe(createdUserDBAfterSettingNewPassword?.passwordHash);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(1);
    expect(authRepositoryDeleteAllRecoveryCodesDataByUserIdSpy).toHaveBeenCalledTimes(1);
    expect(authRepositoryCreateRecoveryPasswordCodeSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceUpdatePasswordByRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(usersRepositoryUpdatePasswordHashByIdSpy).not.toHaveBeenCalled();
    expect(authServiceDeleteRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(authServiceRevokeAllSessionsByUserIdSpy).not.toHaveBeenCalled();
  });

  it('❌ 031 should not set a new password when more than 5 requests to the same URL during the last 10 seconds have been made; 009. POST /api/auth/new-password', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const createdUserDB: UserDBType | null = await usersRepository.findById(createdUserId);
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const testStatus: HttpStatuses = HttpStatuses.TooManyRequest_429;

    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email });

    const recoveryPasswordCodeDataDB_01: RecoveryCodeDataDBType | null =
      await authRepository.findRecoveryPasswordCodeDataByUserId(createdUserId);

    await setNewPasswordByRecoveryCode(app, testUserAgent, {
      newPassword: validUserPasswords.password_01,
      recoveryCode: recoveryPasswordCodeDataDB_01?.recoveryCode,
    });

    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email });

    const recoveryPasswordCodeDataDB_02: RecoveryCodeDataDBType | null =
      await authRepository.findRecoveryPasswordCodeDataByUserId(createdUserId);

    await setNewPasswordByRecoveryCode(app, testUserAgent, {
      newPassword: validUserPasswords.password_01,
      recoveryCode: recoveryPasswordCodeDataDB_02?.recoveryCode,
    });

    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email });

    const recoveryPasswordCodeDataDB_03: RecoveryCodeDataDBType | null =
      await authRepository.findRecoveryPasswordCodeDataByUserId(createdUserId);

    await setNewPasswordByRecoveryCode(app, testUserAgent, {
      newPassword: validUserPasswords.password_01,
      recoveryCode: recoveryPasswordCodeDataDB_03?.recoveryCode,
    });

    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email });

    const recoveryPasswordCodeDataDB_04: RecoveryCodeDataDBType | null =
      await authRepository.findRecoveryPasswordCodeDataByUserId(createdUserId);

    await setNewPasswordByRecoveryCode(app, testUserAgent, {
      newPassword: validUserPasswords.password_01,
      recoveryCode: recoveryPasswordCodeDataDB_04?.recoveryCode,
    });

    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email });

    const recoveryPasswordCodeDataDB_05: RecoveryCodeDataDBType | null =
      await authRepository.findRecoveryPasswordCodeDataByUserId(createdUserId);

    await setNewPasswordByRecoveryCode(app, testUserAgent, {
      newPassword: validUserPasswords.password_01,
      recoveryCode: recoveryPasswordCodeDataDB_05?.recoveryCode,
    });

    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email }, testStatus);

    const recoveryPasswordCodeDataDB_06: RecoveryCodeDataDBType | null =
      await authRepository.findRecoveryPasswordCodeDataByUserId(createdUserId);

    await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      { newPassword: validUserPasswords.password_01, recoveryCode: recoveryPasswordCodeDataDB_06?.recoveryCode },
      testStatus
    );

    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email }, testStatus);

    const recoveryPasswordCodeDataDB_07: RecoveryCodeDataDBType | null =
      await authRepository.findRecoveryPasswordCodeDataByUserId(createdUserId);

    await setNewPasswordByRecoveryCode(
      app,
      testUserAgent,
      { newPassword: validUserPasswords.password_01, recoveryCode: recoveryPasswordCodeDataDB_07?.recoveryCode },
      testStatus
    );

    await delay(5000);
    await setTimeout(5000);

    await sendRecoveryPasswordCode(app, testUserAgent, { email: createUserData.email });

    const recoveryPasswordCodeDataDB_08: RecoveryCodeDataDBType | null =
      await authRepository.findRecoveryPasswordCodeDataByUserId(createdUserId);

    await setNewPasswordByRecoveryCode(app, testUserAgent, {
      newPassword: validUserPasswords.password_01,
      recoveryCode: recoveryPasswordCodeDataDB_08?.recoveryCode,
    });

    const createdUserDBAfterSettingNewPassword: UserDBType | null = await usersRepository.findById(createdUserId);
    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);
    await getSecurityDeviceList(app, testUserAgent, refreshToken, undefined, HttpStatuses.Unauthorized_401);
    expect(createdUserDB?.passwordHash).not.toBe(createdUserDBAfterSettingNewPassword?.passwordHash);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(0);
    expect(nodemailerAdapterSendMailSpyAndMock).toHaveBeenCalledTimes(6);
    expect(authRepositoryDeleteAllRecoveryCodesDataByUserIdSpy).toHaveBeenCalledTimes(6);
    expect(authRepositoryCreateRecoveryPasswordCodeSpy).toHaveBeenCalledTimes(6);
    expect(usersServiceUpdatePasswordByRecoveryCodeSpy).toHaveBeenCalledTimes(6);
    expect(usersRepositoryUpdatePasswordHashByIdSpy).toHaveBeenCalledTimes(6);
    expect(authServiceDeleteRecoveryCodeSpy).toHaveBeenCalledTimes(6);
    expect(authServiceRevokeAllSessionsByUserIdSpy).toHaveBeenCalledTimes(6);
  }, 15000);
});
