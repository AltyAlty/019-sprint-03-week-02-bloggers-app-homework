import { SecurityDeviceType } from '../application/types/security-device.type';
import { db } from '../../db/mongodb/mongo.db';
import { DeleteResult, InsertOneResult, UpdateResult } from 'mongodb';
import { SecurityDeviceDBType } from './types/security-device-db.type';

/*Репозиторий для работы с устройствами пользователей в БД.*/
export const securityDevicesRepository = {
  /*Метод для добавления устройства пользователя в БД.*/
  async create(securityDevice: SecurityDeviceType): Promise<string> {
    /*Просим коллекцию "securityDevicesCollection" создать устройство пользователя в БД.*/
    const insertResult: InsertOneResult<SecurityDeviceType> = await db.securityDevicesCollection.insertOne({
      ...securityDevice,
    });

    /*Возвращаем ID созданного устройства пользователя.*/
    return insertResult.insertedId.toString();
  },

  /*Метод для поиска устройства пользователя по ID в БД.*/
  async findById(id: string): Promise<SecurityDeviceDBType | null> {
    /*Просим коллекцию "securityDevicesCollection" найти устройство пользователя по ID в БД.*/
    const securityDevice: SecurityDeviceDBType | null = await db.securityDevicesCollection.findOne({ deviceId: id });
    /*Если устройство пользователя было найдено, то возвращаем его, иначе возвращаем null.*/
    return securityDevice ?? null;
  },

  /*Метод для изменения устройства пользователя по ID в БД.*/
  async updateById(id: string, ip: string, lastActiveDate: Date): Promise<number> {
    /*Просим коллекцию "securityDevicesCollection" изменить устройство пользователя по ID в БД.*/
    const updateResult: UpdateResult<SecurityDeviceType> = await db.securityDevicesCollection.updateOne(
      { deviceId: id },
      { $set: { ip, lastActiveDate } }
    );

    /*Возвращаем количество измененных устройств пользователя.*/
    return updateResult.matchedCount;
  },

  /*Метод для удаления устройства пользователя по ID устройства в БД.*/
  async deleteById(id: string): Promise<number> {
    /*Просим коллекцию "securityDevicesCollection" удалить устройство пользователя по ID устройства в БД.*/
    const deleteResult: DeleteResult = await db.securityDevicesCollection.deleteOne({ deviceId: id });
    /*Возвращаем количество удаленных устройств пользователя.*/
    return deleteResult.deletedCount;
  },

  /*Метод для удаления всех устройств пользователя, кроме текущего, в БД.*/
  async deleteAllExceptCurrentDevice(id: string): Promise<number> {
    /*Просим коллекцию "securityDevicesCollection" удалить все устройства пользователя, кроме текущего, в БД.*/
    const deleteResult: DeleteResult = await db.securityDevicesCollection.deleteMany({ deviceId: { $ne: id } });
    /*Возвращаем количество удаленных устройств пользователя.*/
    return deleteResult.deletedCount;
  },
};
