import { Router } from 'express';
import { paginationValidationMiddleware } from '../../core/middlewares/validation/pagination-validation.middleware';
import { inputValidationResultMiddleware } from '../../core/middlewares/validation/input-validation-result.middleware';
import { basicAuthGuardMiddleware } from '../../auth/middlewares/guard-middlewares/basic-auth.guard-middleware';
import { idValidation } from '../../core/middlewares/validation/params-id-validation.middlewares';
import { UserSortFieldQueryInputDTO } from './input-dto/query/user-sort-field-query.input-dto';
import { createUserInputValidation } from '../validation/users-input-validation.middlewares';
import { SETTINGS } from '../../core/settings/settings';
import { container } from '../../composition-root';
import { UsersController } from './users.controller';

/**/
const usersController = container.get<UsersController>(UsersController);

/*Роутер из Express для работы с пользователями.*/
export const usersRouter: Router = Router({});
/*Применяем middleware "basicAuthGuardMiddleware" ко всем маршрутам.*/
usersRouter.use(basicAuthGuardMiddleware);

/*Конфигурируем роутер "usersRouter".*/
usersRouter
  /*001. GET-запрос по получению пользователей с пагинацией, используя query-параметры.*/
  .get(
    SETTINGS.GET_USER_LIST_PATH,
    paginationValidationMiddleware(UserSortFieldQueryInputDTO),
    inputValidationResultMiddleware,
    usersController.getUserListHandler.bind(usersController)
  )
  /*002. POST-запрос по добавлению пользователя.*/
  .post(
    SETTINGS.CREATE_USER_PATH,
    createUserInputValidation,
    inputValidationResultMiddleware,
    usersController.createUserHandler.bind(usersController)
  )
  /*003. DELETE-запрос по удалению пользователя по ID, используя URI-параметры.*/
  .delete(
    SETTINGS.DELETE_USER_BY_ID_PATH,
    idValidation,
    inputValidationResultMiddleware,
    usersController.deleteUserByIdHandler.bind(usersController)
  );
