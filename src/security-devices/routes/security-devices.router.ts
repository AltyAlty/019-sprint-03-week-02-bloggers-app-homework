import { Router } from 'express';
import { SETTINGS } from '../../core/settings/settings';
import { refreshTokenGuardMiddleware } from '../../auth/middlewares/guard-middlewares/refresh-token.guard-middleware';
import { idValidation } from '../../core/middlewares/validation/params-id-validation.middlewares';
import { inputValidationResultMiddleware } from '../../core/middlewares/validation/input-validation-result.middleware';
import { container } from '../../composition-root';
import { SecurityDevicesController } from './security-devices.controller';

/**/
const securityDevicesController = container.get<SecurityDevicesController>(SecurityDevicesController);

/*Роутер из Express для работы с устройствами пользователя.*/
export const securityDevicesRouter: Router = Router({});

/*Конфигурируем роутер "securityDevicesRouter".*/
securityDevicesRouter
  /*001. GET-запрос по получению устройств пользователя в активных сессиях.*/
  .get(
    SETTINGS.GET_SECURITY_DEVICE_LIST_PATH,
    refreshTokenGuardMiddleware,
    inputValidationResultMiddleware,
    securityDevicesController.getSecurityDeviceListHandler.bind(securityDevicesController)
  )
  /*002. DELETE-запрос по отзыву всех сессий, кроме текущей.*/
  .delete(
    SETTINGS.REVOKE_SESSIONS_EXCEPT_CURRENT_DEVICE_PATH,
    refreshTokenGuardMiddleware,
    inputValidationResultMiddleware,
    securityDevicesController.revokeSessionsExceptCurrentDeviceHandler.bind(securityDevicesController)
  )
  /*003. DELETE-запрос по отзыву сессии по ID устройства, используя URI-параметры.*/
  .delete(
    SETTINGS.REVOKE_SESSION_BY_DEVICE_ID_PATH,
    refreshTokenGuardMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    securityDevicesController.revokeSessionByDeviceIdHandler.bind(securityDevicesController)
  );
