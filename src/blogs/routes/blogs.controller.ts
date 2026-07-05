import { Request, Response } from 'express';

import { GetBlogListQueryInputDTO } from './input-dto/query/get-blog-list-query.input-dto';
import { PaginatedBlogListOutputDTO } from './output-dto/paginated-blog-list.output-dto';
import { getSanitizedQueryInputWithDefaultPaginationSettings } from '../../core/utils/pagination/get-sanitized-query-input-with-default-pagination-settings';
import { BlogSortFieldQueryInputDTO } from './input-dto/query/blog-sort-field-query.input-dto';
import { ExtensionType, Result } from '../../core/types/result/result.type';
import { HttpStatuses } from '../../core/types/http-statuses';
import { mapResultCodeToHttpStatus } from '../../core/utils/result/mappers/map-result-code-to-http-status';
import { errorsHandler } from '../../core/errors/errors.handler';
import { CreateBlogInputDTO } from './input-dto/create-blog.input-dto';
import { BlogOutputDTO } from './output-dto/blog.output-dto';
import { GetPostListByBlogIdUriInputDTO } from '../../posts/routes/input-dto/uri/get-post-list-by-blog-id-uri.input-dto';
import { GetPostListByBlogIdQueryInputDTO } from '../../posts/routes/input-dto/query/get-post-list-by-blog-id-query.input-dto';
import { PaginatedPostListOutputDTO } from '../../posts/routes/output-dto/paginated-post-list.output-dto';
import { PostSortFieldQueryInputDTO } from '../../posts/routes/input-dto/query/post-sort-field-query.input-dto';
import { CreatePostForBlogByBlogIdUriInputDTO } from '../../posts/routes/input-dto/uri/create-post-for-blog-by-blog-id-uri.input-dto';
import { CreatePostForBlogByBlogIdInputDTO } from '../../posts/routes/input-dto/create-post-for-blog-by-blog-id.input-dto';
import { PostOutputDTO } from '../../posts/routes/output-dto/post.output-dto';
import { GetBlogByIdUriInputDTO } from './input-dto/uri/get-blog-by-id-uri.input-dto';
import { UpdateBlogByIdUriInputDTO } from './input-dto/uri/update-blog-by-id-uri.input-dto';
import { UpdateBlogByIdInputDTO } from './input-dto/update-blog-by-id.input-dto';
import { DeleteBlogByIdUriInputDTO } from './input-dto/uri/delete-blog-by-id-uri.input-dto';
import { inject, injectable } from 'inversify';
import { BlogsService } from '../application/blogs.service';
import { PostsService } from '../../posts/application/posts.service';
import { BlogsQueryService } from '../application/blogs.query-service';
import { PostsQueryService } from '../../posts/application/posts.query-service';

/*Контроллер для работы с блогами.*/
@injectable()
export class BlogsController {
  constructor(
    @inject(BlogsService) private readonly blogsService: BlogsService,
    @inject(PostsService) private readonly postsService: PostsService,
    @inject(BlogsQueryService) private readonly blogsQueryService: BlogsQueryService,
    @inject(PostsQueryService) private readonly postsQueryService: PostsQueryService
  ) {
    this.blogsService = blogsService;
    this.postsService = postsService;
    this.blogsQueryService = blogsQueryService;
    this.postsQueryService = postsQueryService;
  }

  /*Метод-обработчик для GET-запросов по получению блогов, используя query-параметры.*/
  async getBlogListHandler(
    req: Request<{}, {}, {}, GetBlogListQueryInputDTO>,
    res: Response<PaginatedBlogListOutputDTO>
  ): Promise<void | Response<PaginatedBlogListOutputDTO>> {
    try {
      /*Санитизируем query-параметры и добавляем к ним дефолтные настройки пагинации.*/
      const sanitizedQueryInputWithDefaultPaginationSettings = getSanitizedQueryInputWithDefaultPaginationSettings<
        GetBlogListQueryInputDTO,
        BlogSortFieldQueryInputDTO
      >(req);

      /*Просим query-сервис "blogsQueryService" найти блоги.*/
      const paginatedBlogListResult: Result<{ paginatedBlogListOutput: PaginatedBlogListOutputDTO }> =
        await this.blogsQueryService.findAll(sanitizedQueryInputWithDefaultPaginationSettings);

      /*Получаем HTTP-статус операции по поиску блогов.*/
      const paginatedBlogListResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(paginatedBlogListResult.status);
      /*Отправляем блоги клиенту.*/
      return res.status(paginatedBlogListResultHttpStatus).send(paginatedBlogListResult.data.paginatedBlogListOutput);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для POST-запросов по добавлению блога.*/
  async createBlogHandler(
    req: Request<{}, {}, CreateBlogInputDTO>,
    res: Response<BlogOutputDTO | ExtensionType[]>
  ): Promise<void | Response<BlogOutputDTO | ExtensionType[]>> {
    try {
      /*Просим сервис "blogsService" создать блог.*/
      const createdBlogResult: Result<{ createdBlogId: string }> = await this.blogsService.create(req.body);
      /*Получаем HTTP-статус операции по созданию блога.*/
      const createdBlogResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(createdBlogResult.status);

      /*Просим query-сервис "blogsQueryService" найти созданный блог по ID.*/
      const blogResult: Result<{ blogOutput: BlogOutputDTO } | null> = await this.blogsQueryService.findById(
        createdBlogResult.data.createdBlogId
      );

      /*Получаем HTTP-статус операции по поиску созданного блога по ID.*/
      const blogResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(blogResult.status);

      /*Если созданный блог не был найден, то сообщаем об этом клиенту.*/
      if (blogResultHttpStatus !== HttpStatuses.Ok_200) {
        return res.status(blogResultHttpStatus).send(blogResult.extensions);
      }

      /*Если созданный блог был найден, то отправляем его клиенту.*/
      return res.status(createdBlogResultHttpStatus).send(blogResult.data!.blogOutput);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для GET-запросов по получению постов с пагинацией в блоге по ID, используя URI-параметры и
  query-параметры.*/
  async getPostListByBlogIdHandler(
    req: Request<GetPostListByBlogIdUriInputDTO, {}, {}, GetPostListByBlogIdQueryInputDTO>,
    res: Response<PaginatedPostListOutputDTO | ExtensionType[]>
  ): Promise<void | Response<PaginatedPostListOutputDTO | ExtensionType[]>> {
    try {
      /*Получаем ID блога.*/
      const blogId: string = req.params.blogId;

      /*Санитизируем query-параметры и добавляем к ним дефолтные настройки пагинации.*/
      const sanitizedQueryInputWithDefaultPaginationSettings = getSanitizedQueryInputWithDefaultPaginationSettings<
        GetPostListByBlogIdQueryInputDTO,
        PostSortFieldQueryInputDTO
      >(req);

      /*Просим query-сервис "postsQueryService" найти посты в блоге по ID.*/
      const paginatedPostListResult: Result<{ paginatedPostListOutput: PaginatedPostListOutputDTO } | null> =
        await this.postsQueryService.findAll(sanitizedQueryInputWithDefaultPaginationSettings, blogId);

      /*Получаем HTTP-статус операции по поиску постов в блоге по ID.*/
      const paginatedPostListResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(paginatedPostListResult.status);

      /*Если посты в блоге не были найдены, то сообщаем об этом клиенту.*/
      if (paginatedPostListResultHttpStatus !== HttpStatuses.Ok_200) {
        return res.status(paginatedPostListResultHttpStatus).send(paginatedPostListResult.extensions);
      }

      /*Если посты в блоге были найдены, то отправляем их клиенту.*/
      return res.status(paginatedPostListResultHttpStatus).send(paginatedPostListResult.data!.paginatedPostListOutput);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для POST-запросов по добавлению поста в блог по ID, используя URI-параметры.*/
  async createPostForBlogByBlogIdHandler(
    req: Request<CreatePostForBlogByBlogIdUriInputDTO, {}, CreatePostForBlogByBlogIdInputDTO>,
    res: Response<PostOutputDTO | ExtensionType[]>
  ): Promise<void | Response<PostOutputDTO | ExtensionType[]>> {
    try {
      /*Получаем ID блога.*/
      const blogId: string = req.params.blogId;

      /*Просим сервис "postsService" создать пост в блоге.*/
      const createdPostResult: Result<{ createdPostId: string } | null> = await this.postsService.create({
        ...req.body,
        blogId,
      });

      /*Получаем HTTP-статус операции по созданию поста в блоге.*/
      const createdPostResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(createdPostResult.status);

      /*Если пост не был создан в блоге, то сообщаем об этом клиенту.*/
      if (createdPostResultHttpStatus !== HttpStatuses.Created_201) {
        return res.status(createdPostResultHttpStatus).send(createdPostResult.extensions);
      }

      /*Если пост был создан в блоге, то просим query-сервис "postsQueryService" найти созданный пост по ID.*/
      const postResult: Result<{ postOutput: PostOutputDTO } | null> = await this.postsQueryService.findById(
        createdPostResult.data!.createdPostId
      );

      /*Получаем HTTP-статус операции по поиску созданного поста в блоге по ID.*/
      const postResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(postResult.status);

      /*Если созданный пост не был найден в блоге, то сообщаем об этом клиенту.*/
      if (postResultHttpStatus !== HttpStatuses.Ok_200) {
        return res.status(postResultHttpStatus).send(postResult.extensions);
      }

      /*Если созданный пост был найден в блоге, то отправляем его клиенту.*/
      return res.status(createdPostResultHttpStatus).send(postResult.data!.postOutput);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для GET-запросов по получению блога по ID, используя URI-параметры.*/
  async getBlogByIdHandler(
    req: Request<GetBlogByIdUriInputDTO>,
    res: Response<BlogOutputDTO | ExtensionType[]>
  ): Promise<void | Response<BlogOutputDTO | ExtensionType[]>> {
    try {
      /*Получаем ID блога.*/
      const blogId: string = req.params.id;
      /*Просим query-сервис "blogsQueryService" найти блог по ID.*/
      const blogResult: Result<{ blogOutput: BlogOutputDTO } | null> = await this.blogsQueryService.findById(blogId);
      /*Получаем HTTP-статус операции по поиску блога по ID.*/
      const blogResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(blogResult.status);

      /*Если блог не был найден, то сообщаем об этом клиенту.*/
      if (blogResultHttpStatus !== HttpStatuses.Ok_200) {
        return res.status(blogResultHttpStatus).send(blogResult.extensions);
      }

      /*Если блог был найден, то отправляем его клиенту.*/
      return res.status(blogResultHttpStatus).send(blogResult.data!.blogOutput);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для PUT-запросов по изменению блога по ID, используя URI-параметры.*/
  async updateBlogByIdHandler(
    req: Request<UpdateBlogByIdUriInputDTO, {}, UpdateBlogByIdInputDTO>,
    res: Response<void | ExtensionType[]>
  ): Promise<void | Response<void | ExtensionType[]>> {
    try {
      /*Получаем ID блога.*/
      const blogId: string = req.params.id;
      /*Просим сервис "blogsService" изменить блог по ID.*/
      const updatedBlogResult: Result<{} | null> = await this.blogsService.updateById(blogId, req.body);
      /*Получаем HTTP-статус операции по изменению блога по ID.*/
      const updatedBlogResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(updatedBlogResult.status);

      /*Если блог не был изменен, то сообщаем об этом клиенту.*/
      if (updatedBlogResultHttpStatus !== HttpStatuses.NoContent_204) {
        return res.status(updatedBlogResultHttpStatus).send(updatedBlogResult.extensions);
      }

      /*Если блог был изменен, то сообщаем об этом клиенту.*/
      return res.sendStatus(updatedBlogResultHttpStatus);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }

  /*Метод-обработчик для DELETE-запросов по удалению блога по ID, используя URI-параметры.*/
  async deleteBlogByIdHandler(
    req: Request<DeleteBlogByIdUriInputDTO>,
    res: Response<void | ExtensionType[]>
  ): Promise<void | Response<void | ExtensionType[]>> {
    try {
      /*Получаем ID блога.*/
      const blogId: string = req.params.id;
      /*Просим сервис "blogsService" удалить блог по ID.*/
      const deletedBlogResult: Result<{} | null> = await this.blogsService.deleteById(blogId);
      /*Получаем HTTP-статус операции по удалению блога по ID.*/
      const deletedBlogResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(deletedBlogResult.status);

      /*Если блог не был удален, то сообщаем об этом клиенту.*/
      if (deletedBlogResultHttpStatus !== HttpStatuses.NoContent_204) {
        return res.status(deletedBlogResultHttpStatus).send(deletedBlogResult.extensions);
      }

      /*Если блог был удален, то сообщаем об этом клиенту.*/
      return res.sendStatus(deletedBlogResultHttpStatus);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }
}
