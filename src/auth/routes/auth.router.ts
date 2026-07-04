import { Router } from 'express';
import { authByLoginOrEmailHandler } from './handlers/auth-by-login-or-email.handler';
import {
  setNewPasswordByRecoveryCodeInputValidation,
  authUserInputValidation,
  confirmationCodeValidation,
  recoveryPasswordEmailValidation,
  registrationEmailResendingValidation,
} from '../validation/auth-input-validation.middlewares';
import { inputValidationResultMiddleware } from '../../core/middlewares/validation/input-validation-result.middleware';
import { accessTokenGuardMiddleware } from '../middlewares/guard-middlewares/access-token.guard-middleware';
import { getAuthDataByAccessTokenHandler } from './handlers/get-auth-data-by-access-token.handler';
import { createUserInputValidation } from '../../users/validation/users-input-validation.middlewares';
import { registerUserHandler } from './handlers/register-user.handler';
import { confirmUserByCodeHandler } from './handlers/confirm-user-by-code.handler';
import { resendConfirmationEmailHandler } from './handlers/resend-confirmation-email.handler';
import { SETTINGS } from '../../core/settings/settings';
import { refreshTokenGuardMiddleware } from '../middlewares/guard-middlewares/refresh-token.guard-middleware';
import { refreshAccessAndRefreshTokensHandler } from './handlers/refresh-access-and-refresh-tokens.handler';
import { revokeSessionHandler } from './handlers/revoke-session';
import { requestRateLimitGuardMiddleware } from '../middlewares/guard-middlewares/request-rate-limit.guard-middleware';
import { sendRecoveryPasswordCodeHandler } from './handlers/send-recovery-password-code.handler';
import { setNewPasswordByRecoveryCodeHandler } from './handlers/set-new-password-by-recovery-code.handler';

/*Роутер из Express для работы с аутентификацией и авторизацией.*/
export const authRouter: Router = Router({});

/*Конфигурируем роутер "authRouter".*/
authRouter
  /*001. POST-запрос по аутентификации пользователя по логину/email.*/
  .post(
    SETTINGS.AUTH_BY_LOGIN_OR_EMAIL_PATH,
    requestRateLimitGuardMiddleware,
    authUserInputValidation,
    inputValidationResultMiddleware,
    authByLoginOrEmailHandler
  )
  /*002. GET-запрос по получению данных пользователя по AT.*/
  .get(SETTINGS.GET_AUTH_DATA_BY_TOKEN_PATH, accessTokenGuardMiddleware, getAuthDataByAccessTokenHandler)
  /*003. POST-запрос по регистрации пользователя.*/
  .post(
    SETTINGS.REGISTER_USER_PATH,
    requestRateLimitGuardMiddleware,
    createUserInputValidation,
    inputValidationResultMiddleware,
    registerUserHandler
  )
  /*004. POST-запрос по подтверждению регистрации пользователя по коду.*/
  .post(
    SETTINGS.CONFIRM_USER_BY_CODE_PATH,
    requestRateLimitGuardMiddleware,
    confirmationCodeValidation,
    inputValidationResultMiddleware,
    confirmUserByCodeHandler
  )
  /*005. POST-запрос по повторной отправке письма для подтверждения регистрации пользователя.*/
  .post(
    SETTINGS.RESEND_CONFIRMATION_EMAIL_PATH,
    requestRateLimitGuardMiddleware,
    registrationEmailResendingValidation,
    inputValidationResultMiddleware,
    resendConfirmationEmailHandler
  )
  /*006. POST-запрос по получению новой пары AT/RT.*/
  .post(
    SETTINGS.REFRESH_TOKEN_PATH,
    refreshTokenGuardMiddleware,
    inputValidationResultMiddleware,
    refreshAccessAndRefreshTokensHandler
  )
  /*007. POST-запрос по отзыву сессии.*/
  .post(SETTINGS.LOGOUT_PATH, refreshTokenGuardMiddleware, inputValidationResultMiddleware, revokeSessionHandler)
  /*008. POST-запрос по отправке письма с кодом восстановления пароля пользователя.*/
  .post(
    SETTINGS.SEND_RECOVERY_PASSWORD_CODE_PATH,
    requestRateLimitGuardMiddleware,
    recoveryPasswordEmailValidation,
    inputValidationResultMiddleware,
    sendRecoveryPasswordCodeHandler
  )
  /*009. POST-запрос по установлению нового пароля пользователя по коду восстановления.*/
  .post(
    SETTINGS.SET_NEW_PASSWORD_BY_RECOVERY_CODE_PATH,
    requestRateLimitGuardMiddleware,
    setNewPasswordByRecoveryCodeInputValidation,
    inputValidationResultMiddleware,
    setNewPasswordByRecoveryCodeHandler
  );
