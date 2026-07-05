import { BlogsQueryService } from '../../blogs/application/blogs.query-service';
import { PostsQueryRepository } from '../repositories/posts.query-repository';
import { GetPostListQueryInputDTO } from '../routes/input-dto/query/get-post-list-query.input-dto';
import { mapToPaginatedPostListOutputDTO } from '../repositories/mappers/map-to-paginated-post-list-output-dto.util';
import { PaginatedPostListOutputDTO } from '../routes/output-dto/paginated-post-list.output-dto';
import { mapToPostOutputDTO } from '../repositories/mappers/map-to-post-output-dto.util';
import { PostOutputDTO } from '../routes/output-dto/post.output-dto';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { Result } from '../../core/types/result/result.type';
import { BlogOutputDTO } from '../../blogs/routes/output-dto/blog.output-dto';
import { PostDBType } from '../repositories/types/post-db.type';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../ioc/types';

/*Query-сервис для работы с постами.*/
@injectable()
export class PostsQueryService {
  constructor(
    @inject(TYPES.BlogsQueryService) private readonly blogsQueryService: BlogsQueryService,
    @inject(TYPES.PostsQueryRepository) private readonly postsQueryRepository: PostsQueryRepository
  ) {}

  /*Метод для поиска поста по ID.*/
  async findById(id: string): Promise<Result<{ postOutput: PostOutputDTO } | null>> {
    /*Просим query-репозиторий "postsQueryRepository" найти пост по ID в БД.*/
    const postDB: PostDBType | null = await this.postsQueryRepository.findById(id);

    /*Если пост не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!postDB) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'id', message: 'Post not found' }],
      };
    }

    /*Если пост был найден, то преобразовываем пост из БД в подготовленный для отправки клиенту пост.*/
    const postOutput: PostOutputDTO = mapToPostOutputDTO(postDB);
    /*Возвращаем ResultObject с преобразованным постом.*/
    return { status: ResultStatuses.Ok, data: { postOutput }, extensions: [] };
  }

  /*Метод для поиска постов.*/
  async findAll(
    queryDTO: GetPostListQueryInputDTO,
    blogId?: string
  ): Promise<Result<{ paginatedPostListOutput: PaginatedPostListOutputDTO } | null>> {
    /*Если был указан ID блога, то проверяем существует ли он.*/
    if (blogId) {
      /*Просим query-сервис "blogsQueryService" найти блог по ID.*/
      const blogResult: Result<{ blogOutput: BlogOutputDTO } | null> = await this.blogsQueryService.findById(blogId);
      /*Если блог не был найден, то возвращаем ResultObject с информацией об этом.*/
      if (blogResult.status !== ResultStatuses.Ok) return blogResult as Result;
    }

    /*Просим query-репозиторий "postsQueryRepository" найти посты в БД.*/
    const { items, totalCount }: { items: PostDBType[]; totalCount: number } = await this.postsQueryRepository.findAll(
      queryDTO,
      blogId
    );

    /*Преобразовываем посты из БД в подготовленные для пагинации посты.*/
    const paginatedPostListOutput: PaginatedPostListOutputDTO = mapToPaginatedPostListOutputDTO(items, {
      pageNumber: queryDTO.pageNumber,
      pageSize: queryDTO.pageSize,
      totalCount,
    });

    /*Возвращаем ResultObject с преобразованными для пагинации постами.*/
    return { status: ResultStatuses.Ok, data: { paginatedPostListOutput }, extensions: [] };
  }
}
