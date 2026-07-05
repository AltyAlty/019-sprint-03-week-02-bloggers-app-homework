import { Argon2Adapter } from '../../auth/adapters/argon2.adapter';
import { CommentsService } from '../../comments/application/comments.service';
import { AuthService } from '../../auth/application/auth.service';
import { UsersRepository } from '../repositories/users.repository';
import { UserType } from './types/user.type';
import { CreateUserInputDTO } from '../routes/input-dto/create-user.input-dto';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { Result } from '../../core/types/result/result.type';
import { UserOutputDTO } from '../routes/output-dto/user.output-dto';
import { mapToUserOutputDTO } from '../repositories/mappers/map-to-user-output-dto.util';
import { UserDBType } from '../repositories/types/user-db.type';
import { EmailConfirmationType } from '../../auth/application/types/email-сonfirmation.type';
import { RecoveryCodeDataType } from '../../auth/application/types/recovery-code-data.type';
import { inject, injectable } from 'inversify';
import { container } from '../../composition-root';

/*Сервис для работы с пользователями.*/
@injectable()
export class UsersService {
  constructor(
    @inject(Argon2Adapter) private readonly argon2Adapter: Argon2Adapter,
    @inject(UsersRepository) private readonly usersRepository: UsersRepository
  ) {
    this.argon2Adapter = argon2Adapter;
    this.usersRepository = usersRepository;
  }

  private get authService() {
    return container.get(AuthService);
  }

  private get commentsService() {
    return container.get(CommentsService);
  }

  /*Метод для добавления пользователя.*/
  async create(dto: CreateUserInputDTO, isUserRegistering?: boolean): Promise<Result<{ createdUserId: string }>> {
    /*Создаем переменные на основе параметра "dto" при помощи деструктуризации.*/
    const { login, password, email }: { login: string; password: string; email: string } = dto;
    /*Просим адаптер "argon2Adapter" сгенерировать хеш для пароля.*/
    const passwordHash: string = await this.argon2Adapter.generatePasswordHash(password);

    /*Создаем объект с данными нового пользователя.*/
    const newUser: UserType = {
      login,
      email,
      passwordHash,
      createdAt: new Date(),
      isConfirmed: !isUserRegistering,
    };

    /*Просим репозиторий "usersRepository" создать нового пользователя в БД.*/
    const createdUserId: string = await this.usersRepository.create(newUser);
    /*Возвращаем ResultObject с ID пользователя.*/
    return { status: ResultStatuses.Created, data: { createdUserId }, extensions: [] };
  }

  /*Метод для поиска пользователя по ID.*/
  async findById(id: string): Promise<Result<{ userOutput: UserOutputDTO } | null>> {
    /*Просим репозиторий "usersRepository" найти пользователя по ID в БД.*/
    const userDB: UserDBType | null = await this.usersRepository.findById(id);

    /*Если пользователь не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!userDB) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'id', message: 'User not found' }],
      };
    }

    /*Если пользователь был найден, то преобразовываем пользователя из БД в подготовленного для отправки пользователя.*/
    const userOutput: UserOutputDTO = mapToUserOutputDTO(userDB);
    /*Возвращаем ResultObject с преобразованным пользователем.*/
    return { status: ResultStatuses.Ok, data: { userOutput }, extensions: [] };
  }

  /*Метод для поиска пользователя по логину/email.*/
  async findByLoginOrEmail(loginOrEmail: string): Promise<
    Result<{
      userOutputWithIsConfirmedAndPasswordHash: UserOutputDTO & { isConfirmed: boolean; passwordHash: string };
    } | null>
  > {
    /*Просим репозиторий "usersRepository" найти пользователя по логину/email в БД.*/
    const userDB: UserDBType | null = await this.usersRepository.findByLoginOrEmail(loginOrEmail);

    /*Если пользователь не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!userDB) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'login/email', message: 'User not found' }],
      };
    }

    /*Если пользователь был найден, то преобразовываем пользователя из БД в подготовленного для отправки клиенту
    пользователя.*/
    const userOutput: UserOutputDTO = mapToUserOutputDTO(userDB);

    /*Возвращаем ResultObject с преобразованным пользователем.*/
    return {
      status: ResultStatuses.Ok,
      data: {
        userOutputWithIsConfirmedAndPasswordHash: {
          ...userOutput,
          isConfirmed: userDB.isConfirmed,
          passwordHash: userDB.passwordHash,
        },
      },
      extensions: [],
    };
  }

  /*Метод для подтверждения регистрации пользователя по коду.*/
  async confirmByCode(code: string): Promise<Result<{} | null>> {
    /*Просим сервис "authService" найти данные о подтверждении регистрации пользователя по коду подтверждения.*/
    const emailConfirmationResult: Result<{ emailConfirmationOutput: EmailConfirmationType } | null> =
      await this.authService.findEmailConfirmationByCode(code);

    /*Если данные о подтверждении регистрации пользователя не были найдены, то возвращаем ResultObject с информацией об
    этом.*/
    if (emailConfirmationResult.status !== ResultStatuses.Ok) return emailConfirmationResult as Result;
    /*Если данные о подтверждении регистрации пользователя были найдены, то получаем ID пользователя.*/
    const userId: string = emailConfirmationResult.data!.emailConfirmationOutput.userId;
    /*Просим репозиторий "usersRepository" подтвердить регистрацию пользователя по ID пользователя в БД.*/
    const confirmedUserCount: number = await this.usersRepository.confirmById(userId);

    /*Если регистрация пользователя не была подтверждена, то возвращаем ResultObject с информацией об этом.*/
    if (confirmedUserCount < 1) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'user', message: 'User not found' }],
      };
    }

    /*Если регистрация пользователя была подтверждена, то просим сервис "authService" удалить данные о подтверждении
    регистрации пользователя.*/
    await this.authService.deleteEmailConfirmationByUserId(userId);
    /*Возвращаем ResultObject c информацией о подтверждении регистрации пользователя.*/
    return { status: ResultStatuses.NoContent, data: {}, extensions: [] };
  }

  /*Метод для изменения пароля пользователя по коду восстановления.*/
  async updatePasswordByRecoveryCode(recoveryCode: string, password: string): Promise<Result<{} | null>> {
    /*Просим сервис "authService" найти данные о коде восстановления пароля пользователя по коду.*/
    const recoveryCodeDataResult: Result<{ recoveryCodeDataOutput: RecoveryCodeDataType } | null> =
      await this.authService.findRecoveryPasswordCodeDataByCode(recoveryCode);

    /*Если данные о коде восстановления пароля пользователя не были найдены, то возвращаем ResultObject с информацией об
    этом.*/
    if (recoveryCodeDataResult.status !== ResultStatuses.Ok) return recoveryCodeDataResult as Result;
    /*Если данные о коде восстановления пароля пользователя были найдены, то получаем ID пользователя.*/
    const userId: string = recoveryCodeDataResult.data!.recoveryCodeDataOutput.userId;
    /*Просим адаптер "argon2Adapter" сгенерировать хеш для пароля.*/
    const passwordHash: string = await this.argon2Adapter.generatePasswordHash(password);
    /*Просим репозиторий "usersRepository" изменить хеш для пароля пользователя по ID в БД.*/
    await this.usersRepository.updatePasswordHashById(userId, passwordHash);
    /*Просим сервис "authService" удалить данные о коде восстановления пароля пользователя по коду.*/
    await this.authService.deleteRecoveryCodeDataByCode(recoveryCode);
    /*Просим сервис "authService" удалить все сессии пользователя по ID пользователя.*/
    await this.authService.revokeAllSessionsByUserId(userId);
    /*Возвращаем ResultObject c информацией об изменении пароля пользователя.*/
    return { status: ResultStatuses.NoContent, data: {}, extensions: [] };
  }

  /*Метод для удаления пользователя по ID.*/
  async deleteById(id: string): Promise<Result<{} | null>> {
    /*Просим сервис "commentsService" удалить комментарии пользователя по ID.*/
    await this.commentsService.deleteAllByUserId(id);
    /*Просим репозиторий "usersRepository" удалить пользователя по ID в БД.*/
    const deletedUserCount: number = await this.usersRepository.deleteById(id);

    /*Если пользователь не был удален, то возвращаем ResultObject с информацией об этом.*/
    if (deletedUserCount < 1) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'id', message: 'User not found' }],
      };
    }

    /*Если пользователь был удален, то возвращаем ResultObject с информацией об этом.*/
    return { status: ResultStatuses.NoContent, data: {}, extensions: [] };
  }
}
