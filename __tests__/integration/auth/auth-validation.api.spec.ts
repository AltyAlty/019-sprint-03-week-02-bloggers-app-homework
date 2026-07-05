import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { createUser } from '../../utils/users/create-user.test-util';
import { getCreateUserInputDTO } from '../../utils/users/input-dto-utils/get-create-user-input-dto.test-util';
import { loginUserReturnAccessToken } from '../../utils/auth/login-user-return-access-token.test-util';
import { doBeforeTestsWithMongoMemoryServer } from '../../utils/common/do-before-tests.test-util';
import { CreateUserInputDTO } from '../../../src/users/routes/input-dto/create-user.input-dto';
import { UserOutputDTO } from '../../../src/users/routes/output-dto/user.output-dto';
import { LoginDataInputDTO } from '../../../src/auth/routes/input-dto/login-data.input-dto';
import { getAuthDataByAccessToken } from '../../utils/auth/get-auth-data-by-access-token.test-util';
import {
  invalidAccessTokens,
  invalidRefreshTokens,
  invalidUserAgents,
  validAccessTokens,
  validRefreshTokens,
  validUserAgents,
} from '../../test-data/auth.test-data';
import { loginUserReturnAccessAndRefreshTokens } from '../../utils/auth/login-user-return-access-and-refresh-tokens.test-util';
import { refreshAccessAndRefreshTokens } from '../../utils/auth/refresh-access-and-refresh-tokens.test-util';
import { JwtAdapter } from '../../../src/auth/adapters/jwt.adapter';
import { revokeSession } from '../../utils/auth/revoke-session.test-util';
import {
  invalidUserLoginsOrEmails,
  invalidUserPasswords,
  validUserEmails,
  validUserLogins,
  validUserPasswords,
} from '../../test-data/users.test-data';
import { delay } from '../../utils/common/delay.test-util';
import { setTimeout } from 'timers/promises';
import { SessionDBType } from '../../../src/auth/repositories/types/session-db.type';
import { AuthRepository } from '../../../src/auth/repositories/auth.repository';
import { SecurityDeviceListOutputDTO } from '../../../src/security-devices/routes/output-dto/security-device-list.output-dto';
import { getSecurityDeviceList } from '../../utils/security-devices/get-security-device-list.test-util';
import { SecurityDeviceOutputDTO } from '../../../src/security-devices/routes/output-dto/security-device.output-dto';
import { container } from '../../../src/ioc/container';
import { TYPES } from '../../../src/ioc/types';

describe('Auth API Validation', () => {
  const app = doBeforeTestsWithMongoMemoryServer();
  const jwtAdapter = container.get<JwtAdapter>(TYPES.JwtAdapter);
  const authRepository = container.get<AuthRepository>(TYPES.AuthRepository);

  it('❌ 001 should not authenticate a user when invalid credentials passed; 001. POST /api/auth/login', async () => {
    const createdUser: UserOutputDTO = await createUser(app, getCreateUserInputDTO());
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await loginUserReturnAccessToken(app, { loginOrEmail: invalidUserLoginsOrEmails.loginOrEmail_01 }, testStatus);
    await loginUserReturnAccessToken(app, { loginOrEmail: invalidUserLoginsOrEmails.loginOrEmail_02 }, testStatus);
    await loginUserReturnAccessToken(app, { loginOrEmail: invalidUserLoginsOrEmails.loginOrEmail_03 }, testStatus);
    await loginUserReturnAccessToken(app, { password: invalidUserPasswords.password_01 }, testStatus);
    await loginUserReturnAccessToken(app, { password: invalidUserPasswords.password_02 }, testStatus);
    await delay(5000);
    await setTimeout(5000);
    await loginUserReturnAccessToken(app, { password: invalidUserPasswords.password_03 }, testStatus);
    await loginUserReturnAccessToken(app, { password: invalidUserPasswords.password_04 }, testStatus);
    await loginUserReturnAccessToken(app, { password: invalidUserPasswords.password_05 }, testStatus);
    await loginUserReturnAccessToken(app, { password: invalidUserPasswords.password_06 }, testStatus);
    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUser.id);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(0);
  }, 15000);

  it('❌ 002 should not authenticate a user when incorrect credentials passed; 001. POST /api/auth/login', async () => {
    const createUserData_01: CreateUserInputDTO = getCreateUserInputDTO();

    const createUserData_02: CreateUserInputDTO = {
      login: validUserLogins.login_01,
      password: validUserPasswords.password_01,
      email: validUserEmails.email_01,
    };

    const createdUser_01: UserOutputDTO = await createUser(app, createUserData_01);
    const createdUser_02: UserOutputDTO = await createUser(app, createUserData_02);
    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await loginUserReturnAccessToken(
      app,
      { loginOrEmail: createUserData_02.login, password: createUserData_01.password },
      testStatus
    );

    await loginUserReturnAccessToken(
      app,
      { loginOrEmail: createUserData_02.email, password: createUserData_01.password },
      testStatus
    );

    await loginUserReturnAccessToken(
      app,
      { loginOrEmail: createUserData_01.login, password: createUserData_02.password },
      testStatus
    );

    await loginUserReturnAccessToken(
      app,
      { loginOrEmail: createUserData_01.email, password: createUserData_02.password },
      testStatus
    );

    const sessions_01: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUser_01.id);
    const sessions_02: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUser_02.id);
    expect(sessions_01).toBeInstanceOf(Array);
    expect(sessions_01.length).toBe(0);
    expect(sessions_02).toBeInstanceOf(Array);
    expect(sessions_02.length).toBe(0);
  });

  it('❌ 003 should not authenticate a user when an invalid user agent passed; 001. POST /api/auth/login', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const loginUserData: LoginDataInputDTO = { loginOrEmail: createUserData.login, password: createUserData.password };
    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await loginUserReturnAccessAndRefreshTokens(app, invalidUserAgents.userAgent_01, loginUserData, testStatus);
    await loginUserReturnAccessAndRefreshTokens(app, invalidUserAgents.userAgent_02, loginUserData, testStatus);

    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUser.id);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(0);
  });

  it('❌ 004 should not authenticate a user when a user agent not passed; 001. POST /api/auth/login', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);

    await loginUserReturnAccessAndRefreshTokens(
      app,
      validUserAgents.userAgent_01,
      { loginOrEmail: createUserData.login, password: createUserData.password },
      HttpStatuses.Unauthorized_401,
      true
    );

    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUser.id);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(0);
  });

  it('❌ 005 should not authenticate a user when more than 5 requests to the same URL during the last 10 seconds have been made; 001. POST /api/auth/login', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const loginUserData: LoginDataInputDTO = { loginOrEmail: createUserData.login, password: createUserData.password };
    const testStatus: HttpStatuses = HttpStatuses.TooManyRequest_429;

    await loginUserReturnAccessToken(app, loginUserData);
    await loginUserReturnAccessToken(app, loginUserData);
    await loginUserReturnAccessToken(app, loginUserData);
    await loginUserReturnAccessToken(app, loginUserData);
    await loginUserReturnAccessToken(app, loginUserData);
    await loginUserReturnAccessToken(app, loginUserData, testStatus);
    await loginUserReturnAccessToken(app, loginUserData, testStatus);
    await delay(5000);
    await setTimeout(5000);
    await loginUserReturnAccessToken(app, loginUserData);

    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUser.id);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(6);
  }, 15000);

  it('❌ 006 should not create new AT/RT when an invalid refresh token passed; 006. POST /api/auth/refresh-token', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const decodedRefreshTokenPayload: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await jwtAdapter.decodeRefreshToken(refreshToken);

    const decodedRefreshTokenPayloadUserId: string | undefined = decodedRefreshTokenPayload?.userId;
    const decodedRefreshTokenPayloadDeviceId: string | undefined = decodedRefreshTokenPayload?.deviceId;
    const decodedRefreshTokenPayloadIat: number | undefined = decodedRefreshTokenPayload?.iat;
    const decodedRefreshTokenPayloadExp: number | undefined = decodedRefreshTokenPayload?.exp;
    const decodedRefreshTokenPayloadIatDate: Date = new Date(decodedRefreshTokenPayloadIat! * 1000);
    const decodedRefreshTokenPayloadExpDate: Date = new Date(decodedRefreshTokenPayloadExp! * 1000);
    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await refreshAccessAndRefreshTokens(app, testUserAgent, invalidRefreshTokens.RT_01, undefined, testStatus);
    await refreshAccessAndRefreshTokens(app, testUserAgent, invalidRefreshTokens.RT_02, undefined, testStatus);
    await refreshAccessAndRefreshTokens(app, testUserAgent, invalidRefreshTokens.RT_03, undefined, testStatus);
    await refreshAccessAndRefreshTokens(app, testUserAgent, invalidRefreshTokens.RT_04, undefined, testStatus);
    await refreshAccessAndRefreshTokens(app, testUserAgent, invalidRefreshTokens.RT_05, undefined, testStatus);
    await refreshAccessAndRefreshTokens(app, testUserAgent, invalidRefreshTokens.RT_06, undefined, testStatus);
    await refreshAccessAndRefreshTokens(app, testUserAgent, invalidRefreshTokens.RT_07, undefined, testStatus);
    await refreshAccessAndRefreshTokens(app, testUserAgent, invalidRefreshTokens.RT_08, undefined, testStatus);
    await refreshAccessAndRefreshTokens(app, testUserAgent, invalidRefreshTokens.RT_09, undefined, testStatus);

    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);
    const session = sessions[0];
    const sessionUserId: string = session.userId;
    const sessionDeviceId: string = session.deviceId;
    const sessionDeviceName: string = session.deviceName;
    const sessionIp: string = session.ip;
    const sessionIat: Date = session.iat;
    const sessionExp: Date = session.exp;

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent,
      refreshToken
    );

    const securityDevice: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId: string = securityDevice.deviceId;
    const securityDeviceTitle: string = securityDevice.title;
    const securityDeviceIp: string = securityDevice.ip;
    const securityDeviceLastActiveDate: Date = new Date(securityDevice.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(sessionUserId).toBe(createdUserId);
    expect(sessionUserId).toBe(decodedRefreshTokenPayloadUserId);
    expect(sessionDeviceId).toBe(decodedRefreshTokenPayloadDeviceId);
    expect(sessionDeviceId).toBe(securityDeviceId);
    expect(sessionDeviceId).toBe(securityDeviceId);
    expect(sessionDeviceName).toBe(testUserAgent);
    expect(sessionDeviceName).toBe(securityDeviceTitle);
    expect(sessionIp).toBe(securityDeviceIp);
    expect(sessionIat).toEqual(decodedRefreshTokenPayloadIatDate);
    expect(sessionIat).toEqual(securityDeviceLastActiveDate);
    expect(sessionExp).toEqual(decodedRefreshTokenPayloadExpDate);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(securityDevice).not.toBeUndefined();
  });

  it('❌ 007 should not create new AT/RT when an incorrect refresh token passed; 006. POST /api/auth/refresh-token', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const decodedRefreshTokenPayload: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await jwtAdapter.decodeRefreshToken(refreshToken);

    const decodedRefreshTokenPayloadUserId: string | undefined = decodedRefreshTokenPayload?.userId;
    const decodedRefreshTokenPayloadDeviceId: string | undefined = decodedRefreshTokenPayload?.deviceId;
    const decodedRefreshTokenPayloadIat: number | undefined = decodedRefreshTokenPayload?.iat;
    const decodedRefreshTokenPayloadExp: number | undefined = decodedRefreshTokenPayload?.exp;
    const decodedRefreshTokenPayloadIatDate: Date = new Date(decodedRefreshTokenPayloadIat! * 1000);
    const decodedRefreshTokenPayloadExpDate: Date = new Date(decodedRefreshTokenPayloadExp! * 1000);

    await refreshAccessAndRefreshTokens(
      app,
      testUserAgent,
      validRefreshTokens.RT_01,
      undefined,
      HttpStatuses.Unauthorized_401
    );

    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);
    const session = sessions[0];
    const sessionUserId: string = session.userId;
    const sessionDeviceId: string = session.deviceId;
    const sessionDeviceName: string = session.deviceName;
    const sessionIp: string = session.ip;
    const sessionIat: Date = session.iat;
    const sessionExp: Date = session.exp;

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent,
      refreshToken
    );

    const securityDevice: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId: string = securityDevice.deviceId;
    const securityDeviceTitle: string = securityDevice.title;
    const securityDeviceIp: string = securityDevice.ip;
    const securityDeviceLastActiveDate: Date = new Date(securityDevice.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(sessionUserId).toBe(createdUserId);
    expect(sessionUserId).toBe(decodedRefreshTokenPayloadUserId);
    expect(sessionDeviceId).toBe(decodedRefreshTokenPayloadDeviceId);
    expect(sessionDeviceId).toBe(securityDeviceId);
    expect(sessionDeviceId).toBe(securityDeviceId);
    expect(sessionDeviceName).toBe(testUserAgent);
    expect(sessionDeviceName).toBe(securityDeviceTitle);
    expect(sessionIp).toBe(securityDeviceIp);
    expect(sessionIat).toEqual(decodedRefreshTokenPayloadIatDate);
    expect(sessionIat).toEqual(securityDeviceLastActiveDate);
    expect(sessionExp).toEqual(decodedRefreshTokenPayloadExpDate);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(securityDevice).not.toBeUndefined();
  });

  it('❌ 008 should not create new AT/RT when an invalid user agent passed; 006. POST /api/auth/refresh-token', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const decodedRefreshTokenPayload: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await jwtAdapter.decodeRefreshToken(refreshToken);

    const decodedRefreshTokenPayloadUserId: string | undefined = decodedRefreshTokenPayload?.userId;
    const decodedRefreshTokenPayloadDeviceId: string | undefined = decodedRefreshTokenPayload?.deviceId;
    const decodedRefreshTokenPayloadIat: number | undefined = decodedRefreshTokenPayload?.iat;
    const decodedRefreshTokenPayloadExp: number | undefined = decodedRefreshTokenPayload?.exp;
    const decodedRefreshTokenPayloadIatDate: Date = new Date(decodedRefreshTokenPayloadIat! * 1000);
    const decodedRefreshTokenPayloadExpDate: Date = new Date(decodedRefreshTokenPayloadExp! * 1000);
    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await refreshAccessAndRefreshTokens(app, invalidUserAgents.userAgent_01, refreshToken, undefined, testStatus);
    await refreshAccessAndRefreshTokens(app, invalidUserAgents.userAgent_02, refreshToken, undefined, testStatus);

    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);
    const session = sessions[0];
    const sessionUserId: string = session.userId;
    const sessionDeviceId: string = session.deviceId;
    const sessionDeviceName: string = session.deviceName;
    const sessionIp: string = session.ip;
    const sessionIat: Date = session.iat;
    const sessionExp: Date = session.exp;

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent,
      refreshToken
    );

    const securityDevice: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId: string = securityDevice.deviceId;
    const securityDeviceTitle: string = securityDevice.title;
    const securityDeviceIp: string = securityDevice.ip;
    const securityDeviceLastActiveDate: Date = new Date(securityDevice.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(sessionUserId).toBe(createdUserId);
    expect(sessionUserId).toBe(decodedRefreshTokenPayloadUserId);
    expect(sessionDeviceId).toBe(decodedRefreshTokenPayloadDeviceId);
    expect(sessionDeviceId).toBe(securityDeviceId);
    expect(sessionDeviceId).toBe(securityDeviceId);
    expect(sessionDeviceName).toBe(testUserAgent);
    expect(sessionDeviceName).toBe(securityDeviceTitle);
    expect(sessionIp).toBe(securityDeviceIp);
    expect(sessionIat).toEqual(decodedRefreshTokenPayloadIatDate);
    expect(sessionIat).toEqual(securityDeviceLastActiveDate);
    expect(sessionExp).toEqual(decodedRefreshTokenPayloadExpDate);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(securityDevice).not.toBeUndefined();
  });

  it('❌ 009 should not create new AT/RT when a user agent not passed; 006. POST /api/auth/refresh-token', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const decodedRefreshTokenPayload: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await jwtAdapter.decodeRefreshToken(refreshToken);

    const decodedRefreshTokenPayloadUserId: string | undefined = decodedRefreshTokenPayload?.userId;
    const decodedRefreshTokenPayloadDeviceId: string | undefined = decodedRefreshTokenPayload?.deviceId;
    const decodedRefreshTokenPayloadIat: number | undefined = decodedRefreshTokenPayload?.iat;
    const decodedRefreshTokenPayloadExp: number | undefined = decodedRefreshTokenPayload?.exp;
    const decodedRefreshTokenPayloadIatDate: Date = new Date(decodedRefreshTokenPayloadIat! * 1000);
    const decodedRefreshTokenPayloadExpDate: Date = new Date(decodedRefreshTokenPayloadExp! * 1000);

    await refreshAccessAndRefreshTokens(
      app,
      testUserAgent,
      refreshToken,
      undefined,
      HttpStatuses.Unauthorized_401,
      true
    );

    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);
    const session = sessions[0];
    const sessionUserId: string = session.userId;
    const sessionDeviceId: string = session.deviceId;
    const sessionDeviceName: string = session.deviceName;
    const sessionIp: string = session.ip;
    const sessionIat: Date = session.iat;
    const sessionExp: Date = session.exp;

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent,
      refreshToken
    );

    const securityDevice: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId: string = securityDevice.deviceId;
    const securityDeviceTitle: string = securityDevice.title;
    const securityDeviceIp: string = securityDevice.ip;
    const securityDeviceLastActiveDate: Date = new Date(securityDevice.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(sessionUserId).toBe(createdUserId);
    expect(sessionUserId).toBe(decodedRefreshTokenPayloadUserId);
    expect(sessionDeviceId).toBe(decodedRefreshTokenPayloadDeviceId);
    expect(sessionDeviceId).toBe(securityDeviceId);
    expect(sessionDeviceId).toBe(securityDeviceId);
    expect(sessionDeviceName).toBe(testUserAgent);
    expect(sessionDeviceName).toBe(securityDeviceTitle);
    expect(sessionIp).toBe(securityDeviceIp);
    expect(sessionIat).toEqual(decodedRefreshTokenPayloadIatDate);
    expect(sessionIat).toEqual(securityDeviceLastActiveDate);
    expect(sessionExp).toEqual(decodedRefreshTokenPayloadExpDate);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(securityDevice).not.toBeUndefined();
  });

  it('❌ 010 should not revoke a session when an invalid refresh token passed; 007. POST /api/auth/logout', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const decodedRefreshTokenPayload: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await jwtAdapter.decodeRefreshToken(refreshToken);

    const decodedRefreshTokenPayloadUserId: string | undefined = decodedRefreshTokenPayload?.userId;
    const decodedRefreshTokenPayloadDeviceId: string | undefined = decodedRefreshTokenPayload?.deviceId;
    const decodedRefreshTokenPayloadIat: number | undefined = decodedRefreshTokenPayload?.iat;
    const decodedRefreshTokenPayloadExp: number | undefined = decodedRefreshTokenPayload?.exp;
    const decodedRefreshTokenPayloadIatDate: Date = new Date(decodedRefreshTokenPayloadIat! * 1000);
    const decodedRefreshTokenPayloadExpDate: Date = new Date(decodedRefreshTokenPayloadExp! * 1000);
    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await revokeSession(app, testUserAgent, invalidRefreshTokens.RT_01, undefined, testStatus);
    await revokeSession(app, testUserAgent, invalidRefreshTokens.RT_02, undefined, testStatus);
    await revokeSession(app, testUserAgent, invalidRefreshTokens.RT_03, undefined, testStatus);
    await revokeSession(app, testUserAgent, invalidRefreshTokens.RT_04, undefined, testStatus);
    await revokeSession(app, testUserAgent, invalidRefreshTokens.RT_05, undefined, testStatus);
    await revokeSession(app, testUserAgent, invalidRefreshTokens.RT_06, undefined, testStatus);
    await revokeSession(app, testUserAgent, invalidRefreshTokens.RT_07, undefined, testStatus);
    await revokeSession(app, testUserAgent, invalidRefreshTokens.RT_08, undefined, testStatus);
    await revokeSession(app, testUserAgent, invalidRefreshTokens.RT_09, undefined, testStatus);

    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);
    const session = sessions[0];
    const sessionUserId: string = session.userId;
    const sessionDeviceId: string = session.deviceId;
    const sessionDeviceName: string = session.deviceName;
    const sessionIp: string = session.ip;
    const sessionIat: Date = session.iat;
    const sessionExp: Date = session.exp;

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent,
      refreshToken
    );

    const securityDevice: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId: string = securityDevice.deviceId;
    const securityDeviceTitle: string = securityDevice.title;
    const securityDeviceIp: string = securityDevice.ip;
    const securityDeviceLastActiveDate: Date = new Date(securityDevice.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(sessionUserId).toBe(createdUserId);
    expect(sessionUserId).toBe(decodedRefreshTokenPayloadUserId);
    expect(sessionDeviceId).toBe(decodedRefreshTokenPayloadDeviceId);
    expect(sessionDeviceId).toBe(securityDeviceId);
    expect(sessionDeviceId).toBe(securityDeviceId);
    expect(sessionDeviceName).toBe(testUserAgent);
    expect(sessionDeviceName).toBe(securityDeviceTitle);
    expect(sessionIp).toBe(securityDeviceIp);
    expect(sessionIat).toEqual(decodedRefreshTokenPayloadIatDate);
    expect(sessionIat).toEqual(securityDeviceLastActiveDate);
    expect(sessionExp).toEqual(decodedRefreshTokenPayloadExpDate);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(securityDevice).not.toBeUndefined();
  });

  it('❌ 011 should not revoke a session when an incorrect refresh token passed; 007. POST /api/auth/logout', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const decodedRefreshTokenPayload: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await jwtAdapter.decodeRefreshToken(refreshToken);

    const decodedRefreshTokenPayloadUserId: string | undefined = decodedRefreshTokenPayload?.userId;
    const decodedRefreshTokenPayloadDeviceId: string | undefined = decodedRefreshTokenPayload?.deviceId;
    const decodedRefreshTokenPayloadIat: number | undefined = decodedRefreshTokenPayload?.iat;
    const decodedRefreshTokenPayloadExp: number | undefined = decodedRefreshTokenPayload?.exp;
    const decodedRefreshTokenPayloadIatDate: Date = new Date(decodedRefreshTokenPayloadIat! * 1000);
    const decodedRefreshTokenPayloadExpDate: Date = new Date(decodedRefreshTokenPayloadExp! * 1000);

    await revokeSession(app, testUserAgent, validRefreshTokens.RT_01, undefined, HttpStatuses.Unauthorized_401);

    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);
    const session = sessions[0];
    const sessionUserId: string = session.userId;
    const sessionDeviceId: string = session.deviceId;
    const sessionDeviceName: string = session.deviceName;
    const sessionIp: string = session.ip;
    const sessionIat: Date = session.iat;
    const sessionExp: Date = session.exp;

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent,
      refreshToken
    );

    const securityDevice: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId: string = securityDevice.deviceId;
    const securityDeviceTitle: string = securityDevice.title;
    const securityDeviceIp: string = securityDevice.ip;
    const securityDeviceLastActiveDate: Date = new Date(securityDevice.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(sessionUserId).toBe(createdUserId);
    expect(sessionUserId).toBe(decodedRefreshTokenPayloadUserId);
    expect(sessionDeviceId).toBe(decodedRefreshTokenPayloadDeviceId);
    expect(sessionDeviceId).toBe(securityDeviceId);
    expect(sessionDeviceId).toBe(securityDeviceId);
    expect(sessionDeviceName).toBe(testUserAgent);
    expect(sessionDeviceName).toBe(securityDeviceTitle);
    expect(sessionIp).toBe(securityDeviceIp);
    expect(sessionIat).toEqual(decodedRefreshTokenPayloadIatDate);
    expect(sessionIat).toEqual(securityDeviceLastActiveDate);
    expect(sessionExp).toEqual(decodedRefreshTokenPayloadExpDate);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(securityDevice).not.toBeUndefined();
  });

  it('❌ 012 should not revoke a session when an invalid user agent passed; 007. POST /api/auth/logout', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const decodedRefreshTokenPayload: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await jwtAdapter.decodeRefreshToken(refreshToken);

    const decodedRefreshTokenPayloadUserId: string | undefined = decodedRefreshTokenPayload?.userId;
    const decodedRefreshTokenPayloadDeviceId: string | undefined = decodedRefreshTokenPayload?.deviceId;
    const decodedRefreshTokenPayloadIat: number | undefined = decodedRefreshTokenPayload?.iat;
    const decodedRefreshTokenPayloadExp: number | undefined = decodedRefreshTokenPayload?.exp;
    const decodedRefreshTokenPayloadIatDate: Date = new Date(decodedRefreshTokenPayloadIat! * 1000);
    const decodedRefreshTokenPayloadExpDate: Date = new Date(decodedRefreshTokenPayloadExp! * 1000);
    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await revokeSession(app, invalidUserAgents.userAgent_01, refreshToken, undefined, testStatus);
    await revokeSession(app, invalidUserAgents.userAgent_02, refreshToken, undefined, testStatus);

    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);
    const session = sessions[0];
    const sessionUserId: string = session.userId;
    const sessionDeviceId: string = session.deviceId;
    const sessionDeviceName: string = session.deviceName;
    const sessionIp: string = session.ip;
    const sessionIat: Date = session.iat;
    const sessionExp: Date = session.exp;

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent,
      refreshToken
    );

    const securityDevice: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId: string = securityDevice.deviceId;
    const securityDeviceTitle: string = securityDevice.title;
    const securityDeviceIp: string = securityDevice.ip;
    const securityDeviceLastActiveDate: Date = new Date(securityDevice.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(sessionUserId).toBe(createdUserId);
    expect(sessionUserId).toBe(decodedRefreshTokenPayloadUserId);
    expect(sessionDeviceId).toBe(decodedRefreshTokenPayloadDeviceId);
    expect(sessionDeviceId).toBe(securityDeviceId);
    expect(sessionDeviceId).toBe(securityDeviceId);
    expect(sessionDeviceName).toBe(testUserAgent);
    expect(sessionDeviceName).toBe(securityDeviceTitle);
    expect(sessionIp).toBe(securityDeviceIp);
    expect(sessionIat).toEqual(decodedRefreshTokenPayloadIatDate);
    expect(sessionIat).toEqual(securityDeviceLastActiveDate);
    expect(sessionExp).toEqual(decodedRefreshTokenPayloadExpDate);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(securityDevice).not.toBeUndefined();
  });

  it('❌ 013 should not revoke a session when a user agent not passed; 007. POST /api/auth/logout', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const decodedRefreshTokenPayload: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await jwtAdapter.decodeRefreshToken(refreshToken);

    const decodedRefreshTokenPayloadUserId: string | undefined = decodedRefreshTokenPayload?.userId;
    const decodedRefreshTokenPayloadDeviceId: string | undefined = decodedRefreshTokenPayload?.deviceId;
    const decodedRefreshTokenPayloadIat: number | undefined = decodedRefreshTokenPayload?.iat;
    const decodedRefreshTokenPayloadExp: number | undefined = decodedRefreshTokenPayload?.exp;
    const decodedRefreshTokenPayloadIatDate: Date = new Date(decodedRefreshTokenPayloadIat! * 1000);
    const decodedRefreshTokenPayloadExpDate: Date = new Date(decodedRefreshTokenPayloadExp! * 1000);

    await revokeSession(app, testUserAgent, refreshToken, undefined, HttpStatuses.Unauthorized_401, true);

    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);
    const session = sessions[0];
    const sessionUserId: string = session.userId;
    const sessionDeviceId: string = session.deviceId;
    const sessionDeviceName: string = session.deviceName;
    const sessionIp: string = session.ip;
    const sessionIat: Date = session.iat;
    const sessionExp: Date = session.exp;

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent,
      refreshToken
    );

    const securityDevice: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId: string = securityDevice.deviceId;
    const securityDeviceTitle: string = securityDevice.title;
    const securityDeviceIp: string = securityDevice.ip;
    const securityDeviceLastActiveDate: Date = new Date(securityDevice.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(sessionUserId).toBe(createdUserId);
    expect(sessionUserId).toBe(decodedRefreshTokenPayloadUserId);
    expect(sessionDeviceId).toBe(decodedRefreshTokenPayloadDeviceId);
    expect(sessionDeviceId).toBe(securityDeviceId);
    expect(sessionDeviceId).toBe(securityDeviceId);
    expect(sessionDeviceName).toBe(testUserAgent);
    expect(sessionDeviceName).toBe(securityDeviceTitle);
    expect(sessionIp).toBe(securityDeviceIp);
    expect(sessionIat).toEqual(decodedRefreshTokenPayloadIatDate);
    expect(sessionIat).toEqual(securityDeviceLastActiveDate);
    expect(sessionExp).toEqual(decodedRefreshTokenPayloadExpDate);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(securityDevice).not.toBeUndefined();
  });

  it('❌ 014 should not return user data when an invalid access token passed; 002. GET /api/auth/me', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);
    await loginUserReturnAccessToken(app, { loginOrEmail: createUserData.login, password: createUserData.password });
    const testUserAgent: string = validUserAgents.userAgent_01;
    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await getAuthDataByAccessToken(app, testUserAgent, invalidAccessTokens.AT_01, testStatus);
    await getAuthDataByAccessToken(app, testUserAgent, invalidAccessTokens.AT_02, testStatus);
    await getAuthDataByAccessToken(app, testUserAgent, invalidAccessTokens.AT_03, testStatus);
    await getAuthDataByAccessToken(app, testUserAgent, invalidAccessTokens.AT_04, testStatus);
    await getAuthDataByAccessToken(app, testUserAgent, invalidAccessTokens.AT_05, testStatus);
    await getAuthDataByAccessToken(app, testUserAgent, invalidAccessTokens.AT_06, testStatus);
    await getAuthDataByAccessToken(app, testUserAgent, invalidAccessTokens.AT_07, testStatus);
    await getAuthDataByAccessToken(app, testUserAgent, invalidAccessTokens.AT_08, testStatus);
    await getAuthDataByAccessToken(app, testUserAgent, invalidAccessTokens.AT_09, testStatus);
  });

  it('❌ 015 should not return user data when an incorrect access token passed; 002. GET /api/auth/me', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);
    await loginUserReturnAccessToken(app, { loginOrEmail: createUserData.login, password: createUserData.password });

    await getAuthDataByAccessToken(
      app,
      validUserAgents.userAgent_01,
      validAccessTokens.AT_01,
      HttpStatuses.Unauthorized_401
    );
  });

  it('❌ 016 should not return user data when an invalid user agent passed; 002. GET /api/auth/me', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const accessToken: string = await loginUserReturnAccessToken(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await getAuthDataByAccessToken(app, invalidUserAgents.userAgent_01, accessToken, testStatus);
    await getAuthDataByAccessToken(app, invalidUserAgents.userAgent_02, accessToken, testStatus);
  });

  it('❌ 017 should not return user data when a user agent not passed; 002. GET /api/auth/me', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const accessToken: string = await loginUserReturnAccessToken(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    await getAuthDataByAccessToken(app, validUserAgents.userAgent_01, accessToken, HttpStatuses.Unauthorized_401, true);
  });
});
