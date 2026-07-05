import { Request, Response } from 'express';
import { AuthService } from '../../auth/application/auth.service';
import { SecurityDevicesQueryService } from '../application/security-devices.query-service';
import { SecurityDeviceListOutputDTO } from './output-dto/security-device-list.output-dto';
import { HttpStatuses } from '../../core/types/http-statuses';
import { ExtensionType, Result } from '../../core/types/result/result.type';
import { mapResultCodeToHttpStatus } from '../../core/utils/result/mappers/map-result-code-to-http-status';
import { errorsHandler } from '../../core/errors/errors.handler';
import { IdType } from '../../core/types/id.type';
import { RevokeSessionByDeviceIdUriInputDTO } from './input-dto/uri/revoke-session-by-device-id-uri.input-dto';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../ioc/types';

/*Контроллер для работы с постами устройствами пользователя.*/
@injectable()
export class SecurityDevicesController {
  constructor(
    @inject(TYPES.AuthService) private readonly authService: AuthService,
    @inject(TYPES.SecurityDevicesQueryService) private readonly securityDevicesQueryService: SecurityDevicesQueryService
  ) {}

  /*Метод-обработчик для GET-запросов по получению устройств пользователя в активных сессиях.*/
  async getSecurityDeviceListHandler(
    req: Request,
    res: Response<SecurityDeviceListOutputDTO>
  ): Promise<void | Response<SecurityDeviceListOutputDTO>> {
    try {
      /*Получаем ID пользователя.*/
      const userId: string = req.userId!.id;

      /*Просим query-сервис "securityDevicesQueryService" найти устройства пользователя по ID пользователя.*/
      const securityDevicesResult: Result<{ securityDeviceListOutput: SecurityDeviceListOutputDTO }> =
        await this.securityDevicesQueryService.findAllByUserId(userId);

      /*Получаем HTTP-статус операции по поиску устройств пользователя по ID пользователя.*/
      const securityDevicesResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(securityDevicesResult.status);
      /*Отправляем найденные устройства пользователя клиенту.*/
      return res.status(securityDevicesResultHttpStatus).send(securityDevicesResult.data!.securityDeviceListOutput);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для DELETE-запросов по отзыву всех сессий, кроме текущей.*/
  async revokeSessionsExceptCurrentDeviceHandler(
    req: Request<{}, {}, {}, {}, IdType>,
    res: Response
  ): Promise<void | Response> {
    try {
      /*Получаем ID пользователя.*/
      const userId: string = req.userId!.id;
      /*Получаем ID устройства пользователя из сессии.*/
      const deviceId: string = req.deviceId!.id;

      /*Просим сервис "authService" отозвать все сессии пользователя, кроме текущей.*/
      const revokeSessionsExceptCurrentDeviceResult: Result<{}> =
        await this.authService.revokeSessionsExceptCurrentDevice(userId, deviceId);

      /*Получаем HTTP-статус операции по отзыву всех сессий пользователя, кроме текущей.*/
      const revokeSessionsExceptCurrentDeviceResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(
        revokeSessionsExceptCurrentDeviceResult.status
      );

      /*Если отзыв сессий прошел успешно, то сообщаем об этом клиенту.*/
      return res.sendStatus(revokeSessionsExceptCurrentDeviceResultHttpStatus);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для DELETE-запросов по отзыву сессии по ID устройства, используя URI-параметры.*/
  async revokeSessionByDeviceIdHandler(
    req: Request<RevokeSessionByDeviceIdUriInputDTO, {}, {}, {}, IdType>,
    res: Response<void | ExtensionType[]>
  ): Promise<void | Response<void | ExtensionType[]>> {
    try {
      /*Получаем ID пользователя.*/
      const userId: string = req.userId!.id;
      /*Получаем ID устройства.*/
      const deviceId: string = req.params.id;

      /*Просим сервис "authService" отозвать сессию по ID пользователя и ID устройства пользователя.*/
      const revokeSessionByDeviceIdResult: Result<{} | null> = await this.authService.revokeSessionByUserIdAndDeviceId(
        userId,
        deviceId
      );

      /*Получаем HTTP-статус операции по отзыву сессии по ID пользователя и ID устройства пользователя.*/
      const revokeSessionByDeviceIdResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(
        revokeSessionByDeviceIdResult.status
      );

      /*Если отзыв сессии по ID пользователя и ID устройства пользователя не прошел успешно, то сообщаем об этом
      клиенту.*/
      if (revokeSessionByDeviceIdResultHttpStatus !== HttpStatuses.NoContent_204) {
        return res.status(revokeSessionByDeviceIdResultHttpStatus).send(revokeSessionByDeviceIdResult.extensions);
      }

      /*Если отзыв сессии по ID пользователя и ID устройства пользователя прошел успешно, то сообщаем об этом клиенту.*/
      return res.sendStatus(revokeSessionByDeviceIdResultHttpStatus);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }
}
