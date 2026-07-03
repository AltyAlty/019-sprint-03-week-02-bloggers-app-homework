import { Express } from 'express';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import request from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';

export const revokeSessionsExceptCurrentDevice = async (
  app: Express,
  userAgent: string | any,
  refreshToken?: string | any,
  refreshTokenCookieString?: string | any,
  expectedStatus?: HttpStatuses,
  noUserAgent?: boolean
): Promise<any> => {
  const testRefreshTokenCookieString: string =
    refreshTokenCookieString ?? `refreshToken=${refreshToken}; Path=/; HttpOnly; Secure`;

  const testStatus: HttpStatuses = expectedStatus ?? HttpStatuses.NoContent_204;
  let revokeSessionsExceptCurrentDeviceResponse;

  if (noUserAgent) {
    revokeSessionsExceptCurrentDeviceResponse = await request(app)
      .del(`${SETTINGS.SECURITY_DEVICES_PATH}${SETTINGS.REVOKE_SESSIONS_EXCEPT_CURRENT_DEVICE_PATH}`)
      .set('Cookie', testRefreshTokenCookieString)
      .expect(testStatus);
  } else {
    revokeSessionsExceptCurrentDeviceResponse = await request(app)
      .del(`${SETTINGS.SECURITY_DEVICES_PATH}${SETTINGS.REVOKE_SESSIONS_EXCEPT_CURRENT_DEVICE_PATH}`)
      .set('Cookie', testRefreshTokenCookieString)
      .set('User-Agent', userAgent)
      .expect(testStatus);
  }

  return revokeSessionsExceptCurrentDeviceResponse.body;
};
