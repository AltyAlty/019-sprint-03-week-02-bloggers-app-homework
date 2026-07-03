import { doBeforeTestsWithMongoMemoryServer } from '../../utils/common/do-before-tests.test-util';
import { CreateUserInputDTO } from '../../../src/users/routes/input-dto/create-user.input-dto';
import { getCreateUserInputDTO } from '../../utils/users/input-dto-utils/get-create-user-input-dto.test-util';
import { LoginDataInputDTO } from '../../../src/auth/routes/input-dto/login-data.input-dto';
import { validUserAgents } from '../../test-data/auth.test-data';
import { loginUserReturnAccessAndRefreshTokens } from '../../utils/auth/login-user-return-access-and-refresh-tokens.test-util';
import { jwtAdapter } from '../../../src/auth/adapters/jwt.adapter';
import { SecurityDeviceListOutputDTO } from '../../../src/security-devices/routes/output-dto/security-device-list.output-dto';
import { getSecurityDeviceList } from '../../utils/security-devices/get-security-device-list.test-util';
import { createUser } from '../../utils/users/create-user.test-util';
import { revokeSessionsExceptCurrentDevice } from '../../utils/security-devices/revoke-sessions-except-current-device.test-util';
import { revokeSessionByDeviceId } from '../../utils/security-devices/revoke-session-by-device-id.test-util';
import { SessionDBType } from '../../../src/auth/repositories/types/session-db.type';
import { authRepository } from '../../../src/auth/repositories/auth.repository';
import { UserOutputDTO } from '../../../src/users/routes/output-dto/user.output-dto';
import { SecurityDeviceOutputDTO } from '../../../src/security-devices/routes/output-dto/security-device.output-dto';

describe('Security Devices API', () => {
  const app = doBeforeTestsWithMongoMemoryServer();

  it('✅ 001 should return a list of security devices; 001. GET /api/security/devices', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);
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

    const decodedRefreshTokenPayload_01: { deviceId: string; iat: number } | null =
      await jwtAdapter.decodeRefreshToken(refreshToken_01);

    const decodedRefreshTokenPayloadDeviceId_01: string | undefined = decodedRefreshTokenPayload_01?.deviceId;
    const decodedRefreshTokenPayloadIat_01: number | undefined = decodedRefreshTokenPayload_01?.iat;
    const decodedRefreshTokenPayloadIatDate_01: Date = new Date(decodedRefreshTokenPayloadIat_01! * 1000);

    const decodedRefreshTokenPayload_02: { deviceId: string; iat: number } | null =
      await jwtAdapter.decodeRefreshToken(refreshToken_02);

    const decodedRefreshTokenPayloadDeviceId_02: string | undefined = decodedRefreshTokenPayload_02?.deviceId;
    const decodedRefreshTokenPayloadIat_02: number | undefined = decodedRefreshTokenPayload_02?.iat;
    const decodedRefreshTokenPayloadIatDate_02: Date = new Date(decodedRefreshTokenPayloadIat_02! * 1000);

    const decodedRefreshTokenPayload_03: { deviceId: string; iat: number } | null =
      await jwtAdapter.decodeRefreshToken(refreshToken_03);

    const decodedRefreshTokenPayloadDeviceId_03: string | undefined = decodedRefreshTokenPayload_03?.deviceId;
    const decodedRefreshTokenPayloadIat_03: number | undefined = decodedRefreshTokenPayload_03?.iat;
    const decodedRefreshTokenPayloadIatDate_03: Date = new Date(decodedRefreshTokenPayloadIat_03! * 1000);

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent_01,
      refreshToken_01
    );

    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(3);
    expect(getSecurityDeviceListResponse[0].deviceId).toBe(decodedRefreshTokenPayloadDeviceId_01);
    expect(getSecurityDeviceListResponse[0].title).toBe(testUserAgent_01);
    expect(new Date(getSecurityDeviceListResponse[0].lastActiveDate)).toEqual(decodedRefreshTokenPayloadIatDate_01);
    expect(getSecurityDeviceListResponse[1].deviceId).toBe(decodedRefreshTokenPayloadDeviceId_02);
    expect(getSecurityDeviceListResponse[1].title).toBe(testUserAgent_02);
    expect(new Date(getSecurityDeviceListResponse[1].lastActiveDate)).toEqual(decodedRefreshTokenPayloadIatDate_02);
    expect(getSecurityDeviceListResponse[2].deviceId).toBe(decodedRefreshTokenPayloadDeviceId_03);
    expect(getSecurityDeviceListResponse[2].title).toBe(testUserAgent_03);
    expect(new Date(getSecurityDeviceListResponse[2].lastActiveDate)).toEqual(decodedRefreshTokenPayloadIatDate_03);
  });

  it('✅ 002 should revoke sessions except the current security device; 002. DEL /api/security/devices', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const loginUserData: LoginDataInputDTO = { loginOrEmail: createUserData.login, password: createUserData.password };
    const testUserAgent_01: string = validUserAgents.userAgent_01;
    const testUserAgent_02: string = validUserAgents.userAgent_02;
    const testUserAgent_03: string = validUserAgents.userAgent_03;
    await loginUserReturnAccessAndRefreshTokens(app, testUserAgent_01, loginUserData);

    const { refreshToken }: { refreshToken: string } = await loginUserReturnAccessAndRefreshTokens(
      app,
      testUserAgent_02,
      loginUserData
    );

    await loginUserReturnAccessAndRefreshTokens(app, testUserAgent_03, loginUserData);

    const decodedRefreshTokenPayload: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await jwtAdapter.decodeRefreshToken(refreshToken);

    const decodedRefreshTokenPayloadUserId: string | undefined = decodedRefreshTokenPayload?.userId;
    const decodedRefreshTokenPayloadDeviceId: string | undefined = decodedRefreshTokenPayload?.deviceId;
    const decodedRefreshTokenPayloadIat: number | undefined = decodedRefreshTokenPayload?.iat;
    const decodedRefreshTokenPayloadExp: number | undefined = decodedRefreshTokenPayload?.exp;
    const decodedRefreshTokenPayloadIatDate: Date = new Date(decodedRefreshTokenPayloadIat! * 1000);
    const decodedRefreshTokenPayloadExpDate: Date = new Date(decodedRefreshTokenPayloadExp! * 1000);

    await revokeSessionsExceptCurrentDevice(app, testUserAgent_02, refreshToken);

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
      testUserAgent_02,
      refreshToken
    );

    const securityDevice: SecurityDeviceOutputDTO | undefined = getSecurityDeviceListResponse[0];
    const securityDeviceId: string = securityDevice.deviceId;
    const securityDeviceTitle: string = securityDevice.title;
    const securityDeviceIp: string = securityDevice.ip;
    const securityDeviceLastActiveDate: Date = new Date(securityDevice.lastActiveDate);
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(1);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(1);
    expect(sessionUserId).toBe(createdUserId);
    expect(sessionUserId).toBe(decodedRefreshTokenPayloadUserId);
    expect(sessionDeviceId).toBe(decodedRefreshTokenPayloadDeviceId);
    expect(sessionDeviceId).toBe(securityDeviceId);
    expect(sessionDeviceName).toBe(testUserAgent_02);
    expect(sessionDeviceName).toBe(securityDeviceTitle);
    expect(sessionIp).toBe(securityDeviceIp);
    expect(sessionIat).toEqual(decodedRefreshTokenPayloadIatDate);
    expect(sessionIat).toEqual(securityDeviceLastActiveDate);
    expect(sessionExp).toEqual(decodedRefreshTokenPayloadExpDate);
  });

  it('✅ 003 should revoke a session by a correct ID of a security device; 003. DEL /api/security/devices/:id', async () => {
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
      await jwtAdapter.decodeRefreshToken(refreshToken_01);

    const decodedRefreshTokenPayloadUserId_01: string | undefined = decodedRefreshTokenPayload_01?.userId;
    const decodedRefreshTokenPayloadDeviceId_01: string | undefined = decodedRefreshTokenPayload_01?.deviceId;
    const decodedRefreshTokenPayloadIat_01: number | undefined = decodedRefreshTokenPayload_01?.iat;
    const decodedRefreshTokenPayloadExp_01: number | undefined = decodedRefreshTokenPayload_01?.exp;
    const decodedRefreshTokenPayloadIatDate_01: Date = new Date(decodedRefreshTokenPayloadIat_01! * 1000);
    const decodedRefreshTokenPayloadExpDate_01: Date = new Date(decodedRefreshTokenPayloadExp_01! * 1000);

    const decodedRefreshTokenPayload_02: { deviceId: string } | null =
      await jwtAdapter.decodeRefreshToken(refreshToken_02);

    const decodedRefreshTokenPayloadDeviceId_02: string | undefined = decodedRefreshTokenPayload_02?.deviceId;

    const decodedRefreshTokenPayload_03: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await jwtAdapter.decodeRefreshToken(refreshToken_03);

    const decodedRefreshTokenPayloadUserId_03: string | undefined = decodedRefreshTokenPayload_03?.userId;
    const decodedRefreshTokenPayloadDeviceId_03: string | undefined = decodedRefreshTokenPayload_03?.deviceId;
    const decodedRefreshTokenPayloadIat_03: number | undefined = decodedRefreshTokenPayload_03?.iat;
    const decodedRefreshTokenPayloadExp_03: number | undefined = decodedRefreshTokenPayload_03?.exp;
    const decodedRefreshTokenPayloadIatDate_03: Date = new Date(decodedRefreshTokenPayloadIat_03! * 1000);
    const decodedRefreshTokenPayloadExpDate_03: Date = new Date(decodedRefreshTokenPayloadExp_03! * 1000);

    await revokeSessionByDeviceId(app, testUserAgent_02, decodedRefreshTokenPayloadDeviceId_02!, refreshToken_02);

    const sessions: SessionDBType[] = await authRepository.findAllSessionsByUserId(createdUserId);
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

    const getSecurityDeviceListResponse: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      app,
      testUserAgent_01,
      refreshToken_01
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
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(2);
    expect(getSecurityDeviceListResponse).toBeInstanceOf(Array);
    expect(getSecurityDeviceListResponse.length).toBe(2);
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
    expect(sessionUserId_02).toBe(decodedRefreshTokenPayloadUserId_03);
    expect(sessionDeviceId_02).toBe(decodedRefreshTokenPayloadDeviceId_03);
    expect(sessionDeviceId_02).toBe(securityDeviceId_02);
    expect(sessionDeviceName_02).toBe(testUserAgent_03);
    expect(sessionDeviceName_02).toBe(securityDeviceTitle_02);
    expect(sessionIp_02).toBe(securityDeviceIp_02);
    expect(sessionIat_02).toEqual(decodedRefreshTokenPayloadIatDate_03);
    expect(sessionIat_02).toEqual(securityDeviceLastActiveDate_02);
    expect(sessionExp_02).toEqual(decodedRefreshTokenPayloadExpDate_03);
  });
});
