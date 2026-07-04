import { SecurityDeviceListOutputDTO } from '../routes/output-dto/security-device-list.output-dto';
import { SessionType } from '../../auth/application/types/session.type';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { Result } from '../../core/types/result/result.type';
import { SecurityDeviceDBType } from '../repositories/types/security-device-db.type';
import { securityDevicesQueryRepository } from '../repositories/security-devices.query-repository';
import { mapToSecurityDeviceListOutputDTO } from '../repositories/mappers/map-to-security-device-list-output-dto.util';
import { authService } from '../../auth/application/auth.service';

/*Query-сервис для работы с устройствами пользователей.*/
export const securityDevicesQueryService = {
  /*Метод для поиска устройств пользователя по ID пользователя.*/
  async findAllByUserId(userId: string): Promise<Result<{ securityDeviceListOutput: SecurityDeviceListOutputDTO }>> {
    /*Просим сервис "authService" найти сессии по ID пользователя.*/
    const sessionsResult: Result<{ sessionListOutput: SessionType[] }> =
      await authService.findAllSessionsByUserId(userId);

    /*Получаем массив ID устройств пользователя.*/
    const securityDeviceIds: string[] = sessionsResult.data!.sessionListOutput.map(session => String(session.deviceId));

    /*Просим query-репозиторий "securityDevicesQueryRepository" найти устройства пользователя по ID устройств
    пользователя в БД.*/
    const securityDevicesDB: SecurityDeviceDBType[] =
      await securityDevicesQueryRepository.findAllByIds(securityDeviceIds);

    /*Преобразовываем устройства пользователя из БД в подготовленные для отправки клиенту устройства пользователя.*/
    const securityDeviceListOutput: SecurityDeviceListOutputDTO = mapToSecurityDeviceListOutputDTO(securityDevicesDB);
    /*Возвращаем ResultObject с преобразованными устройствами пользователя.*/
    return { status: ResultStatuses.Ok, data: { securityDeviceListOutput }, extensions: [] };
  },
};
