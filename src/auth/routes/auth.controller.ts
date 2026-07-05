import { AuthService } from '../application/auth.service';
import { UsersService } from '../../users/application/users.service';
import { UsersQueryService } from '../../users/application/users.query-service';
import { Request, Response } from 'express';
import { LoginDataInputDTO } from './input-dto/login-data.input-dto';
import { LoginOutputDTO } from './output-dto/login.output-dto';
import { ExtensionType, Result } from '../../core/types/result/result.type';
import { HttpStatuses } from '../../core/types/http-statuses';
import { mapResultCodeToHttpStatus } from '../../core/utils/result/mappers/map-result-code-to-http-status';
import { errorsHandler } from '../../core/errors/errors.handler';
import { CreateUserInputDTO } from '../../users/routes/input-dto/create-user.input-dto';
import { IdType } from '../../core/types/id.type';
import { MeOutputDTO } from './output-dto/me.output-dto';
import { UserOutputDTO } from '../../users/routes/output-dto/user.output-dto';
import { RegistrationConfirmationCodeInputDTO } from './input-dto/registration-confirmation-code.input-dto';
import { ResendConfirmationEmailInputDTO } from './input-dto/resend-confirmation-email.input-dto';
import { RefreshAccessAndRefreshTokensOutputDTO } from './output-dto/refresh-token.output-dto';
import { PasswordRecoveryEmailInputDTO } from './input-dto/password-recovery-email.input-dto';
import { settingNewPasswordByRecoveryCodeInputDTO } from './input-dto/setting-new-password-by-recovery-code.input-dto';
import { inject, injectable } from 'inversify';

/*Контроллер для работы с аутентификацией и авторизацией.*/
@injectable()
export class AuthController {
  constructor(
    @inject(AuthService) private readonly authService: AuthService,
    @inject(UsersService) private readonly usersService: UsersService,
    @inject(UsersQueryService) private readonly usersQueryService: UsersQueryService
  ) {
    this.authService = authService;
    this.usersService = usersService;
    this.usersQueryService = usersQueryService;
  }

  /*Метод-обработчик для POST-запросов по аутентификации пользователя по логину/email.*/
  async authByLoginOrEmailHandler(
    req: Request<{}, {}, LoginDataInputDTO>,
    res: Response<LoginOutputDTO | ExtensionType[]>
  ): Promise<void | Response<LoginOutputDTO | ExtensionType[]>> {
    try {
      /*Получаем логин/email и пароль пользователя.*/
      const { loginOrEmail, password }: { loginOrEmail: string; password: string } = req.body;
      /*Получаем имя устройства пользователя.*/
      const deviceName: string = req.headers['user-agent'] || 'Unknown Device';
      /*Получаем IP-адрес пользователя.*/
      const ip: string = req.ip || req.socket.remoteAddress || '0.0.0.0';

      /*Просим сервис "authService" аутентифицировать пользователя по логину/email и паролю.*/
      const loginUserResult: Result<{ accessToken: string; refreshToken: string } | null> =
        await this.authService.loginUser(loginOrEmail, password, deviceName, ip);

      /*Получаем HTTP-статус операции по аутентификации пользователя по логину/email и паролю.*/
      const loginUserResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(loginUserResult.status);

      /*Если аутентификация не прошла успешно, то сообщаем об этом клиенту.*/
      if (loginUserResultHttpStatus !== HttpStatuses.Ok_200) {
        return res.status(loginUserResultHttpStatus).send(loginUserResult.extensions);
      }

      /*Если аутентификация прошла успешно, то отправляем AT (в теле ответа) и RT (в cookies) клиенту.*/
      return res
        .cookie('refreshToken', loginUserResult.data!.refreshToken, { httpOnly: true, secure: true })
        .status(loginUserResultHttpStatus)
        .send({ accessToken: loginUserResult.data!.accessToken });
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для GET-запросов по получению данных пользователя по AT.*/
  async getAuthDataByAccessTokenHandler(
    req: Request<{}, {}, {}, {}, IdType>,
    res: Response<MeOutputDTO | ExtensionType[]>
  ): Promise<void | Response<MeOutputDTO | ExtensionType[]>> {
    try {
      /*Получаем ID пользователя.*/
      const userId: string = req.userId!.id;
      /*Просим query-сервис "usersQueryService" найти пользователя по ID.*/
      const userResult: Result<{ userOutput: UserOutputDTO } | null> = await this.usersQueryService.findById(userId);
      /*Получаем HTTP-статус операции по поиску пользователя по ID.*/
      const userResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(userResult.status);

      /*Если пользователь не был найден, то сообщаем об этом клиенту.*/
      if (userResultHttpStatus !== HttpStatuses.Ok_200) {
        return res.status(userResultHttpStatus).send(userResult.extensions);
      }

      /*Если пользователь был найден, то отправляем его данные клиенту.*/
      return res.status(userResultHttpStatus).send({
        login: userResult.data!.userOutput.login,
        email: userResult.data!.userOutput.email,
        userId: userResult.data!.userOutput.id,
      });
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для POST-запросов по регистрации пользователя.*/
  async registerUserHandler(
    req: Request<{}, {}, CreateUserInputDTO>,
    res: Response<void | ExtensionType[]>
  ): Promise<void | Response<void | ExtensionType[]>> {
    try {
      /*Просим сервис "authService" зарегистрировать пользователя.*/
      const registerUserResult: Result<{ createdUserId: string } | null> = await this.authService.registerUser(
        req.body
      );

      /*Получаем HTTP-статус операции по регистрации пользователя.*/
      const registerUserResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(registerUserResult.status);

      /*Если пользователь не был зарегистрирован, то сообщаем об этом клиенту.*/
      if (registerUserResultHttpStatus !== HttpStatuses.Created_201) {
        return res.status(registerUserResultHttpStatus).send(registerUserResult.extensions);
      }

      /*Если пользователь был зарегистрирован, то сообщаем об этом клиенту.*/
      return res.sendStatus(HttpStatuses.NoContent_204);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для POST-запросов по подтверждению регистрации пользователя по коду.*/
  async confirmUserByCodeHandler(
    req: Request<{}, {}, RegistrationConfirmationCodeInputDTO>,
    res: Response<void | ExtensionType[]>
  ): Promise<void | Response<void | ExtensionType[]>> {
    try {
      /*Получаем код подтверждения регистрации пользователя.*/
      const code: string = req.body.code;
      /*Просим сервис "usersService" подтвердить регистрацию пользователя по коду.*/
      const confirmEmailResult: Result<{} | null> = await this.usersService.confirmByCode(code);
      /*Получаем HTTP-статус операции по подтверждению регистрации пользователя по коду.*/
      const confirmEmailResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(confirmEmailResult.status);

      /*Если подтверждение регистрации пользователя по коду не прошло успешно, то сообщаем об этом клиенту.*/
      if (confirmEmailResultHttpStatus !== HttpStatuses.NoContent_204) {
        return res.status(confirmEmailResultHttpStatus).send(confirmEmailResult.extensions);
      }

      /*Если подтверждение регистрации пользователя по коду прошло успешно, то сообщаем об этом клиенту.*/
      return res.sendStatus(confirmEmailResultHttpStatus);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для POST-запросов по повторной отправке письма для подтверждения регистрация пользователя.*/
  async resendConfirmationEmailHandler(
    req: Request<{}, {}, ResendConfirmationEmailInputDTO>,
    res: Response<void | ExtensionType[]>
  ): Promise<void | Response<void | ExtensionType[]>> {
    try {
      /*Получаем почту регистрируемого пользователя.*/
      const email: string = req.body.email;
      /*Просим сервис "authService" повторно отправить письмо для подтверждения регистрации пользователя.*/
      const resendConfirmationEmailResult: Result<{} | null> = await this.authService.resendConfirmationEmail(email);

      /*Получаем HTTP-статус операции по повторной отправке письма для подтверждения регистрации пользователя.*/
      const resendConfirmationEmailResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(
        resendConfirmationEmailResult.status
      );

      /*Если повторная отправка письма для подтверждения регистрации пользователя не прошла успешно, то сообщаем об этом
      клиенту.*/
      if (resendConfirmationEmailResultHttpStatus !== HttpStatuses.NoContent_204) {
        return res.status(resendConfirmationEmailResultHttpStatus).send(resendConfirmationEmailResult.extensions);
      }

      /*Если повторная отправка письма для подтверждения регистрации пользователя прошла успешно, то сообщаем об этом
      клиенту.*/
      return res.sendStatus(resendConfirmationEmailResultHttpStatus);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для POST-запросов по получению новой пары AT/RT.*/
  async refreshAccessAndRefreshTokensHandler(
    req: Request<{}, {}, {}, {}, IdType>,
    res: Response<RefreshAccessAndRefreshTokensOutputDTO | ExtensionType[]>
  ): Promise<void | Response<RefreshAccessAndRefreshTokensOutputDTO | ExtensionType[]>> {
    try {
      /*Получаем ID пользователя.*/
      const userId: string = req.userId!.id;
      /*Получаем ID устройства пользователя из сессии.*/
      const deviceId: string = req.deviceId!.id;
      /*Получаем IP-адрес пользователя.*/
      const ip: string = req.ip || req.socket.remoteAddress || '0.0.0.0';
      /*Получаем текущий RT.*/
      const currentRefreshToken: string = req.cookies.refreshToken;

      /*Просим сервис "authService" перевыпустить пару AT/RT.*/
      const createAccessAndRefreshTokensResult: Result<{ accessToken: string; refreshToken: string } | null> =
        await this.authService.refreshAccessAndRefreshTokens(userId, deviceId, ip, currentRefreshToken);

      /*Получаем HTTP-статус операции по перевыпуску пары AT/RT.*/
      const createAccessAndRefreshTokensResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(
        createAccessAndRefreshTokensResult.status
      );

      /*Если перевыпуск пары AT/RT не прошел успешно, то сообщаем об этом клиенту.*/
      if (createAccessAndRefreshTokensResultHttpStatus !== HttpStatuses.Ok_200) {
        return res
          .status(createAccessAndRefreshTokensResultHttpStatus)
          .send(createAccessAndRefreshTokensResult.extensions);
      }

      /*Если перевыпуск пары AT/RT прошел успешно, то отправляем AT (в теле ответа) и RT (в cookies) клиенту.*/
      return res
        .cookie('refreshToken', createAccessAndRefreshTokensResult.data!.refreshToken, { httpOnly: true, secure: true })
        .status(createAccessAndRefreshTokensResultHttpStatus)
        .send({ accessToken: createAccessAndRefreshTokensResult.data!.accessToken });
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для POST-запросов по отзыву сессии.*/
  async revokeSessionHandler(
    req: Request<{}, {}, {}, {}, IdType>,
    res: Response<void | ExtensionType[]>
  ): Promise<void | Response<void | ExtensionType[]>> {
    try {
      /*Получаем RT.*/
      const refreshToken: string = req.cookies.refreshToken;
      /*Просим сервис "authService" отозвать сессию.*/
      const revokeSessionResult: Result<{} | null> = await this.authService.revokeSession(refreshToken);
      /*Получаем HTTP-статус операции по отзыву сессии.*/
      const revokeRefreshTokenResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(revokeSessionResult.status);

      /*Если отзыв сессии не прошел успешно, то сообщаем об этом клиенту.*/
      if (revokeRefreshTokenResultHttpStatus !== HttpStatuses.NoContent_204) {
        return res.status(revokeRefreshTokenResultHttpStatus).send(revokeSessionResult.extensions);
      }

      /*Если отзыв сессии прошел успешно, то сообщаем об этом клиенту.*/
      return res.sendStatus(revokeRefreshTokenResultHttpStatus);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для POST-запросов по отправке письма с кодом восстановления пароля пользователя.*/
  async sendRecoveryPasswordCodeHandler(
    req: Request<{}, {}, PasswordRecoveryEmailInputDTO>,
    res: Response<void>
  ): Promise<void | Response<void>> {
    try {
      /*Получаем почту пользователя.*/
      const email: string = req.body.email;
      /*Просим сервис "authService" отправить письмо с кодом восстановления пароля пользователя.*/
      const sendRecoveryPasswordCodeResult: Result<{} | null> = await this.authService.sendRecoveryPasswordCode(email);

      /*Получаем HTTP-статус операции по отправке письма с кодом восстановления пароля пользователя.*/
      const sendRecoveryPasswordCodeResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(
        sendRecoveryPasswordCodeResult.status
      );

      /*Сообщаем клиенту об отправке письма с кодом восстановления пароля пользователя.*/
      return res.sendStatus(sendRecoveryPasswordCodeResultHttpStatus);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для POST-запросов по установлению нового пароля пользователя по коду восстановления.*/
  async setNewPasswordByRecoveryCodeHandler(
    req: Request<{}, {}, settingNewPasswordByRecoveryCodeInputDTO>,
    res: Response<void | ExtensionType[]>
  ): Promise<void | Response<void | ExtensionType[]>> {
    try {
      /*Получаем новый пароль пользователя.*/
      const password: string = req.body.newPassword;
      /*Получаем код восстановления пароля пользователя.*/
      const recoveryCode: string = req.body.recoveryCode;

      /*Просим сервис "usersService" установить новый пароль пользователя по коду восстановления.*/
      const updatePasswordByRecoveryCodeResult: Result<{} | null> =
        await this.usersService.updatePasswordByRecoveryCode(recoveryCode, password);

      /*Получаем HTTP-статус операции по установлению нового пароль пользователя по коду восстановления.*/
      const updatePasswordByRecoveryCodeResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(
        updatePasswordByRecoveryCodeResult.status
      );

      /*Если установление нового пароля пользователя по коду восстановления не прошла успешно, то сообщаем об этом
      клиенту.*/
      if (updatePasswordByRecoveryCodeResultHttpStatus !== HttpStatuses.NoContent_204) {
        return res
          .status(updatePasswordByRecoveryCodeResultHttpStatus)
          .send(updatePasswordByRecoveryCodeResult.extensions);
      }

      /*Если установление нового пароля пользователя по коду восстановления прошла успешно, то сообщаем об этом клиенту.*/
      return res.sendStatus(updatePasswordByRecoveryCodeResultHttpStatus);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }
}
