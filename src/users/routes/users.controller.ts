import { Request, Response } from 'express';
import { UsersService } from '../application/users.service';
import { UsersQueryService } from '../application/users.query-service';
import { GetUserListQueryInputDTO } from './input-dto/query/get-user-list-query.input-dto';
import { getSanitizedQueryInputWithDefaultPaginationSettings } from '../../core/utils/pagination/get-sanitized-query-input-with-default-pagination-settings';
import { UserSortFieldQueryInputDTO } from './input-dto/query/user-sort-field-query.input-dto';
import { ExtensionType, Result } from '../../core/types/result/result.type';
import { HttpStatuses } from '../../core/types/http-statuses';
import { mapResultCodeToHttpStatus } from '../../core/utils/result/mappers/map-result-code-to-http-status';
import { errorsHandler } from '../../core/errors/errors.handler';
import { PaginatedUserListOutputDTO } from './output-dto/paginated-user-list.output-dto';
import { CreateUserInputDTO } from './input-dto/create-user.input-dto';
import { UserOutputDTO } from './output-dto/user.output-dto';
import { DeleteUSerByIdUriInputDTO } from './input-dto/uri/delete-user-by-id-uri.input-dto';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../ioc/types';

/*Контроллер для работы с пользователями.*/
@injectable()
export class UsersController {
  constructor(
    @inject(TYPES.UsersService) private readonly usersService: UsersService,
    @inject(TYPES.UsersQueryService) private readonly usersQueryService: UsersQueryService
  ) {}

  /*Метод-обработчик для GET-запросов по получению пользователей с пагинацией, используя query-параметры.*/
  async getUserListHandler(
    req: Request<{}, {}, {}, GetUserListQueryInputDTO>,
    res: Response<PaginatedUserListOutputDTO>
  ): Promise<void | Response<PaginatedUserListOutputDTO>> {
    try {
      /*Санитизируем query-параметры и добавляем к ним дефолтные настройки пагинации.*/
      const sanitizedQueryInputWithDefaultPaginationSettings = getSanitizedQueryInputWithDefaultPaginationSettings<
        GetUserListQueryInputDTO,
        UserSortFieldQueryInputDTO
      >(req);

      /*Просим query-сервис "usersQueryService" найти пользователей.*/
      const paginatedUserListResult: Result<{ paginatedUserListOutput: PaginatedUserListOutputDTO }> =
        await this.usersQueryService.findAll(sanitizedQueryInputWithDefaultPaginationSettings);

      /*Получаем HTTP-статус операции по поиску пользователей.*/
      const paginatedUserListResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(paginatedUserListResult.status);
      /*Отправляем пользователей клиенту.*/
      return res.status(paginatedUserListResultHttpStatus).send(paginatedUserListResult.data.paginatedUserListOutput);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для POST-запросов по добавлению пользователя.*/
  async createUserHandler(
    req: Request<{}, {}, CreateUserInputDTO>,
    res: Response<UserOutputDTO | ExtensionType[]>
  ): Promise<void | Response<UserOutputDTO | ExtensionType[]>> {
    try {
      /*Просим сервис "usersService" создать пользователя.*/
      const createdUserResult: Result<{ createdUserId: string }> = await this.usersService.create(req.body);
      /*Получаем HTTP-статус операции по созданию пользователя.*/
      const createdUserResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(createdUserResult.status);

      /*Просим query-сервис "usersQueryService" найти созданного пользователя по ID.*/
      const userResult: Result<{ userOutput: UserOutputDTO } | null> = await this.usersQueryService.findById(
        createdUserResult.data.createdUserId
      );

      /*Получаем HTTP-статус операции по поиску созданного пользователя по ID.*/
      const userResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(userResult.status);

      /*Если созданный пользователь не был найден, то сообщаем об этом клиенту.*/
      if (userResultHttpStatus !== HttpStatuses.Ok_200) {
        return res.status(userResultHttpStatus).send(userResult.extensions);
      }

      /*Если созданный пользователь был найден, то отправляем его клиенту.*/
      return res.status(createdUserResultHttpStatus).send(userResult.data!.userOutput);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для DELETE-запросов по удалению пользователя по ID, используя URI-параметры.*/
  async deleteUserByIdHandler(
    req: Request<DeleteUSerByIdUriInputDTO>,
    res: Response<void | ExtensionType[]>
  ): Promise<void | Response<void | ExtensionType[]>> {
    try {
      /*Получаем ID пользователя.*/
      const userId: string = req.params.id;
      /*Просим сервис "usersService" удалить пользователя по ID.*/
      const deletedUserResult: Result<{} | null> = await this.usersService.deleteById(userId);
      /*Получаем HTTP-статус операции по удалению пользователя по ID.*/
      const deletedUserResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(deletedUserResult.status);

      /*Если пользователь не был удален, то сообщаем об этом клиенту.*/
      if (deletedUserResultHttpStatus !== HttpStatuses.NoContent_204) {
        return res.status(deletedUserResultHttpStatus).send(deletedUserResult.extensions);
      }

      /*Если пользователь был удален, то сообщаем об этом клиенту.*/
      return res.sendStatus(deletedUserResultHttpStatus);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }
}
