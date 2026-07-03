import { SecurityDeviceDBType } from './types/security-device-db.type';
import { db } from '../../db/mongodb/mongo.db';

/*Query-репозиторий для работы с устройствами пользователей в БД.*/
export const securityDevicesQueryRepository = {
  /*Метод для поиска устройств пользователя по ID устройств пользователя в БД.*/
  async findAllByIds(ids: string[]): Promise<SecurityDeviceDBType[]> {
    /*Просим коллекцию "securityDevicesCollection" найти устройства пользователя по ID устройств пользователя в БД.*/
    return await db.securityDevicesCollection.find({ deviceId: { $in: ids } }).toArray();
  },
};
