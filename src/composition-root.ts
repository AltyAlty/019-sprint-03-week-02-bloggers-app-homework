import { Container } from 'inversify';
import { AuthController } from './auth/routes/auth.controller';
import { BlogsController } from './blogs/routes/blogs.controller';
import { CommentsController } from './comments/routes/comments.controller';
import { PostsController } from './posts/routes/posts.controller';
import { SecurityDevicesController } from './security-devices/routes/security-devices.controller';
import { TestingController } from './testing/routes/testing.controller';
import { UsersController } from './users/routes/users.controller';
import { Argon2Adapter } from './auth/adapters/argon2.adapter';
import { BcryptAdapter } from './auth/adapters/bcrypt.adapter';
import { JwtAdapter } from './auth/adapters/jwt.adapter';
import { NodemailerAdapter } from './auth/adapters/nodemailer.adapter';
import { AuthService } from './auth/application/auth.service';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsQueryService } from './blogs/application/blogs.query-service';
import { CommentsService } from './comments/application/comments.service';
import { CommentsQueryService } from './comments/application/comments.query-service';
import { PostsService } from './posts/application/posts.service';
import { PostsQueryService } from './posts/application/posts.query-service';
import { SecurityDevicesQueryService } from './security-devices/application/security-devices.query-service';
import { SecurityDevicesService } from './security-devices/application/security-devices.service';
import { UsersService } from './users/application/users.service';
import { UsersQueryService } from './users/application/users.query-service';
import { AuthRepository } from './auth/repositories/auth.repository';
import { BlogsQueryRepository } from './blogs/repositories/blogs.query-repository';
import { BlogsRepository } from './blogs/repositories/blogs.repository';
import { CommentsQueryRepository } from './comments/repositories/comments.query-repository';
import { CommentsRepository } from './comments/repositories/comments.repository';
import { PostsQueryRepository } from './posts/repositories/posts.query-repository';
import { PostsRepository } from './posts/repositories/posts.repository';
import { SecurityDevicesQueryRepository } from './security-devices/repositories/security-devices.query-repository';
import { SecurityDevicesRepository } from './security-devices/repositories/security-devices.repository';
import { UsersQueryRepository } from './users/repositories/users.query-repository';
import { UsersRepository } from './users/repositories/users.repository';

/**/
export const container: Container = new Container();
/**/
container.bind<Argon2Adapter>(Argon2Adapter).toSelf();
container.bind<BcryptAdapter>(BcryptAdapter).toSelf();
container.bind<JwtAdapter>(JwtAdapter).toSelf();
container.bind<NodemailerAdapter>(NodemailerAdapter).toSelf();

container.bind<AuthController>(AuthController).to(AuthController);
container.bind<SecurityDevicesController>(SecurityDevicesController).toSelf();
container.bind<UsersController>(UsersController).toSelf();
container.bind<BlogsController>(BlogsController).toSelf();
container.bind<PostsController>(PostsController).toSelf();
container.bind<CommentsController>(CommentsController).toSelf();
container.bind<TestingController>(TestingController).toSelf();

container.bind<AuthService>(AuthService).toSelf();
container.bind<SecurityDevicesService>(SecurityDevicesService).toSelf();
container.bind<UsersService>(UsersService).toSelf();
container.bind<BlogsService>(BlogsService).toSelf();
container.bind<PostsService>(PostsService).toSelf();
container.bind<CommentsService>(CommentsService).toSelf();

container.bind<SecurityDevicesQueryService>(SecurityDevicesQueryService).toSelf();
container.bind<UsersQueryService>(UsersQueryService).toSelf();
container.bind<BlogsQueryService>(BlogsQueryService).toSelf();
container.bind<PostsQueryService>(PostsQueryService).toSelf();
container.bind<CommentsQueryService>(CommentsQueryService).toSelf();

container.bind<AuthRepository>(AuthRepository).toSelf();
container.bind<SecurityDevicesRepository>(SecurityDevicesRepository).toSelf();
container.bind<UsersRepository>(UsersRepository).toSelf();
container.bind<BlogsRepository>(BlogsRepository).toSelf();
container.bind<PostsRepository>(PostsRepository).toSelf();
container.bind<CommentsRepository>(CommentsRepository).toSelf();

container.bind<SecurityDevicesQueryRepository>(SecurityDevicesQueryRepository).toSelf();
container.bind<UsersQueryRepository>(UsersQueryRepository).toSelf();
container.bind<BlogsQueryRepository>(BlogsQueryRepository).toSelf();
container.bind<PostsQueryRepository>(PostsQueryRepository).toSelf();
container.bind<CommentsQueryRepository>(CommentsQueryRepository).toSelf();
