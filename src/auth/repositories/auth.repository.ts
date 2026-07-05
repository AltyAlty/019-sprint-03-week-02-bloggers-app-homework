import { DeleteResult, InsertOneResult, UpdateResult } from 'mongodb';
import { db } from '../../db/mongodb/mongo.db';
import { SessionType } from '../application/types/session.type';
import { SessionDBType } from './types/session-db.type';
import { RequestRateLimitLogType } from '../application/types/request-rate-limit-log.type';
import { EmailConfirmationType } from '../application/types/email-сonfirmation.type';
import { EmailConfirmationDBType } from './types/email-сonfirmation-db.type';
import { RecoveryCodeDataType } from '../application/types/recovery-code-data.type';
import { RecoveryCodeDataDBType } from './types/recovery-code-data-db.type';
import { injectable } from 'inversify';

/*Репозиторий для работы с аутентификацией и авторизацией в БД.*/
@injectable()
export class AuthRepository {
  /*Метод для добавления сессии в БД.*/
  async createSession(
    userId: string,
    deviceId: string,
    deviceName: string,
    ip: string,
    iat: Date,
    exp: Date
  ): Promise<string> {
    /*Просим коллекцию "sessionsCollection" создать сессию в БД.*/
    const insertResult: InsertOneResult<SessionType> = await db.sessionsCollection.insertOne({
      userId,
      deviceId,
      deviceName,
      ip,
      iat,
      exp,
    });

    /*Возвращаем ID созданной сессии.*/
    return insertResult.insertedId.toString();
  }

  /*Метод для создания данных о подтверждении регистрации пользователя в БД.*/
  async createEmailConfirmation(userId: string, confirmationCode: string, expirationDate: Date): Promise<string> {
    /*Просим коллекцию "emailConfirmationsCollection" создать данные о подтверждении регистрации пользователя в БД.*/
    const insertResult: InsertOneResult<EmailConfirmationType> = await db.emailConfirmationsCollection.insertOne({
      userId,
      confirmationCode,
      expirationDate,
    });

    /*Возвращаем ID созданных данных о подтверждении регистрации пользователя.*/
    return insertResult.insertedId.toString();
  }

  /*Метод для добавления записи в журнал лимитов запросов в БД.*/
  async createRequestRateLimitLog(requestRateLimitLog: RequestRateLimitLogType): Promise<string> {
    /*Просим коллекцию "requestRateLimitLogsCollection" создать запись в журнале лимитов запросов в БД.*/
    const insertResult: InsertOneResult<RequestRateLimitLogType> =
      await db.requestRateLimitLogsCollection.insertOne(requestRateLimitLog);

    /*Возвращаем ID созданной записи в журнале лимитов запросов.*/
    return insertResult.insertedId.toString();
  }

  /*Метод для подсчета количества записей в журнале лимитов запросов за указанный период по IP-адресу и URL в БД.*/
  async countRequestRateLimitLogsByIpAndUrl(ip: string, url: string, seconds: number): Promise<number> {
    /*Просим коллекцию "requestRateLimitLogsCollection" подсчитать количество записей в журнале лимитов запросов за
    указанный период по IP-адресу и URL в БД.*/
    return db.requestRateLimitLogsCollection.countDocuments({
      ip: ip,
      url: url,
      timestamp: { $gte: new Date(Date.now() - seconds * 1000) },
    });
  }

  /*Метод для создания данных о коде восстановления пароля пользователя в БД.*/
  async createRecoveryPasswordCodeData(userId: string, recoveryCode: string, expirationDate: Date): Promise<string> {
    /*Просим коллекцию "recoveryPasswordCodesDataCollection" создать данные о коде восстановления пароля пользователя в
    БД.*/
    const insertResult: InsertOneResult<RecoveryCodeDataType> = await db.recoveryPasswordCodesDataCollection.insertOne({
      userId,
      recoveryCode,
      expirationDate,
    });

    /*Возвращаем ID созданных данных о коде восстановления пароля пользователя.*/
    return insertResult.insertedId.toString();
  }

  /*Метод для поиска сессии по ID пользователя и ID устройства пользователя в БД.*/
  async findSessionByUserIdAndDeviceId(userId: string, deviceId: string): Promise<SessionDBType | null> {
    /*Просим коллекцию "sessionsCollection" найти сессию по ID устройства пользователя в БД.*/
    const session: SessionDBType | null = await db.sessionsCollection.findOne({ userId, deviceId });
    /*Если сессия была найдена, то возвращаем ее, иначе возвращаем null.*/
    return session ?? null;
  }

  /*Метод для поиска сессии по ID пользователя, ID устройства пользователя и дате выдачи RT в БД.*/
  async findSessionByUserIdAndDeviceIdAndIat(
    userId: string,
    deviceId: string,
    iat: Date
  ): Promise<SessionDBType | null> {
    /*Просим коллекцию "sessionsCollection" найти сессию по дате выдачи RT в БД.*/
    const session: SessionDBType | null = await db.sessionsCollection.findOne({ userId, deviceId, iat });
    /*Если сессия была найдена, то возвращаем ее, иначе возвращаем null.*/
    return session ?? null;
  }

  /*Метод для поиска сессий по ID пользователя в БД.*/
  async findAllSessionsByUserId(userId: string): Promise<SessionDBType[]> {
    /*Просим коллекцию "sessionsCollection" найти сессии по ID пользователя в БД.*/
    return await db.sessionsCollection.find({ userId }).toArray();
  }

  /*Метод для поиска данных о подтверждении регистрации пользователя по коду подтверждения в БД.*/
  async findEmailConfirmationByCode(code: string): Promise<EmailConfirmationDBType | null> {
    /*Просим коллекцию "emailConfirmationsCollection" найти данные о подтверждении регистрации пользователя по коду
    подтверждения в БД.*/
    const emailConfirmation: EmailConfirmationDBType | null = await db.emailConfirmationsCollection.findOne({
      confirmationCode: code,
    });

    /*Если данные о подтверждении регистрации пользователя были найдены, то возвращаем их, иначе возвращаем null.*/
    return emailConfirmation ?? null;
  }

  /*Метод для поиска данных о подтверждении регистрации пользователя по ID пользователя в БД.*/
  async findEmailConfirmationByUserId(userId: string): Promise<EmailConfirmationDBType | null> {
    /*Просим коллекцию "emailConfirmationsCollection" найти данные о подтверждении регистрации пользователя по ID
    пользователя в БД.*/
    const emailConfirmation: EmailConfirmationDBType | null = await db.emailConfirmationsCollection.findOne({ userId });
    /*Если данные о подтверждении регистрации пользователя были найдены, то возвращаем их, иначе возвращаем null.*/
    return emailConfirmation ?? null;
  }

  /*Метод для поиска данных о коде восстановления пароля пользователя по коду в БД.*/
  async findRecoveryPasswordCodeDataByCode(recoveryCode: string): Promise<RecoveryCodeDataDBType | null> {
    /*Просим коллекцию "recoveryPasswordCodesDataCollection" найти данные о коде восстановления пароля пользователя по
    коду в БД.*/
    const recoveryCodeData: RecoveryCodeDataDBType | null = await db.recoveryPasswordCodesDataCollection.findOne({
      recoveryCode,
    });

    /*Если данные о коде восстановления пароля пользователя были найдены, то возвращаем их, иначе возвращаем null.*/
    return recoveryCodeData ?? null;
  }

  /*Метод для поиска данных о коде восстановления пароля пользователя по ID пользователя в БД.*/
  async findRecoveryPasswordCodeDataByUserId(userId: string): Promise<RecoveryCodeDataDBType | null> {
    /*Просим коллекцию "recoveryPasswordCodesDataCollection" найти данные о коде восстановления пароля пользователя по
    ID пользователя в БД.*/
    const recoveryCodeData: RecoveryCodeDataDBType | null = await db.recoveryPasswordCodesDataCollection.findOne({
      userId,
    });

    /*Если данные о коде восстановления пароля пользователя были найдены, то возвращаем их, иначе возвращаем null.*/
    return recoveryCodeData ?? null;
  }

  /*Метод для изменения сессии по дате создания RT в БД.*/
  async updateSessionByIat(currentIat: Date, iat: Date, exp: Date, ip: string): Promise<number> {
    /*Просим коллекцию "sessionsCollection" изменить сессию по дате создания RT в БД.*/
    const updateResult: UpdateResult<SessionType> = await db.sessionsCollection.updateOne(
      { iat: currentIat },
      { $set: { iat, exp, ip } }
    );

    /*Возвращаем количество сессий, попавших под фильтр.*/
    return updateResult.matchedCount;
  }

  /*Метод для изменения данных о подтверждении регистрации пользователя по ID пользователя в БД.*/
  async updateEmailConfirmationByUserId(
    userId: string,
    confirmationCode: string,
    expirationDate: Date
  ): Promise<number> {
    /*Просим коллекцию "emailConfirmationsCollection" изменить данные для подтверждения регистрации пользователя по ID
    пользователя в БД.*/
    const updateResult: UpdateResult = await db.emailConfirmationsCollection.updateOne(
      { userId },
      { $set: { confirmationCode: confirmationCode, expirationDate: expirationDate } }
    );

    /*Возвращаем количество данных о подтверждении регистрации пользователя, попавших под фильтр.*/
    return updateResult.matchedCount;
  }

  /*Метод для удаления сессии по дате создания RT в БД.*/
  async deleteSessionByIat(iat: Date): Promise<number> {
    /*Просим коллекцию "sessionsCollection" удалить сессию по дате создания RT в БД.*/
    const deleteResult: DeleteResult = await db.sessionsCollection.deleteOne({ iat });
    /*Возвращаем количество удаленных сессий.*/
    return deleteResult.deletedCount;
  }

  /*Метод для удаления сессии по ID пользователя и ID устройства пользователя в БД.*/
  async deleteSessionByUserIdAndDeviceId(userId: string, deviceId: string): Promise<number> {
    /*Просим коллекцию "sessionsCollection" удалить сессию по ID пользователя и ID устройства пользователя в БД.*/
    const deleteResult: DeleteResult = await db.sessionsCollection.deleteOne({ userId, deviceId });
    /*Возвращаем количество удаленных сессий.*/
    return deleteResult.deletedCount;
  }

  /*Метод для удаления всех сессий пользователя, кроме текущей, в БД.*/
  async deleteSessionsExceptCurrentDevice(userId: string, deviceId: string): Promise<number> {
    /*Просим коллекцию "sessionsCollection" удалить все сессии пользователя, кроме текущей, в БД.*/
    const deleteResult: DeleteResult = await db.sessionsCollection.deleteMany({
      userId: userId,
      deviceId: { $ne: deviceId },
    });

    /*Возвращаем количество удаленных сессий.*/
    return deleteResult.deletedCount;
  }

  /*Метод для удаления всех сессий пользователя по ID пользователя в БД.*/
  async deleteAllSessionsByUserId(userId: string): Promise<number> {
    /*Просим коллекцию "sessionsCollection" удалить все сессии пользователя по ID пользователя в БД.*/
    const deleteResult: DeleteResult = await db.sessionsCollection.deleteMany({ userId });
    /*Возвращаем количество удаленных сессий.*/
    return deleteResult.deletedCount;
  }

  /*Метод для удаления данных о подтверждении регистрации пользователя по ID пользователя в БД.*/
  async deleteEmailConfirmationByUserId(userId: string): Promise<number> {
    /*Просим коллекцию "emailConfirmationsCollection" удалить данные о подтверждении регистрации пользователя по ID
    пользователя в БД.*/
    const deleteResult: DeleteResult = await db.emailConfirmationsCollection.deleteOne({ userId });
    /*Возвращаем количество удаленных данных о подтверждении регистрации пользователя.*/
    return deleteResult.deletedCount;
  }

  /*Метод для удаления данных о коде восстановления пароля пользователя по коду в БД.*/
  async deleteRecoveryCodeDataByCode(recoveryCode: string): Promise<number> {
    /*Просим коллекцию "recoveryPasswordCodesDataCollection" удалить данные о коде восстановления пароля пользователя по
    коду в БД.*/
    const deleteResult: DeleteResult = await db.recoveryPasswordCodesDataCollection.deleteOne({ recoveryCode });
    /*Возвращаем количество удаленных данных о коде восстановления пароля пользователя.*/
    return deleteResult.deletedCount;
  }

  /*Метод для удаления данных о всех кодах восстановления пароля пользователя по ID пользователя в БД.*/
  async deleteAllRecoveryCodesDataByUserId(userId: string): Promise<number> {
    /*Просим коллекцию "recoveryPasswordCodesDataCollection" удалить данные о всех кодах восстановления пароля
    пользователя по ID пользователя в БД.*/
    const deleteResult: DeleteResult = await db.recoveryPasswordCodesDataCollection.deleteMany({ userId });
    /*Возвращаем количество удаленных данных о коде восстановления пароля пользователя.*/
    return deleteResult.deletedCount;
  }
}
