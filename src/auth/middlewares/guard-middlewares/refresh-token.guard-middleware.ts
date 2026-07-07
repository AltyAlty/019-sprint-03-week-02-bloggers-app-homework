import { NextFunction, Request, Response } from 'express';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { SETTINGS } from '../../../core/settings/settings';
import { IdType } from '../../../core/types/id.type';
import { SessionDBType } from '../../repositories/types/session-db.type';
import { SecurityDeviceDBType } from '../../../security-devices/repositories/types/security-device-db.type';
import { UserDBType } from '../../../users/repositories/types/user-db.type';
import { ObjectId } from 'mongodb';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../ioc/types';
import { JwtAdapter } from '../../adapters/jwt.adapter';
import { UsersRepository } from '../../../users/repositories/users.repository';
import { AuthRepository } from '../../repositories/auth.repository';
import { SecurityDevicesRepository } from '../../../security-devices/repositories/security-devices.repository';

/*Guard-middleware для проверки RT.*/
@injectable()
export class RefreshTokenGuardMiddleware {
  constructor(
    @inject(TYPES.JwtAdapter) private readonly jwtAdapter: JwtAdapter,
    @inject(TYPES.AuthRepository) private readonly authRepository: AuthRepository,
    @inject(TYPES.SecurityDevicesRepository) private readonly securityDevicesRepository: SecurityDevicesRepository,
    @inject(TYPES.UsersRepository) private readonly usersRepository: UsersRepository
  ) {}

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    /*Получаем имя устройства пользователя из запроса.*/
    const deviceName: string | undefined = req.headers['user-agent'];
    /*Если имя устройства пользователя не было найдено, то сообщаем об отказе в аутентификации клиенту.*/
    if (!deviceName || deviceName.trim() === '') return res.sendStatus(HttpStatuses.Unauthorized_401);
    /*Если имя устройства пользователя было найдено, то получаем IP-адрес пользователя из запроса.*/
    const ip: string | undefined = req.ip || req.socket.remoteAddress;
    /*Если IP-адрес пользователя не был найден, то сообщаем об отказе в аутентификации клиенту.*/
    if (!ip) return res.sendStatus(HttpStatuses.Unauthorized_401);
    /*Если IP-адрес пользователя был найден, то получаем RT из cookies.*/
    const refreshToken: string | undefined = req.cookies.refreshToken;
    /*Если RT не был найден, то сообщаем об отказе в аутентификации клиенту.*/
    if (!refreshToken) return res.sendStatus(HttpStatuses.Unauthorized_401);

    /*Если RT был найден, то просим адаптер "jwtAdapter" верифицировать RT.*/
    const payload: { userId: string; deviceId: string } | null = await this.jwtAdapter.verifyRefreshToken(
      refreshToken,
      SETTINGS.RT_SECRET!
    );

    /*Если верификация RT не прошла успешно, то сообщаем об отказе в аутентификации клиенту.*/
    if (!payload) return res.sendStatus(HttpStatuses.Unauthorized_401);
    /*Если верификация RT прошла успешно, то получаем ID пользователя и ID устройства пользователя из RT.*/
    const { userId: userIdFromRT, deviceId: deviceIdFromRT }: { userId: string; deviceId: string } = payload;

    /*Если ID пользователя или ID устройства пользователя из RT не соответствуют формату ObjectId, то сообщаем об отказе в
    аутентификации клиенту.*/
    if (!ObjectId.isValid(userIdFromRT) || !ObjectId.isValid(deviceIdFromRT))
      return res.sendStatus(HttpStatuses.Unauthorized_401);

    /*Если ID пользователя или ID устройства пользователя из RT соответствуют формату ObjectId, то просим репозиторий
    "usersRepository" найти пользователя по ID в БД.*/
    const userDB: UserDBType | null = await this.usersRepository.findById(userIdFromRT);
    /*Если пользователь не был найден, то сообщаем об отказе в аутентификации клиенту.*/
    if (!userDB) return res.sendStatus(HttpStatuses.Unauthorized_401);
    /*Если пользователь был найден, то просим репозиторий "securityDevicesRepository" найти устройство пользователя по ID
    в БД.*/
    const securityDeviceDB: SecurityDeviceDBType | null = await this.securityDevicesRepository.findById(deviceIdFromRT);
    /*Если устройство пользователя не было найдено, то сообщаем об отказе в аутентификации клиенту.*/
    if (!securityDeviceDB) return res.sendStatus(HttpStatuses.Unauthorized_401);
    /*Если устройство пользователя было найдено, то просим адаптер "jwtAdapter" декодировать RT.*/
    const refreshTokenPayload: { iat: number } | null = await this.jwtAdapter.decodeRefreshToken(refreshToken);
    /*Если декодирование RT не прошло успешно, то сообщаем об отказе в аутентификации клиенту.*/
    if (!refreshTokenPayload) return res.sendStatus(HttpStatuses.Unauthorized_401);
    /*Если декодирование RT прошло успешно, то формируем дату создания RT.*/
    const refreshTokenIatDate: Date = new Date(refreshTokenPayload.iat * 1000);

    /*Просим репозиторий "authRepository" найти сессию по ID пользователя, ID устройства пользователя и дате выдачи RT
    в БД.*/
    const sessionDB: SessionDBType | null = await this.authRepository.findSessionByUserIdAndDeviceIdAndIat(
      userIdFromRT,
      deviceIdFromRT,
      refreshTokenIatDate
    );

    /*Если сессия не была найдена, то сообщаем об отказе в аутентификации клиенту.*/
    if (!sessionDB) return res.sendStatus(HttpStatuses.Unauthorized_401);
    /*Если сессия была найдена, то прикрепляем ID пользователя и ID устройства пользователя к запросу.*/
    req.userId = { id: userIdFromRT } as IdType;
    req.deviceId = { id: deviceIdFromRT } as IdType;
    /*Разрешаем дальнейшее выполнение запроса при помощи функции "next()".*/
    next();
  }
}
