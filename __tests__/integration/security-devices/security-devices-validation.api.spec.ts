import { doBeforeTestsWithMongoMemoryServer } from '../../utils/common/do-before-tests.test-util';
import { CreateUserInputDTO } from '../../../src/users/routes/input-dto/create-user.input-dto';
import { getCreateUserInputDTO } from '../../utils/users/input-dto-utils/get-create-user-input-dto.test-util';
import { createUser } from '../../utils/users/create-user.test-util';
import { LoginDataInputDTO } from '../../../src/auth/routes/input-dto/login-data.input-dto';
import {
  invalidRefreshTokens,
  invalidUserAgents,
  validRefreshTokens,
  validUserAgents,
} from '../../test-data/auth.test-data';
import { loginUserReturnAccessAndRefreshTokens } from '../../utils/auth/login-user-return-access-and-refresh-tokens.test-util';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { getSecurityDeviceList } from '../../utils/security-devices/get-security-device-list.test-util';
import { revokeSessionsExceptCurrentDevice } from '../../utils/security-devices/revoke-sessions-except-current-device.test-util';
import { JwtAdapter } from '../../../src/auth/adapters/jwt.adapter';
import { SecurityDeviceListOutputDTO } from '../../../src/security-devices/routes/output-dto/security-device-list.output-dto';
import { SessionDBType } from '../../../src/auth/repositories/types/session-db.type';
import { AuthRepository } from '../../../src/auth/repositories/auth.repository';
import { SecurityDeviceOutputDTO } from '../../../src/security-devices/routes/output-dto/security-device.output-dto';
import { UserOutputDTO } from '../../../src/users/routes/output-dto/user.output-dto';
import { revokeSessionByDeviceId } from '../../utils/security-devices/revoke-session-by-device-id.test-util';
import { invalidDeviceIds, validDeviceIds } from '../../test-data/security-devices.test-data';

describe('Security Devices API Validation', () => {
  const app = doBeforeTestsWithMongoMemoryServer();

  it('❌ 001 should not return a list of security devices when an invalid refresh token passed; 001. GET /api/security/devices', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);
    const testUserAgent: string = validUserAgents.userAgent_01;

    await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await getSecurityDeviceList(app, testUserAgent, invalidRefreshTokens.RT_01, undefined, testStatus);
    await getSecurityDeviceList(app, testUserAgent, invalidRefreshTokens.RT_02, undefined, testStatus);
    await getSecurityDeviceList(app, testUserAgent, invalidRefreshTokens.RT_03, undefined, testStatus);
    await getSecurityDeviceList(app, testUserAgent, invalidRefreshTokens.RT_04, undefined, testStatus);
    await getSecurityDeviceList(app, testUserAgent, invalidRefreshTokens.RT_05, undefined, testStatus);
    await getSecurityDeviceList(app, testUserAgent, invalidRefreshTokens.RT_06, undefined, testStatus);
    await getSecurityDeviceList(app, testUserAgent, invalidRefreshTokens.RT_07, undefined, testStatus);
    await getSecurityDeviceList(app, testUserAgent, invalidRefreshTokens.RT_08, undefined, testStatus);
    await getSecurityDeviceList(app, testUserAgent, invalidRefreshTokens.RT_09, undefined, testStatus);
  });

  it('❌ 002 should not return a list of security devices when an incorrect refresh token passed; 001. GET /api/security/devices', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);
    const testUserAgent: string = validUserAgents.userAgent_01;

    await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    await getSecurityDeviceList(app, testUserAgent, validRefreshTokens.RT_01, undefined, HttpStatuses.Unauthorized_401);
  });

  it('❌ 003 should not return a list of security devices when an invalid user agent passed; 001. GET /api/security/devices', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      validUserAgents.userAgent_01,
      { loginOrEmail: createUserData.login, password: createUserData.password }
    );

    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await getSecurityDeviceList(app, invalidUserAgents.userAgent_01, refreshToken, undefined, testStatus);
    await getSecurityDeviceList(app, invalidUserAgents.userAgent_02, refreshToken, undefined, testStatus);
  });

  it('❌ 004 should not return a list of security devices when a user agent not passed; 001. GET /api/security/devices', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);
    const testUserAgent: string = validUserAgents.userAgent_01;

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(app, testUserAgent, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    await getSecurityDeviceList(app, testUserAgent, refreshToken, undefined, HttpStatuses.Unauthorized_401, true);
  });

  it('❌ 005 should not revoke sessions except the current security device when an invalid refresh token passed; 002. DEL /api/security/devices', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const loginUserData: LoginDataInputDTO = { loginOrEmail: createUserData.login, password: createUserData.password };
    const testUserAgent_01: string = validUserAgents.userAgent_01;
    const testUserAgent_02: string = validUserAgents.userAgent_02;
    const testUserAgent_03: string = validUserAgents.userAgent_03;

    const { refreshToken: refreshToken_01 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_01,
      loginUserData
    );

    const { refreshToken: refreshToken_02 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_02,
      loginUserData
    );

    const { refreshToken: refreshToken_03 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_03,
      loginUserData
    );

    const decodedRefreshTokenPayload_01: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_01);

    const decodedRefreshTokenPayloadUserId_01: string | undefined = decodedRefreshTokenPayload_01?.userId;
    const decodedRefreshTokenPayloadDeviceId_01: string | undefined = decodedRefreshTokenPayload_01?.deviceId;
    const decodedRefreshTokenPayloadIat_01: number | undefined = decodedRefreshTokenPayload_01?.iat;
    const decodedRefreshTokenPayloadExp_01: number | undefined = decodedRefreshTokenPayload_01?.exp;
    const decodedRefreshTokenPayloadIatDate_01: Date = new Date(decodedRefreshTokenPayloadIat_01! * 1000);
    const decodedRefreshTokenPayloadExpDate_01: Date = new Date(decodedRefreshTokenPayloadExp_01! * 1000);

    const decodedRefreshTokenPayload_02: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_02);

    const decodedRefreshTokenPayloadUserId_02: string | undefined = decodedRefreshTokenPayload_02?.userId;
    const decodedRefreshTokenPayloadDeviceId_02: string | undefined = decodedRefreshTokenPayload_02?.deviceId;
    const decodedRefreshTokenPayloadIat_02: number | undefined = decodedRefreshTokenPayload_02?.iat;
    const decodedRefreshTokenPayloadExp_02: number | undefined = decodedRefreshTokenPayload_02?.exp;
    const decodedRefreshTokenPayloadIatDate_02: Date = new Date(decodedRefreshTokenPayloadIat_02! * 1000);
    const decodedRefreshTokenPayloadExpDate_02: Date = new Date(decodedRefreshTokenPayloadExp_02! * 1000);

    const decodedRefreshTokenPayload_03: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_03);

    const decodedRefreshTokenPayloadUserId_03: string | undefined = decodedRefreshTokenPayload_03?.userId;
    const decodedRefreshTokenPayloadDeviceId_03: string | undefined = decodedRefreshTokenPayload_03?.deviceId;
    const decodedRefreshTokenPayloadIat_03: number | undefined = decodedRefreshTokenPayload_03?.iat;
    const decodedRefreshTokenPayloadExp_03: number | undefined = decodedRefreshTokenPayload_03?.exp;
    const decodedRefreshTokenPayloadIatDate_03: Date = new Date(decodedRefreshTokenPayloadIat_03! * 1000);
    const decodedRefreshTokenPayloadExpDate_03: Date = new Date(decodedRefreshTokenPayloadExp_03! * 1000);
    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await revokeSessionsExceptCurrentDevice(app, testUserAgent_02, invalidRefreshTokens.RT_01, undefined, testStatus);
    await revokeSessionsExceptCurrentDevice(app, testUserAgent_02, invalidRefreshTokens.RT_02, undefined, testStatus);
    await revokeSessionsExceptCurrentDevice(app, testUserAgent_02, invalidRefreshTokens.RT_03, undefined, testStatus);
    await revokeSessionsExceptCurrentDevice(app, testUserAgent_02, invalidRefreshTokens.RT_04, undefined, testStatus);
    await revokeSessionsExceptCurrentDevice(app, testUserAgent_02, invalidRefreshTokens.RT_05, undefined, testStatus);
    await revokeSessionsExceptCurrentDevice(app, testUserAgent_02, invalidRefreshTokens.RT_06, undefined, testStatus);
    await revokeSessionsExceptCurrentDevice(app, testUserAgent_02, invalidRefreshTokens.RT_07, undefined, testStatus);
    await revokeSessionsExceptCurrentDevice(app, testUserAgent_02, invalidRefreshTokens.RT_08, undefined, testStatus);
    await revokeSessionsExceptCurrentDevice(app, testUserAgent_02, invalidRefreshTokens.RT_09, undefined, testStatus);

    const sessions: SessionDBType[] = await AuthRepository.findAllSessionsByUserId(createdUserId);
    const session_01 = sessions[0];
    const sessionUserId_01: string = session_01.userId;
    const sessionDeviceId_01: string = session_01.deviceId;
    const sessionDeviceName_01: string = session_01.deviceName;
    const sessionIp_01: string = session_01.ip;
    const sessionIat_01: Date = session_01.iat;
    const sessionExp_01: Date = session_01.exp;
    const session_02 = sessions[1];
    const sessionUserId_02: string = session_02.userId;
    const sessionDeviceId_02: string = session_02.deviceId;
    const sessionDeviceName_02: string = session_02.deviceName;
    const sessionIp_02: string = session_02.ip;
    const sessionIat_02: Date = session_02.iat;
    const sessionExp_02: Date = session_02.exp;
    const session_03 = sessions[2];
    const sessionUserId_03: string = session_03.userId;
    const sessionDeviceId_03: string = session_03.deviceId;
    const sessionDeviceName_03: string = session_03.deviceName;
    const sessionIp_03: string = session_03.ip;
    const sessionIat_03: Date = session_03.iat;
    const sessionExp_03: Date = session_03.exp;

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent_02,
      refreshToken_02
    );

    const securityDevice_01: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId_01: string = securityDevice_01.deviceId;
    const securityDeviceTitle_01: string = securityDevice_01.title;
    const securityDeviceIp_01: string = securityDevice_01.ip;
    const securityDeviceLastActiveDate_01: Date = new Date(securityDevice_01.lastActiveDate);
    const securityDevice_02: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[1];
    const securityDeviceId_02: string = securityDevice_02.deviceId;
    const securityDeviceTitle_02: string = securityDevice_02.title;
    const securityDeviceIp_02: string = securityDevice_02.ip;
    const securityDeviceLastActiveDate_02: Date = new Date(securityDevice_02.lastActiveDate);
    const securityDevice_03: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[2];
    const securityDeviceId_03: string = securityDevice_03.deviceId;
    const securityDeviceTitle_03: string = securityDevice_03.title;
    const securityDeviceIp_03: string = securityDevice_03.ip;
    const securityDeviceLastActiveDate_03: Date = new Date(securityDevice_03.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(3);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(3);
    expect(sessionUserId_01).toBe(createdUserId);
    expect(sessionUserId_01).toBe(decodedRefreshTokenPayloadUserId_01);
    expect(sessionDeviceId_01).toBe(decodedRefreshTokenPayloadDeviceId_01);
    expect(sessionDeviceId_01).toBe(securityDeviceId_01);
    expect(sessionDeviceName_01).toBe(testUserAgent_01);
    expect(sessionDeviceName_01).toBe(securityDeviceTitle_01);
    expect(sessionIp_01).toBe(securityDeviceIp_01);
    expect(sessionIat_01).toEqual(decodedRefreshTokenPayloadIatDate_01);
    expect(sessionIat_01).toEqual(securityDeviceLastActiveDate_01);
    expect(sessionExp_01).toEqual(decodedRefreshTokenPayloadExpDate_01);
    expect(sessionUserId_02).toBe(createdUserId);
    expect(sessionUserId_02).toBe(decodedRefreshTokenPayloadUserId_02);
    expect(sessionDeviceId_02).toBe(decodedRefreshTokenPayloadDeviceId_02);
    expect(sessionDeviceId_02).toBe(securityDeviceId_02);
    expect(sessionDeviceName_02).toBe(testUserAgent_02);
    expect(sessionDeviceName_02).toBe(securityDeviceTitle_02);
    expect(sessionIp_02).toBe(securityDeviceIp_02);
    expect(sessionIat_02).toEqual(decodedRefreshTokenPayloadIatDate_02);
    expect(sessionIat_02).toEqual(securityDeviceLastActiveDate_02);
    expect(sessionExp_02).toEqual(decodedRefreshTokenPayloadExpDate_02);
    expect(sessionUserId_03).toBe(createdUserId);
    expect(sessionUserId_03).toBe(decodedRefreshTokenPayloadUserId_03);
    expect(sessionDeviceId_03).toBe(decodedRefreshTokenPayloadDeviceId_03);
    expect(sessionDeviceId_03).toBe(securityDeviceId_03);
    expect(sessionDeviceName_03).toBe(testUserAgent_03);
    expect(sessionDeviceName_03).toBe(securityDeviceTitle_03);
    expect(sessionIp_03).toBe(securityDeviceIp_03);
    expect(sessionIat_03).toEqual(decodedRefreshTokenPayloadIatDate_03);
    expect(sessionIat_03).toEqual(securityDeviceLastActiveDate_03);
    expect(sessionExp_03).toEqual(decodedRefreshTokenPayloadExpDate_03);
  });

  it('❌ 006 should not revoke sessions except the current security device when an incorrect refresh token passed; 002. DEL /api/security/devices', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const loginUserData: LoginDataInputDTO = { loginOrEmail: createUserData.login, password: createUserData.password };
    const testUserAgent_01: string = validUserAgents.userAgent_01;
    const testUserAgent_02: string = validUserAgents.userAgent_02;
    const testUserAgent_03: string = validUserAgents.userAgent_03;

    const { refreshToken: refreshToken_01 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_01,
      loginUserData
    );

    const { refreshToken: refreshToken_02 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_02,
      loginUserData
    );

    const { refreshToken: refreshToken_03 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_03,
      loginUserData
    );

    const decodedRefreshTokenPayload_01: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_01);

    const decodedRefreshTokenPayloadUserId_01: string | undefined = decodedRefreshTokenPayload_01?.userId;
    const decodedRefreshTokenPayloadDeviceId_01: string | undefined = decodedRefreshTokenPayload_01?.deviceId;
    const decodedRefreshTokenPayloadIat_01: number | undefined = decodedRefreshTokenPayload_01?.iat;
    const decodedRefreshTokenPayloadExp_01: number | undefined = decodedRefreshTokenPayload_01?.exp;
    const decodedRefreshTokenPayloadIatDate_01: Date = new Date(decodedRefreshTokenPayloadIat_01! * 1000);
    const decodedRefreshTokenPayloadExpDate_01: Date = new Date(decodedRefreshTokenPayloadExp_01! * 1000);

    const decodedRefreshTokenPayload_02: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_02);

    const decodedRefreshTokenPayloadUserId_02: string | undefined = decodedRefreshTokenPayload_02?.userId;
    const decodedRefreshTokenPayloadDeviceId_02: string | undefined = decodedRefreshTokenPayload_02?.deviceId;
    const decodedRefreshTokenPayloadIat_02: number | undefined = decodedRefreshTokenPayload_02?.iat;
    const decodedRefreshTokenPayloadExp_02: number | undefined = decodedRefreshTokenPayload_02?.exp;
    const decodedRefreshTokenPayloadIatDate_02: Date = new Date(decodedRefreshTokenPayloadIat_02! * 1000);
    const decodedRefreshTokenPayloadExpDate_02: Date = new Date(decodedRefreshTokenPayloadExp_02! * 1000);

    const decodedRefreshTokenPayload_03: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_03);

    const decodedRefreshTokenPayloadUserId_03: string | undefined = decodedRefreshTokenPayload_03?.userId;
    const decodedRefreshTokenPayloadDeviceId_03: string | undefined = decodedRefreshTokenPayload_03?.deviceId;
    const decodedRefreshTokenPayloadIat_03: number | undefined = decodedRefreshTokenPayload_03?.iat;
    const decodedRefreshTokenPayloadExp_03: number | undefined = decodedRefreshTokenPayload_03?.exp;
    const decodedRefreshTokenPayloadIatDate_03: Date = new Date(decodedRefreshTokenPayloadIat_03! * 1000);
    const decodedRefreshTokenPayloadExpDate_03: Date = new Date(decodedRefreshTokenPayloadExp_03! * 1000);

    await revokeSessionsExceptCurrentDevice(
      app,
      testUserAgent_02,
      validRefreshTokens.RT_01,
      undefined,
      HttpStatuses.Unauthorized_401
    );

    const sessions: SessionDBType[] = await AuthRepository.findAllSessionsByUserId(createdUserId);
    const session_01 = sessions[0];
    const sessionUserId_01: string = session_01.userId;
    const sessionDeviceId_01: string = session_01.deviceId;
    const sessionDeviceName_01: string = session_01.deviceName;
    const sessionIp_01: string = session_01.ip;
    const sessionIat_01: Date = session_01.iat;
    const sessionExp_01: Date = session_01.exp;
    const session_02 = sessions[1];
    const sessionUserId_02: string = session_02.userId;
    const sessionDeviceId_02: string = session_02.deviceId;
    const sessionDeviceName_02: string = session_02.deviceName;
    const sessionIp_02: string = session_02.ip;
    const sessionIat_02: Date = session_02.iat;
    const sessionExp_02: Date = session_02.exp;
    const session_03 = sessions[2];
    const sessionUserId_03: string = session_03.userId;
    const sessionDeviceId_03: string = session_03.deviceId;
    const sessionDeviceName_03: string = session_03.deviceName;
    const sessionIp_03: string = session_03.ip;
    const sessionIat_03: Date = session_03.iat;
    const sessionExp_03: Date = session_03.exp;

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent_02,
      refreshToken_02
    );

    const securityDevice_01: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId_01: string = securityDevice_01.deviceId;
    const securityDeviceTitle_01: string = securityDevice_01.title;
    const securityDeviceIp_01: string = securityDevice_01.ip;
    const securityDeviceLastActiveDate_01: Date = new Date(securityDevice_01.lastActiveDate);
    const securityDevice_02: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[1];
    const securityDeviceId_02: string = securityDevice_02.deviceId;
    const securityDeviceTitle_02: string = securityDevice_02.title;
    const securityDeviceIp_02: string = securityDevice_02.ip;
    const securityDeviceLastActiveDate_02: Date = new Date(securityDevice_02.lastActiveDate);
    const securityDevice_03: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[2];
    const securityDeviceId_03: string = securityDevice_03.deviceId;
    const securityDeviceTitle_03: string = securityDevice_03.title;
    const securityDeviceIp_03: string = securityDevice_03.ip;
    const securityDeviceLastActiveDate_03: Date = new Date(securityDevice_03.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(3);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(3);
    expect(sessionUserId_01).toBe(createdUserId);
    expect(sessionUserId_01).toBe(decodedRefreshTokenPayloadUserId_01);
    expect(sessionDeviceId_01).toBe(decodedRefreshTokenPayloadDeviceId_01);
    expect(sessionDeviceId_01).toBe(securityDeviceId_01);
    expect(sessionDeviceName_01).toBe(testUserAgent_01);
    expect(sessionDeviceName_01).toBe(securityDeviceTitle_01);
    expect(sessionIp_01).toBe(securityDeviceIp_01);
    expect(sessionIat_01).toEqual(decodedRefreshTokenPayloadIatDate_01);
    expect(sessionIat_01).toEqual(securityDeviceLastActiveDate_01);
    expect(sessionExp_01).toEqual(decodedRefreshTokenPayloadExpDate_01);
    expect(sessionUserId_02).toBe(createdUserId);
    expect(sessionUserId_02).toBe(decodedRefreshTokenPayloadUserId_02);
    expect(sessionDeviceId_02).toBe(decodedRefreshTokenPayloadDeviceId_02);
    expect(sessionDeviceId_02).toBe(securityDeviceId_02);
    expect(sessionDeviceName_02).toBe(testUserAgent_02);
    expect(sessionDeviceName_02).toBe(securityDeviceTitle_02);
    expect(sessionIp_02).toBe(securityDeviceIp_02);
    expect(sessionIat_02).toEqual(decodedRefreshTokenPayloadIatDate_02);
    expect(sessionIat_02).toEqual(securityDeviceLastActiveDate_02);
    expect(sessionExp_02).toEqual(decodedRefreshTokenPayloadExpDate_02);
    expect(sessionUserId_03).toBe(createdUserId);
    expect(sessionUserId_03).toBe(decodedRefreshTokenPayloadUserId_03);
    expect(sessionDeviceId_03).toBe(decodedRefreshTokenPayloadDeviceId_03);
    expect(sessionDeviceId_03).toBe(securityDeviceId_03);
    expect(sessionDeviceName_03).toBe(testUserAgent_03);
    expect(sessionDeviceName_03).toBe(securityDeviceTitle_03);
    expect(sessionIp_03).toBe(securityDeviceIp_03);
    expect(sessionIat_03).toEqual(decodedRefreshTokenPayloadIatDate_03);
    expect(sessionIat_03).toEqual(securityDeviceLastActiveDate_03);
    expect(sessionExp_03).toEqual(decodedRefreshTokenPayloadExpDate_03);
  });

  it('❌ 007 should not revoke sessions except the current security device when an invalid user agent passed; 002. DEL /api/security/devices', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const loginUserData: LoginDataInputDTO = { loginOrEmail: createUserData.login, password: createUserData.password };
    const testUserAgent_01: string = validUserAgents.userAgent_01;
    const testUserAgent_02: string = validUserAgents.userAgent_02;
    const testUserAgent_03: string = validUserAgents.userAgent_03;

    const { refreshToken: refreshToken_01 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_01,
      loginUserData
    );

    const { refreshToken: refreshToken_02 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_02,
      loginUserData
    );

    const { refreshToken: refreshToken_03 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_03,
      loginUserData
    );

    const decodedRefreshTokenPayload_01: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_01);

    const decodedRefreshTokenPayloadUserId_01: string | undefined = decodedRefreshTokenPayload_01?.userId;
    const decodedRefreshTokenPayloadDeviceId_01: string | undefined = decodedRefreshTokenPayload_01?.deviceId;
    const decodedRefreshTokenPayloadIat_01: number | undefined = decodedRefreshTokenPayload_01?.iat;
    const decodedRefreshTokenPayloadExp_01: number | undefined = decodedRefreshTokenPayload_01?.exp;
    const decodedRefreshTokenPayloadIatDate_01: Date = new Date(decodedRefreshTokenPayloadIat_01! * 1000);
    const decodedRefreshTokenPayloadExpDate_01: Date = new Date(decodedRefreshTokenPayloadExp_01! * 1000);

    const decodedRefreshTokenPayload_02: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_02);

    const decodedRefreshTokenPayloadUserId_02: string | undefined = decodedRefreshTokenPayload_02?.userId;
    const decodedRefreshTokenPayloadDeviceId_02: string | undefined = decodedRefreshTokenPayload_02?.deviceId;
    const decodedRefreshTokenPayloadIat_02: number | undefined = decodedRefreshTokenPayload_02?.iat;
    const decodedRefreshTokenPayloadExp_02: number | undefined = decodedRefreshTokenPayload_02?.exp;
    const decodedRefreshTokenPayloadIatDate_02: Date = new Date(decodedRefreshTokenPayloadIat_02! * 1000);
    const decodedRefreshTokenPayloadExpDate_02: Date = new Date(decodedRefreshTokenPayloadExp_02! * 1000);

    const decodedRefreshTokenPayload_03: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_03);

    const decodedRefreshTokenPayloadUserId_03: string | undefined = decodedRefreshTokenPayload_03?.userId;
    const decodedRefreshTokenPayloadDeviceId_03: string | undefined = decodedRefreshTokenPayload_03?.deviceId;
    const decodedRefreshTokenPayloadIat_03: number | undefined = decodedRefreshTokenPayload_03?.iat;
    const decodedRefreshTokenPayloadExp_03: number | undefined = decodedRefreshTokenPayload_03?.exp;
    const decodedRefreshTokenPayloadIatDate_03: Date = new Date(decodedRefreshTokenPayloadIat_03! * 1000);
    const decodedRefreshTokenPayloadExpDate_03: Date = new Date(decodedRefreshTokenPayloadExp_03! * 1000);
    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await revokeSessionsExceptCurrentDevice(
      app,
      invalidUserAgents.userAgent_01,
      refreshToken_02,
      undefined,
      testStatus
    );

    await revokeSessionsExceptCurrentDevice(
      app,
      invalidUserAgents.userAgent_02,
      refreshToken_02,
      undefined,
      testStatus
    );

    const sessions: SessionDBType[] = await AuthRepository.findAllSessionsByUserId(createdUserId);
    const session_01 = sessions[0];
    const sessionUserId_01: string = session_01.userId;
    const sessionDeviceId_01: string = session_01.deviceId;
    const sessionDeviceName_01: string = session_01.deviceName;
    const sessionIp_01: string = session_01.ip;
    const sessionIat_01: Date = session_01.iat;
    const sessionExp_01: Date = session_01.exp;
    const session_02 = sessions[1];
    const sessionUserId_02: string = session_02.userId;
    const sessionDeviceId_02: string = session_02.deviceId;
    const sessionDeviceName_02: string = session_02.deviceName;
    const sessionIp_02: string = session_02.ip;
    const sessionIat_02: Date = session_02.iat;
    const sessionExp_02: Date = session_02.exp;
    const session_03 = sessions[2];
    const sessionUserId_03: string = session_03.userId;
    const sessionDeviceId_03: string = session_03.deviceId;
    const sessionDeviceName_03: string = session_03.deviceName;
    const sessionIp_03: string = session_03.ip;
    const sessionIat_03: Date = session_03.iat;
    const sessionExp_03: Date = session_03.exp;

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent_02,
      refreshToken_02
    );

    const securityDevice_01: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId_01: string = securityDevice_01.deviceId;
    const securityDeviceTitle_01: string = securityDevice_01.title;
    const securityDeviceIp_01: string = securityDevice_01.ip;
    const securityDeviceLastActiveDate_01: Date = new Date(securityDevice_01.lastActiveDate);
    const securityDevice_02: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[1];
    const securityDeviceId_02: string = securityDevice_02.deviceId;
    const securityDeviceTitle_02: string = securityDevice_02.title;
    const securityDeviceIp_02: string = securityDevice_02.ip;
    const securityDeviceLastActiveDate_02: Date = new Date(securityDevice_02.lastActiveDate);
    const securityDevice_03: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[2];
    const securityDeviceId_03: string = securityDevice_03.deviceId;
    const securityDeviceTitle_03: string = securityDevice_03.title;
    const securityDeviceIp_03: string = securityDevice_03.ip;
    const securityDeviceLastActiveDate_03: Date = new Date(securityDevice_03.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(3);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(3);
    expect(sessionUserId_01).toBe(createdUserId);
    expect(sessionUserId_01).toBe(decodedRefreshTokenPayloadUserId_01);
    expect(sessionDeviceId_01).toBe(decodedRefreshTokenPayloadDeviceId_01);
    expect(sessionDeviceId_01).toBe(securityDeviceId_01);
    expect(sessionDeviceName_01).toBe(testUserAgent_01);
    expect(sessionDeviceName_01).toBe(securityDeviceTitle_01);
    expect(sessionIp_01).toBe(securityDeviceIp_01);
    expect(sessionIat_01).toEqual(decodedRefreshTokenPayloadIatDate_01);
    expect(sessionIat_01).toEqual(securityDeviceLastActiveDate_01);
    expect(sessionExp_01).toEqual(decodedRefreshTokenPayloadExpDate_01);
    expect(sessionUserId_02).toBe(createdUserId);
    expect(sessionUserId_02).toBe(decodedRefreshTokenPayloadUserId_02);
    expect(sessionDeviceId_02).toBe(decodedRefreshTokenPayloadDeviceId_02);
    expect(sessionDeviceId_02).toBe(securityDeviceId_02);
    expect(sessionDeviceName_02).toBe(testUserAgent_02);
    expect(sessionDeviceName_02).toBe(securityDeviceTitle_02);
    expect(sessionIp_02).toBe(securityDeviceIp_02);
    expect(sessionIat_02).toEqual(decodedRefreshTokenPayloadIatDate_02);
    expect(sessionIat_02).toEqual(securityDeviceLastActiveDate_02);
    expect(sessionExp_02).toEqual(decodedRefreshTokenPayloadExpDate_02);
    expect(sessionUserId_03).toBe(createdUserId);
    expect(sessionUserId_03).toBe(decodedRefreshTokenPayloadUserId_03);
    expect(sessionDeviceId_03).toBe(decodedRefreshTokenPayloadDeviceId_03);
    expect(sessionDeviceId_03).toBe(securityDeviceId_03);
    expect(sessionDeviceName_03).toBe(testUserAgent_03);
    expect(sessionDeviceName_03).toBe(securityDeviceTitle_03);
    expect(sessionIp_03).toBe(securityDeviceIp_03);
    expect(sessionIat_03).toEqual(decodedRefreshTokenPayloadIatDate_03);
    expect(sessionIat_03).toEqual(securityDeviceLastActiveDate_03);
    expect(sessionExp_03).toEqual(decodedRefreshTokenPayloadExpDate_03);
  });

  it('❌ 008 should not revoke sessions except the current security device when a user agent not passed; 002. DEL /api/security/devices', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const loginUserData: LoginDataInputDTO = { loginOrEmail: createUserData.login, password: createUserData.password };
    const testUserAgent_01: string = validUserAgents.userAgent_01;
    const testUserAgent_02: string = validUserAgents.userAgent_02;
    const testUserAgent_03: string = validUserAgents.userAgent_03;

    const { refreshToken: refreshToken_01 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_01,
      loginUserData
    );

    const { refreshToken: refreshToken_02 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_02,
      loginUserData
    );

    const { refreshToken: refreshToken_03 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_03,
      loginUserData
    );

    const decodedRefreshTokenPayload_01: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_01);

    const decodedRefreshTokenPayloadUserId_01: string | undefined = decodedRefreshTokenPayload_01?.userId;
    const decodedRefreshTokenPayloadDeviceId_01: string | undefined = decodedRefreshTokenPayload_01?.deviceId;
    const decodedRefreshTokenPayloadIat_01: number | undefined = decodedRefreshTokenPayload_01?.iat;
    const decodedRefreshTokenPayloadExp_01: number | undefined = decodedRefreshTokenPayload_01?.exp;
    const decodedRefreshTokenPayloadIatDate_01: Date = new Date(decodedRefreshTokenPayloadIat_01! * 1000);
    const decodedRefreshTokenPayloadExpDate_01: Date = new Date(decodedRefreshTokenPayloadExp_01! * 1000);

    const decodedRefreshTokenPayload_02: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_02);

    const decodedRefreshTokenPayloadUserId_02: string | undefined = decodedRefreshTokenPayload_02?.userId;
    const decodedRefreshTokenPayloadDeviceId_02: string | undefined = decodedRefreshTokenPayload_02?.deviceId;
    const decodedRefreshTokenPayloadIat_02: number | undefined = decodedRefreshTokenPayload_02?.iat;
    const decodedRefreshTokenPayloadExp_02: number | undefined = decodedRefreshTokenPayload_02?.exp;
    const decodedRefreshTokenPayloadIatDate_02: Date = new Date(decodedRefreshTokenPayloadIat_02! * 1000);
    const decodedRefreshTokenPayloadExpDate_02: Date = new Date(decodedRefreshTokenPayloadExp_02! * 1000);

    const decodedRefreshTokenPayload_03: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_03);

    const decodedRefreshTokenPayloadUserId_03: string | undefined = decodedRefreshTokenPayload_03?.userId;
    const decodedRefreshTokenPayloadDeviceId_03: string | undefined = decodedRefreshTokenPayload_03?.deviceId;
    const decodedRefreshTokenPayloadIat_03: number | undefined = decodedRefreshTokenPayload_03?.iat;
    const decodedRefreshTokenPayloadExp_03: number | undefined = decodedRefreshTokenPayload_03?.exp;
    const decodedRefreshTokenPayloadIatDate_03: Date = new Date(decodedRefreshTokenPayloadIat_03! * 1000);
    const decodedRefreshTokenPayloadExpDate_03: Date = new Date(decodedRefreshTokenPayloadExp_03! * 1000);

    await revokeSessionsExceptCurrentDevice(
      app,
      testUserAgent_02,
      refreshToken_02,
      undefined,
      HttpStatuses.Unauthorized_401,
      true
    );

    const sessions: SessionDBType[] = await AuthRepository.findAllSessionsByUserId(createdUserId);
    const session_01 = sessions[0];
    const sessionUserId_01: string = session_01.userId;
    const sessionDeviceId_01: string = session_01.deviceId;
    const sessionDeviceName_01: string = session_01.deviceName;
    const sessionIp_01: string = session_01.ip;
    const sessionIat_01: Date = session_01.iat;
    const sessionExp_01: Date = session_01.exp;
    const session_02 = sessions[1];
    const sessionUserId_02: string = session_02.userId;
    const sessionDeviceId_02: string = session_02.deviceId;
    const sessionDeviceName_02: string = session_02.deviceName;
    const sessionIp_02: string = session_02.ip;
    const sessionIat_02: Date = session_02.iat;
    const sessionExp_02: Date = session_02.exp;
    const session_03 = sessions[2];
    const sessionUserId_03: string = session_03.userId;
    const sessionDeviceId_03: string = session_03.deviceId;
    const sessionDeviceName_03: string = session_03.deviceName;
    const sessionIp_03: string = session_03.ip;
    const sessionIat_03: Date = session_03.iat;
    const sessionExp_03: Date = session_03.exp;

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent_02,
      refreshToken_02
    );

    const securityDevice_01: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId_01: string = securityDevice_01.deviceId;
    const securityDeviceTitle_01: string = securityDevice_01.title;
    const securityDeviceIp_01: string = securityDevice_01.ip;
    const securityDeviceLastActiveDate_01: Date = new Date(securityDevice_01.lastActiveDate);
    const securityDevice_02: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[1];
    const securityDeviceId_02: string = securityDevice_02.deviceId;
    const securityDeviceTitle_02: string = securityDevice_02.title;
    const securityDeviceIp_02: string = securityDevice_02.ip;
    const securityDeviceLastActiveDate_02: Date = new Date(securityDevice_02.lastActiveDate);
    const securityDevice_03: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[2];
    const securityDeviceId_03: string = securityDevice_03.deviceId;
    const securityDeviceTitle_03: string = securityDevice_03.title;
    const securityDeviceIp_03: string = securityDevice_03.ip;
    const securityDeviceLastActiveDate_03: Date = new Date(securityDevice_03.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(3);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(3);
    expect(sessionUserId_01).toBe(createdUserId);
    expect(sessionUserId_01).toBe(decodedRefreshTokenPayloadUserId_01);
    expect(sessionDeviceId_01).toBe(decodedRefreshTokenPayloadDeviceId_01);
    expect(sessionDeviceId_01).toBe(securityDeviceId_01);
    expect(sessionDeviceName_01).toBe(testUserAgent_01);
    expect(sessionDeviceName_01).toBe(securityDeviceTitle_01);
    expect(sessionIp_01).toBe(securityDeviceIp_01);
    expect(sessionIat_01).toEqual(decodedRefreshTokenPayloadIatDate_01);
    expect(sessionIat_01).toEqual(securityDeviceLastActiveDate_01);
    expect(sessionExp_01).toEqual(decodedRefreshTokenPayloadExpDate_01);
    expect(sessionUserId_02).toBe(createdUserId);
    expect(sessionUserId_02).toBe(decodedRefreshTokenPayloadUserId_02);
    expect(sessionDeviceId_02).toBe(decodedRefreshTokenPayloadDeviceId_02);
    expect(sessionDeviceId_02).toBe(securityDeviceId_02);
    expect(sessionDeviceName_02).toBe(testUserAgent_02);
    expect(sessionDeviceName_02).toBe(securityDeviceTitle_02);
    expect(sessionIp_02).toBe(securityDeviceIp_02);
    expect(sessionIat_02).toEqual(decodedRefreshTokenPayloadIatDate_02);
    expect(sessionIat_02).toEqual(securityDeviceLastActiveDate_02);
    expect(sessionExp_02).toEqual(decodedRefreshTokenPayloadExpDate_02);
    expect(sessionUserId_03).toBe(createdUserId);
    expect(sessionUserId_03).toBe(decodedRefreshTokenPayloadUserId_03);
    expect(sessionDeviceId_03).toBe(decodedRefreshTokenPayloadDeviceId_03);
    expect(sessionDeviceId_03).toBe(securityDeviceId_03);
    expect(sessionDeviceName_03).toBe(testUserAgent_03);
    expect(sessionDeviceName_03).toBe(securityDeviceTitle_03);
    expect(sessionIp_03).toBe(securityDeviceIp_03);
    expect(sessionIat_03).toEqual(decodedRefreshTokenPayloadIatDate_03);
    expect(sessionIat_03).toEqual(securityDeviceLastActiveDate_03);
    expect(sessionExp_03).toEqual(decodedRefreshTokenPayloadExpDate_03);
  });

  it('❌ 009 should not revoke a session by an invalid ID of a security device; 003. DEL /api/security/devices', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const loginUserData: LoginDataInputDTO = { loginOrEmail: createUserData.login, password: createUserData.password };
    const testUserAgent_01: string = validUserAgents.userAgent_01;
    const testUserAgent_02: string = validUserAgents.userAgent_02;
    const testUserAgent_03: string = validUserAgents.userAgent_03;

    const { refreshToken: refreshToken_01 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_01,
      loginUserData
    );

    const { refreshToken: refreshToken_02 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_02,
      loginUserData
    );

    const { refreshToken: refreshToken_03 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_03,
      loginUserData
    );

    const decodedRefreshTokenPayload_01: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_01);

    const decodedRefreshTokenPayloadUserId_01: string | undefined = decodedRefreshTokenPayload_01?.userId;
    const decodedRefreshTokenPayloadDeviceId_01: string | undefined = decodedRefreshTokenPayload_01?.deviceId;
    const decodedRefreshTokenPayloadIat_01: number | undefined = decodedRefreshTokenPayload_01?.iat;
    const decodedRefreshTokenPayloadExp_01: number | undefined = decodedRefreshTokenPayload_01?.exp;
    const decodedRefreshTokenPayloadIatDate_01: Date = new Date(decodedRefreshTokenPayloadIat_01! * 1000);
    const decodedRefreshTokenPayloadExpDate_01: Date = new Date(decodedRefreshTokenPayloadExp_01! * 1000);

    const decodedRefreshTokenPayload_02: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_02);

    const decodedRefreshTokenPayloadUserId_02: string | undefined = decodedRefreshTokenPayload_02?.userId;
    const decodedRefreshTokenPayloadDeviceId_02: string | undefined = decodedRefreshTokenPayload_02?.deviceId;
    const decodedRefreshTokenPayloadIat_02: number | undefined = decodedRefreshTokenPayload_02?.iat;
    const decodedRefreshTokenPayloadExp_02: number | undefined = decodedRefreshTokenPayload_02?.exp;
    const decodedRefreshTokenPayloadIatDate_02: Date = new Date(decodedRefreshTokenPayloadIat_02! * 1000);
    const decodedRefreshTokenPayloadExpDate_02: Date = new Date(decodedRefreshTokenPayloadExp_02! * 1000);

    const decodedRefreshTokenPayload_03: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_03);

    const decodedRefreshTokenPayloadUserId_03: string | undefined = decodedRefreshTokenPayload_03?.userId;
    const decodedRefreshTokenPayloadDeviceId_03: string | undefined = decodedRefreshTokenPayload_03?.deviceId;
    const decodedRefreshTokenPayloadIat_03: number | undefined = decodedRefreshTokenPayload_03?.iat;
    const decodedRefreshTokenPayloadExp_03: number | undefined = decodedRefreshTokenPayload_03?.exp;
    const decodedRefreshTokenPayloadIatDate_03: Date = new Date(decodedRefreshTokenPayloadIat_03! * 1000);
    const decodedRefreshTokenPayloadExpDate_03: Date = new Date(decodedRefreshTokenPayloadExp_03! * 1000);
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const revokeSessionByDeviceIdResponse_01: any = await revokeSessionByDeviceId(
      app,
      testUserAgent_02,
      invalidDeviceIds.id_01,
      refreshToken_02,
      undefined,
      testStatus
    );

    const revokeSessionByDeviceIdResponse_02: any = await revokeSessionByDeviceId(
      app,
      testUserAgent_02,
      invalidDeviceIds.id_02,
      refreshToken_02,
      undefined,
      testStatus
    );

    const revokeSessionByDeviceIdResponse_03: any = await revokeSessionByDeviceId(
      app,
      testUserAgent_02,
      invalidDeviceIds.id_03,
      refreshToken_02,
      undefined,
      testStatus
    );

    const sessions: SessionDBType[] = await AuthRepository.findAllSessionsByUserId(createdUserId);
    const session_01 = sessions[0];
    const sessionUserId_01: string = session_01.userId;
    const sessionDeviceId_01: string = session_01.deviceId;
    const sessionDeviceName_01: string = session_01.deviceName;
    const sessionIp_01: string = session_01.ip;
    const sessionIat_01: Date = session_01.iat;
    const sessionExp_01: Date = session_01.exp;
    const session_02 = sessions[1];
    const sessionUserId_02: string = session_02.userId;
    const sessionDeviceId_02: string = session_02.deviceId;
    const sessionDeviceName_02: string = session_02.deviceName;
    const sessionIp_02: string = session_02.ip;
    const sessionIat_02: Date = session_02.iat;
    const sessionExp_02: Date = session_02.exp;
    const session_03 = sessions[2];
    const sessionUserId_03: string = session_03.userId;
    const sessionDeviceId_03: string = session_03.deviceId;
    const sessionDeviceName_03: string = session_03.deviceName;
    const sessionIp_03: string = session_03.ip;
    const sessionIat_03: Date = session_03.iat;
    const sessionExp_03: Date = session_03.exp;

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent_02,
      refreshToken_02
    );

    const securityDevice_01: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId_01: string = securityDevice_01.deviceId;
    const securityDeviceTitle_01: string = securityDevice_01.title;
    const securityDeviceIp_01: string = securityDevice_01.ip;
    const securityDeviceLastActiveDate_01: Date = new Date(securityDevice_01.lastActiveDate);
    const securityDevice_02: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[1];
    const securityDeviceId_02: string = securityDevice_02.deviceId;
    const securityDeviceTitle_02: string = securityDevice_02.title;
    const securityDeviceIp_02: string = securityDevice_02.ip;
    const securityDeviceLastActiveDate_02: Date = new Date(securityDevice_02.lastActiveDate);
    const securityDevice_03: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[2];
    const securityDeviceId_03: string = securityDevice_03.deviceId;
    const securityDeviceTitle_03: string = securityDevice_03.title;
    const securityDeviceIp_03: string = securityDevice_03.ip;
    const securityDeviceLastActiveDate_03: Date = new Date(securityDevice_03.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(3);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(3);
    expect(sessionUserId_01).toBe(createdUserId);
    expect(sessionUserId_01).toBe(decodedRefreshTokenPayloadUserId_01);
    expect(sessionDeviceId_01).toBe(decodedRefreshTokenPayloadDeviceId_01);
    expect(sessionDeviceId_01).toBe(securityDeviceId_01);
    expect(sessionDeviceName_01).toBe(testUserAgent_01);
    expect(sessionDeviceName_01).toBe(securityDeviceTitle_01);
    expect(sessionIp_01).toBe(securityDeviceIp_01);
    expect(sessionIat_01).toEqual(decodedRefreshTokenPayloadIatDate_01);
    expect(sessionIat_01).toEqual(securityDeviceLastActiveDate_01);
    expect(sessionExp_01).toEqual(decodedRefreshTokenPayloadExpDate_01);
    expect(sessionUserId_02).toBe(createdUserId);
    expect(sessionUserId_02).toBe(decodedRefreshTokenPayloadUserId_02);
    expect(sessionDeviceId_02).toBe(decodedRefreshTokenPayloadDeviceId_02);
    expect(sessionDeviceId_02).toBe(securityDeviceId_02);
    expect(sessionDeviceName_02).toBe(testUserAgent_02);
    expect(sessionDeviceName_02).toBe(securityDeviceTitle_02);
    expect(sessionIp_02).toBe(securityDeviceIp_02);
    expect(sessionIat_02).toEqual(decodedRefreshTokenPayloadIatDate_02);
    expect(sessionIat_02).toEqual(securityDeviceLastActiveDate_02);
    expect(sessionExp_02).toEqual(decodedRefreshTokenPayloadExpDate_02);
    expect(sessionUserId_03).toBe(createdUserId);
    expect(sessionUserId_03).toBe(decodedRefreshTokenPayloadUserId_03);
    expect(sessionDeviceId_03).toBe(decodedRefreshTokenPayloadDeviceId_03);
    expect(sessionDeviceId_03).toBe(securityDeviceId_03);
    expect(sessionDeviceName_03).toBe(testUserAgent_03);
    expect(sessionDeviceName_03).toBe(securityDeviceTitle_03);
    expect(sessionIp_03).toBe(securityDeviceIp_03);
    expect(sessionIat_03).toEqual(decodedRefreshTokenPayloadIatDate_03);
    expect(sessionIat_03).toEqual(securityDeviceLastActiveDate_03);
    expect(sessionExp_03).toEqual(decodedRefreshTokenPayloadExpDate_03);
    expect(revokeSessionByDeviceIdResponse_01.errorsMessages[0].field).toBe('id');
    expect(revokeSessionByDeviceIdResponse_01.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
    expect(revokeSessionByDeviceIdResponse_02.errorsMessages[0].field).toBe('id');
    expect(revokeSessionByDeviceIdResponse_02.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
    expect(revokeSessionByDeviceIdResponse_03.errorsMessages[0].field).toBe('id');
    expect(revokeSessionByDeviceIdResponse_03.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
  });

  it('❌ 010 should not revoke a session by an incorrect ID of a security device; 003. DEL /api/security/devices', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const loginUserData: LoginDataInputDTO = { loginOrEmail: createUserData.login, password: createUserData.password };
    const testUserAgent_01: string = validUserAgents.userAgent_01;
    const testUserAgent_02: string = validUserAgents.userAgent_02;
    const testUserAgent_03: string = validUserAgents.userAgent_03;

    const { refreshToken: refreshToken_01 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_01,
      loginUserData
    );

    const { refreshToken: refreshToken_02 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_02,
      loginUserData
    );

    const { refreshToken: refreshToken_03 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_03,
      loginUserData
    );

    const decodedRefreshTokenPayload_01: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_01);

    const decodedRefreshTokenPayloadUserId_01: string | undefined = decodedRefreshTokenPayload_01?.userId;
    const decodedRefreshTokenPayloadDeviceId_01: string | undefined = decodedRefreshTokenPayload_01?.deviceId;
    const decodedRefreshTokenPayloadIat_01: number | undefined = decodedRefreshTokenPayload_01?.iat;
    const decodedRefreshTokenPayloadExp_01: number | undefined = decodedRefreshTokenPayload_01?.exp;
    const decodedRefreshTokenPayloadIatDate_01: Date = new Date(decodedRefreshTokenPayloadIat_01! * 1000);
    const decodedRefreshTokenPayloadExpDate_01: Date = new Date(decodedRefreshTokenPayloadExp_01! * 1000);

    const decodedRefreshTokenPayload_02: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_02);

    const decodedRefreshTokenPayloadUserId_02: string | undefined = decodedRefreshTokenPayload_02?.userId;
    const decodedRefreshTokenPayloadDeviceId_02: string | undefined = decodedRefreshTokenPayload_02?.deviceId;
    const decodedRefreshTokenPayloadIat_02: number | undefined = decodedRefreshTokenPayload_02?.iat;
    const decodedRefreshTokenPayloadExp_02: number | undefined = decodedRefreshTokenPayload_02?.exp;
    const decodedRefreshTokenPayloadIatDate_02: Date = new Date(decodedRefreshTokenPayloadIat_02! * 1000);
    const decodedRefreshTokenPayloadExpDate_02: Date = new Date(decodedRefreshTokenPayloadExp_02! * 1000);

    const decodedRefreshTokenPayload_03: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_03);

    const decodedRefreshTokenPayloadUserId_03: string | undefined = decodedRefreshTokenPayload_03?.userId;
    const decodedRefreshTokenPayloadDeviceId_03: string | undefined = decodedRefreshTokenPayload_03?.deviceId;
    const decodedRefreshTokenPayloadIat_03: number | undefined = decodedRefreshTokenPayload_03?.iat;
    const decodedRefreshTokenPayloadExp_03: number | undefined = decodedRefreshTokenPayload_03?.exp;
    const decodedRefreshTokenPayloadIatDate_03: Date = new Date(decodedRefreshTokenPayloadIat_03! * 1000);
    const decodedRefreshTokenPayloadExpDate_03: Date = new Date(decodedRefreshTokenPayloadExp_03! * 1000);

    await revokeSessionByDeviceId(
      app,
      testUserAgent_02,
      validDeviceIds.id_01,
      refreshToken_02,
      undefined,
      HttpStatuses.NotFound_404
    );

    const sessions: SessionDBType[] = await AuthRepository.findAllSessionsByUserId(createdUserId);
    const session_01 = sessions[0];
    const sessionUserId_01: string = session_01.userId;
    const sessionDeviceId_01: string = session_01.deviceId;
    const sessionDeviceName_01: string = session_01.deviceName;
    const sessionIp_01: string = session_01.ip;
    const sessionIat_01: Date = session_01.iat;
    const sessionExp_01: Date = session_01.exp;
    const session_02 = sessions[1];
    const sessionUserId_02: string = session_02.userId;
    const sessionDeviceId_02: string = session_02.deviceId;
    const sessionDeviceName_02: string = session_02.deviceName;
    const sessionIp_02: string = session_02.ip;
    const sessionIat_02: Date = session_02.iat;
    const sessionExp_02: Date = session_02.exp;
    const session_03 = sessions[2];
    const sessionUserId_03: string = session_03.userId;
    const sessionDeviceId_03: string = session_03.deviceId;
    const sessionDeviceName_03: string = session_03.deviceName;
    const sessionIp_03: string = session_03.ip;
    const sessionIat_03: Date = session_03.iat;
    const sessionExp_03: Date = session_03.exp;

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent_02,
      refreshToken_02
    );

    const securityDevice_01: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId_01: string = securityDevice_01.deviceId;
    const securityDeviceTitle_01: string = securityDevice_01.title;
    const securityDeviceIp_01: string = securityDevice_01.ip;
    const securityDeviceLastActiveDate_01: Date = new Date(securityDevice_01.lastActiveDate);
    const securityDevice_02: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[1];
    const securityDeviceId_02: string = securityDevice_02.deviceId;
    const securityDeviceTitle_02: string = securityDevice_02.title;
    const securityDeviceIp_02: string = securityDevice_02.ip;
    const securityDeviceLastActiveDate_02: Date = new Date(securityDevice_02.lastActiveDate);
    const securityDevice_03: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[2];
    const securityDeviceId_03: string = securityDevice_03.deviceId;
    const securityDeviceTitle_03: string = securityDevice_03.title;
    const securityDeviceIp_03: string = securityDevice_03.ip;
    const securityDeviceLastActiveDate_03: Date = new Date(securityDevice_03.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(3);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(3);
    expect(sessionUserId_01).toBe(createdUserId);
    expect(sessionUserId_01).toBe(decodedRefreshTokenPayloadUserId_01);
    expect(sessionDeviceId_01).toBe(decodedRefreshTokenPayloadDeviceId_01);
    expect(sessionDeviceId_01).toBe(securityDeviceId_01);
    expect(sessionDeviceName_01).toBe(testUserAgent_01);
    expect(sessionDeviceName_01).toBe(securityDeviceTitle_01);
    expect(sessionIp_01).toBe(securityDeviceIp_01);
    expect(sessionIat_01).toEqual(decodedRefreshTokenPayloadIatDate_01);
    expect(sessionIat_01).toEqual(securityDeviceLastActiveDate_01);
    expect(sessionExp_01).toEqual(decodedRefreshTokenPayloadExpDate_01);
    expect(sessionUserId_02).toBe(createdUserId);
    expect(sessionUserId_02).toBe(decodedRefreshTokenPayloadUserId_02);
    expect(sessionDeviceId_02).toBe(decodedRefreshTokenPayloadDeviceId_02);
    expect(sessionDeviceId_02).toBe(securityDeviceId_02);
    expect(sessionDeviceName_02).toBe(testUserAgent_02);
    expect(sessionDeviceName_02).toBe(securityDeviceTitle_02);
    expect(sessionIp_02).toBe(securityDeviceIp_02);
    expect(sessionIat_02).toEqual(decodedRefreshTokenPayloadIatDate_02);
    expect(sessionIat_02).toEqual(securityDeviceLastActiveDate_02);
    expect(sessionExp_02).toEqual(decodedRefreshTokenPayloadExpDate_02);
    expect(sessionUserId_03).toBe(createdUserId);
    expect(sessionUserId_03).toBe(decodedRefreshTokenPayloadUserId_03);
    expect(sessionDeviceId_03).toBe(decodedRefreshTokenPayloadDeviceId_03);
    expect(sessionDeviceId_03).toBe(securityDeviceId_03);
    expect(sessionDeviceName_03).toBe(testUserAgent_03);
    expect(sessionDeviceName_03).toBe(securityDeviceTitle_03);
    expect(sessionIp_03).toBe(securityDeviceIp_03);
    expect(sessionIat_03).toEqual(decodedRefreshTokenPayloadIatDate_03);
    expect(sessionIat_03).toEqual(securityDeviceLastActiveDate_03);
    expect(sessionExp_03).toEqual(decodedRefreshTokenPayloadExpDate_03);
  });

  it('❌ 011 should not revoke a session by a correct ID of a security device when an invalid refresh token passed; 003. DEL /api/security/devices', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const loginUserData: LoginDataInputDTO = { loginOrEmail: createUserData.login, password: createUserData.password };
    const testUserAgent_01: string = validUserAgents.userAgent_01;
    const testUserAgent_02: string = validUserAgents.userAgent_02;
    const testUserAgent_03: string = validUserAgents.userAgent_03;

    const { refreshToken: refreshToken_01 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_01,
      loginUserData
    );

    const { refreshToken: refreshToken_02 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_02,
      loginUserData
    );

    const { refreshToken: refreshToken_03 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_03,
      loginUserData
    );

    const decodedRefreshTokenPayload_01: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_01);

    const decodedRefreshTokenPayloadUserId_01: string | undefined = decodedRefreshTokenPayload_01?.userId;
    const decodedRefreshTokenPayloadDeviceId_01: string | undefined = decodedRefreshTokenPayload_01?.deviceId;
    const decodedRefreshTokenPayloadIat_01: number | undefined = decodedRefreshTokenPayload_01?.iat;
    const decodedRefreshTokenPayloadExp_01: number | undefined = decodedRefreshTokenPayload_01?.exp;
    const decodedRefreshTokenPayloadIatDate_01: Date = new Date(decodedRefreshTokenPayloadIat_01! * 1000);
    const decodedRefreshTokenPayloadExpDate_01: Date = new Date(decodedRefreshTokenPayloadExp_01! * 1000);

    const decodedRefreshTokenPayload_02: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_02);

    const decodedRefreshTokenPayloadUserId_02: string | undefined = decodedRefreshTokenPayload_02?.userId;
    const decodedRefreshTokenPayloadDeviceId_02: string | undefined = decodedRefreshTokenPayload_02?.deviceId;
    const decodedRefreshTokenPayloadIat_02: number | undefined = decodedRefreshTokenPayload_02?.iat;
    const decodedRefreshTokenPayloadExp_02: number | undefined = decodedRefreshTokenPayload_02?.exp;
    const decodedRefreshTokenPayloadIatDate_02: Date = new Date(decodedRefreshTokenPayloadIat_02! * 1000);
    const decodedRefreshTokenPayloadExpDate_02: Date = new Date(decodedRefreshTokenPayloadExp_02! * 1000);

    const decodedRefreshTokenPayload_03: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_03);

    const decodedRefreshTokenPayloadUserId_03: string | undefined = decodedRefreshTokenPayload_03?.userId;
    const decodedRefreshTokenPayloadDeviceId_03: string | undefined = decodedRefreshTokenPayload_03?.deviceId;
    const decodedRefreshTokenPayloadIat_03: number | undefined = decodedRefreshTokenPayload_03?.iat;
    const decodedRefreshTokenPayloadExp_03: number | undefined = decodedRefreshTokenPayload_03?.exp;
    const decodedRefreshTokenPayloadIatDate_03: Date = new Date(decodedRefreshTokenPayloadIat_03! * 1000);
    const decodedRefreshTokenPayloadExpDate_03: Date = new Date(decodedRefreshTokenPayloadExp_03! * 1000);
    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await revokeSessionByDeviceId(
      app,
      testUserAgent_02,
      decodedRefreshTokenPayloadDeviceId_02,
      invalidRefreshTokens.RT_01,
      undefined,
      testStatus
    );

    await revokeSessionByDeviceId(
      app,
      testUserAgent_02,
      decodedRefreshTokenPayloadDeviceId_02,
      invalidRefreshTokens.RT_02,
      undefined,
      testStatus
    );

    await revokeSessionByDeviceId(
      app,
      testUserAgent_02,
      decodedRefreshTokenPayloadDeviceId_02,
      invalidRefreshTokens.RT_03,
      undefined,
      testStatus
    );

    await revokeSessionByDeviceId(
      app,
      testUserAgent_02,
      decodedRefreshTokenPayloadDeviceId_02,
      invalidRefreshTokens.RT_04,
      undefined,
      testStatus
    );

    await revokeSessionByDeviceId(
      app,
      testUserAgent_02,
      decodedRefreshTokenPayloadDeviceId_02,
      invalidRefreshTokens.RT_05,
      undefined,
      testStatus
    );

    await revokeSessionByDeviceId(
      app,
      testUserAgent_02,
      decodedRefreshTokenPayloadDeviceId_02,
      invalidRefreshTokens.RT_06,
      undefined,
      testStatus
    );

    await revokeSessionByDeviceId(
      app,
      testUserAgent_02,
      decodedRefreshTokenPayloadDeviceId_02,
      invalidRefreshTokens.RT_07,
      undefined,
      testStatus
    );

    await revokeSessionByDeviceId(
      app,
      testUserAgent_02,
      decodedRefreshTokenPayloadDeviceId_02,
      invalidRefreshTokens.RT_08,
      undefined,
      testStatus
    );

    await revokeSessionByDeviceId(
      app,
      testUserAgent_02,
      decodedRefreshTokenPayloadDeviceId_02,
      invalidRefreshTokens.RT_09,
      undefined,
      testStatus
    );

    const sessions: SessionDBType[] = await AuthRepository.findAllSessionsByUserId(createdUserId);
    const session_01 = sessions[0];
    const sessionUserId_01: string = session_01.userId;
    const sessionDeviceId_01: string = session_01.deviceId;
    const sessionDeviceName_01: string = session_01.deviceName;
    const sessionIp_01: string = session_01.ip;
    const sessionIat_01: Date = session_01.iat;
    const sessionExp_01: Date = session_01.exp;
    const session_02 = sessions[1];
    const sessionUserId_02: string = session_02.userId;
    const sessionDeviceId_02: string = session_02.deviceId;
    const sessionDeviceName_02: string = session_02.deviceName;
    const sessionIp_02: string = session_02.ip;
    const sessionIat_02: Date = session_02.iat;
    const sessionExp_02: Date = session_02.exp;
    const session_03 = sessions[2];
    const sessionUserId_03: string = session_03.userId;
    const sessionDeviceId_03: string = session_03.deviceId;
    const sessionDeviceName_03: string = session_03.deviceName;
    const sessionIp_03: string = session_03.ip;
    const sessionIat_03: Date = session_03.iat;
    const sessionExp_03: Date = session_03.exp;

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent_02,
      refreshToken_02
    );

    const securityDevice_01: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId_01: string = securityDevice_01.deviceId;
    const securityDeviceTitle_01: string = securityDevice_01.title;
    const securityDeviceIp_01: string = securityDevice_01.ip;
    const securityDeviceLastActiveDate_01: Date = new Date(securityDevice_01.lastActiveDate);
    const securityDevice_02: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[1];
    const securityDeviceId_02: string = securityDevice_02.deviceId;
    const securityDeviceTitle_02: string = securityDevice_02.title;
    const securityDeviceIp_02: string = securityDevice_02.ip;
    const securityDeviceLastActiveDate_02: Date = new Date(securityDevice_02.lastActiveDate);
    const securityDevice_03: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[2];
    const securityDeviceId_03: string = securityDevice_03.deviceId;
    const securityDeviceTitle_03: string = securityDevice_03.title;
    const securityDeviceIp_03: string = securityDevice_03.ip;
    const securityDeviceLastActiveDate_03: Date = new Date(securityDevice_03.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(3);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(3);
    expect(sessionUserId_01).toBe(createdUserId);
    expect(sessionUserId_01).toBe(decodedRefreshTokenPayloadUserId_01);
    expect(sessionDeviceId_01).toBe(decodedRefreshTokenPayloadDeviceId_01);
    expect(sessionDeviceId_01).toBe(securityDeviceId_01);
    expect(sessionDeviceName_01).toBe(testUserAgent_01);
    expect(sessionDeviceName_01).toBe(securityDeviceTitle_01);
    expect(sessionIp_01).toBe(securityDeviceIp_01);
    expect(sessionIat_01).toEqual(decodedRefreshTokenPayloadIatDate_01);
    expect(sessionIat_01).toEqual(securityDeviceLastActiveDate_01);
    expect(sessionExp_01).toEqual(decodedRefreshTokenPayloadExpDate_01);
    expect(sessionUserId_02).toBe(createdUserId);
    expect(sessionUserId_02).toBe(decodedRefreshTokenPayloadUserId_02);
    expect(sessionDeviceId_02).toBe(decodedRefreshTokenPayloadDeviceId_02);
    expect(sessionDeviceId_02).toBe(securityDeviceId_02);
    expect(sessionDeviceName_02).toBe(testUserAgent_02);
    expect(sessionDeviceName_02).toBe(securityDeviceTitle_02);
    expect(sessionIp_02).toBe(securityDeviceIp_02);
    expect(sessionIat_02).toEqual(decodedRefreshTokenPayloadIatDate_02);
    expect(sessionIat_02).toEqual(securityDeviceLastActiveDate_02);
    expect(sessionExp_02).toEqual(decodedRefreshTokenPayloadExpDate_02);
    expect(sessionUserId_03).toBe(createdUserId);
    expect(sessionUserId_03).toBe(decodedRefreshTokenPayloadUserId_03);
    expect(sessionDeviceId_03).toBe(decodedRefreshTokenPayloadDeviceId_03);
    expect(sessionDeviceId_03).toBe(securityDeviceId_03);
    expect(sessionDeviceName_03).toBe(testUserAgent_03);
    expect(sessionDeviceName_03).toBe(securityDeviceTitle_03);
    expect(sessionIp_03).toBe(securityDeviceIp_03);
    expect(sessionIat_03).toEqual(decodedRefreshTokenPayloadIatDate_03);
    expect(sessionIat_03).toEqual(securityDeviceLastActiveDate_03);
    expect(sessionExp_03).toEqual(decodedRefreshTokenPayloadExpDate_03);
  });

  it('❌ 012 should not revoke a session by a correct ID of a security device when an incorrect refresh token passed; 003. DEL /api/security/devices', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const loginUserData: LoginDataInputDTO = { loginOrEmail: createUserData.login, password: createUserData.password };
    const testUserAgent_01: string = validUserAgents.userAgent_01;
    const testUserAgent_02: string = validUserAgents.userAgent_02;
    const testUserAgent_03: string = validUserAgents.userAgent_03;

    const { refreshToken: refreshToken_01 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_01,
      loginUserData
    );

    const { refreshToken: refreshToken_02 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_02,
      loginUserData
    );

    const { refreshToken: refreshToken_03 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_03,
      loginUserData
    );

    const decodedRefreshTokenPayload_01: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_01);

    const decodedRefreshTokenPayloadUserId_01: string | undefined = decodedRefreshTokenPayload_01?.userId;
    const decodedRefreshTokenPayloadDeviceId_01: string | undefined = decodedRefreshTokenPayload_01?.deviceId;
    const decodedRefreshTokenPayloadIat_01: number | undefined = decodedRefreshTokenPayload_01?.iat;
    const decodedRefreshTokenPayloadExp_01: number | undefined = decodedRefreshTokenPayload_01?.exp;
    const decodedRefreshTokenPayloadIatDate_01: Date = new Date(decodedRefreshTokenPayloadIat_01! * 1000);
    const decodedRefreshTokenPayloadExpDate_01: Date = new Date(decodedRefreshTokenPayloadExp_01! * 1000);

    const decodedRefreshTokenPayload_02: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_02);

    const decodedRefreshTokenPayloadUserId_02: string | undefined = decodedRefreshTokenPayload_02?.userId;
    const decodedRefreshTokenPayloadDeviceId_02: string | undefined = decodedRefreshTokenPayload_02?.deviceId;
    const decodedRefreshTokenPayloadIat_02: number | undefined = decodedRefreshTokenPayload_02?.iat;
    const decodedRefreshTokenPayloadExp_02: number | undefined = decodedRefreshTokenPayload_02?.exp;
    const decodedRefreshTokenPayloadIatDate_02: Date = new Date(decodedRefreshTokenPayloadIat_02! * 1000);
    const decodedRefreshTokenPayloadExpDate_02: Date = new Date(decodedRefreshTokenPayloadExp_02! * 1000);

    const decodedRefreshTokenPayload_03: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_03);

    const decodedRefreshTokenPayloadUserId_03: string | undefined = decodedRefreshTokenPayload_03?.userId;
    const decodedRefreshTokenPayloadDeviceId_03: string | undefined = decodedRefreshTokenPayload_03?.deviceId;
    const decodedRefreshTokenPayloadIat_03: number | undefined = decodedRefreshTokenPayload_03?.iat;
    const decodedRefreshTokenPayloadExp_03: number | undefined = decodedRefreshTokenPayload_03?.exp;
    const decodedRefreshTokenPayloadIatDate_03: Date = new Date(decodedRefreshTokenPayloadIat_03! * 1000);
    const decodedRefreshTokenPayloadExpDate_03: Date = new Date(decodedRefreshTokenPayloadExp_03! * 1000);

    await revokeSessionByDeviceId(
      app,
      testUserAgent_02,
      decodedRefreshTokenPayloadDeviceId_02,
      validRefreshTokens.RT_01,
      undefined,
      HttpStatuses.Unauthorized_401
    );

    const sessions: SessionDBType[] = await AuthRepository.findAllSessionsByUserId(createdUserId);
    const session_01 = sessions[0];
    const sessionUserId_01: string = session_01.userId;
    const sessionDeviceId_01: string = session_01.deviceId;
    const sessionDeviceName_01: string = session_01.deviceName;
    const sessionIp_01: string = session_01.ip;
    const sessionIat_01: Date = session_01.iat;
    const sessionExp_01: Date = session_01.exp;
    const session_02 = sessions[1];
    const sessionUserId_02: string = session_02.userId;
    const sessionDeviceId_02: string = session_02.deviceId;
    const sessionDeviceName_02: string = session_02.deviceName;
    const sessionIp_02: string = session_02.ip;
    const sessionIat_02: Date = session_02.iat;
    const sessionExp_02: Date = session_02.exp;
    const session_03 = sessions[2];
    const sessionUserId_03: string = session_03.userId;
    const sessionDeviceId_03: string = session_03.deviceId;
    const sessionDeviceName_03: string = session_03.deviceName;
    const sessionIp_03: string = session_03.ip;
    const sessionIat_03: Date = session_03.iat;
    const sessionExp_03: Date = session_03.exp;

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent_02,
      refreshToken_02
    );

    const securityDevice_01: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId_01: string = securityDevice_01.deviceId;
    const securityDeviceTitle_01: string = securityDevice_01.title;
    const securityDeviceIp_01: string = securityDevice_01.ip;
    const securityDeviceLastActiveDate_01: Date = new Date(securityDevice_01.lastActiveDate);
    const securityDevice_02: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[1];
    const securityDeviceId_02: string = securityDevice_02.deviceId;
    const securityDeviceTitle_02: string = securityDevice_02.title;
    const securityDeviceIp_02: string = securityDevice_02.ip;
    const securityDeviceLastActiveDate_02: Date = new Date(securityDevice_02.lastActiveDate);
    const securityDevice_03: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[2];
    const securityDeviceId_03: string = securityDevice_03.deviceId;
    const securityDeviceTitle_03: string = securityDevice_03.title;
    const securityDeviceIp_03: string = securityDevice_03.ip;
    const securityDeviceLastActiveDate_03: Date = new Date(securityDevice_03.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(3);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(3);
    expect(sessionUserId_01).toBe(createdUserId);
    expect(sessionUserId_01).toBe(decodedRefreshTokenPayloadUserId_01);
    expect(sessionDeviceId_01).toBe(decodedRefreshTokenPayloadDeviceId_01);
    expect(sessionDeviceId_01).toBe(securityDeviceId_01);
    expect(sessionDeviceName_01).toBe(testUserAgent_01);
    expect(sessionDeviceName_01).toBe(securityDeviceTitle_01);
    expect(sessionIp_01).toBe(securityDeviceIp_01);
    expect(sessionIat_01).toEqual(decodedRefreshTokenPayloadIatDate_01);
    expect(sessionIat_01).toEqual(securityDeviceLastActiveDate_01);
    expect(sessionExp_01).toEqual(decodedRefreshTokenPayloadExpDate_01);
    expect(sessionUserId_02).toBe(createdUserId);
    expect(sessionUserId_02).toBe(decodedRefreshTokenPayloadUserId_02);
    expect(sessionDeviceId_02).toBe(decodedRefreshTokenPayloadDeviceId_02);
    expect(sessionDeviceId_02).toBe(securityDeviceId_02);
    expect(sessionDeviceName_02).toBe(testUserAgent_02);
    expect(sessionDeviceName_02).toBe(securityDeviceTitle_02);
    expect(sessionIp_02).toBe(securityDeviceIp_02);
    expect(sessionIat_02).toEqual(decodedRefreshTokenPayloadIatDate_02);
    expect(sessionIat_02).toEqual(securityDeviceLastActiveDate_02);
    expect(sessionExp_02).toEqual(decodedRefreshTokenPayloadExpDate_02);
    expect(sessionUserId_03).toBe(createdUserId);
    expect(sessionUserId_03).toBe(decodedRefreshTokenPayloadUserId_03);
    expect(sessionDeviceId_03).toBe(decodedRefreshTokenPayloadDeviceId_03);
    expect(sessionDeviceId_03).toBe(securityDeviceId_03);
    expect(sessionDeviceName_03).toBe(testUserAgent_03);
    expect(sessionDeviceName_03).toBe(securityDeviceTitle_03);
    expect(sessionIp_03).toBe(securityDeviceIp_03);
    expect(sessionIat_03).toEqual(decodedRefreshTokenPayloadIatDate_03);
    expect(sessionIat_03).toEqual(securityDeviceLastActiveDate_03);
    expect(sessionExp_03).toEqual(decodedRefreshTokenPayloadExpDate_03);
  });

  it('❌ 013 should not revoke a session by a correct ID of a security device when an invalid user agent passed; 003. DEL /api/security/devices', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const loginUserData: LoginDataInputDTO = { loginOrEmail: createUserData.login, password: createUserData.password };
    const testUserAgent_01: string = validUserAgents.userAgent_01;
    const testUserAgent_02: string = validUserAgents.userAgent_02;
    const testUserAgent_03: string = validUserAgents.userAgent_03;

    const { refreshToken: refreshToken_01 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_01,
      loginUserData
    );

    const { refreshToken: refreshToken_02 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_02,
      loginUserData
    );

    const { refreshToken: refreshToken_03 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_03,
      loginUserData
    );

    const decodedRefreshTokenPayload_01: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_01);

    const decodedRefreshTokenPayloadUserId_01: string | undefined = decodedRefreshTokenPayload_01?.userId;
    const decodedRefreshTokenPayloadDeviceId_01: string | undefined = decodedRefreshTokenPayload_01?.deviceId;
    const decodedRefreshTokenPayloadIat_01: number | undefined = decodedRefreshTokenPayload_01?.iat;
    const decodedRefreshTokenPayloadExp_01: number | undefined = decodedRefreshTokenPayload_01?.exp;
    const decodedRefreshTokenPayloadIatDate_01: Date = new Date(decodedRefreshTokenPayloadIat_01! * 1000);
    const decodedRefreshTokenPayloadExpDate_01: Date = new Date(decodedRefreshTokenPayloadExp_01! * 1000);

    const decodedRefreshTokenPayload_02: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_02);

    const decodedRefreshTokenPayloadUserId_02: string | undefined = decodedRefreshTokenPayload_02?.userId;
    const decodedRefreshTokenPayloadDeviceId_02: string | undefined = decodedRefreshTokenPayload_02?.deviceId;
    const decodedRefreshTokenPayloadIat_02: number | undefined = decodedRefreshTokenPayload_02?.iat;
    const decodedRefreshTokenPayloadExp_02: number | undefined = decodedRefreshTokenPayload_02?.exp;
    const decodedRefreshTokenPayloadIatDate_02: Date = new Date(decodedRefreshTokenPayloadIat_02! * 1000);
    const decodedRefreshTokenPayloadExpDate_02: Date = new Date(decodedRefreshTokenPayloadExp_02! * 1000);

    const decodedRefreshTokenPayload_03: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_03);

    const decodedRefreshTokenPayloadUserId_03: string | undefined = decodedRefreshTokenPayload_03?.userId;
    const decodedRefreshTokenPayloadDeviceId_03: string | undefined = decodedRefreshTokenPayload_03?.deviceId;
    const decodedRefreshTokenPayloadIat_03: number | undefined = decodedRefreshTokenPayload_03?.iat;
    const decodedRefreshTokenPayloadExp_03: number | undefined = decodedRefreshTokenPayload_03?.exp;
    const decodedRefreshTokenPayloadIatDate_03: Date = new Date(decodedRefreshTokenPayloadIat_03! * 1000);
    const decodedRefreshTokenPayloadExpDate_03: Date = new Date(decodedRefreshTokenPayloadExp_03! * 1000);
    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await revokeSessionByDeviceId(
      app,
      invalidUserAgents.userAgent_01,
      decodedRefreshTokenPayloadDeviceId_02,
      refreshToken_02,
      undefined,
      testStatus
    );

    await revokeSessionByDeviceId(
      app,
      invalidUserAgents.userAgent_02,
      decodedRefreshTokenPayloadDeviceId_02,
      refreshToken_02,
      undefined,
      testStatus
    );

    const sessions: SessionDBType[] = await AuthRepository.findAllSessionsByUserId(createdUserId);
    const session_01 = sessions[0];
    const sessionUserId_01: string = session_01.userId;
    const sessionDeviceId_01: string = session_01.deviceId;
    const sessionDeviceName_01: string = session_01.deviceName;
    const sessionIp_01: string = session_01.ip;
    const sessionIat_01: Date = session_01.iat;
    const sessionExp_01: Date = session_01.exp;
    const session_02 = sessions[1];
    const sessionUserId_02: string = session_02.userId;
    const sessionDeviceId_02: string = session_02.deviceId;
    const sessionDeviceName_02: string = session_02.deviceName;
    const sessionIp_02: string = session_02.ip;
    const sessionIat_02: Date = session_02.iat;
    const sessionExp_02: Date = session_02.exp;
    const session_03 = sessions[2];
    const sessionUserId_03: string = session_03.userId;
    const sessionDeviceId_03: string = session_03.deviceId;
    const sessionDeviceName_03: string = session_03.deviceName;
    const sessionIp_03: string = session_03.ip;
    const sessionIat_03: Date = session_03.iat;
    const sessionExp_03: Date = session_03.exp;

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent_02,
      refreshToken_02
    );

    const securityDevice_01: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId_01: string = securityDevice_01.deviceId;
    const securityDeviceTitle_01: string = securityDevice_01.title;
    const securityDeviceIp_01: string = securityDevice_01.ip;
    const securityDeviceLastActiveDate_01: Date = new Date(securityDevice_01.lastActiveDate);
    const securityDevice_02: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[1];
    const securityDeviceId_02: string = securityDevice_02.deviceId;
    const securityDeviceTitle_02: string = securityDevice_02.title;
    const securityDeviceIp_02: string = securityDevice_02.ip;
    const securityDeviceLastActiveDate_02: Date = new Date(securityDevice_02.lastActiveDate);
    const securityDevice_03: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[2];
    const securityDeviceId_03: string = securityDevice_03.deviceId;
    const securityDeviceTitle_03: string = securityDevice_03.title;
    const securityDeviceIp_03: string = securityDevice_03.ip;
    const securityDeviceLastActiveDate_03: Date = new Date(securityDevice_03.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(3);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(3);
    expect(sessionUserId_01).toBe(createdUserId);
    expect(sessionUserId_01).toBe(decodedRefreshTokenPayloadUserId_01);
    expect(sessionDeviceId_01).toBe(decodedRefreshTokenPayloadDeviceId_01);
    expect(sessionDeviceId_01).toBe(securityDeviceId_01);
    expect(sessionDeviceName_01).toBe(testUserAgent_01);
    expect(sessionDeviceName_01).toBe(securityDeviceTitle_01);
    expect(sessionIp_01).toBe(securityDeviceIp_01);
    expect(sessionIat_01).toEqual(decodedRefreshTokenPayloadIatDate_01);
    expect(sessionIat_01).toEqual(securityDeviceLastActiveDate_01);
    expect(sessionExp_01).toEqual(decodedRefreshTokenPayloadExpDate_01);
    expect(sessionUserId_02).toBe(createdUserId);
    expect(sessionUserId_02).toBe(decodedRefreshTokenPayloadUserId_02);
    expect(sessionDeviceId_02).toBe(decodedRefreshTokenPayloadDeviceId_02);
    expect(sessionDeviceId_02).toBe(securityDeviceId_02);
    expect(sessionDeviceName_02).toBe(testUserAgent_02);
    expect(sessionDeviceName_02).toBe(securityDeviceTitle_02);
    expect(sessionIp_02).toBe(securityDeviceIp_02);
    expect(sessionIat_02).toEqual(decodedRefreshTokenPayloadIatDate_02);
    expect(sessionIat_02).toEqual(securityDeviceLastActiveDate_02);
    expect(sessionExp_02).toEqual(decodedRefreshTokenPayloadExpDate_02);
    expect(sessionUserId_03).toBe(createdUserId);
    expect(sessionUserId_03).toBe(decodedRefreshTokenPayloadUserId_03);
    expect(sessionDeviceId_03).toBe(decodedRefreshTokenPayloadDeviceId_03);
    expect(sessionDeviceId_03).toBe(securityDeviceId_03);
    expect(sessionDeviceName_03).toBe(testUserAgent_03);
    expect(sessionDeviceName_03).toBe(securityDeviceTitle_03);
    expect(sessionIp_03).toBe(securityDeviceIp_03);
    expect(sessionIat_03).toEqual(decodedRefreshTokenPayloadIatDate_03);
    expect(sessionIat_03).toEqual(securityDeviceLastActiveDate_03);
    expect(sessionExp_03).toEqual(decodedRefreshTokenPayloadExpDate_03);
  });

  it('❌ 014 should not revoke a session by a correct ID of a security device when a user agent not passed; 003. DEL /api/security/devices', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const loginUserData: LoginDataInputDTO = { loginOrEmail: createUserData.login, password: createUserData.password };
    const testUserAgent_01: string = validUserAgents.userAgent_01;
    const testUserAgent_02: string = validUserAgents.userAgent_02;
    const testUserAgent_03: string = validUserAgents.userAgent_03;

    const { refreshToken: refreshToken_01 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_01,
      loginUserData
    );

    const { refreshToken: refreshToken_02 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_02,
      loginUserData
    );

    const { refreshToken: refreshToken_03 }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_03,
      loginUserData
    );

    const decodedRefreshTokenPayload_01: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_01);

    const decodedRefreshTokenPayloadUserId_01: string | undefined = decodedRefreshTokenPayload_01?.userId;
    const decodedRefreshTokenPayloadDeviceId_01: string | undefined = decodedRefreshTokenPayload_01?.deviceId;
    const decodedRefreshTokenPayloadIat_01: number | undefined = decodedRefreshTokenPayload_01?.iat;
    const decodedRefreshTokenPayloadExp_01: number | undefined = decodedRefreshTokenPayload_01?.exp;
    const decodedRefreshTokenPayloadIatDate_01: Date = new Date(decodedRefreshTokenPayloadIat_01! * 1000);
    const decodedRefreshTokenPayloadExpDate_01: Date = new Date(decodedRefreshTokenPayloadExp_01! * 1000);

    const decodedRefreshTokenPayload_02: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_02);

    const decodedRefreshTokenPayloadUserId_02: string | undefined = decodedRefreshTokenPayload_02?.userId;
    const decodedRefreshTokenPayloadDeviceId_02: string | undefined = decodedRefreshTokenPayload_02?.deviceId;
    const decodedRefreshTokenPayloadIat_02: number | undefined = decodedRefreshTokenPayload_02?.iat;
    const decodedRefreshTokenPayloadExp_02: number | undefined = decodedRefreshTokenPayload_02?.exp;
    const decodedRefreshTokenPayloadIatDate_02: Date = new Date(decodedRefreshTokenPayloadIat_02! * 1000);
    const decodedRefreshTokenPayloadExpDate_02: Date = new Date(decodedRefreshTokenPayloadExp_02! * 1000);

    const decodedRefreshTokenPayload_03: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await JwtAdapter.decodeRefreshToken(refreshToken_03);

    const decodedRefreshTokenPayloadUserId_03: string | undefined = decodedRefreshTokenPayload_03?.userId;
    const decodedRefreshTokenPayloadDeviceId_03: string | undefined = decodedRefreshTokenPayload_03?.deviceId;
    const decodedRefreshTokenPayloadIat_03: number | undefined = decodedRefreshTokenPayload_03?.iat;
    const decodedRefreshTokenPayloadExp_03: number | undefined = decodedRefreshTokenPayload_03?.exp;
    const decodedRefreshTokenPayloadIatDate_03: Date = new Date(decodedRefreshTokenPayloadIat_03! * 1000);
    const decodedRefreshTokenPayloadExpDate_03: Date = new Date(decodedRefreshTokenPayloadExp_03! * 1000);

    await revokeSessionByDeviceId(
      app,
      testUserAgent_02,
      decodedRefreshTokenPayloadDeviceId_02,
      refreshToken_02,
      undefined,
      HttpStatuses.Unauthorized_401,
      true
    );

    const sessions: SessionDBType[] = await AuthRepository.findAllSessionsByUserId(createdUserId);
    const session_01 = sessions[0];
    const sessionUserId_01: string = session_01.userId;
    const sessionDeviceId_01: string = session_01.deviceId;
    const sessionDeviceName_01: string = session_01.deviceName;
    const sessionIp_01: string = session_01.ip;
    const sessionIat_01: Date = session_01.iat;
    const sessionExp_01: Date = session_01.exp;
    const session_02 = sessions[1];
    const sessionUserId_02: string = session_02.userId;
    const sessionDeviceId_02: string = session_02.deviceId;
    const sessionDeviceName_02: string = session_02.deviceName;
    const sessionIp_02: string = session_02.ip;
    const sessionIat_02: Date = session_02.iat;
    const sessionExp_02: Date = session_02.exp;
    const session_03 = sessions[2];
    const sessionUserId_03: string = session_03.userId;
    const sessionDeviceId_03: string = session_03.deviceId;
    const sessionDeviceName_03: string = session_03.deviceName;
    const sessionIp_03: string = session_03.ip;
    const sessionIat_03: Date = session_03.iat;
    const sessionExp_03: Date = session_03.exp;

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent_02,
      refreshToken_02
    );

    const securityDevice_01: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId_01: string = securityDevice_01.deviceId;
    const securityDeviceTitle_01: string = securityDevice_01.title;
    const securityDeviceIp_01: string = securityDevice_01.ip;
    const securityDeviceLastActiveDate_01: Date = new Date(securityDevice_01.lastActiveDate);
    const securityDevice_02: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[1];
    const securityDeviceId_02: string = securityDevice_02.deviceId;
    const securityDeviceTitle_02: string = securityDevice_02.title;
    const securityDeviceIp_02: string = securityDevice_02.ip;
    const securityDeviceLastActiveDate_02: Date = new Date(securityDevice_02.lastActiveDate);
    const securityDevice_03: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[2];
    const securityDeviceId_03: string = securityDevice_03.deviceId;
    const securityDeviceTitle_03: string = securityDevice_03.title;
    const securityDeviceIp_03: string = securityDevice_03.ip;
    const securityDeviceLastActiveDate_03: Date = new Date(securityDevice_03.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(3);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(3);
    expect(sessionUserId_01).toBe(createdUserId);
    expect(sessionUserId_01).toBe(decodedRefreshTokenPayloadUserId_01);
    expect(sessionDeviceId_01).toBe(decodedRefreshTokenPayloadDeviceId_01);
    expect(sessionDeviceId_01).toBe(securityDeviceId_01);
    expect(sessionDeviceName_01).toBe(testUserAgent_01);
    expect(sessionDeviceName_01).toBe(securityDeviceTitle_01);
    expect(sessionIp_01).toBe(securityDeviceIp_01);
    expect(sessionIat_01).toEqual(decodedRefreshTokenPayloadIatDate_01);
    expect(sessionIat_01).toEqual(securityDeviceLastActiveDate_01);
    expect(sessionExp_01).toEqual(decodedRefreshTokenPayloadExpDate_01);
    expect(sessionUserId_02).toBe(createdUserId);
    expect(sessionUserId_02).toBe(decodedRefreshTokenPayloadUserId_02);
    expect(sessionDeviceId_02).toBe(decodedRefreshTokenPayloadDeviceId_02);
    expect(sessionDeviceId_02).toBe(securityDeviceId_02);
    expect(sessionDeviceName_02).toBe(testUserAgent_02);
    expect(sessionDeviceName_02).toBe(securityDeviceTitle_02);
    expect(sessionIp_02).toBe(securityDeviceIp_02);
    expect(sessionIat_02).toEqual(decodedRefreshTokenPayloadIatDate_02);
    expect(sessionIat_02).toEqual(securityDeviceLastActiveDate_02);
    expect(sessionExp_02).toEqual(decodedRefreshTokenPayloadExpDate_02);
    expect(sessionUserId_03).toBe(createdUserId);
    expect(sessionUserId_03).toBe(decodedRefreshTokenPayloadUserId_03);
    expect(sessionDeviceId_03).toBe(decodedRefreshTokenPayloadDeviceId_03);
    expect(sessionDeviceId_03).toBe(securityDeviceId_03);
    expect(sessionDeviceName_03).toBe(testUserAgent_03);
    expect(sessionDeviceName_03).toBe(securityDeviceTitle_03);
    expect(sessionIp_03).toBe(securityDeviceIp_03);
    expect(sessionIat_03).toEqual(decodedRefreshTokenPayloadIatDate_03);
    expect(sessionIat_03).toEqual(securityDeviceLastActiveDate_03);
    expect(sessionExp_03).toEqual(decodedRefreshTokenPayloadExpDate_03);
  });
});
