import { Router } from 'express';
import { SETTINGS } from '../../core/settings/settings';
import { refreshTokenGuardMiddleware } from '../../auth/middlewares/guard-middlewares/refresh-token.guard-middleware';
import { getSecurityDeviceListHandler } from './handlers/get-security-device-list.handler';
import { revokeSessionsExceptCurrentDeviceHandler } from './handlers/revoke-sessions-except-current-device.handler';
import { revokeSessionByDeviceIdHandler } from './handlers/revoke-session-by-device-id.handler';
import { idValidation } from '../../core/middlewares/validation/params-id-validation.middlewares';
import { inputValidationResultMiddleware } from '../../core/middlewares/validation/input-validation-result.middleware';

/*Роутер из Express для работы с устройствами пользователя в сессиях.*/
export const securityDevicesRouter: Router = Router({});

/*Конфигурируем роутер "securityDevicesRouter".*/
securityDevicesRouter
  /*001. GET-запрос по получению устройств пользователя в активных сессиях.*/
  .get(
    SETTINGS.GET_SECURITY_DEVICE_LIST_PATH,
    refreshTokenGuardMiddleware,
    inputValidationResultMiddleware,
    getSecurityDeviceListHandler
  )
  /*002. DELETE-запрос по отзыву всех сессий, кроме текущей.*/
  .delete(
    SETTINGS.REVOKE_SESSIONS_EXCEPT_CURRENT_DEVICE_PATH,
    refreshTokenGuardMiddleware,
    inputValidationResultMiddleware,
    revokeSessionsExceptCurrentDeviceHandler
  )
  /*003. DELETE-запрос по отзыву сессии по ID устройства, используя URI-параметры.*/
  .delete(
    SETTINGS.REVOKE_SESSION_BY_DEVICE_ID_PATH,
    refreshTokenGuardMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    revokeSessionByDeviceIdHandler
  );
