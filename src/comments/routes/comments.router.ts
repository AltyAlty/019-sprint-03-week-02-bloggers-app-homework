import { Router } from 'express';
import { idValidation } from '../../core/middlewares/validation/params-id-validation.middlewares';
import { inputValidationResultMiddleware } from '../../core/middlewares/validation/input-validation-result.middleware';
import { accessTokenGuardMiddleware } from '../../auth/middlewares/guard-middlewares/access-token.guard-middleware';
import { updateCommentInputValidation } from '../validation/comments-input-validation.middlewares';
import { SETTINGS } from '../../core/settings/settings';
import { container } from '../../composition-root';
import { CommentsController } from './comments.controller';

/**/
const commentsController = container.get<CommentsController>(CommentsController);

/*Роутер из Express для работы с комментариями.*/
export const commentsRouter: Router = Router({});

/*Конфигурируем роутер "commentsRouter".*/
commentsRouter
  /*001. PUT-запрос по изменению комментария по ID, используя URI-параметры.*/
  .put(
    SETTINGS.UPDATE_COMMENT_BY_ID_PATH,
    accessTokenGuardMiddleware,
    idValidation,
    updateCommentInputValidation,
    inputValidationResultMiddleware,
    commentsController.updateCommentByIdHandler.bind(commentsController)
  )
  /*002. DELETE-запрос по удалению комментария по ID, используя URI-параметры.*/
  .delete(
    SETTINGS.DELETE_COMMENT_BY_ID_PATH,
    accessTokenGuardMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    commentsController.deleteCommentByIdHandler.bind(commentsController)
  )
  /*003. GET-запрос по получению комментария по ID, используя URI-параметры.*/
  .get(
    SETTINGS.GET_COMMENT_BY_ID_PATH,
    idValidation,
    inputValidationResultMiddleware,
    commentsController.getCommentByIdHandler.bind(commentsController)
  );
