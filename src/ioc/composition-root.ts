import { container } from './container';
import { TYPES } from './types';
import { Argon2Adapter } from '../auth/adapters/argon2.adapter';
import { BcryptAdapter } from '../auth/adapters/bcrypt.adapter';
import { JwtAdapter } from '../auth/adapters/jwt.adapter';
import { NodemailerAdapter } from '../auth/adapters/nodemailer.adapter';
import { AuthController } from '../auth/routes/auth.controller';
import { SecurityDevicesController } from '../security-devices/routes/security-devices.controller';
import { UsersController } from '../users/routes/users.controller';
import { BlogsController } from '../blogs/routes/blogs.controller';
import { PostsController } from '../posts/routes/posts.controller';
import { CommentsController } from '../comments/routes/comments.controller';
import { TestingController } from '../testing/routes/testing.controller';
import { AuthService } from '../auth/application/auth.service';
import { SecurityDevicesService } from '../security-devices/application/security-devices.service';
import { UsersService } from '../users/application/users.service';
import { BlogsService } from '../blogs/application/blogs.service';
import { PostsService } from '../posts/application/posts.service';
import { CommentsService } from '../comments/application/comments.service';
import { SecurityDevicesQueryService } from '../security-devices/application/security-devices.query-service';
import { UsersQueryService } from '../users/application/users.query-service';
import { BlogsQueryService } from '../blogs/application/blogs.query-service';
import { PostsQueryService } from '../posts/application/posts.query-service';
import { CommentsQueryService } from '../comments/application/comments.query-service';
import { AuthRepository } from '../auth/repositories/auth.repository';
import { SecurityDevicesRepository } from '../security-devices/repositories/security-devices.repository';
import { UsersRepository } from '../users/repositories/users.repository';
import { BlogsRepository } from '../blogs/repositories/blogs.repository';
import { PostsRepository } from '../posts/repositories/posts.repository';
import { CommentsRepository } from '../comments/repositories/comments.repository';
import { SecurityDevicesQueryRepository } from '../security-devices/repositories/security-devices.query-repository';
import { UsersQueryRepository } from '../users/repositories/users.query-repository';
import { BlogsQueryRepository } from '../blogs/repositories/blogs.query-repository';
import { PostsQueryRepository } from '../posts/repositories/posts.query-repository';
import { CommentsQueryRepository } from '../comments/repositories/comments.query-repository';
import { AccessTokenGuardMiddleware } from '../auth/middlewares/guard-middlewares/access-token.guard-middleware';
import { BasicAuthGuardMiddleware } from '../auth/middlewares/guard-middlewares/basic-auth.guard-middleware';
import { RefreshTokenGuardMiddleware } from '../auth/middlewares/guard-middlewares/refresh-token.guard-middleware';
import { RequestRateLimitGuardMiddleware } from '../auth/middlewares/guard-middlewares/request-rate-limit.guard-middleware';

/*Заполняем IoC-контейнер. Классам указываем, чтобы создавалось только по одному экземпляру класса (паттерн синглтон)
для корректной работы тестов. Обязательно нужно указывать в отдельном файле для избежания циклической зависимости.*/
container.bind<Argon2Adapter>(TYPES.Argon2Adapter).to(Argon2Adapter).inSingletonScope();
container.bind<BcryptAdapter>(TYPES.BcryptAdapter).to(BcryptAdapter).inSingletonScope();
container.bind<JwtAdapter>(TYPES.JwtAdapter).to(JwtAdapter).inSingletonScope();
container.bind<NodemailerAdapter>(TYPES.NodemailerAdapter).to(NodemailerAdapter).inSingletonScope();

/*--------------------------------------------------------------------------------------------------------------------*/

container
  .bind<AccessTokenGuardMiddleware>(TYPES.AccessTokenGuardMiddleware)
  .to(AccessTokenGuardMiddleware)
  .inSingletonScope();

container
  .bind<BasicAuthGuardMiddleware>(TYPES.BasicAuthGuardMiddleware)
  .to(BasicAuthGuardMiddleware)
  .inSingletonScope();

container
  .bind<RefreshTokenGuardMiddleware>(TYPES.RefreshTokenGuardMiddleware)
  .to(RefreshTokenGuardMiddleware)
  .inSingletonScope();

container
  .bind<RequestRateLimitGuardMiddleware>(TYPES.RequestRateLimitGuardMiddleware)
  .to(RequestRateLimitGuardMiddleware)
  .inSingletonScope();

/*--------------------------------------------------------------------------------------------------------------------*/

container.bind<AuthController>(TYPES.AuthController).to(AuthController).inSingletonScope();

container
  .bind<SecurityDevicesController>(TYPES.SecurityDevicesController)
  .to(SecurityDevicesController)
  .inSingletonScope();

container.bind<UsersController>(TYPES.UsersController).to(UsersController).inSingletonScope();
container.bind<BlogsController>(TYPES.BlogsController).to(BlogsController).inSingletonScope();
container.bind<PostsController>(TYPES.PostsController).to(PostsController).inSingletonScope();
container.bind<CommentsController>(TYPES.CommentsController).to(CommentsController).inSingletonScope();
container.bind<TestingController>(TYPES.TestingController).to(TestingController).inSingletonScope();

/*--------------------------------------------------------------------------------------------------------------------*/

container.bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
container.bind<SecurityDevicesService>(TYPES.SecurityDevicesService).to(SecurityDevicesService).inSingletonScope();
container.bind<UsersService>(TYPES.UsersService).to(UsersService).inSingletonScope();
container.bind<BlogsService>(TYPES.BlogsService).to(BlogsService).inSingletonScope();
container.bind<PostsService>(TYPES.PostsService).to(PostsService).inSingletonScope();
container.bind<CommentsService>(TYPES.CommentsService).to(CommentsService).inSingletonScope();

/*--------------------------------------------------------------------------------------------------------------------*/

container
  .bind<SecurityDevicesQueryService>(TYPES.SecurityDevicesQueryService)
  .to(SecurityDevicesQueryService)
  .inSingletonScope();

container.bind<UsersQueryService>(TYPES.UsersQueryService).to(UsersQueryService).inSingletonScope();
container.bind<BlogsQueryService>(TYPES.BlogsQueryService).to(BlogsQueryService).inSingletonScope();
container.bind<PostsQueryService>(TYPES.PostsQueryService).to(PostsQueryService).inSingletonScope();
container.bind<CommentsQueryService>(TYPES.CommentsQueryService).to(CommentsQueryService).inSingletonScope();

/*--------------------------------------------------------------------------------------------------------------------*/

container.bind<AuthRepository>(TYPES.AuthRepository).to(AuthRepository).inSingletonScope();

container
  .bind<SecurityDevicesRepository>(TYPES.SecurityDevicesRepository)
  .to(SecurityDevicesRepository)
  .inSingletonScope();

container.bind<UsersRepository>(TYPES.UsersRepository).to(UsersRepository).inSingletonScope();
container.bind<BlogsRepository>(TYPES.BlogsRepository).to(BlogsRepository).inSingletonScope();
container.bind<PostsRepository>(TYPES.PostsRepository).to(PostsRepository).inSingletonScope();
container.bind<CommentsRepository>(TYPES.CommentsRepository).to(CommentsRepository).inSingletonScope();

/*--------------------------------------------------------------------------------------------------------------------*/

container
  .bind<SecurityDevicesQueryRepository>(TYPES.SecurityDevicesQueryRepository)
  .to(SecurityDevicesQueryRepository)
  .inSingletonScope();

container.bind<UsersQueryRepository>(TYPES.UsersQueryRepository).to(UsersQueryRepository).inSingletonScope();
container.bind<BlogsQueryRepository>(TYPES.BlogsQueryRepository).to(BlogsQueryRepository).inSingletonScope();
container.bind<PostsQueryRepository>(TYPES.PostsQueryRepository).to(PostsQueryRepository).inSingletonScope();
container.bind<CommentsQueryRepository>(TYPES.CommentsQueryRepository).to(CommentsQueryRepository).inSingletonScope();

/*--------------------------------------------------------------------------------------------------------------------*/

/*Создаем экземпляры из контейнера для переиспользования в приложении.*/
const accessTokenGuardMiddlewareInstance = container.get<AccessTokenGuardMiddleware>(TYPES.AccessTokenGuardMiddleware);

export const accessTokenGuardMiddleware = accessTokenGuardMiddlewareInstance.execute.bind(
  accessTokenGuardMiddlewareInstance
);

const basicAuthGuardMiddlewareInstance = container.get<BasicAuthGuardMiddleware>(TYPES.BasicAuthGuardMiddleware);
export const basicAuthGuardMiddleware = basicAuthGuardMiddlewareInstance.execute.bind(basicAuthGuardMiddlewareInstance);

const refreshTokenGuardMiddlewareInstance = container.get<RefreshTokenGuardMiddleware>(
  TYPES.RefreshTokenGuardMiddleware
);

export const refreshTokenGuardMiddleware = refreshTokenGuardMiddlewareInstance.execute.bind(
  refreshTokenGuardMiddlewareInstance
);

const requestRateLimitGuardMiddlewareInstance = container.get<RequestRateLimitGuardMiddleware>(
  TYPES.RequestRateLimitGuardMiddleware
);

export const requestRateLimitGuardMiddleware = requestRateLimitGuardMiddlewareInstance.execute.bind(
  requestRateLimitGuardMiddlewareInstance
);

/*--------------------------------------------------------------------------------------------------------------------*/

export const authController = container.get<AuthController>(TYPES.AuthController);
export const securityDevicesController = container.get<SecurityDevicesController>(TYPES.SecurityDevicesController);
export const usersController = container.get<UsersController>(TYPES.UsersController);
export const blogsController = container.get<BlogsController>(TYPES.BlogsController);
export const postsController = container.get<PostsController>(TYPES.PostsController);
export const commentsController = container.get<CommentsController>(TYPES.CommentsController);
export const testingController = container.get<TestingController>(TYPES.TestingController);
