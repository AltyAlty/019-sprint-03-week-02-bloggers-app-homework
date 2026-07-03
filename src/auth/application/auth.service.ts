import { argon2Adapter } from '../adapters/argon2.adapter';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { Result } from '../../core/types/result/result.type';
import { jwtAdapter } from '../adapters/jwt.adapter';
import { usersService } from '../../users/application/users.service';
import { UserOutputDTO } from '../../users/routes/output-dto/user.output-dto';
import { CreateUserInputDTO } from '../../users/routes/input-dto/create-user.input-dto';
import { nodemailerAdapter } from '../adapters/nodemailer.adapter';
import { randomUUID } from 'crypto';
import { emailExamples } from '../email/email-examples';
import { add } from 'date-fns/add';
import { SETTINGS } from '../../core/settings/settings';
import { authRepository } from '../repositories/auth.repository';
import { securityDevicesService } from '../../security-devices/application/security-devices.service';
import { SessionDBType } from '../repositories/types/session-db.type';
import { mapToSessionList } from '../repositories/mappers/map-to-session-list.util';
import { SessionListType } from './types/session-list.type';
import { SecurityDeviceOutputDTO } from '../../security-devices/routes/output-dto/security-device.output-dto';
import { ObjectId } from 'mongodb';
import { EmailConfirmationDBType } from '../repositories/types/email-сonfirmation-db.type';
import { mapToEmailConfirmation } from '../repositories/mappers/map-to-email-confirmation.util';
import { EmailConfirmationType } from './types/email-сonfirmation.type';

/*Сервис для работы с аутентификацией и авторизацией.*/
export const authService = {
  /*Метод для аутентификации пользователя по логину/email и паролю.*/
  async loginUser(
    loginOrEmail: string,
    password: string,
    deviceName: string,
    ip: string
  ): Promise<Result<{ accessToken: string; refreshToken: string } | null>> {
    /*Просим сервис "authService" проверить подлинность логина/email и пароля пользователя.*/
    const checkedUserCredentialsResult: Result<{ id: string } | null> = await this._checkUserCredentials(
      loginOrEmail,
      password
    );

    /*Если проверка не прошла успешно, то возвращаем ResultObject с информацией об этом.*/
    if (checkedUserCredentialsResult.status !== ResultStatuses.Ok) return checkedUserCredentialsResult as Result;
    /*Если проверка прошла успешно, то получаем ID пользователя.*/
    const userId: string = checkedUserCredentialsResult.data!.id;
    /*Генерируем ID устройства пользователя.*/
    const deviceId = new ObjectId().toString();
    /*Просим адаптер "jwtAdapter" создать AT.*/
    const accessToken: string = await jwtAdapter.createAccessToken(userId, SETTINGS.AT_SECRET!, SETTINGS.AT_TIME!);

    /*Просим адаптер "jwtAdapter" создать RT.*/
    const refreshToken: string = await jwtAdapter.createRefreshToken(
      userId,
      deviceId,
      SETTINGS.RT_SECRET!,
      SETTINGS.RT_TIME!
    );

    /*Просим адаптер "jwtAdapter" декодировать RT.*/
    const refreshTokenPayload: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await jwtAdapter.decodeRefreshToken(refreshToken);

    /*Если декодирование RT не прошло успешно, то возвращаем ResultObject с информацией об этом.*/
    if (!refreshTokenPayload) {
      return {
        status: ResultStatuses.InternalServerError,
        data: null,
        errorMessage: 'Internal Server Error',
        extensions: [{ field: 'refresh token', message: 'Bad token created. Please retry' }],
      };
    }

    /*Если декодирование RT прошло успешно, то формируем даты создания и истечения RT.*/
    const { iat: refreshTokenIat, exp: refreshTokenExp }: { iat: number; exp: number } = refreshTokenPayload;
    const refreshTokenIatDate: Date = new Date(refreshTokenIat * 1000);
    const refreshTokenExpDate: Date = new Date(refreshTokenExp * 1000);
    /*Просим репозиторий "authRepository" добавить сессию в БД.*/
    await authRepository.createSession(userId, deviceId, deviceName, ip, refreshTokenIatDate, refreshTokenExpDate);

    /*Просим сервис "securityDevicesService" добавить устройство пользователя.*/
    await securityDevicesService.create({
      deviceId,
      title: deviceName,
      ip,
      lastActiveDate: refreshTokenIatDate,
    });

    /*Возвращаем ResultObject с AT и RT.*/
    return {
      status: ResultStatuses.Ok,
      data: { accessToken, refreshToken },
      extensions: [],
    };
  },

  /*Метод для регистрации пользователя. Второй параметр для использования в тестах.*/
  async registerUser(
    dto: CreateUserInputDTO,
    emailAdapter = nodemailerAdapter
  ): Promise<Result<{ createdUserId: string }>> {
    /*Генерируем код подтверждения регистрации пользователя.*/
    const newUserConfirmationCode: string = randomUUID();
    /*Генерируем дату истечения кода подтверждения регистрации пользователя.*/
    const newUserExpirationDate: Date = add(new Date(), SETTINGS.DEFAULT_CODE_EXPIRATION_TIME);

    /*Просим сервис "usersService" создать пользователя.*/
    const createUserResult: Result<{ createdUserId: string }> = await usersService.create(
      dto,
      newUserConfirmationCode,
      newUserExpirationDate
    );

    /*Получаем ID созданного пользователя.*/
    const createdUserId: string = createUserResult.data.createdUserId;

    /*Просим адаптер "nodemailerAdapter" отправить письмо о подтверждении регистрации пользователя.*/
    emailAdapter
      .sendMail(dto.email, 'Complete Registration', newUserConfirmationCode, emailExamples.completeRegistrationEmail)
      .catch(error => console.error('Failed to send a confirmation email: ', error));

    /*Если письмо было успешно отправлено, то возвращаем ResultObject с информацией об этом.*/
    return {
      status: ResultStatuses.Created,
      data: { createdUserId },
      extensions: [],
    };
  },

  /*Метод для перевыпуска пары AT/RT.*/
  async refreshAccessAndRefreshTokens(
    userId: string,
    deviceId: string,
    ip: string,
    currentRefreshToken: string
  ): Promise<Result<{ accessToken: string; refreshToken: string } | null>> {
    /*Просим адаптер "jwtAdapter" декодировать RT.*/
    const currentRefreshTokenPayload: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await jwtAdapter.decodeRefreshToken(currentRefreshToken);

    /*Если декодирование RT не прошло успешно, то возвращаем ResultObject с информацией об этом.*/
    if (!currentRefreshTokenPayload) {
      return {
        status: ResultStatuses.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'refresh token', message: 'Bad token. Please retry' }],
      };
    }

    /*Если декодирование RT прошло успешно, то формируем дату создания RT.*/
    const { iat: currentRefreshTokenIat }: { iat: number } = currentRefreshTokenPayload;
    const currentRefreshTokenIatDate: Date = new Date(currentRefreshTokenIat * 1000);
    /*Просим адаптер "jwtAdapter" создать AT.*/
    const accessToken: string = await jwtAdapter.createAccessToken(userId, SETTINGS.AT_SECRET!, SETTINGS.AT_TIME!);

    /*Просим адаптер "jwtAdapter" создать RT.*/
    const refreshToken: string = await jwtAdapter.createRefreshToken(
      userId,
      deviceId,
      SETTINGS.RT_SECRET!,
      SETTINGS.RT_TIME!
    );

    /*Просим адаптер "jwtAdapter" декодировать созданный RT.*/
    const refreshTokenPayload: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await jwtAdapter.decodeRefreshToken(refreshToken);

    /*Если декодирование RT не прошло успешно, то возвращаем ResultObject с информацией об этом.*/
    if (!refreshTokenPayload) {
      return {
        status: ResultStatuses.InternalServerError,
        data: null,
        errorMessage: 'Internal Server Error',
        extensions: [{ field: 'refresh token', message: 'Bad token created. Please retry' }],
      };
    }

    /*Если декодирование RT прошло успешно, то формируем даты создания и истечения созданного RT.*/
    const { iat: refreshTokenIat, exp: refreshTokenExp }: { iat: number; exp: number } = refreshTokenPayload;
    const refreshTokenIatDate: Date = new Date(refreshTokenIat * 1000);
    const refreshTokenExpDate: Date = new Date(refreshTokenExp * 1000);

    /*Просим репозиторий "authRepository" изменить сессию по дате создания RT в БД.*/
    await authRepository.updateSessionByIat(currentRefreshTokenIatDate, refreshTokenIatDate, refreshTokenExpDate, ip);

    /*Просим сервис "securityDevicesService" изменить устройство пользователя по ID.*/
    const updatedSecurityDeviceResult: Result<{} | null> = await securityDevicesService.updateById(
      deviceId,
      ip,
      refreshTokenIatDate
    );

    /*Если изменение устройства пользователя не прошло успешно, то возвращаем ResultObject с информацией об этом.*/
    if (updatedSecurityDeviceResult.status !== ResultStatuses.NoContent) return updatedSecurityDeviceResult as Result;

    /*Если изменение устройства пользователя прошло успешно, то возвращаем ResultObject с созданными AT и RT.*/
    return {
      status: ResultStatuses.Ok,
      data: { accessToken, refreshToken },
      extensions: [],
    };
  },

  /*Метод для создания данных о подтверждении регистрации пользователя.*/
  async createEmailConfirmation(userId: string, confirmationCode: string, expirationDate: Date): Promise<Result<{}>> {
    /*Просим репозиторий "authRepository" создать данные о подтверждении регистрации пользователя в БД.*/
    await authRepository.createEmailConfirmation(userId, confirmationCode, expirationDate);

    /*Возвращаем ResultObject с информацией о создании данных о подтверждении регистрации пользователя.*/
    return {
      status: ResultStatuses.Created,
      data: {},
      extensions: [],
    };
  },

  /*Метод для поиска сессий по ID пользователя.*/
  async findAllSessionsByUserId(userId: string): Promise<Result<{ sessionListOutput: SessionListType }>> {
    /*Просим репозиторий "authRepository" найти сессии по ID пользователя в БД.*/
    const sessionsDB: SessionDBType[] = await authRepository.findAllSessionsByUserId(userId);

    /*Преобразовываем сессии из БД в подготовленные для работы внутри приложения сессии.*/
    const sessionListOutput: SessionListType = mapToSessionList(sessionsDB);

    /*Возвращаем ResultObject с преобразованным сессиями.*/
    return {
      status: ResultStatuses.Ok,
      data: { sessionListOutput },
      extensions: [],
    };
  },

  /*Метод для поиска данных о подтверждении регистрации пользователя по коду подтверждения.*/
  async findEmailConfirmationByCode(
    code: string
  ): Promise<Result<{ emailConfirmationOutput: EmailConfirmationType } | null>> {
    /*Просим репозиторий "authRepository" найти данные о подтверждении регистрации пользователя по коду подтверждения в
    БД.*/
    const emailConfirmationDB: EmailConfirmationDBType | null = await authRepository.findEmailConfirmationByCode(code);

    /*Если данные о подтверждении регистрации пользователя не были найдены, то возвращаем ResultObject с информацией об
    этом.*/
    if (!emailConfirmationDB) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'code', message: 'Code is invalid' }],
      };
    }

    /*Если данные о подтверждении регистрации пользователя были найдены, то преобразовываем данные о подтверждении
    регистрации пользователя из БД в подготовленные для работы внутри приложения данные о подтверждении регистрации
    пользователя.*/
    const emailConfirmationOutput: EmailConfirmationType = mapToEmailConfirmation(emailConfirmationDB);

    /*Возвращаем ResultObject с преобразованными данными о подтверждении регистрации пользователя.*/
    return {
      status: ResultStatuses.Ok,
      data: { emailConfirmationOutput },
      extensions: [],
    };
  },

  /*Метод для повторной отправки письма для подтверждения регистрации пользователя. Второй параметр для использования в
  тестах.*/
  async resendConfirmationEmail(email: string, emailAdapter = nodemailerAdapter): Promise<Result<{} | null>> {
    /*Генерируем код подтверждения регистрации пользователя.*/
    const newUserConfirmationCode: string = randomUUID();
    /*Генерируем дату истечения кода подтверждения регистрации пользователя.*/
    const newUserExpirationDate: Date = add(new Date(), SETTINGS.DEFAULT_CODE_EXPIRATION_TIME);

    /*Просим сервис "usersService" найти пользователя по email.*/
    const userResult: Result<{
      userOutputWithIsConfirmedAndPasswordHash: UserOutputDTO & { isConfirmed: boolean; passwordHash: string };
    } | null> = await usersService.findByLoginOrEmail(email);

    /*Если пользователь не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (userResult.status !== ResultStatuses.Ok) {
      return {
        status: ResultStatuses.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'user', message: 'User not found' }],
      };
    }

    /*Если пользователь был найден, то получаем его ID.*/
    const userId: string = userResult.data!.userOutputWithIsConfirmedAndPasswordHash.id;
    /*Просим сервис "authService" изменить данные о подтверждении регистрации пользователя по ID пользователя.*/
    await this.updateEmailConfirmationByUserId(userId, newUserConfirmationCode, newUserExpirationDate);

    /*Просим адаптер "nodemailerAdapter" повторно отправить письмо о подтверждении регистрации пользователя.*/
    emailAdapter
      .sendMail(
        email,
        'Resending Complete Registration Mail',
        newUserConfirmationCode,
        emailExamples.completeRegistrationEmail
      )
      .catch(error => console.error('Failed to resend a confirmation email: ', error));

    /*Если письмо было успешно отправлено, то возвращаем ResultObject с информацией об этом.*/
    return {
      status: ResultStatuses.NoContent,
      data: {},
      extensions: [],
    };
  },

  /*Метод для изменения данных о подтверждении регистрации пользователя по ID пользователя.*/
  async updateEmailConfirmationByUserId(
    userId: string,
    confirmationCode: string,
    expirationDate: Date
  ): Promise<Result<{}>> {
    /*Просим репозиторий "authRepository" изменить данные для подтверждения регистрации пользователя по ID пользователя
    в БД.*/
    const updatedEmailConfirmationCount: number = await authRepository.updateEmailConfirmationByUserId(
      userId,
      confirmationCode,
      expirationDate
    );

    /*Если данные о подтверждении регистрации пользователя не были найдены, то просим сервис "authService" создать
    данные о подтверждении регистрации пользователя.*/
    if (updatedEmailConfirmationCount < 1) {
      await this.createEmailConfirmation(userId, confirmationCode, expirationDate);
    }

    /*Возвращаем ResultObject с информацией об изменении данных о подтверждении регистрации пользователя.*/
    return {
      status: ResultStatuses.NoContent,
      data: {},
      extensions: [],
    };
  },

  /*Метод для отзыва сессии.*/
  async revokeSession(refreshToken: string): Promise<Result<{} | null>> {
    /*Просим адаптер "jwtAdapter" декодировать RT.*/
    const refreshTokenPayload: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await jwtAdapter.decodeRefreshToken(refreshToken);

    /*Если декодирование RT не прошло успешно, то возвращаем ResultObject с информацией об этом.*/
    if (!refreshTokenPayload) {
      return {
        status: ResultStatuses.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'refresh token', message: 'Bad token. Please retry' }],
      };
    }

    /*Если декодирование RT прошло успешно, то формируем дату создания RT.*/
    const { iat: refreshTokenIat }: { iat: number } = refreshTokenPayload;
    const refreshTokenIatDate: Date = new Date(refreshTokenIat * 1000);
    /*Просим репозиторий "authRepository" удалить сессию по дате создания RT в БД.*/
    await authRepository.deleteSessionByIat(refreshTokenIatDate);

    /*Возвращаем ResultObject с информацией об отзыве сессии.*/
    return {
      status: ResultStatuses.NoContent,
      data: {},
      extensions: [],
    };
  },

  /*Метод для отзыва всех сессий пользователя, кроме текущей.*/
  async revokeSessionsExceptCurrentDevice(userId: string, deviceId: string): Promise<Result<{}>> {
    /*Просим репозиторий "authRepository" удалить все сессии пользователя, кроме текущей, в БД.*/
    await authRepository.deleteSessionsExceptCurrentDevice(userId, deviceId);
    /*Просим сервис "securityDevicesService" удалить все устройства пользователя, кроме текущего.*/
    await securityDevicesService.deleteAllExceptCurrentDevice(deviceId);

    /*Возвращаем ResultObject с информацией об отзыве сессий.*/
    return {
      status: ResultStatuses.NoContent,
      data: {},
      extensions: [],
    };
  },

  /*Метод для отзыва сессии по ID пользователя и ID устройства пользователя.*/
  async revokeSessionByUserIdAndDeviceId(userId: string, deviceId: string): Promise<Result<{} | null>> {
    /*Просим сервис "securityDevicesService" найти устройство пользователя по ID.*/
    const securityDeviceResult: Result<{ securityDeviceOutput: SecurityDeviceOutputDTO } | null> =
      await securityDevicesService.findById(deviceId);

    /*Если устройство пользователя не было найдено, то возвращаем ResultObject с информацией об этом.*/
    if (securityDeviceResult.status !== ResultStatuses.Ok) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'id', message: 'Device not found' }],
      };
    }

    /*Если устройство пользователя было найдено, то просим репозиторий "authRepository" найти сессию по ID пользователя
    и ID устройства пользователя в БД.*/
    const sessionDB: SessionDBType | null = await authRepository.findSessionByUserIdAndDeviceId(userId, deviceId);

    /*Если указанное устройство не принадлежит пользователю, то возвращаем ResultObject с информацией об этом*/
    if (!sessionDB) {
      return {
        status: ResultStatuses.Forbidden,
        data: null,
        errorMessage: 'Forbidden',
        extensions: [{ field: 'id', message: 'Device belongs to another user' }],
      };
    }

    /*Если указанное устройство принадлежит пользователю, то просим репозиторий "authRepository" удалить сессию по ID
    устройства пользователя в БД.*/
    await authRepository.deleteSessionByUserIdAndDeviceId(userId, deviceId);
    /*Просим сервис "securityDevicesService" удалить устройство пользователя по ID устройства.*/
    await securityDevicesService.deleteById(deviceId);

    /*Возвращаем ResultObject с информацией об отзыве сессии.*/
    return {
      status: ResultStatuses.NoContent,
      data: {},
      extensions: [],
    };
  },

  /*Метод для удаления данных о подтверждении регистрации пользователя по ID пользователя.*/
  async deleteEmailConfirmationByUserId(userId: string): Promise<Result<{}>> {
    /*Просим репозиторий "authRepository" удалить данные о подтверждении регистрации пользователя по ID пользователя в
    БД.*/
    await authRepository.deleteEmailConfirmationByUserId(userId);

    /*Возвращаем ResultObject с информацией об удалении данных о подтверждении регистрации пользователя .*/
    return {
      status: ResultStatuses.NoContent,
      data: {},
      extensions: [],
    };
  },

  /*Метод для проверки подлинности логина/email и пароля пользователя.*/
  async _checkUserCredentials(loginOrEmail: string, password: string): Promise<Result<{ id: string } | null>> {
    /*Просим сервис "usersService" найти пользователя по логину/email.*/
    const userResult: Result<{
      userOutputWithIsConfirmedAndPasswordHash: UserOutputDTO & { isConfirmed: boolean; passwordHash: string };
    } | null> = await usersService.findByLoginOrEmail(loginOrEmail);

    /*Если пользователь не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (userResult.status !== ResultStatuses.Ok) {
      return {
        status: ResultStatuses.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'user', message: 'User not found' }],
      };
    }

    /*Если пользователь был найден, но у него не была подтверждена регистрация, то возвращаем ResultObject с информацией
    об этом.*/
    if (!userResult.data!.userOutputWithIsConfirmedAndPasswordHash.isConfirmed) {
      return {
        status: ResultStatuses.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'email', message: 'Registration is not confirmed' }],
      };
    }

    /*Если пользователь был найден и у него была подтверждена регистрация, то просим адаптер "argon2Adapter" проверить
    валидность пароля.*/
    const isPasswordValid: boolean = await argon2Adapter.checkPasswordByHash(
      password,
      userResult.data!.userOutputWithIsConfirmedAndPasswordHash.passwordHash
    );

    /*Если проверка не прошла успешно, то возвращаем ResultObject с информацией об этом.*/
    if (!isPasswordValid) {
      return {
        status: ResultStatuses.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'credentials', message: 'Unauthorized' }],
      };
    }

    /*Если проверка прошла успешно, то возвращаем ResultObject с информацией об этом.*/
    return {
      status: ResultStatuses.Ok,
      data: { id: userResult.data!.userOutputWithIsConfirmedAndPasswordHash.id },
      extensions: [],
    };
  },
};
