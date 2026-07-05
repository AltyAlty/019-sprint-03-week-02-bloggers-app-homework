import { Router } from 'express';
import {
  setNewPasswordByRecoveryCodeInputValidation,
  authUserInputValidation,
  confirmationCodeValidation,
  recoveryPasswordEmailValidation,
  registrationEmailResendingValidation,
} from '../validation/auth-input-validation.middlewares';
import { inputValidationResultMiddleware } from '../../core/middlewares/validation/input-validation-result.middleware';
import { accessTokenGuardMiddleware } from '../middlewares/guard-middlewares/access-token.guard-middleware';
import { createUserInputValidation } from '../../users/validation/users-input-validation.middlewares';
import { SETTINGS } from '../../core/settings/settings';
import { refreshTokenGuardMiddleware } from '../middlewares/guard-middlewares/refresh-token.guard-middleware';
import { requestRateLimitGuardMiddleware } from '../middlewares/guard-middlewares/request-rate-limit.guard-middleware';
import { AuthController } from './auth.controller';
import { container } from '../../composition-root';

/**/
const authController = container.get<AuthController>(AuthController);

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
    authController.authByLoginOrEmailHandler.bind(authController)
  )
  /*002. GET-запрос по получению данных пользователя по AT.*/
  .get(
    SETTINGS.GET_AUTH_DATA_BY_TOKEN_PATH,
    accessTokenGuardMiddleware,
    authController.getAuthDataByAccessTokenHandler.bind(authController)
  )
  /*003. POST-запрос по регистрации пользователя.*/
  .post(
    SETTINGS.REGISTER_USER_PATH,
    requestRateLimitGuardMiddleware,
    createUserInputValidation,
    inputValidationResultMiddleware,
    authController.registerUserHandler.bind(authController)
  )
  /*004. POST-запрос по подтверждению регистрации пользователя по коду.*/
  .post(
    SETTINGS.CONFIRM_USER_BY_CODE_PATH,
    requestRateLimitGuardMiddleware,
    confirmationCodeValidation,
    inputValidationResultMiddleware,
    authController.confirmUserByCodeHandler.bind(authController)
  )
  /*005. POST-запрос по повторной отправке письма для подтверждения регистрации пользователя.*/
  .post(
    SETTINGS.RESEND_CONFIRMATION_EMAIL_PATH,
    requestRateLimitGuardMiddleware,
    registrationEmailResendingValidation,
    inputValidationResultMiddleware,
    authController.resendConfirmationEmailHandler.bind(authController)
  )
  /*006. POST-запрос по получению новой пары AT/RT.*/
  .post(
    SETTINGS.REFRESH_TOKEN_PATH,
    refreshTokenGuardMiddleware,
    inputValidationResultMiddleware,
    authController.refreshAccessAndRefreshTokensHandler.bind(authController)
  )
  /*007. POST-запрос по отзыву сессии.*/
  .post(
    SETTINGS.LOGOUT_PATH,
    refreshTokenGuardMiddleware,
    inputValidationResultMiddleware,
    authController.revokeSessionHandler.bind(authController)
  )
  /*008. POST-запрос по отправке письма с кодом восстановления пароля пользователя.*/
  .post(
    SETTINGS.SEND_RECOVERY_PASSWORD_CODE_PATH,
    requestRateLimitGuardMiddleware,
    recoveryPasswordEmailValidation,
    inputValidationResultMiddleware,
    authController.sendRecoveryPasswordCodeHandler.bind(authController)
  )
  /*009. POST-запрос по установлению нового пароля пользователя по коду восстановления.*/
  .post(
    SETTINGS.SET_NEW_PASSWORD_BY_RECOVERY_CODE_PATH,
    requestRateLimitGuardMiddleware,
    setNewPasswordByRecoveryCodeInputValidation,
    inputValidationResultMiddleware,
    authController.setNewPasswordByRecoveryCodeHandler.bind(authController)
  );
