import { Router } from 'express';
import { blogIdValidation, idValidation } from '../../core/middlewares/validation/params-id-validation.middlewares';
import { inputValidationResultMiddleware } from '../../core/middlewares/validation/input-validation-result.middleware';
import { createBlogInputValidation, updateBlogInputValidation } from '../validation/blogs-input-validation.middlewares';
import { basicAuthGuardMiddleware } from '../../auth/middlewares/guard-middlewares/basic-auth.guard-middleware';
import { paginationValidationMiddleware } from '../../core/middlewares/validation/pagination-validation.middleware';
import { BlogSortFieldQueryInputDTO } from './input-dto/query/blog-sort-field-query.input-dto';
import { createPostForBlogInputValidation } from '../../posts/validation/posts-input-validation.middlewares';
import { PostSortFieldQueryInputDTO } from '../../posts/routes/input-dto/query/post-sort-field-query.input-dto';
import { SETTINGS } from '../../core/settings/settings';
import { container } from '../../composition-root';
import { BlogsController } from './blogs.controller';

/**/
const blogsController = container.get<BlogsController>(BlogsController);

/*Роутер из Express для работы с блогами.*/
export const blogsRouter: Router = Router({});

/*Конфигурируем роутер "blogsRouter".*/
blogsRouter
  /*001. GET-запрос по получению блогов с пагинацией, используя query-параметры.*/
  .get(
    SETTINGS.GET_BLOG_LIST_PATH,
    paginationValidationMiddleware(BlogSortFieldQueryInputDTO),
    inputValidationResultMiddleware,
    blogsController.getBlogListHandler.bind(blogsController)
  )
  /*002. POST-запрос по добавлению блога.*/
  .post(
    SETTINGS.CREATE_BLOG_PATH,
    basicAuthGuardMiddleware,
    createBlogInputValidation,
    inputValidationResultMiddleware,
    blogsController.createBlogHandler.bind(blogsController)
  )
  /*003. GET-запрос по получению постов с пагинацией в блоге по ID, используя URI-параметры и query-параметры.*/
  .get(
    SETTINGS.GET_POST_LIST_BY_BLOG_ID_PATH,
    blogIdValidation,
    paginationValidationMiddleware(PostSortFieldQueryInputDTO),
    inputValidationResultMiddleware,
    blogsController.getPostListByBlogIdHandler.bind(blogsController)
  )
  /*004. POST-запрос по добавлению поста в блог по ID, используя URI-параметры.*/
  .post(
    SETTINGS.CREATE_POST_FOR_BLOG_PATH,
    basicAuthGuardMiddleware,
    blogIdValidation,
    createPostForBlogInputValidation,
    inputValidationResultMiddleware,
    blogsController.createPostForBlogByBlogIdHandler.bind(blogsController)
  )
  /*005. GET-запрос по получению блога по ID, используя URI-параметры. При помощи ":" Express позволяет указывать
  переменные в пути. Такие переменные доступны через объект "req.params".*/
  .get(
    SETTINGS.GET_BLOG_BY_ID_PATH,
    idValidation,
    inputValidationResultMiddleware,
    blogsController.getBlogByIdHandler.bind(blogsController)
  )
  /*006. PUT-запрос по изменению блога по ID, используя URI-параметры.*/
  .put(
    SETTINGS.UPDATE_BLOG_BY_ID_PATH,
    basicAuthGuardMiddleware,
    idValidation,
    updateBlogInputValidation,
    inputValidationResultMiddleware,
    blogsController.updateBlogByIdHandler.bind(blogsController)
  )
  /*007. DELETE-запрос по удалению блога по ID, используя URI-параметры.*/
  .delete(
    SETTINGS.DELETE_BLOG_BY_ID_PATH,
    basicAuthGuardMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    blogsController.deleteBlogByIdHandler.bind(blogsController)
  );
