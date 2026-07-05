/*Выдаем каждой сущности уникальный символ, чтобы использовать для типизации вместо самих классов. Это позволяет классам
общаться, не зная об устройстве друг друга, что, в свою очередь, позволяет подменять классы при тестировании.
Обязательно нужно указывать в отдельном файле для избежания циклической зависимости.*/
export const TYPES = {
  Argon2Adapter: Symbol('Argon2Adapter'),
  BcryptAdapter: Symbol('BcryptAdapter'),
  JwtAdapter: Symbol('JwtAdapter'),
  NodemailerAdapter: Symbol('NodemailerAdapter'),

  AccessTokenGuardMiddleware: Symbol('AccessTokenGuardMiddleware'),
  BasicAuthGuardMiddleware: Symbol('BasicAuthGuardMiddleware'),
  RefreshTokenGuardMiddleware: Symbol('RefreshTokenGuardMiddleware'),
  RequestRateLimitGuardMiddleware: Symbol('RequestRateLimitGuardMiddleware'),

  AuthController: Symbol('AuthController'),
  SecurityDevicesController: Symbol('SecurityDevicesController'),
  UsersController: Symbol('UsersController'),
  BlogsController: Symbol('BlogsController'),
  PostsController: Symbol('PostsController'),
  CommentsController: Symbol('CommentsController'),
  TestingController: Symbol('TestingController'),

  AuthService: Symbol('AuthService'),
  SecurityDevicesService: Symbol('SecurityDevicesService'),
  UsersService: Symbol('UsersService'),
  BlogsService: Symbol('BlogsService'),
  PostsService: Symbol('PostsService'),
  CommentsService: Symbol('CommentsService'),

  SecurityDevicesQueryService: Symbol('SecurityDevicesQueryService'),
  UsersQueryService: Symbol('UsersQueryService'),
  BlogsQueryService: Symbol('BlogsQueryService'),
  PostsQueryService: Symbol('PostsQueryService'),
  CommentsQueryService: Symbol('CommentsQueryService'),

  AuthRepository: Symbol('AuthRepository'),
  SecurityDevicesRepository: Symbol('SecurityDevicesRepository'),
  UsersRepository: Symbol('UsersRepository'),
  BlogsRepository: Symbol('BlogsRepository'),
  PostsRepository: Symbol('PostsRepository'),
  CommentsRepository: Symbol('CommentsRepository'),

  SecurityDevicesQueryRepository: Symbol('SecurityDevicesQueryRepository'),
  UsersQueryRepository: Symbol('UsersQueryRepository'),
  BlogsQueryRepository: Symbol('BlogsQueryRepository'),
  PostsQueryRepository: Symbol('PostsQueryRepository'),
  CommentsQueryRepository: Symbol('CommentsQueryRepository'),
};
