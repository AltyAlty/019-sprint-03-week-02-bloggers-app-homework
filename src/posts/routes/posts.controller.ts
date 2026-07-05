import { Request, Response } from 'express';
import { PostsService } from '../application/posts.service';
import { CommentsService } from '../../comments/application/comments.service';
import { PostsQueryService } from '../application/posts.query-service';
import { CommentsQueryService } from '../../comments/application/comments.query-service';
import { GetCommentListByPostIdUriInputDTO } from '../../comments/routes/input-dto/uri/get-comment-list-by-post-id-uri.input-dto';
import { GetCommentListByPostIdQueryInputDTO } from '../../comments/routes/input-dto/query/get-comment-list-by-post-id-query.input-dto';
import { PaginatedCommentListOutputDTO } from '../../comments/routes/output-dto/paginated-comment-list.output-dto';
import { ExtensionType, Result } from '../../core/types/result/result.type';
import { getSanitizedQueryInputWithDefaultPaginationSettings } from '../../core/utils/pagination/get-sanitized-query-input-with-default-pagination-settings';
import { CommentSortFieldQueryInputDTO } from '../../comments/routes/input-dto/query/comment-sort-field-query.input-dto';
import { HttpStatuses } from '../../core/types/http-statuses';
import { mapResultCodeToHttpStatus } from '../../core/utils/result/mappers/map-result-code-to-http-status';
import { errorsHandler } from '../../core/errors/errors.handler';
import { CreateCommentForPostUriInputDTO } from '../../comments/routes/input-dto/uri/create-comment-for-post-uri.input-dto';
import { CreateCommentForPostInputDTO } from '../../comments/routes/input-dto/create-comment-for-post.input-dto';
import { CommentOutputDTO } from '../../comments/routes/output-dto/comment.output-dto';
import { GetPostListQueryInputDTO } from './input-dto/query/get-post-list-query.input-dto';
import { PaginatedPostListOutputDTO } from './output-dto/paginated-post-list.output-dto';
import { PostSortFieldQueryInputDTO } from './input-dto/query/post-sort-field-query.input-dto';
import { CreatePostInputDTO } from './input-dto/create-post.input-dto';
import { PostOutputDTO } from './output-dto/post.output-dto';
import { GetPostByIdUriInputDTO } from './input-dto/uri/get-post-by-id-uri.input-dto';
import { UpdatePostByIdUriInputDTO } from './input-dto/uri/update-post-by-id-uri.input-dto';
import { UpdatePostByIdInputDTO } from './input-dto/update-post-by-id.input-dto';
import { DeletePostByIdUriInputDTO } from './input-dto/uri/delete-post-by-id-uri.input-dto';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../ioc/types';

/*Контроллер для работы с постами.*/
@injectable()
export class PostsController {
  constructor(
    @inject(TYPES.PostsService) private readonly postsService: PostsService,
    @inject(TYPES.CommentsService) private readonly commentsService: CommentsService,
    @inject(TYPES.PostsQueryService) private readonly postsQueryService: PostsQueryService,
    @inject(TYPES.CommentsQueryService) private readonly commentsQueryService: CommentsQueryService
  ) {}

  /*Метод-обработчик для GET-запросов по получению комментариев с пагинацией в посте по ID, используя URI-параметры и
  query-параметры.*/
  async getCommentListByPostIdHandler(
    req: Request<GetCommentListByPostIdUriInputDTO, {}, {}, GetCommentListByPostIdQueryInputDTO>,
    res: Response<PaginatedCommentListOutputDTO | ExtensionType[]>
  ): Promise<void | Response<PaginatedCommentListOutputDTO | ExtensionType[]>> {
    try {
      /*Получаем ID поста.*/
      const postId: string = req.params.postId;

      /*Санитизируем query-параметры и добавляем к ним дефолтные настройки пагинации.*/
      const sanitizedQueryInputWithDefaultPaginationSettings = getSanitizedQueryInputWithDefaultPaginationSettings<
        GetCommentListByPostIdQueryInputDTO,
        CommentSortFieldQueryInputDTO
      >(req);

      /*Просим query-сервис "commentsQueryService" найти комментарии в посте по ID.*/
      const paginatedCommentListResult: Result<{ paginatedCommentListOutput: PaginatedCommentListOutputDTO } | null> =
        await this.commentsQueryService.findAllByPostId(postId, sanitizedQueryInputWithDefaultPaginationSettings);

      /*Получаем HTTP-статус операции по поиску комментариев в посте по ID.*/
      const paginatedCommentListResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(
        paginatedCommentListResult.status
      );

      /*Если комментарии не были найдены в посте, то сообщаем об этом клиенту.*/
      if (paginatedCommentListResultHttpStatus !== HttpStatuses.Ok_200) {
        return res.status(paginatedCommentListResultHttpStatus).send(paginatedCommentListResult.extensions);
      }

      /*Если комментарии были найдены в посте, то отправляем их клиенту.*/
      return res
        .status(paginatedCommentListResultHttpStatus)
        .send(paginatedCommentListResult.data!.paginatedCommentListOutput);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для POST-запросов по добавлению нового комментария в пост по ID, используя URI-параметры.*/
  async createCommentForPostHandler(
    req: Request<CreateCommentForPostUriInputDTO, {}, CreateCommentForPostInputDTO>,
    res: Response<CommentOutputDTO | ExtensionType[]>
  ): Promise<void | Response<CommentOutputDTO | ExtensionType[]>> {
    try {
      /*Получаем ID поста.*/
      const postId: string = req.params.postId;
      /*Получаем ID пользователя.*/
      const userId: string = req.userId!.id;

      /*Просим сервис "commentsService" создать комментарий в посте.*/
      const createdCommentResult: Result<{ createdCommentId: string } | null> =
        await this.commentsService.createForPost(postId, userId, req.body);

      /*Получаем HTTP-статус операции по созданию комментария в посте.*/
      const createdCommentResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(createdCommentResult.status);

      /*Если комментарий не был создан в посте, то сообщаем об этом клиенту.*/
      if (createdCommentResultHttpStatus !== HttpStatuses.Created_201) {
        return res.status(createdCommentResultHttpStatus).send(createdCommentResult.extensions);
      }

      /*Если комментарий был создан в посте, то просим query-сервис "commentsQueryService" найти созданный комментарий по
      ID.*/
      const commentResult: Result<{ commentOutput: CommentOutputDTO } | null> =
        await this.commentsQueryService.findById(createdCommentResult.data!.createdCommentId);

      /*Получаем HTTP-статус операции по поиску созданного комментария по ID.*/
      const commentResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(commentResult.status);

      /*Если созданный комментарий не был найден, то сообщаем об этом клиенту.*/
      if (commentResultHttpStatus !== HttpStatuses.Ok_200) {
        return res.status(commentResultHttpStatus).send(commentResult.extensions);
      }

      /*Если созданный комментарий был найден, то отправляем его клиенту.*/
      return res.status(createdCommentResultHttpStatus).send(commentResult.data!.commentOutput);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для GET-запросов по получению постов с пагинацией, используя query-параметры.*/
  async getPostListHandler(
    req: Request<{}, {}, {}, GetPostListQueryInputDTO>,
    res: Response<PaginatedPostListOutputDTO | ExtensionType[]>
  ): Promise<void | Response<PaginatedPostListOutputDTO | ExtensionType[]>> {
    try {
      /*Санитизируем query-параметры и добавляем к ним дефолтные настройки пагинации.*/
      const sanitizedQueryInputWithDefaultPaginationSettings = getSanitizedQueryInputWithDefaultPaginationSettings<
        GetPostListQueryInputDTO,
        PostSortFieldQueryInputDTO
      >(req);

      /*Просим query-сервис "postsQueryService" найти посты.*/
      const paginatedPostListResult: Result<{ paginatedPostListOutput: PaginatedPostListOutputDTO } | null> =
        await this.postsQueryService.findAll(sanitizedQueryInputWithDefaultPaginationSettings);

      /*Получаем HTTP-статус операции по поиску постов.*/
      const paginatedPostListResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(paginatedPostListResult.status);

      /*Если посты не были найдены, то сообщаем об этом клиенту.*/
      if (paginatedPostListResultHttpStatus !== HttpStatuses.Ok_200) {
        return res.status(paginatedPostListResultHttpStatus).send(paginatedPostListResult.extensions);
      }

      /*Если посты были найдены, то отправляем их клиенту.*/
      return res.status(paginatedPostListResultHttpStatus).send(paginatedPostListResult.data!.paginatedPostListOutput);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для POST-запросов по добавлению поста.*/
  async createPostHandler(
    req: Request<{}, {}, CreatePostInputDTO>,
    res: Response<PostOutputDTO | ExtensionType[]>
  ): Promise<void | Response<PostOutputDTO | ExtensionType[]>> {
    try {
      /*Просим сервис "postsService" создать пост.*/
      const createdPostResult: Result<{ createdPostId: string } | null> = await this.postsService.create(req.body);
      /*Получаем HTTP-статус операции по созданию поста.*/
      const createdPostResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(createdPostResult.status);

      /*Просим query-сервис "postsQueryService" найти созданный пост по ID.*/
      const postResult: Result<{ postOutput: PostOutputDTO } | null> = await this.postsQueryService.findById(
        createdPostResult.data!.createdPostId
      );

      /*Получаем HTTP-статус операции по поиску созданного поста по ID.*/
      const postResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(postResult.status);

      /*Если созданный пост не был найден, то сообщаем об этом клиенту.*/
      if (postResultHttpStatus !== HttpStatuses.Ok_200) {
        return res.status(postResultHttpStatus).send(postResult.extensions);
      }

      /*Если созданный пост был найден, то отправляем его клиенту.*/
      return res.status(createdPostResultHttpStatus).send(postResult.data!.postOutput);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для GET-запросов по получению поста по ID, используя URI-параметры.*/
  async getPostByIdHandler(
    req: Request<GetPostByIdUriInputDTO>,
    res: Response<PostOutputDTO | ExtensionType[]>
  ): Promise<void | Response<PostOutputDTO | ExtensionType[]>> {
    try {
      /*Получаем ID поста.*/
      const postId: string = req.params.id;
      /*Просим query-сервис "postsQueryService" найти пост по ID.*/
      const postResult: Result<{ postOutput: PostOutputDTO } | null> = await this.postsQueryService.findById(postId);
      /*Получаем HTTP-статус операции по поиску поста по ID.*/
      const postResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(postResult.status);

      /*Если пост не был найден, то сообщаем об этом клиенту.*/
      if (postResultHttpStatus !== HttpStatuses.Ok_200) {
        return res.status(postResultHttpStatus).send(postResult.extensions);
      }

      /*Если пост был найден, то отправляем его клиенту.*/
      return res.status(postResultHttpStatus).send(postResult.data!.postOutput);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для PUT-запросов по изменению поста по ID, используя URI-параметры.*/
  async updatePostByIdHandler(
    req: Request<UpdatePostByIdUriInputDTO, {}, UpdatePostByIdInputDTO>,
    res: Response<void | ExtensionType[]>
  ): Promise<void | Response<void | ExtensionType[]>> {
    try {
      /*Получаем ID поста.*/
      const postId: string = req.params.id;
      /*Просим сервис "postsService" изменить пост по ID.*/
      const updatedPostResult: Result<{} | null> = await this.postsService.updateById(postId, req.body);
      /*Получаем HTTP-статус операции по изменению поста по ID.*/
      const updatedPostResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(updatedPostResult.status);

      /*Если пост не был изменен, то сообщаем об этом клиенту.*/
      if (updatedPostResultHttpStatus !== HttpStatuses.NoContent_204) {
        return res.status(updatedPostResultHttpStatus).send(updatedPostResult.extensions);
      }

      /*Если пост был изменен, то сообщаем об этом клиенту.*/
      return res.sendStatus(updatedPostResultHttpStatus);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для DELETE-запросов по удалению поста по ID, используя URI-параметры.*/
  async deletePostByIdHandler(
    req: Request<DeletePostByIdUriInputDTO>,
    res: Response<void | ExtensionType[]>
  ): Promise<void | Response<void | ExtensionType[]>> {
    try {
      /*Получаем ID поста.*/
      const postId: string = req.params.id;
      /*Просим сервис "postsService" удалить пост по ID.*/
      const deletedPostResult: Result<{} | null> = await this.postsService.deleteById(postId);
      /*Получаем HTTP-статус операции по удалению поста по ID.*/
      const deletedPostResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(deletedPostResult.status);

      /*Если пост не был удален, то сообщаем об этом клиенту.*/
      if (deletedPostResultHttpStatus !== HttpStatuses.NoContent_204) {
        return res.status(deletedPostResultHttpStatus).send(deletedPostResult.extensions);
      }

      /*Если пост был удален, то сообщаем об этом клиенту.*/
      return res.sendStatus(deletedPostResultHttpStatus);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }
}
