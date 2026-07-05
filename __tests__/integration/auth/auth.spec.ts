import { getCreateUserInputDTO } from '../../utils/users/input-dto-utils/get-create-user-input-dto.test-util';
import { doBeforeTestsWithMongoMemoryServer } from '../../utils/common/do-before-tests.test-util';
import { CreateUserInputDTO } from '../../../src/users/routes/input-dto/create-user.input-dto';
import { NodemailerAdapter } from '../../../src/auth/adapters/nodemailer.adapter';
import { AuthService } from '../../../src/auth/application/auth.service';
import { ResultStatuses } from '../../../src/core/types/result/result-statuses';
import { emailExamples } from '../../../src/auth/email/email-examples';
import { UsersRepository } from '../../../src/users/repositories/users.repository';
import { UserDBType } from '../../../src/users/repositories/types/user-db.type';
import { confirmUserByCode } from '../../utils/auth/confirm-user-by-code.test-util';
import { Result } from '../../../src/core/types/result/result.type';
import { createMockEmailAdapter } from '../../test-doubles/mocks';
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
import { validUserAgents, validUUIDRegExp } from '../../test-data/auth.test-data';
import { EmailConfirmationDBType } from '../../../src/auth/repositories/types/email-сonfirmation-db.type';
import { AuthRepository } from '../../../src/auth/repositories/auth.repository';
import { UserOutputDTO } from '../../../src/users/routes/output-dto/user.output-dto';
import { createUser } from '../../utils/users/create-user.test-util';
import { RecoveryCodeDataDBType } from '../../../src/auth/repositories/types/recovery-code-data-db.type';
import { SessionDBType } from '../../../src/auth/repositories/types/session-db.type';
import { setNewPasswordByRecoveryCode } from '../../utils/auth/set-new-password-by-recovery-code.test-util';
import { validUserPasswords } from '../../test-data/users.test-data';
import { SecurityDeviceListOutputDTO } from '../../../src/security-devices/routes/output-dto/security-device-list.output-dto';
import { getSecurityDeviceList } from '../../utils/security-devices/get-security-device-list.test-util';
import { loginUserReturnAccessAndRefreshTokens } from '../../utils/auth/login-user-return-access-and-refresh-tokens.test-util';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { container } from '../../../src/ioc/container';
import { TYPES } from '../../../src/ioc/types';

describe('Auth', () => {
  const app = doBeforeTestsWithMongoMemoryServer();
  const mockEmailAdapter: jest.Mocked<NodemailerAdapter> = createMockEmailAdapter();
  /*Подменяем "NodemailerAdapter". Важно делать до получения сервиса, в котором используется мок, то есть до сервиса
  "AuthService".*/
  container.rebind<NodemailerAdapter>(TYPES.NodemailerAdapter).toConstantValue(mockEmailAdapter);
  /*Поскольку сервис "AuthService" является синглтоном, то переопределяем зависимости, чтобы выбросит старый синглтон и
  собрать новый с целью подхвата мока для "NodemailerAdapter".*/
  container.rebind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
  const authService = container.get<AuthService>(TYPES.AuthService);
  const authRepository = container.get<AuthRepository>(TYPES.AuthRepository);
  const usersRepository = container.get<UsersRepository>(TYPES.UsersRepository);
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

  it('✅ 001 should register a user when a valid body passed; 003. POST /api/auth/registration', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();

    const registerUserResult: Result<{ createdUserId: string }> = await authService.registerUser(createUserData);

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
  });

  it('✅ 002 should confirm user registration when a correct confirmation code passed; 004. POST /api/auth/registration-confirmation', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const registerUserResult: Result<{ createdUserId: string }> = await authService.registerUser(createUserData);
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
  });

  it('✅ 003 should resend a confirmation mail when a correct email passed; 005. POST /api/auth/registration-email-resending', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const registerUserResult: Result<{ createdUserId: string }> = await authService.registerUser(createUserData);
    const createdUserId: string = registerUserResult.data.createdUserId;
    const createdUserDBBeforeResending: UserDBType | null = await usersRepository.findById(createdUserId);

    const emailConfirmationDBBeforeResending: EmailConfirmationDBType | null =
      await authRepository.findEmailConfirmationByUserId(createdUserId);

    const resendConfirmationEmailResult: Result<{} | null> = await authService.resendConfirmationEmail(
      createUserData.email
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
  });

  it('✅ 004 should confirm user registration after resending a confirmation email when a correct confirmation code passed; 004. POST /api/auth/registration-confirmation', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const registerUserResult: Result<{ createdUserId: string }> = await authService.registerUser(createUserData);
    const createdUserId: string = registerUserResult.data.createdUserId;
    await authService.resendConfirmationEmail(createUserData.email);

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
  });

  it('✅ 005 should send a recovery password mail when a correct email passed; 008. POST /api/auth/password-recovery', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const createdUserEmail: string = createdUser.email;
    const createdUserDB: UserDBType | null = await usersRepository.findById(createdUserId);
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const sendRecoveryPasswordCodeResult: Result<{}> = await authService.sendRecoveryPasswordCode(createdUserEmail);

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
    expect(sendRecoveryPasswordCodeResult.status).toBe(ResultStatuses.NoContent);
    expect(sendRecoveryPasswordCodeResult.extensions).toBeInstanceOf(Array);
    expect(mockEmailAdapter.sendMail).toHaveBeenCalledTimes(1);
    expect(authRepositoryDeleteAllRecoveryCodesDataByUserIdSpy).toHaveBeenCalledTimes(1);
    expect(authRepositoryCreateRecoveryPasswordCodeSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceUpdatePasswordByRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(usersRepositoryUpdatePasswordHashByIdSpy).not.toHaveBeenCalled();
    expect(authServiceDeleteRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(authServiceRevokeAllSessionsByUserIdSpy).not.toHaveBeenCalled();

    expect(mockEmailAdapter.sendMail).toHaveBeenCalledWith(
      createdUserEmail,
      'Recover Password',
      expect.stringMatching(validUUIDRegExp),
      emailExamples.passwordRecoveryEmail
    );
  });

  it('✅ 006 should set a new password when a valid body passed; 009. POST /api/auth/new-password', async () => {
    const usersRepositoryUpdatePasswordHashByIdSpy: jest.SpyInstance = createUsersRepositoryUpdatePasswordHashByIdSpy();
    const authServiceDeleteRecoveryCodeSpy: jest.SpyInstance = createAuthServiceDeleteRecoveryCodeDataSpy();
    const authServiceRevokeAllSessionsByUserIdSpy: jest.SpyInstance = createAuthServiceRevokeAllSessionsByUserIdSpy();

    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const createdUserEmail: string = createdUser.email;
    const createdUserDB: UserDBType | null = await usersRepository.findById(createdUserId);
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    await authService.sendRecoveryPasswordCode(createdUserEmail);

    const recoveryPasswordCodeDataDB: RecoveryCodeDataDBType | null =
      await authRepository.findRecoveryPasswordCodeDataByUserId(createdUserId);

    await setNewPasswordByRecoveryCode(app, testUserAgent, {
      newPassword: validUserPasswords.password_01,
      recoveryCode: recoveryPasswordCodeDataDB?.recoveryCode,
    });

    const createdUserDBAfterSettingNewPassword: UserDBType | null = await usersRepository.findById(createdUserId);
    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);
    await getSecurityDeviceList(app, testUserAgent, refreshToken, undefined, HttpStatuses.Unauthorized_401);
    expect(createdUserDB?.passwordHash).not.toBe(createdUserDBAfterSettingNewPassword?.passwordHash);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(0);
    expect(mockEmailAdapter.sendMail).toHaveBeenCalledTimes(1);
    expect(authRepositoryDeleteAllRecoveryCodesDataByUserIdSpy).toHaveBeenCalledTimes(1);
    expect(authRepositoryCreateRecoveryPasswordCodeSpy).toHaveBeenCalledTimes(1);
    expect(usersServiceUpdatePasswordByRecoveryCodeSpy).toHaveBeenCalledTimes(1);
    expect(usersRepositoryUpdatePasswordHashByIdSpy).toHaveBeenCalledTimes(1);
    expect(authServiceDeleteRecoveryCodeSpy).toHaveBeenCalledTimes(1);
    expect(authServiceRevokeAllSessionsByUserIdSpy).toHaveBeenCalledTimes(1);

    expect(mockEmailAdapter.sendMail).toHaveBeenCalledWith(
      createdUserEmail,
      'Recover Password',
      expect.stringMatching(validUUIDRegExp),
      emailExamples.passwordRecoveryEmail
    );
  });
});
