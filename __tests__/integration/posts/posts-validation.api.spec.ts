import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { SETTINGS } from '../../../src/core/settings/settings';
import { createBlog } from '../../utils/blogs/create-blog.test-util';
import { createPost } from '../../utils/posts/create-post.test-util';
import { BlogOutputDTO } from '../../../src/blogs/routes/output-dto/blog.output-dto';
import { PostOutputDTO } from '../../../src/posts/routes/output-dto/post.output-dto';
import { getPostById } from '../../utils/posts/get-post-by-id.test-util';
import { createUser } from '../../utils/users/create-user.test-util';
import { loginUserReturnAccessToken } from '../../utils/auth/login-user-return-access-token.test-util';
import { createCommentForPost } from '../../utils/posts/create-comment-for-post.test-util';
import { doBeforeTestsWithMongoMemoryServer } from '../../utils/common/do-before-tests.test-util';
import { getPostList } from '../../utils/posts/get-post-list.test-util';
import { PaginatedPostListOutputDTO } from '../../../src/posts/routes/output-dto/paginated-post-list.output-dto';
import { updatePostById } from '../../utils/posts/update-post-by-id.test-util';
import { deletePostById } from '../../utils/posts/delete-post-by-id.test-util';
import { getCommentListByPostId } from '../../utils/posts/get-comment-list-by-post-id.test-util';
import { CreateUserInputDTO } from '../../../src/users/routes/input-dto/create-user.input-dto';
import { getCreateUserInputDTO } from '../../utils/users/input-dto-utils/get-create-user-input-dto.test-util';
import { PaginatedCommentListOutputDTO } from '../../../src/comments/routes/output-dto/paginated-comment-list.output-dto';
import { invalidAccessTokens, invalidBasicAuthTokens } from '../../test-data/auth.test-data';
import { invalidBlogIds } from '../../test-data/blogs.test-data';
import {
  invalidPostContents,
  invalidPostIds,
  invalidPostShortDescriptions,
  invalidPostsPaginationSettings,
  invalidPostTitles,
  validPostIds,
  validPostsPaginationSettings,
} from '../../test-data/posts.test-data';
import {
  invalidCommentContents,
  invalidCommentsPaginationSettings,
  validCommentsPaginationSettings,
} from '../../test-data/comments.test-data';

describe('Posts API Validation', () => {
  const app = doBeforeTestsWithMongoMemoryServer();

  it('❌ 001 should not create a post without proper basic authorization; 004. POST /api/posts', async () => {
    await createPost(app, undefined, undefined, HttpStatuses.Unauthorized_401, invalidBasicAuthTokens.BAT_01);

    const getPostListResponse: PaginatedPostListOutputDTO = await getPostList(app);
    expect(getPostListResponse.items).toBeInstanceOf(Array);
    expect(getPostListResponse.items.length).toBe(0);
    expect(getPostListResponse.totalCount).toBe(0);
  });

  it('❌ 002 should not create a post when an invalid body passed; 004. POST /api/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const createPostResponse_01: any = await createPost(
      app,
      { title: invalidPostTitles.title_01 },
      createdBlogId,
      testStatus
    );

    const createPostResponse_02: any = await createPost(
      app,
      { title: invalidPostTitles.title_02 },
      createdBlogId,
      testStatus
    );

    const createPostResponse_03: any = await createPost(
      app,
      { title: invalidPostTitles.title_03 },
      createdBlogId,
      testStatus
    );

    const createPostResponse_04: any = await createPost(
      app,
      { title: invalidPostTitles.title_04 },
      createdBlogId,
      testStatus
    );

    const createPostResponse_05: any = await createPost(
      app,
      { title: invalidPostTitles.title_05 },
      createdBlogId,
      testStatus
    );

    const createPostResponse_06: any = await createPost(
      app,
      { shortDescription: invalidPostShortDescriptions.shortDescription_01 },
      createdBlogId,
      testStatus
    );

    const createPostResponse_07: any = await createPost(
      app,
      { shortDescription: invalidPostShortDescriptions.shortDescription_02 },
      createdBlogId,
      testStatus
    );

    const createPostResponse_08: any = await createPost(
      app,
      { shortDescription: invalidPostShortDescriptions.shortDescription_03 },
      createdBlogId,
      testStatus
    );

    const createPostResponse_09: any = await createPost(
      app,
      { content: invalidPostContents.content_01 },
      createdBlogId,
      testStatus
    );

    const createPostResponse_10: any = await createPost(
      app,
      { content: invalidPostContents.content_02 },
      createdBlogId,
      testStatus
    );

    const createPostResponse_11: any = await createPost(
      app,
      { content: invalidPostContents.content_03 },
      createdBlogId,
      testStatus
    );

    const createPostResponse_12: any = await createPost(
      app,
      { blogId: invalidBlogIds.id_01 },
      createdBlogId,
      testStatus
    );

    const createPostResponse_13: any = await createPost(
      app,
      { blogId: invalidBlogIds.id_02 },
      createdBlogId,
      testStatus
    );

    const createPostResponse_14: any = await createPost(
      app,
      { blogId: invalidBlogIds.id_03 },
      createdBlogId,
      testStatus
    );

    const createPostResponse_15: any = await createPost(
      app,
      { blogId: invalidBlogIds.id_04 },
      createdBlogId,
      testStatus
    );

    const getPostListResponse: PaginatedPostListOutputDTO = await getPostList(app);
    expect(getPostListResponse.items).toBeInstanceOf(Array);
    expect(getPostListResponse.items.length).toBe(0);
    expect(getPostListResponse.totalCount).toBe(0);
    expect(createPostResponse_01.errorsMessages[0].field).toBe('title');
    expect(createPostResponse_01.errorsMessages[0].message).toBe('Field "title" must not be empty');
    expect(createPostResponse_02.errorsMessages[0].field).toBe('title');
    expect(createPostResponse_03.errorsMessages[0].message).toBe('Field "title" must be between 1 and 30 characters');
    expect(createPostResponse_03.errorsMessages[0].field).toBe('title');
    expect(createPostResponse_03.errorsMessages[0].message).toBe('Field "title" must be between 1 and 30 characters');
    expect(createPostResponse_04.errorsMessages[0].field).toBe('title');
    expect(createPostResponse_04.errorsMessages[0].message).toBe('Field "title" must be between 1 and 30 characters');
    expect(createPostResponse_05.errorsMessages[0].field).toBe('title');
    expect(createPostResponse_05.errorsMessages[0].message).toBe('Field "title" must be a string');
    expect(createPostResponse_06.errorsMessages[0].field).toBe('shortDescription');
    expect(createPostResponse_06.errorsMessages[0].message).toBe('Field "shortDescription" must not be empty');
    expect(createPostResponse_07.errorsMessages[0].field).toBe('shortDescription');
    expect(createPostResponse_07.errorsMessages[0].message).toBe('Field "shortDescription" must not be empty');
    expect(createPostResponse_08.errorsMessages[0].field).toBe('shortDescription');
    expect(createPostResponse_08.errorsMessages[0].message).toBe('Field "shortDescription" must be a string');
    expect(createPostResponse_09.errorsMessages[0].field).toBe('content');
    expect(createPostResponse_09.errorsMessages[0].message).toBe('Field "content" must not be empty');
    expect(createPostResponse_10.errorsMessages[0].field).toBe('content');
    expect(createPostResponse_10.errorsMessages[0].message).toBe('Field "content" must not be empty');
    expect(createPostResponse_11.errorsMessages[0].field).toBe('content');
    expect(createPostResponse_11.errorsMessages[0].message).toBe('Field "content" must be a string');
    expect(createPostResponse_12.errorsMessages[0].field).toBe('blogId');
    expect(createPostResponse_12.errorsMessages[0].message).toBe('Field "blogId" must be an ObjectId');
    expect(createPostResponse_13.errorsMessages[0].field).toBe('blogId');
    expect(createPostResponse_13.errorsMessages[0].message).toBe('Field "blogId" must be a string');
    expect(createPostResponse_14.errorsMessages[0].field).toBe('blogId');
    expect(createPostResponse_14.errorsMessages[0].message).toBe('Field "blogId" must be a string');
    expect(createPostResponse_15.errorsMessages[0].field).toBe('blogId');
    expect(createPostResponse_15.errorsMessages[0].message).toBe('Field "blogId" must not be empty');
  });

  it('❌ 003 should not return a post by an invalid ID; 005. GET /api/posts/:id', async () => {
    await createPost(app);
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const getPostByIdResponse_01: any = await getPostById(app, invalidPostIds.id_01, testStatus);
    const getPostByIdResponse_02: any = await getPostById(app, invalidPostIds.id_02, testStatus);
    const getPostByIdResponse_03: any = await getPostById(app, invalidPostIds.id_03, testStatus);

    expect(getPostByIdResponse_01.errorsMessages[0].field).toBe('id');
    expect(getPostByIdResponse_01.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
    expect(getPostByIdResponse_02.errorsMessages[0].field).toBe('id');
    expect(getPostByIdResponse_03.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
    expect(getPostByIdResponse_03.errorsMessages[0].field).toBe('id');
    expect(getPostByIdResponse_03.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
  });

  it('❌ 004 should not return a post by an incorrect ID; 005. GET /api/posts/:id', async () => {
    await createPost(app);

    await getPostById(app, validPostIds.id_01, HttpStatuses.NotFound_404);
  });

  it('❌ 005 should not return a list of posts when invalid pagination settings passed; 003. GET /api/posts', async () => {
    await Promise.all([createPost(app), createPost(app)]);
    const invalidUrl_01: string = `${SETTINGS.POSTS_PATH}?pageSize=${invalidPostsPaginationSettings.pageSize}&pageNumber=${validPostsPaginationSettings.pageNumber}&sortDirection=${validPostsPaginationSettings.sortDirection}&sortBy=${validPostsPaginationSettings.sortBy}`;
    const invalidUrl_02: string = `${SETTINGS.POSTS_PATH}?pageSize=${validPostsPaginationSettings.pageSize}&pageNumber=${invalidPostsPaginationSettings.pageNumber}&sortDirection=${validPostsPaginationSettings.sortDirection}&sortBy=${validPostsPaginationSettings.sortBy}`;
    const invalidUrl_03: string = `${SETTINGS.POSTS_PATH}?pageSize=${validPostsPaginationSettings.pageSize}&pageNumber=${validPostsPaginationSettings.pageNumber}&sortDirection=${invalidPostsPaginationSettings.sortDirection}&sortBy=${validPostsPaginationSettings.sortBy}`;
    const invalidUrl_04: string = `${SETTINGS.POSTS_PATH}?pageSize=${validPostsPaginationSettings.pageSize}&pageNumber=${validPostsPaginationSettings.pageNumber}&sortDirection=${validPostsPaginationSettings.sortDirection}&sortBy=${invalidPostsPaginationSettings.sortDirection}`;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const getPostListResponse_01: any = await getPostList(app, invalidUrl_01, testStatus);
    const getPostListResponse_02: any = await getPostList(app, invalidUrl_02, testStatus);
    const getPostListResponse_03: any = await getPostList(app, invalidUrl_03, testStatus);
    const getPostListResponse_04: any = await getPostList(app, invalidUrl_04, testStatus);

    expect(getPostListResponse_01.errorsMessages[0].field).toBe('pageSize');

    expect(getPostListResponse_01.errorsMessages[0].message).toBe(
      'Field "pageSize" must be between 1 and 100 characters'
    );

    expect(getPostListResponse_02.errorsMessages[0].field).toBe('pageNumber');
    expect(getPostListResponse_02.errorsMessages[0].message).toBe('Field "pageNumber" must be a positive integer');
    expect(getPostListResponse_03.errorsMessages[0].field).toBe('sortDirection');
    expect(getPostListResponse_03.errorsMessages[0].message).toBe('Field "sortDirection" must be: asc, desc');
    expect(getPostListResponse_04.errorsMessages[0].field).toBe('sortBy');

    expect(getPostListResponse_04.errorsMessages[0].message).toBe(
      'Field "sortBy" must be: createdAt, title, shortDescription, content, blogId, blogName'
    );
  });

  it('❌ 006 should not update a post by a correct ID without proper basic authorization; 006. PUT /api/posts/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const createdPost: PostOutputDTO = await createPost(app, undefined, createdBlogId);
    const createdPostId: string = createdPost.id;

    await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      undefined,
      HttpStatuses.Unauthorized_401,
      invalidBasicAuthTokens.BAT_01
    );

    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPostId);
    expect(getPostByIdResponse).toEqual(createdPost);
  });

  it('❌ 007 should not update a post by an invalid ID; 006. PUT /api/posts/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const createdPost: PostOutputDTO = await createPost(app, undefined, createdBlogId);
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const updatePostByIdResponse_01: any = await updatePostById(
      app,
      invalidPostIds.id_01,
      createdBlogId,
      undefined,
      testStatus
    );

    const updatePostByIdResponse_02: any = await updatePostById(
      app,
      invalidPostIds.id_02,
      createdBlogId,
      undefined,
      testStatus
    );

    const updatePostByIdResponse_03: any = await updatePostById(
      app,
      invalidPostIds.id_03,
      createdBlogId,
      undefined,
      testStatus
    );

    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPost.id);
    expect(getPostByIdResponse).toEqual(createdPost);
    expect(updatePostByIdResponse_01.errorsMessages[0].field).toBe('id');
    expect(updatePostByIdResponse_01.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
    expect(updatePostByIdResponse_02.errorsMessages[0].field).toBe('id');
    expect(updatePostByIdResponse_03.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
    expect(updatePostByIdResponse_03.errorsMessages[0].field).toBe('id');
    expect(updatePostByIdResponse_03.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
  });

  it('❌ 008 should not update a post by an incorrect ID; 006. PUT /api/posts/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const createdPost: PostOutputDTO = await createPost(app, undefined, createdBlogId);

    await updatePostById(app, validPostIds.id_01, createdBlogId, undefined, HttpStatuses.NotFound_404);

    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPost.id);
    expect(getPostByIdResponse).toEqual(createdPost);
  });

  it('❌ 009 should not update a post by a correct ID when an invalid body passed; 006. PUT /api/posts/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const createdPost: PostOutputDTO = await createPost(app, undefined, createdBlogId);
    const createdPostId: string = createdPost.id;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const updatePostByIdResponse_01: any = await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { title: invalidPostTitles.title_01 },
      testStatus
    );

    const updatePostByIdResponse_02: any = await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { title: invalidPostTitles.title_02 },
      testStatus
    );

    const updatePostByIdResponse_03: any = await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { title: invalidPostTitles.title_03 },
      testStatus
    );

    const updatePostByIdResponse_04: any = await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { title: invalidPostTitles.title_04 },
      testStatus
    );

    const updatePostByIdResponse_05: any = await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { title: invalidPostTitles.title_05 },
      testStatus
    );

    const updatePostByIdResponse_06: any = await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { shortDescription: invalidPostShortDescriptions.shortDescription_01 },
      testStatus
    );

    const updatePostByIdResponse_07: any = await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { shortDescription: invalidPostShortDescriptions.shortDescription_02 },
      testStatus
    );

    const updatePostByIdResponse_08: any = await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { shortDescription: invalidPostShortDescriptions.shortDescription_03 },
      testStatus
    );

    const updatePostByIdResponse_09: any = await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { content: invalidPostContents.content_01 },
      testStatus
    );

    const updatePostByIdResponse_10: any = await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { content: invalidPostContents.content_02 },
      testStatus
    );

    const updatePostByIdResponse_11: any = await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { content: invalidPostContents.content_03 },
      testStatus
    );

    const updatePostByIdResponse_12: any = await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { blogId: invalidBlogIds.id_01 },
      testStatus
    );

    const updatePostByIdResponse_13: any = await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { blogId: invalidBlogIds.id_02 },
      testStatus
    );

    const updatePostByIdResponse_14: any = await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { blogId: invalidBlogIds.id_03 },
      testStatus
    );

    const updatePostByIdResponse_15: any = await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { blogId: invalidBlogIds.id_04 },
      testStatus
    );

    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPostId);
    expect(getPostByIdResponse).toEqual(createdPost);
    expect(updatePostByIdResponse_01.errorsMessages[0].field).toBe('title');
    expect(updatePostByIdResponse_01.errorsMessages[0].message).toBe('Field "title" must not be empty');
    expect(updatePostByIdResponse_02.errorsMessages[0].field).toBe('title');

    expect(updatePostByIdResponse_03.errorsMessages[0].message).toBe(
      'Field "title" must be between 1 and 30 characters'
    );

    expect(updatePostByIdResponse_03.errorsMessages[0].field).toBe('title');

    expect(updatePostByIdResponse_03.errorsMessages[0].message).toBe(
      'Field "title" must be between 1 and 30 characters'
    );

    expect(updatePostByIdResponse_04.errorsMessages[0].field).toBe('title');

    expect(updatePostByIdResponse_04.errorsMessages[0].message).toBe(
      'Field "title" must be between 1 and 30 characters'
    );

    expect(updatePostByIdResponse_05.errorsMessages[0].field).toBe('title');
    expect(updatePostByIdResponse_05.errorsMessages[0].message).toBe('Field "title" must be a string');
    expect(updatePostByIdResponse_06.errorsMessages[0].field).toBe('shortDescription');
    expect(updatePostByIdResponse_06.errorsMessages[0].message).toBe('Field "shortDescription" must not be empty');
    expect(updatePostByIdResponse_07.errorsMessages[0].field).toBe('shortDescription');
    expect(updatePostByIdResponse_07.errorsMessages[0].message).toBe('Field "shortDescription" must not be empty');
    expect(updatePostByIdResponse_08.errorsMessages[0].field).toBe('shortDescription');
    expect(updatePostByIdResponse_08.errorsMessages[0].message).toBe('Field "shortDescription" must be a string');
    expect(updatePostByIdResponse_09.errorsMessages[0].field).toBe('content');
    expect(updatePostByIdResponse_09.errorsMessages[0].message).toBe('Field "content" must not be empty');
    expect(updatePostByIdResponse_10.errorsMessages[0].field).toBe('content');
    expect(updatePostByIdResponse_10.errorsMessages[0].message).toBe('Field "content" must not be empty');
    expect(updatePostByIdResponse_11.errorsMessages[0].field).toBe('content');
    expect(updatePostByIdResponse_11.errorsMessages[0].message).toBe('Field "content" must be a string');
    expect(updatePostByIdResponse_12.errorsMessages[0].field).toBe('blogId');
    expect(updatePostByIdResponse_12.errorsMessages[0].message).toBe('Field "blogId" must be an ObjectId');
    expect(updatePostByIdResponse_13.errorsMessages[0].field).toBe('blogId');
    expect(updatePostByIdResponse_13.errorsMessages[0].message).toBe('Field "blogId" must be a string');
    expect(updatePostByIdResponse_14.errorsMessages[0].field).toBe('blogId');
    expect(updatePostByIdResponse_14.errorsMessages[0].message).toBe('Field "blogId" must be a string');
    expect(updatePostByIdResponse_15.errorsMessages[0].field).toBe('blogId');
    expect(updatePostByIdResponse_15.errorsMessages[0].message).toBe('Field "blogId" must not be empty');
  });

  it('❌ 010 should not delete a post by a correct ID without proper basic authorization; 007. DELETE /api/posts/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;

    await deletePostById(app, createdPostId, HttpStatuses.Unauthorized_401, invalidBasicAuthTokens.BAT_01);

    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPostId);
    expect(getPostByIdResponse).toEqual(createdPost);
  });

  it('❌ 011 should not delete a post by an invalid ID; 007. DELETE /api/posts/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const deletePostByIdResponse_01: any = await deletePostById(app, invalidPostIds.id_01, testStatus);
    const deletePostByIdResponse_02: any = await deletePostById(app, invalidPostIds.id_02, testStatus);
    const deletePostByIdResponse_03: any = await deletePostById(app, invalidPostIds.id_03, testStatus);

    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPost.id);
    expect(getPostByIdResponse).toEqual(createdPost);
    expect(deletePostByIdResponse_01.errorsMessages[0].field).toBe('id');
    expect(deletePostByIdResponse_01.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
    expect(deletePostByIdResponse_02.errorsMessages[0].field).toBe('id');
    expect(deletePostByIdResponse_03.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
    expect(deletePostByIdResponse_03.errorsMessages[0].field).toBe('id');
    expect(deletePostByIdResponse_03.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
  });

  it('❌ 012 should not delete a post by an incorrect ID; 007. DELETE /api/posts/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);

    await deletePostById(app, validPostIds.id_01, HttpStatuses.NotFound_404);

    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPost.id);
    expect(getPostByIdResponse).toEqual(createdPost);
  });

  it('❌ 013 should not create a comment for a post by a correct ID when an invalid access token passed; 002. POST /api/posts/:postId/comments', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await createCommentForPost(app, createdPostId, invalidAccessTokens.AT_01, undefined, testStatus);
    await createCommentForPost(app, createdPostId, invalidAccessTokens.AT_02, undefined, testStatus);
    await createCommentForPost(app, createdPostId, invalidAccessTokens.AT_03, undefined, testStatus);
    await createCommentForPost(app, createdPostId, invalidAccessTokens.AT_04, undefined, testStatus);
    await createCommentForPost(app, createdPostId, invalidAccessTokens.AT_05, undefined, testStatus);
    await createCommentForPost(app, createdPostId, invalidAccessTokens.AT_06, undefined, testStatus);
    await createCommentForPost(app, createdPostId, invalidAccessTokens.AT_07, undefined, testStatus);
    await createCommentForPost(app, createdPostId, invalidAccessTokens.AT_08, undefined, testStatus);
    await createCommentForPost(app, createdPostId, invalidAccessTokens.AT_09, undefined, testStatus);

    const getCommentListByPostIdResponse: PaginatedCommentListOutputDTO = await getCommentListByPostId(
      app,
      createdPostId
    );

    expect(getCommentListByPostIdResponse.items).toBeInstanceOf(Array);
    expect(getCommentListByPostIdResponse.items.length).toBe(0);
    expect(getCommentListByPostIdResponse.totalCount).toBe(0);
  });

  it('❌ 014 should not create a comment for a post by an invalid ID; 002. POST /api/posts/:postId/comments', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const accessToken: string = await loginUserReturnAccessToken(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const createCommentForPostResponse_01: any = await createCommentForPost(
      app,
      invalidPostIds.id_01,
      accessToken,
      undefined,
      testStatus
    );

    const createCommentForPostResponse_02: any = await createCommentForPost(
      app,
      invalidPostIds.id_02,
      accessToken,
      undefined,
      testStatus
    );

    const createCommentForPostResponse_03: any = await createCommentForPost(
      app,
      invalidPostIds.id_03,
      accessToken,
      undefined,
      testStatus
    );

    const createCommentForPostResponse_04: any = await createCommentForPost(
      app,
      invalidPostIds.id_04,
      accessToken,
      undefined,
      testStatus
    );

    const getCommentListByPostIdResponse: PaginatedCommentListOutputDTO = await getCommentListByPostId(
      app,
      createdPost.id
    );

    expect(getCommentListByPostIdResponse.items).toBeInstanceOf(Array);
    expect(getCommentListByPostIdResponse.items.length).toBe(0);
    expect(getCommentListByPostIdResponse.totalCount).toBe(0);
    expect(createCommentForPostResponse_01.errorsMessages[0].field).toBe('postId');
    expect(createCommentForPostResponse_01.errorsMessages[0].message).toBe('Field "postId" must be an ObjectId');
    expect(createCommentForPostResponse_02.errorsMessages[0].field).toBe('postId');
    expect(createCommentForPostResponse_03.errorsMessages[0].message).toBe('Field "postId" must be an ObjectId');
    expect(createCommentForPostResponse_03.errorsMessages[0].field).toBe('postId');
    expect(createCommentForPostResponse_03.errorsMessages[0].message).toBe('Field "postId" must be an ObjectId');
    expect(createCommentForPostResponse_04.errorsMessages[0].field).toBe('postId');
    expect(createCommentForPostResponse_04.errorsMessages[0].message).toBe('Field "postId" must not be empty');
  });

  it('❌ 015 should not create a comment for a post by an incorrect ID; 002. POST /api/posts/:postId/comments', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const accessToken: string = await loginUserReturnAccessToken(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    await createCommentForPost(app, validPostIds.id_01, accessToken, undefined, HttpStatuses.NotFound_404);

    const getCommentListByPostIdResponse: PaginatedCommentListOutputDTO = await getCommentListByPostId(
      app,
      createdPost.id
    );

    expect(getCommentListByPostIdResponse.items).toBeInstanceOf(Array);
    expect(getCommentListByPostIdResponse.items.length).toBe(0);
    expect(getCommentListByPostIdResponse.totalCount).toBe(0);
  });

  it('❌ 016 should not create a comment for a post by a correct ID when an invalid body passed; 002. POST /api/posts/:postId/comments', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const accessToken: string = await loginUserReturnAccessToken(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const createCommentForPostResponse_01: any = await createCommentForPost(
      app,
      createdPostId,
      accessToken,
      { content: invalidCommentContents.content_01 },
      testStatus
    );

    const createCommentForPostResponse_02: any = await createCommentForPost(
      app,
      createdPostId,
      accessToken,
      { content: invalidCommentContents.content_02 },
      testStatus
    );

    const createCommentForPostResponse_03: any = await createCommentForPost(
      app,
      createdPostId,
      accessToken,
      { content: invalidCommentContents.content_03 },
      testStatus
    );

    const createCommentForPostResponse_04: any = await createCommentForPost(
      app,
      createdPostId,
      accessToken,
      { content: invalidCommentContents.content_04 },
      testStatus
    );

    const createCommentForPostResponse_05: any = await createCommentForPost(
      app,
      createdPostId,
      accessToken,
      { content: invalidCommentContents.content_05 },
      testStatus
    );

    const createCommentForPostResponse_06: any = await createCommentForPost(
      app,
      createdPostId,
      accessToken,
      { content: invalidCommentContents.content_06 },
      testStatus
    );

    const createCommentForPostResponse_07: any = await createCommentForPost(
      app,
      createdPostId,
      accessToken,
      { content: invalidCommentContents.content_07 },
      testStatus
    );

    const createCommentForPostResponse_08: any = await createCommentForPost(
      app,
      createdPostId,
      accessToken,
      { content: invalidCommentContents.content_08 },
      testStatus
    );

    const createCommentForPostResponse_09: any = await createCommentForPost(
      app,
      createdPostId,
      accessToken,
      { content: invalidCommentContents.content_09 },
      testStatus
    );

    const createCommentForPostResponse_10: any = await createCommentForPost(
      app,
      createdPostId,
      accessToken,
      { content: invalidCommentContents.content_10 },
      testStatus
    );

    const getCommentListByPostIdResponse: PaginatedCommentListOutputDTO = await getCommentListByPostId(
      app,
      createdPostId
    );

    expect(getCommentListByPostIdResponse.items).toBeInstanceOf(Array);
    expect(getCommentListByPostIdResponse.items.length).toBe(0);
    expect(getCommentListByPostIdResponse.totalCount).toBe(0);
    expect(createCommentForPostResponse_01.errorsMessages[0].field).toBe('content');

    expect(createCommentForPostResponse_01.errorsMessages[0].message).toBe(
      'Field "content" must be between 20 and 300 characters'
    );

    expect(createCommentForPostResponse_02.errorsMessages[0].field).toBe('content');
    expect(createCommentForPostResponse_02.errorsMessages[0].message).toBe('Field "content" must not be empty');
    expect(createCommentForPostResponse_03.errorsMessages[0].field).toBe('content');
    expect(createCommentForPostResponse_03.errorsMessages[0].message).toBe('Field "content" must not be empty');
    expect(createCommentForPostResponse_04.errorsMessages[0].field).toBe('content');

    expect(createCommentForPostResponse_04.errorsMessages[0].message).toBe(
      'Field "content" must be between 20 and 300 characters'
    );

    expect(createCommentForPostResponse_05.errorsMessages[0].field).toBe('content');

    expect(createCommentForPostResponse_05.errorsMessages[0].message).toBe(
      'Field "content" must be between 20 and 300 characters'
    );

    expect(createCommentForPostResponse_06.errorsMessages[0].field).toBe('content');
    expect(createCommentForPostResponse_06.errorsMessages[0].message).toBe('Field "content" must be a string');
    expect(createCommentForPostResponse_07.errorsMessages[0].field).toBe('content');
    expect(createCommentForPostResponse_07.errorsMessages[0].message).toBe('Field "content" must be a string');
    expect(createCommentForPostResponse_08.errorsMessages[0].field).toBe('content');
    expect(createCommentForPostResponse_08.errorsMessages[0].message).toBe('Field "content" must be a string');
    expect(createCommentForPostResponse_09.errorsMessages[0].field).toBe('content');
    expect(createCommentForPostResponse_09.errorsMessages[0].message).toBe('Field "content" is required');
    expect(createCommentForPostResponse_10.errorsMessages[0].field).toBe('content');
    expect(createCommentForPostResponse_10.errorsMessages[0].message).toBe('Field "content" must be a string');
  });

  it('❌ 017 should not return a list of comments for a post by an invalid ID; 001. GET /api/posts/:postId/comments', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const accessToken: string = await loginUserReturnAccessToken(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    await Promise.all([
      createCommentForPost(app, createdPostId, accessToken),
      createCommentForPost(app, createdPostId, accessToken),
    ]);

    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const getCommentListByPostIdResponse_01: any = await getCommentListByPostId(
      app,
      invalidPostIds.id_01,
      undefined,
      testStatus
    );

    const getCommentListByPostIdResponse_02: any = await getCommentListByPostId(
      app,
      invalidPostIds.id_02,
      undefined,
      testStatus
    );

    const getCommentListByPostIdResponse_03: any = await getCommentListByPostId(
      app,
      invalidPostIds.id_03,
      undefined,
      testStatus
    );

    const getCommentListByPostIdResponse_04: any = await getCommentListByPostId(
      app,
      invalidPostIds.id_04,
      undefined,
      testStatus
    );

    expect(getCommentListByPostIdResponse_01.errorsMessages[0].field).toBe('postId');
    expect(getCommentListByPostIdResponse_01.errorsMessages[0].message).toBe('Field "postId" must be an ObjectId');
    expect(getCommentListByPostIdResponse_02.errorsMessages[0].field).toBe('postId');
    expect(getCommentListByPostIdResponse_03.errorsMessages[0].message).toBe('Field "postId" must be an ObjectId');
    expect(getCommentListByPostIdResponse_03.errorsMessages[0].field).toBe('postId');
    expect(getCommentListByPostIdResponse_03.errorsMessages[0].message).toBe('Field "postId" must be an ObjectId');
    expect(getCommentListByPostIdResponse_04.errorsMessages[0].field).toBe('postId');
    expect(getCommentListByPostIdResponse_04.errorsMessages[0].message).toBe('Field "postId" must not be empty');
  });

  it('❌ 018 should not return a list of comments for a post by an incorrect ID; 001. GET /api/posts/:postId/comments', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const accessToken: string = await loginUserReturnAccessToken(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    await Promise.all([
      createCommentForPost(app, createdPostId, accessToken),
      createCommentForPost(app, createdPostId, accessToken),
    ]);

    await getCommentListByPostId(app, validPostIds.id_01, undefined, HttpStatuses.NotFound_404);
  });

  it('❌ 019 should not return a list of comments for a post by a correct ID when invalid pagination settings passed; 001. GET /api/posts/:postId/comments', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const invalidUrl_01: string = `${SETTINGS.POSTS_PATH}/${createdPostId}/comments?pageSize=${invalidCommentsPaginationSettings.pageSize}&pageNumber=${validCommentsPaginationSettings.pageNumber}&sortDirection=${validCommentsPaginationSettings.sortDirection}&sortBy=${validCommentsPaginationSettings.sortBy}`;
    const invalidUrl_02: string = `${SETTINGS.POSTS_PATH}/${createdPostId}/comments?pageSize=${validCommentsPaginationSettings.pageSize}&pageNumber=${invalidCommentsPaginationSettings.pageNumber}&sortDirection=${validCommentsPaginationSettings.sortDirection}&sortBy=${validCommentsPaginationSettings.sortBy}`;
    const invalidUrl_03: string = `${SETTINGS.POSTS_PATH}/${createdPostId}/comments?pageSize=${validCommentsPaginationSettings.pageSize}&pageNumber=${validCommentsPaginationSettings.pageNumber}&sortDirection=${invalidCommentsPaginationSettings.sortDirection}&sortBy=${validCommentsPaginationSettings.sortBy}`;
    const invalidUrl_04: string = `${SETTINGS.POSTS_PATH}/${createdPostId}/comments?pageSize=${validCommentsPaginationSettings.pageSize}&pageNumber=${validCommentsPaginationSettings.pageNumber}&sortDirection=${validCommentsPaginationSettings.sortDirection}&sortBy=${invalidCommentsPaginationSettings.sortBy}`;
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const accessToken: string = await loginUserReturnAccessToken(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    await Promise.all([
      createCommentForPost(app, createdPostId, accessToken),
      createCommentForPost(app, createdPostId, accessToken),
      createCommentForPost(app, createdPostId, accessToken),
      createCommentForPost(app, createdPostId, accessToken),
      createCommentForPost(app, createdPostId, accessToken),
      createCommentForPost(app, createdPostId, accessToken),
    ]);

    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const getCommentListByPostIdResponse_01: any = await getCommentListByPostId(
      app,
      createdPostId,
      invalidUrl_01,
      testStatus
    );

    const getCommentListByPostIdResponse_02: any = await getCommentListByPostId(
      app,
      createdPostId,
      invalidUrl_02,
      testStatus
    );

    const getCommentListByPostIdResponse_03: any = await getCommentListByPostId(
      app,
      createdPostId,
      invalidUrl_03,
      testStatus
    );

    const getCommentListByPostIdResponse_04: any = await getCommentListByPostId(
      app,
      createdPostId,
      invalidUrl_04,
      testStatus
    );

    expect(getCommentListByPostIdResponse_01.errorsMessages[0].field).toBe('pageSize');

    expect(getCommentListByPostIdResponse_01.errorsMessages[0].message).toBe(
      'Field "pageSize" must be between 1 and 100 characters'
    );

    expect(getCommentListByPostIdResponse_02.errorsMessages[0].field).toBe('pageNumber');

    expect(getCommentListByPostIdResponse_02.errorsMessages[0].message).toBe(
      'Field "pageNumber" must be a positive integer'
    );

    expect(getCommentListByPostIdResponse_03.errorsMessages[0].field).toBe('sortDirection');

    expect(getCommentListByPostIdResponse_03.errorsMessages[0].message).toBe(
      'Field "sortDirection" must be: asc, desc'
    );

    expect(getCommentListByPostIdResponse_04.errorsMessages[0].field).toBe('sortBy');

    expect(getCommentListByPostIdResponse_04.errorsMessages[0].message).toBe(
      'Field "sortBy" must be: createdAt, postId, content, commentatorInfo'
    );
  });
});
