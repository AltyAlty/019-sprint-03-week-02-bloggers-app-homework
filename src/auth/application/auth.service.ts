import { Argon2Adapter } from '../adapters/argon2.adapter';
import { JwtAdapter } from '../adapters/jwt.adapter';
import { NodemailerAdapter } from '../adapters/nodemailer.adapter';
import { UsersService } from '../../users/application/users.service';
import { SecurityDevicesService } from '../../security-devices/application/security-devices.service';
import { AuthRepository } from '../repositories/auth.repository';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { Result } from '../../core/types/result/result.type';
import { UserOutputDTO } from '../../users/routes/output-dto/user.output-dto';
import { CreateUserInputDTO } from '../../users/routes/input-dto/create-user.input-dto';
import { randomUUID } from 'crypto';
import { emailExamples } from '../email/email-examples';
import { add } from 'date-fns/add';
import { SETTINGS } from '../../core/settings/settings';
import { SessionDBType } from '../repositories/types/session-db.type';
import { mapToSessionList } from '../repositories/mappers/map-to-session-list.util';
import { SessionListType } from './types/session-list.type';
import { SecurityDeviceOutputDTO } from '../../security-devices/routes/output-dto/security-device.output-dto';
import { ObjectId } from 'mongodb';
import { EmailConfirmationDBType } from '../repositories/types/email-сonfirmation-db.type';
import { mapToEmailConfirmation } from '../repositories/mappers/map-to-email-confirmation.util';
import { EmailConfirmationType } from './types/email-сonfirmation.type';
import { RecoveryCodeDataDBType } from '../repositories/types/recovery-code-data-db.type';
import { mapToRecoveryCodeData } from '../repositories/mappers/map-to-recovery-code-data.util';
import { RecoveryCodeDataType } from './types/recovery-code-data.type';
import { inject, injectable } from 'inversify';
import { container } from '../../composition-root';

/*Сервис для работы с аутентификацией и авторизацией.*/
@injectable()
export class AuthService {
  constructor(
    @inject(Argon2Adapter) private readonly argon2Adapter: Argon2Adapter,
    @inject(JwtAdapter) private readonly jwtAdapter: JwtAdapter,
    @inject(NodemailerAdapter) private readonly nodemailerAdapter: NodemailerAdapter,
    @inject(SecurityDevicesService) private readonly securityDevicesService: SecurityDevicesService,
    @inject(AuthRepository) private readonly authRepository: AuthRepository
  ) {
    this.argon2Adapter = argon2Adapter;
    this.jwtAdapter = jwtAdapter;
    this.nodemailerAdapter = nodemailerAdapter;
    this.authRepository = authRepository;
  }

  private get usersService() {
    return container.get(UsersService);
  }

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
    const accessToken: string = await this.jwtAdapter.createAccessToken(userId, SETTINGS.AT_SECRET!, SETTINGS.AT_TIME!);

    /*Просим адаптер "jwtAdapter" создать RT.*/
    const refreshToken: string = await this.jwtAdapter.createRefreshToken(
      userId,
      deviceId,
      SETTINGS.RT_SECRET!,
      SETTINGS.RT_TIME!
    );

    /*Просим адаптер "jwtAdapter" декодировать RT.*/
    const refreshTokenPayload: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await this.jwtAdapter.decodeRefreshToken(refreshToken);

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
    await this.authRepository.createSession(userId, deviceId, deviceName, ip, refreshTokenIatDate, refreshTokenExpDate);
    /*Просим сервис "securityDevicesService" добавить устройство пользователя.*/
    await this.securityDevicesService.create({ deviceId, title: deviceName, ip, lastActiveDate: refreshTokenIatDate });
    /*Возвращаем ResultObject с AT и RT.*/
    return { status: ResultStatuses.Ok, data: { accessToken, refreshToken }, extensions: [] };
  }

  /*Метод для регистрации пользователя. Второй параметр для использования в тестах.*/
  async registerUser(
    dto: CreateUserInputDTO,
    emailAdapter = this.nodemailerAdapter
  ): Promise<Result<{ createdUserId: string }>> {
    /*Генерируем код подтверждения регистрации пользователя.*/
    const newUserConfirmationCode: string = randomUUID();
    /*Генерируем дату истечения кода подтверждения регистрации пользователя.*/
    const newUserExpirationDate: Date = add(new Date(), SETTINGS.COMPLETE_REGISTRATION_CODE_EXPIRATION_TIME);
    /*Просим сервис "usersService" создать пользователя.*/
    const createUserResult: Result<{ createdUserId: string }> = await this.usersService.create(dto, true);
    /*Получаем ID созданного пользователя.*/
    const createdUserId: string = createUserResult.data.createdUserId;
    /*Просим сервис "authService" создать данные о подтверждении регистрации пользователя.*/
    await this.createEmailConfirmation(createdUserId, newUserConfirmationCode, newUserExpirationDate);

    /*Просим адаптер "nodemailerAdapter" отправить письмо о подтверждении регистрации пользователя.*/
    emailAdapter
      .sendMail(dto.email, 'Complete Registration', newUserConfirmationCode, emailExamples.completeRegistrationEmail)
      .catch(error => console.error('Failed to send a confirmation email: ', error));

    /*Если письмо было успешно отправлено, то возвращаем ResultObject с информацией об этом.*/
    return { status: ResultStatuses.Created, data: { createdUserId }, extensions: [] };
  }

  /*Метод для перевыпуска пары AT/RT.*/
  async refreshAccessAndRefreshTokens(
    userId: string,
    deviceId: string,
    ip: string,
    currentRefreshToken: string
  ): Promise<Result<{ accessToken: string; refreshToken: string } | null>> {
    /*Просим адаптер "jwtAdapter" декодировать RT.*/
    const currentRefreshTokenPayload: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await this.jwtAdapter.decodeRefreshToken(currentRefreshToken);

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
    const accessToken: string = await this.jwtAdapter.createAccessToken(userId, SETTINGS.AT_SECRET!, SETTINGS.AT_TIME!);

    /*Просим адаптер "jwtAdapter" создать RT.*/
    const refreshToken: string = await this.jwtAdapter.createRefreshToken(
      userId,
      deviceId,
      SETTINGS.RT_SECRET!,
      SETTINGS.RT_TIME!
    );

    /*Просим адаптер "jwtAdapter" декодировать созданный RT.*/
    const refreshTokenPayload: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await this.jwtAdapter.decodeRefreshToken(refreshToken);

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
    await this.authRepository.updateSessionByIat(
      currentRefreshTokenIatDate,
      refreshTokenIatDate,
      refreshTokenExpDate,
      ip
    );

    /*Просим сервис "securityDevicesService" изменить устройство пользователя по ID.*/
    const updatedSecurityDeviceResult: Result<{} | null> = await this.securityDevicesService.updateById(
      deviceId,
      ip,
      refreshTokenIatDate
    );

    /*Если изменение устройства пользователя не прошло успешно, то возвращаем ResultObject с информацией об этом.*/
    if (updatedSecurityDeviceResult.status !== ResultStatuses.NoContent) return updatedSecurityDeviceResult as Result;
    /*Если изменение устройства пользователя прошло успешно, то возвращаем ResultObject с созданными AT и RT.*/
    return { status: ResultStatuses.Ok, data: { accessToken, refreshToken }, extensions: [] };
  }

  /*Метод для создания данных о подтверждении регистрации пользователя.*/
  async createEmailConfirmation(userId: string, confirmationCode: string, expirationDate: Date): Promise<Result<{}>> {
    /*Просим репозиторий "authRepository" создать данные о подтверждении регистрации пользователя в БД.*/
    await this.authRepository.createEmailConfirmation(userId, confirmationCode, expirationDate);
    /*Возвращаем ResultObject с информацией о создании данных о подтверждении регистрации пользователя.*/
    return { status: ResultStatuses.Created, data: {}, extensions: [] };
  }

  /*Метод для отправки письма с кодом восстановления пароля пользователя. Второй параметр для использования в тестах.*/
  async sendRecoveryPasswordCode(email: string, emailAdapter = this.nodemailerAdapter): Promise<Result<{}>> {
    /*Просим сервис "usersService" найти пользователя по email.*/
    const userResult: Result<{
      userOutputWithIsConfirmedAndPasswordHash: UserOutputDTO & { isConfirmed: boolean; passwordHash: string };
    } | null> = await this.usersService.findByLoginOrEmail(email);

    /*Если пользователь не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (userResult.status !== ResultStatuses.Ok) return { status: ResultStatuses.NoContent, data: {}, extensions: [] };
    /*Если пользователь был найден, то получаем ID пользователя.*/
    const userId: string = userResult.data!.userOutputWithIsConfirmedAndPasswordHash.id;
    /*Просим репозиторий "authRepository" удалить данные о всех кодах восстановления пароля пользователя по ID
    пользователя в БД.*/
    await this.authRepository.deleteAllRecoveryCodesDataByUserId(userId);
    /*Генерируем код восстановления пароля пользователя.*/
    const recoveryCode: string = randomUUID();
    /*Генерируем дату истечения кода восстановления пароля пользователя.*/
    const recoveryCodeExpirationDate: Date = add(new Date(), SETTINGS.PASSWORD_RECOVERY_CODE_EXPIRATION_TIME);
    /*Просим репозиторий "authRepository" создать данные о коде восстановления пароля пользователя в БД.*/
    await this.authRepository.createRecoveryPasswordCodeData(userId, recoveryCode, recoveryCodeExpirationDate);

    /*Просим адаптер "nodemailerAdapter" отправить письмо с кодом восстановления пароля пользователя.*/
    emailAdapter
      .sendMail(email, 'Recover Password', recoveryCode, emailExamples.passwordRecoveryEmail)
      .catch(error => console.error('Failed to send a recovery password email: ', error));

    /*Если письмо было успешно отправлено, то возвращаем ResultObject с информацией об этом.*/
    return { status: ResultStatuses.NoContent, data: {}, extensions: [] };
  }

  /*Метод для поиска сессий по ID пользователя.*/
  async findAllSessionsByUserId(userId: string): Promise<Result<{ sessionListOutput: SessionListType }>> {
    /*Просим репозиторий "authRepository" найти сессии по ID пользователя в БД.*/
    const sessionsDB: SessionDBType[] = await this.authRepository.findAllSessionsByUserId(userId);
    /*Преобразовываем сессии из БД в подготовленные для работы внутри приложения сессии.*/
    const sessionListOutput: SessionListType = mapToSessionList(sessionsDB);
    /*Возвращаем ResultObject с преобразованным сессиями.*/
    return { status: ResultStatuses.Ok, data: { sessionListOutput }, extensions: [] };
  }

  /*Метод для поиска данных о подтверждении регистрации пользователя по коду подтверждения.*/
  async findEmailConfirmationByCode(
    code: string
  ): Promise<Result<{ emailConfirmationOutput: EmailConfirmationType } | null>> {
    /*Просим репозиторий "authRepository" найти данные о подтверждении регистрации пользователя по коду подтверждения в
    БД.*/
    const emailConfirmationDB: EmailConfirmationDBType | null =
      await this.authRepository.findEmailConfirmationByCode(code);

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
    return { status: ResultStatuses.Ok, data: { emailConfirmationOutput }, extensions: [] };
  }

  /*Метод для поиска данных о коде восстановления пароля пользователя по коду.*/
  async findRecoveryPasswordCodeDataByCode(
    recoveryCode: string
  ): Promise<Result<{ recoveryCodeDataOutput: RecoveryCodeDataType } | null>> {
    /*Просим репозиторий "authRepository" найти данные о коде восстановления пароля пользователя по коду в БД.*/
    const recoveryCodeDataDB: RecoveryCodeDataDBType | null =
      await this.authRepository.findRecoveryPasswordCodeDataByCode(recoveryCode);

    /*Если данные о коде восстановления пароля пользователя не были найдены, то возвращаем ResultObject с информацией об
    этом.*/
    if (!recoveryCodeDataDB) {
      return {
        status: ResultStatuses.BadRequest,
        data: null,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'recovery code', message: 'Recovery code is invalid' }],
      };
    }

    /*Если данные о коде восстановления пароля пользователя были найдены, то преобразовываем данные о коде
    восстановления пароля пользователя из БД в подготовленные для работы внутри приложения данные о коде восстановления
    пароля пользователя.*/
    const recoveryCodeDataOutput: RecoveryCodeDataType = mapToRecoveryCodeData(recoveryCodeDataDB);
    /*Возвращаем ResultObject с преобразованным кодом восстановления пароля пользователя.*/
    return { status: ResultStatuses.Ok, data: { recoveryCodeDataOutput }, extensions: [] };
  }

  /*Метод для повторной отправки письма для подтверждения регистрации пользователя. Второй параметр для использования в
  тестах.*/
  async resendConfirmationEmail(email: string, emailAdapter = this.nodemailerAdapter): Promise<Result<{} | null>> {
    /*Генерируем код подтверждения регистрации пользователя.*/
    const newUserConfirmationCode: string = randomUUID();
    /*Генерируем дату истечения кода подтверждения регистрации пользователя.*/
    const newUserExpirationDate: Date = add(new Date(), SETTINGS.COMPLETE_REGISTRATION_CODE_EXPIRATION_TIME);

    /*Просим сервис "usersService" найти пользователя по email.*/
    const userResult: Result<{
      userOutputWithIsConfirmedAndPasswordHash: UserOutputDTO & { isConfirmed: boolean; passwordHash: string };
    } | null> = await this.usersService.findByLoginOrEmail(email);

    /*Если пользователь не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (userResult.status !== ResultStatuses.Ok) {
      return {
        status: ResultStatuses.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'user', message: 'User not found' }],
      };
    }

    /*Если пользователь был найден, то получаем ID пользователя.*/
    const userId: string = userResult.data!.userOutputWithIsConfirmedAndPasswordHash.id;
    /*Просим сервис "authService" изменить данные о подтверждении регистрации пользователя по ID пользователя.*/
    await this.updateEmailConfirmationByUserId(userId, newUserConfirmationCode, newUserExpirationDate);

    /*Просим адаптер "nodemailerAdapter" повторно отправить письмо о подтверждении регистрации пользователя.*/
    emailAdapter
      .sendMail(
        email,
        'Resending Complete Registration Email',
        newUserConfirmationCode,
        emailExamples.completeRegistrationEmail
      )
      .catch(error => console.error('Failed to resend a confirmation email: ', error));

    /*Если письмо было успешно отправлено, то возвращаем ResultObject с информацией об этом.*/
    return { status: ResultStatuses.NoContent, data: {}, extensions: [] };
  }

  /*Метод для изменения данных о подтверждении регистрации пользователя по ID пользователя.*/
  async updateEmailConfirmationByUserId(
    userId: string,
    confirmationCode: string,
    expirationDate: Date
  ): Promise<Result<{}>> {
    /*Просим репозиторий "authRepository" изменить данные для подтверждения регистрации пользователя по ID пользователя
    в БД.*/
    const updatedEmailConfirmationCount: number = await this.authRepository.updateEmailConfirmationByUserId(
      userId,
      confirmationCode,
      expirationDate
    );

    /*Если данные о подтверждении регистрации пользователя не были найдены, то просим сервис "authService" создать
    данные о подтверждении регистрации пользователя.*/
    if (updatedEmailConfirmationCount < 1) await this.createEmailConfirmation(userId, confirmationCode, expirationDate);
    /*Возвращаем ResultObject с информацией об изменении данных о подтверждении регистрации пользователя.*/
    return { status: ResultStatuses.NoContent, data: {}, extensions: [] };
  }

  /*Метод для отзыва сессии.*/
  async revokeSession(refreshToken: string): Promise<Result<{} | null>> {
    /*Просим адаптер "jwtAdapter" декодировать RT.*/
    const refreshTokenPayload: { userId: string; deviceId: string; iat: number; exp: number } | null =
      await this.jwtAdapter.decodeRefreshToken(refreshToken);

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
    await this.authRepository.deleteSessionByIat(refreshTokenIatDate);
    /*Возвращаем ResultObject с информацией об отзыве сессии.*/
    return { status: ResultStatuses.NoContent, data: {}, extensions: [] };
  }

  /*Метод для отзыва всех сессий пользователя, кроме текущей.*/
  async revokeSessionsExceptCurrentDevice(userId: string, deviceId: string): Promise<Result<{}>> {
    /*Просим репозиторий "authRepository" удалить все сессии пользователя, кроме текущей, в БД.*/
    await this.authRepository.deleteSessionsExceptCurrentDevice(userId, deviceId);
    /*Просим сервис "securityDevicesService" удалить все устройства пользователя, кроме текущего.*/
    await this.securityDevicesService.deleteAllExceptCurrentDevice(deviceId);
    /*Возвращаем ResultObject с информацией об отзыве сессий.*/
    return { status: ResultStatuses.NoContent, data: {}, extensions: [] };
  }

  /*Метод для отзыва сессии по ID пользователя и ID устройства пользователя.*/
  async revokeSessionByUserIdAndDeviceId(userId: string, deviceId: string): Promise<Result<{} | null>> {
    /*Просим сервис "securityDevicesService" найти устройство пользователя по ID.*/
    const securityDeviceResult: Result<{ securityDeviceOutput: SecurityDeviceOutputDTO } | null> =
      await this.securityDevicesService.findById(deviceId);

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
    const sessionDB: SessionDBType | null = await this.authRepository.findSessionByUserIdAndDeviceId(userId, deviceId);

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
    await this.authRepository.deleteSessionByUserIdAndDeviceId(userId, deviceId);
    /*Просим сервис "securityDevicesService" удалить устройство пользователя по ID устройства.*/
    await this.securityDevicesService.deleteById(deviceId);
    /*Возвращаем ResultObject с информацией об отзыве сессии.*/
    return { status: ResultStatuses.NoContent, data: {}, extensions: [] };
  }

  /*Метод для отзыва всех сессий пользователя по ID пользователя.*/
  async revokeAllSessionsByUserId(userId: string): Promise<Result<{}>> {
    /*Просим репозиторий "authRepository" удалить все сессии пользователя по ID пользователя в БД.*/
    await this.authRepository.deleteAllSessionsByUserId(userId);
    /*Просим сервис "securityDevicesService" удалить все устройства пользователя по ID пользователя.*/
    await this.securityDevicesService.deleteAllByUserId(userId);
    /*Возвращаем ResultObject с информацией об отзыве сессий.*/
    return { status: ResultStatuses.NoContent, data: {}, extensions: [] };
  }

  /*Метод для удаления данных о подтверждении регистрации пользователя по ID пользователя.*/
  async deleteEmailConfirmationByUserId(userId: string): Promise<Result<{}>> {
    /*Просим репозиторий "authRepository" удалить данные о подтверждении регистрации пользователя по ID пользователя в
    БД.*/
    await this.authRepository.deleteEmailConfirmationByUserId(userId);
    /*Возвращаем ResultObject с информацией об удалении данных о подтверждении регистрации пользователя.*/
    return { status: ResultStatuses.NoContent, data: {}, extensions: [] };
  }

  /*Метод для удаления данных о коде восстановления пароля пользователя по коду.*/
  async deleteRecoveryCodeDataByCode(recoveryCode: string): Promise<Result<{}>> {
    /*Просим репозиторий "authRepository" удалить данные о коде восстановления пароля пользователя по коду в БД.*/
    await this.authRepository.deleteRecoveryCodeDataByCode(recoveryCode);
    /*Возвращаем ResultObject с информацией об удалении данных о коде восстановления пароля пользователя.*/
    return { status: ResultStatuses.NoContent, data: {}, extensions: [] };
  }

  /*Метод для проверки подлинности логина/email и пароля пользователя.*/
  async _checkUserCredentials(loginOrEmail: string, password: string): Promise<Result<{ id: string } | null>> {
    /*Просим сервис "usersService" найти пользователя по логину/email.*/
    const userResult: Result<{
      userOutputWithIsConfirmedAndPasswordHash: UserOutputDTO & { isConfirmed: boolean; passwordHash: string };
    } | null> = await this.usersService.findByLoginOrEmail(loginOrEmail);

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
    const isPasswordValid: boolean = await this.argon2Adapter.checkPasswordByHash(
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
  }
}
