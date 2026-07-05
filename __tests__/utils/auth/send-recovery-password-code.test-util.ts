import { Express } from 'express';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import request from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { PasswordRecoveryEmailInputDTO } from '../../../src/auth/routes/input-dto/password-recovery-email.input-dto';

export const sendRecoveryPasswordCode = async (
  app: Express,
  userAgent: string | any,
  emailDTO: PasswordRecoveryEmailInputDTO | any,
  expectedStatus?: HttpStatuses,
  noUserAgent?: boolean
): Promise<any> => {
  const testStatus: HttpStatuses = expectedStatus ?? HttpStatuses.NoContent_204;
  let sendRecoveryPasswordCodeResponse;

  if (noUserAgent) {
    sendRecoveryPasswordCodeResponse = await request(app)
      .post(`${SETTINGS.AUTH_PATH}${SETTINGS.SEND_RECOVERY_PASSWORD_CODE_PATH}`)
      .send(emailDTO)
      .expect(testStatus);
  } else {
    sendRecoveryPasswordCodeResponse = await request(app)
      .post(`${SETTINGS.AUTH_PATH}${SETTINGS.SEND_RECOVERY_PASSWORD_CODE_PATH}`)
      .set('User-Agent', userAgent)
      .send(emailDTO)
      .expect(testStatus);
  }

  return sendRecoveryPasswordCodeResponse.body;
};
