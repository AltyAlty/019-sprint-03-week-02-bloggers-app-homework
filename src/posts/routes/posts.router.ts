import { Router } from 'express';
import { inputValidationResultMiddleware } from '../../core/middlewares/validation/input-validation-result.middleware';
import { idValidation, postIdValidation } from '../../core/middlewares/validation/params-id-validation.middlewares';
import { createPostInputValidation, updatePostInputValidation } from '../validation/posts-input-validation.middlewares';
import { paginationValidationMiddleware } from '../../core/middlewares/validation/pagination-validation.middleware';
import { PostSortFieldQueryInputDTO } from './input-dto/query/post-sort-field-query.input-dto';
import { CommentSortFieldQueryInputDTO } from '../../comments/routes/input-dto/query/comment-sort-field-query.input-dto';
import { createCommentForPostInputValidation } from '../../comments/validation/comments-input-validation.middlewares';
import { SETTINGS } from '../../core/settings/settings';
import { accessTokenGuardMiddleware, basicAuthGuardMiddleware, postsController } from '../../ioc/composition-root';

/*Роутер из Express для работы с постами.*/
export const postsRouter: Router = Router({});

/*Конфигурируем роутер "postsRouter".*/
postsRouter
  /*001. GET-запрос по получению комментариев с пагинацией в посте по ID, используя URI-параметры и query-параметры.*/
  .get(
    SETTINGS.GET_COMMENT_LIST_BY_POST_ID_PATH,
    postIdValidation,
    paginationValidationMiddleware(CommentSortFieldQueryInputDTO),
    inputValidationResultMiddleware,
    postsController.getCommentListByPostIdHandler.bind(postsController)
  )
  /*002. POST-запрос по добавлению комментария в пост по ID, используя URI-параметры.*/
  .post(
    SETTINGS.CREATE_COMMENT_FOR_POST_PATH,
    accessTokenGuardMiddleware,
    postIdValidation,
    createCommentForPostInputValidation,
    inputValidationResultMiddleware,
    postsController.createCommentForPostHandler.bind(postsController)
  )
  /*003. GET-запрос по получению постов с пагинацией, используя query-параметры.*/
  .get(
    SETTINGS.GET_POST_LIST_PATH,
    paginationValidationMiddleware(PostSortFieldQueryInputDTO),
    inputValidationResultMiddleware,
    postsController.getPostListHandler.bind(postsController)
  )
  /*004. POST-запрос по добавлению поста.*/
  .post(
    SETTINGS.CREATE_POST_PATH,
    basicAuthGuardMiddleware,
    createPostInputValidation,
    inputValidationResultMiddleware,
    postsController.createPostHandler.bind(postsController)
  )
  /*005. GET-запрос по получению поста по ID, используя URI-параметры.*/
  .get(
    SETTINGS.GET_POST_BY_ID_PATH,
    idValidation,
    inputValidationResultMiddleware,
    postsController.getPostByIdHandler.bind(postsController)
  )
  /*006. PUT-запрос по изменению поста по ID, используя URI-параметры.*/
  .put(
    SETTINGS.UPDATE_POST_BY_ID_PATH,
    basicAuthGuardMiddleware,
    idValidation,
    updatePostInputValidation,
    inputValidationResultMiddleware,
    postsController.updatePostByIdHandler.bind(postsController)
  )
  /*007. DELETE-запрос по удалению поста по ID, используя URI-параметры.*/
  .delete(
    SETTINGS.DELETE_POST_BY_ID_PATH,
    basicAuthGuardMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    postsController.deletePostByIdHandler.bind(postsController)
  );
