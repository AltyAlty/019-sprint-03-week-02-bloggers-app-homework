import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { SETTINGS } from '../../../src/core/settings/settings';
import { createBlog } from '../../utils/blogs/create-blog.test-util';
import { getBlogById } from '../../utils/blogs/get-blog-by-id.test-util';
import { BlogOutputDTO } from '../../../src/blogs/routes/output-dto/blog.output-dto';
import { getBlogList } from '../../utils/blogs/get-blog-list.test-util';
import { getPostListByBlogId } from '../../utils/blogs/get-post-list-by-blog-id.test-util';
import { PaginatedPostListOutputDTO } from '../../../src/posts/routes/output-dto/paginated-post-list.output-dto';
import { PaginatedBlogListOutputDTO } from '../../../src/blogs/routes/output-dto/paginated-blog-list.output-dto';
import { createPostForBlog } from '../../utils/blogs/create-post-for-blog.test-util';
import { updateBlogById } from '../../utils/blogs/update-blog-by-id.test-util';
import { deleteBlogById } from '../../utils/blogs/delete-blog-by-id.test-util';
import { doBeforeTestsWithMongoMemoryServer } from '../../utils/common/do-before-tests.test-util';
import {
  invalidBlogDescriptions,
  invalidBlogIds,
  invalidBlogNames,
  invalidBlogsPaginationSettings,
  invalidBlogWebsiteUrls,
  validBlogIds,
  validBlogsPaginationSettings,
} from '../../test-data/blogs.test-data';
import {
  invalidPostContents,
  invalidPostShortDescriptions,
  invalidPostsPaginationSettings,
  invalidPostTitles,
  validPostsPaginationSettings,
} from '../../test-data/posts.test-data';
import { invalidBasicAuthTokens } from '../../test-data/auth.test-data';

describe('Blogs API Validation', () => {
  const app = doBeforeTestsWithMongoMemoryServer();

  it('❌ 001 should not create a blog without proper basic authorization; 002. POST /api/blogs', async () => {
    await createBlog(app, undefined, HttpStatuses.Unauthorized_401, invalidBasicAuthTokens.BAT_01);

    const getBlogListResponse: PaginatedBlogListOutputDTO = await getBlogList(app);
    expect(getBlogListResponse.items).toBeInstanceOf(Array);
    expect(getBlogListResponse.items.length).toBe(0);
    expect(getBlogListResponse.totalCount).toBe(0);
  });

  it('❌ 002 should not create a blog when an invalid body passed; 002. POST /api/blogs', async () => {
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const createBlogResponse_01: any = await createBlog(app, { name: invalidBlogNames.name_01 }, testStatus);
    const createBlogResponse_02: any = await createBlog(app, { name: invalidBlogNames.name_02 }, testStatus);
    const createBlogResponse_03: any = await createBlog(app, { name: invalidBlogNames.name_03 }, testStatus);
    const createBlogResponse_04: any = await createBlog(app, { name: invalidBlogNames.name_04 }, testStatus);

    const createBlogResponse_05: any = await createBlog(
      app,
      { description: invalidBlogDescriptions.description_01 },
      testStatus
    );

    const createBlogResponse_06: any = await createBlog(
      app,
      { description: invalidBlogDescriptions.description_02 },
      testStatus
    );

    const createBlogResponse_07: any = await createBlog(
      app,
      { description: invalidBlogDescriptions.description_03 },
      testStatus
    );

    const createBlogResponse_08: any = await createBlog(
      app,
      { websiteUrl: invalidBlogWebsiteUrls.websiteUrl_01 },
      testStatus
    );

    const createBlogResponse_09: any = await createBlog(
      app,
      { websiteUrl: invalidBlogWebsiteUrls.websiteUrl_02 },
      testStatus
    );

    const createBlogResponse_10: any = await createBlog(
      app,
      { websiteUrl: invalidBlogWebsiteUrls.websiteUrl_03 },
      testStatus
    );

    const createBlogResponse_11: any = await createBlog(
      app,
      { websiteUrl: invalidBlogWebsiteUrls.websiteUrl_04 },
      testStatus
    );

    const getBlogListResponse: PaginatedBlogListOutputDTO = await getBlogList(app);
    expect(getBlogListResponse.items).toBeInstanceOf(Array);
    expect(getBlogListResponse.items.length).toBe(0);
    expect(getBlogListResponse.totalCount).toBe(0);
    expect(createBlogResponse_01.errorsMessages[0].field).toBe('name');
    expect(createBlogResponse_01.errorsMessages[0].message).toBe('Field "name" must not be empty');
    expect(createBlogResponse_02.errorsMessages[0].field).toBe('name');
    expect(createBlogResponse_02.errorsMessages[0].message).toBe('Field "name" must not be empty');
    expect(createBlogResponse_03.errorsMessages[0].field).toBe('name');
    expect(createBlogResponse_03.errorsMessages[0].message).toBe('Field "name" must be between 1 and 15 characters');
    expect(createBlogResponse_04.errorsMessages[0].field).toBe('name');
    expect(createBlogResponse_04.errorsMessages[0].message).toBe('Field "name" must be a string');
    expect(createBlogResponse_05.errorsMessages[0].field).toBe('description');
    expect(createBlogResponse_05.errorsMessages[0].message).toBe('Field "description" must not be empty');
    expect(createBlogResponse_06.errorsMessages[0].field).toBe('description');
    expect(createBlogResponse_06.errorsMessages[0].message).toBe('Field "description" must not be empty');
    expect(createBlogResponse_07.errorsMessages[0].field).toBe('description');
    expect(createBlogResponse_07.errorsMessages[0].message).toBe('Field "description" must be a string');
    expect(createBlogResponse_08.errorsMessages[0].field).toBe('websiteUrl');
    expect(createBlogResponse_08.errorsMessages[0].message).toBe('Field "websiteUrl" must not be empty');
    expect(createBlogResponse_09.errorsMessages[0].field).toBe('websiteUrl');
    expect(createBlogResponse_09.errorsMessages[0].message).toBe('Field "websiteUrl" must not be empty');
    expect(createBlogResponse_10.errorsMessages[0].field).toBe('websiteUrl');
    expect(createBlogResponse_10.errorsMessages[0].message).toBe('Field "websiteUrl" is invalid');
    expect(createBlogResponse_11.errorsMessages[0].field).toBe('websiteUrl');
    expect(createBlogResponse_11.errorsMessages[0].message).toBe('Field "websiteUrl" must be a string');
  });

  it('❌ 003 should not return a blog by an invalid ID; 005. GET /api/blogs/:id', async () => {
    await createBlog(app);
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const getBlogByIdResponse_01: any = await getBlogById(app, invalidBlogIds.id_01, testStatus);
    const getBlogByIdResponse_02: any = await getBlogById(app, invalidBlogIds.id_02, testStatus);
    const getBlogByIdResponse_03: any = await getBlogById(app, invalidBlogIds.id_03, testStatus);

    expect(getBlogByIdResponse_01.errorsMessages[0].field).toBe('id');
    expect(getBlogByIdResponse_01.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
    expect(getBlogByIdResponse_02.errorsMessages[0].field).toBe('id');
    expect(getBlogByIdResponse_02.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
    expect(getBlogByIdResponse_03.errorsMessages[0].field).toBe('id');
    expect(getBlogByIdResponse_03.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
  });

  it('❌ 004 should not return a blog by an incorrect ID; 005. GET /api/blogs/:id', async () => {
    await createBlog(app);

    await getBlogById(app, validBlogIds.id_01, HttpStatuses.NotFound_404);
  });

  it('❌ 005 should not return a list of blogs when invalid pagination settings passed; 001. GET /api/blogs', async () => {
    await Promise.all([createBlog(app), createBlog(app)]);
    const invalidUrl_01: string = `${SETTINGS.BLOGS_PATH}?pageSize=${invalidBlogsPaginationSettings.pageSize}&pageNumber=${validBlogsPaginationSettings.pageNumber}&sortDirection=${validBlogsPaginationSettings.sortDirection}&sortBy=${validBlogsPaginationSettings.sortBy}`;
    const invalidUrl_02: string = `${SETTINGS.BLOGS_PATH}?pageSize=${validBlogsPaginationSettings.pageSize}&pageNumber=${invalidBlogsPaginationSettings.pageNumber}&sortDirection=${validBlogsPaginationSettings.sortDirection}&sortBy=${validBlogsPaginationSettings.sortBy}`;
    const invalidUrl_03: string = `${SETTINGS.BLOGS_PATH}?pageSize=${validBlogsPaginationSettings.pageSize}&pageNumber=${validBlogsPaginationSettings.pageNumber}&sortDirection=${invalidBlogsPaginationSettings.sortDirection}&sortBy=${validBlogsPaginationSettings.sortBy}`;
    const invalidUrl_04: string = `${SETTINGS.BLOGS_PATH}?pageSize=${validBlogsPaginationSettings.pageSize}&pageNumber=${validBlogsPaginationSettings.pageNumber}&sortDirection=${validBlogsPaginationSettings.sortDirection}&sortBy=${invalidBlogsPaginationSettings.sortBy}`;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const getBlogListResponse_01: any = await getBlogList(app, invalidUrl_01, testStatus);
    const getBlogListResponse_02: any = await getBlogList(app, invalidUrl_02, testStatus);
    const getBlogListResponse_03: any = await getBlogList(app, invalidUrl_03, testStatus);
    const getBlogListResponse_04: any = await getBlogList(app, invalidUrl_04, testStatus);

    expect(getBlogListResponse_01.errorsMessages[0].field).toBe('pageSize');

    expect(getBlogListResponse_01.errorsMessages[0].message).toBe(
      'Field "pageSize" must be between 1 and 100 characters'
    );

    expect(getBlogListResponse_02.errorsMessages[0].field).toBe('pageNumber');
    expect(getBlogListResponse_02.errorsMessages[0].message).toBe('Field "pageNumber" must be a positive integer');
    expect(getBlogListResponse_03.errorsMessages[0].field).toBe('sortDirection');
    expect(getBlogListResponse_03.errorsMessages[0].message).toBe('Field "sortDirection" must be: asc, desc');
    expect(getBlogListResponse_04.errorsMessages[0].field).toBe('sortBy');

    expect(getBlogListResponse_04.errorsMessages[0].message).toBe(
      'Field "sortBy" must be: createdAt, name, description, websiteUrl'
    );
  });

  it('❌ 006 should not update a blog by a correct ID without proper basic authorization; 006. PUT /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;

    await updateBlogById(app, createdBlogId, undefined, HttpStatuses.Unauthorized_401, invalidBasicAuthTokens.BAT_01);

    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(app, createdBlogId);
    expect(getBlogByIdResponse).toEqual(createdBlog);
  });

  it('❌ 007 should not update a blog by an invalid ID; 006. PUT /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const updateBlogByIdResponse_01: any = await updateBlogById(app, invalidBlogIds.id_01, undefined, testStatus);
    const updateBlogByIdResponse_02: any = await updateBlogById(app, invalidBlogIds.id_02, undefined, testStatus);
    const updateBlogByIdResponse_03: any = await updateBlogById(app, invalidBlogIds.id_03, undefined, testStatus);

    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(app, createdBlog.id);
    expect(getBlogByIdResponse).toEqual(createdBlog);
    expect(updateBlogByIdResponse_01.errorsMessages[0].field).toBe('id');
    expect(updateBlogByIdResponse_01.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
    expect(updateBlogByIdResponse_02.errorsMessages[0].field).toBe('id');
    expect(updateBlogByIdResponse_02.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
    expect(updateBlogByIdResponse_03.errorsMessages[0].field).toBe('id');
    expect(updateBlogByIdResponse_03.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
  });

  it('❌ 008 should not update a blog by an incorrect ID; 006. PUT /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);

    await updateBlogById(app, validBlogIds.id_01, undefined, HttpStatuses.NotFound_404);

    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(app, createdBlog.id);
    expect(getBlogByIdResponse).toEqual(createdBlog);
  });

  it('❌ 009 should not update a blog by a correct ID when an invalid body passed; 006. PUT /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const updateBlogByIdResponse_01: any = await updateBlogById(
      app,
      createdBlogId,
      { name: invalidBlogNames.name_01 },
      testStatus
    );

    const updateBlogByIdResponse_02: any = await updateBlogById(
      app,
      createdBlogId,
      { name: invalidBlogNames.name_02 },
      testStatus
    );

    const updateBlogByIdResponse_03: any = await updateBlogById(
      app,
      createdBlogId,
      { name: invalidBlogNames.name_03 },
      testStatus
    );

    const updateBlogByIdResponse_04: any = await updateBlogById(
      app,
      createdBlogId,
      { name: invalidBlogNames.name_04 },
      testStatus
    );

    const updateBlogByIdResponse_05: any = await updateBlogById(
      app,
      createdBlogId,
      { description: invalidBlogDescriptions.description_01 },
      testStatus
    );

    const updateBlogByIdResponse_06: any = await updateBlogById(
      app,
      createdBlogId,
      { description: invalidBlogDescriptions.description_02 },
      testStatus
    );

    const updateBlogByIdResponse_07: any = await updateBlogById(
      app,
      createdBlogId,
      { description: invalidBlogDescriptions.description_03 },
      testStatus
    );

    const updateBlogByIdResponse_08: any = await updateBlogById(
      app,
      createdBlogId,
      { websiteUrl: invalidBlogWebsiteUrls.websiteUrl_01 },
      testStatus
    );

    const updateBlogByIdResponse_09: any = await updateBlogById(
      app,
      createdBlogId,
      { websiteUrl: invalidBlogWebsiteUrls.websiteUrl_02 },
      testStatus
    );

    const updateBlogByIdResponse_10: any = await updateBlogById(
      app,
      createdBlogId,
      { websiteUrl: invalidBlogWebsiteUrls.websiteUrl_03 },
      testStatus
    );

    const updateBlogByIdResponse_11: any = await updateBlogById(
      app,
      createdBlogId,
      { websiteUrl: invalidBlogWebsiteUrls.websiteUrl_04 },
      testStatus
    );

    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(app, createdBlogId);
    expect(getBlogByIdResponse).toEqual(createdBlog);
    expect(updateBlogByIdResponse_01.errorsMessages[0].field).toBe('name');
    expect(updateBlogByIdResponse_01.errorsMessages[0].message).toBe('Field "name" must not be empty');
    expect(updateBlogByIdResponse_02.errorsMessages[0].field).toBe('name');
    expect(updateBlogByIdResponse_02.errorsMessages[0].message).toBe('Field "name" must not be empty');
    expect(updateBlogByIdResponse_03.errorsMessages[0].field).toBe('name');

    expect(updateBlogByIdResponse_03.errorsMessages[0].message).toBe(
      'Field "name" must be between 1 and 15 characters'
    );

    expect(updateBlogByIdResponse_04.errorsMessages[0].field).toBe('name');
    expect(updateBlogByIdResponse_04.errorsMessages[0].message).toBe('Field "name" must be a string');
    expect(updateBlogByIdResponse_05.errorsMessages[0].field).toBe('description');
    expect(updateBlogByIdResponse_05.errorsMessages[0].message).toBe('Field "description" must not be empty');
    expect(updateBlogByIdResponse_06.errorsMessages[0].field).toBe('description');
    expect(updateBlogByIdResponse_06.errorsMessages[0].message).toBe('Field "description" must not be empty');
    expect(updateBlogByIdResponse_07.errorsMessages[0].field).toBe('description');
    expect(updateBlogByIdResponse_07.errorsMessages[0].message).toBe('Field "description" must be a string');
    expect(updateBlogByIdResponse_08.errorsMessages[0].field).toBe('websiteUrl');
    expect(updateBlogByIdResponse_08.errorsMessages[0].message).toBe('Field "websiteUrl" must not be empty');
    expect(updateBlogByIdResponse_09.errorsMessages[0].field).toBe('websiteUrl');
    expect(updateBlogByIdResponse_09.errorsMessages[0].message).toBe('Field "websiteUrl" must not be empty');
    expect(updateBlogByIdResponse_10.errorsMessages[0].field).toBe('websiteUrl');
    expect(updateBlogByIdResponse_10.errorsMessages[0].message).toBe('Field "websiteUrl" is invalid');
    expect(updateBlogByIdResponse_11.errorsMessages[0].field).toBe('websiteUrl');
    expect(updateBlogByIdResponse_11.errorsMessages[0].message).toBe('Field "websiteUrl" must be a string');
  });

  it('❌ 010 should not delete a blog by a correct ID without proper basic authorization; 007. DELETE /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;

    await deleteBlogById(app, createdBlogId, HttpStatuses.Unauthorized_401, invalidBasicAuthTokens.BAT_01);

    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(app, createdBlogId);
    expect(getBlogByIdResponse).toEqual(createdBlog);
  });

  it('❌ 011 should not delete a blog by an invalid ID; 007. DELETE /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const deleteBlogByIdResponse_01: any = await deleteBlogById(app, invalidBlogIds.id_01, testStatus);
    const deleteBlogByIdResponse_02: any = await deleteBlogById(app, invalidBlogIds.id_02, testStatus);
    const deleteBlogByIdResponse_03: any = await deleteBlogById(app, invalidBlogIds.id_03, testStatus);

    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(app, createdBlog.id);
    expect(getBlogByIdResponse).toEqual(createdBlog);
    expect(deleteBlogByIdResponse_01.errorsMessages[0].field).toBe('id');
    expect(deleteBlogByIdResponse_01.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
    expect(deleteBlogByIdResponse_02.errorsMessages[0].field).toBe('id');
    expect(deleteBlogByIdResponse_02.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
    expect(deleteBlogByIdResponse_03.errorsMessages[0].field).toBe('id');
    expect(deleteBlogByIdResponse_03.errorsMessages[0].message).toBe('Field "id" must be an ObjectId');
  });

  it('❌ 012 should not delete a blog by an incorrect ID; 007. DELETE /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);

    await deleteBlogById(app, validBlogIds.id_01, HttpStatuses.NotFound_404);

    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(app, createdBlog.id);
    expect(getBlogByIdResponse).toEqual(createdBlog);
  });

  it('❌ 013 should not create a post for a blog by a correct ID without proper basic authorization; 004. POST /api/blogs/:blogId/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;

    await createPostForBlog(
      app,
      createdBlogId,
      undefined,
      HttpStatuses.Unauthorized_401,
      invalidBasicAuthTokens.BAT_01
    );

    const getPostListByBlogIdResponse: PaginatedPostListOutputDTO = await getPostListByBlogId(app, createdBlogId);
    expect(getPostListByBlogIdResponse.items).toBeInstanceOf(Array);
    expect(getPostListByBlogIdResponse.items.length).toBe(0);
    expect(getPostListByBlogIdResponse.totalCount).toBe(0);
  });

  it('❌ 014 should not create a post for a blog by an invalid ID; 004. POST /api/blogs/:blogId/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const createPostForBlogResponse_01: any = await createPostForBlog(app, invalidBlogIds.id_01, undefined, testStatus);
    const createPostForBlogResponse_02: any = await createPostForBlog(app, invalidBlogIds.id_02, undefined, testStatus);
    const createPostForBlogResponse_03: any = await createPostForBlog(app, invalidBlogIds.id_03, undefined, testStatus);
    const createPostForBlogResponse_04: any = await createPostForBlog(app, invalidBlogIds.id_04, undefined, testStatus);

    const getPostListByBlogIdResponse: PaginatedPostListOutputDTO = await getPostListByBlogId(app, createdBlog.id);
    expect(getPostListByBlogIdResponse.items).toBeInstanceOf(Array);
    expect(getPostListByBlogIdResponse.items.length).toBe(0);
    expect(getPostListByBlogIdResponse.totalCount).toBe(0);
    expect(createPostForBlogResponse_01.errorsMessages[0].field).toBe('blogId');
    expect(createPostForBlogResponse_01.errorsMessages[0].message).toBe('Field "blogId" must be an ObjectId');
    expect(createPostForBlogResponse_02.errorsMessages[0].field).toBe('blogId');
    expect(createPostForBlogResponse_02.errorsMessages[0].message).toBe('Field "blogId" must be an ObjectId');
    expect(createPostForBlogResponse_03.errorsMessages[0].field).toBe('blogId');
    expect(createPostForBlogResponse_03.errorsMessages[0].message).toBe('Field "blogId" must be an ObjectId');
    expect(createPostForBlogResponse_04.errorsMessages[0].field).toBe('blogId');
    expect(createPostForBlogResponse_04.errorsMessages[0].message).toBe('Field "blogId" must not be empty');
  });

  it('❌ 015 should not create a post for a blog by an incorrect ID; 004. POST /api/blogs/:blogId/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);

    await createPostForBlog(app, validBlogIds.id_01, undefined, HttpStatuses.NotFound_404);

    const getPostListByBlogIdResponse: PaginatedPostListOutputDTO = await getPostListByBlogId(app, createdBlog.id);
    expect(getPostListByBlogIdResponse.items).toBeInstanceOf(Array);
    expect(getPostListByBlogIdResponse.items.length).toBe(0);
    expect(getPostListByBlogIdResponse.totalCount).toBe(0);
  });

  it('❌ 016 should not create a post for a blog by a correct ID when an invalid body passed; 004. POST /api/blogs/:blogId/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const createPostForBlogResponse_01: any = await createPostForBlog(
      app,
      createdBlogId,
      { title: invalidPostTitles.title_01 },
      testStatus
    );

    const createPostForBlogResponse_02: any = await createPostForBlog(
      app,
      createdBlogId,
      { title: invalidPostTitles.title_02 },
      testStatus
    );

    const createPostForBlogResponse_03: any = await createPostForBlog(
      app,
      createdBlogId,
      { title: invalidPostTitles.title_03 },
      testStatus
    );

    const createPostForBlogResponse_04: any = await createPostForBlog(
      app,
      createdBlogId,
      { title: invalidPostTitles.title_04 },
      testStatus
    );

    const createPostForBlogResponse_05: any = await createPostForBlog(
      app,
      createdBlogId,
      { title: invalidPostTitles.title_05 },
      testStatus
    );

    const createPostForBlogResponse_06: any = await createPostForBlog(
      app,
      createdBlogId,
      { shortDescription: invalidPostShortDescriptions.shortDescription_01 },
      testStatus
    );

    const createPostForBlogResponse_07: any = await createPostForBlog(
      app,
      createdBlogId,
      { shortDescription: invalidPostShortDescriptions.shortDescription_02 },
      testStatus
    );

    const createPostForBlogResponse_08: any = await createPostForBlog(
      app,
      createdBlogId,
      { shortDescription: invalidPostShortDescriptions.shortDescription_03 },
      testStatus
    );

    const createPostForBlogResponse_09: any = await createPostForBlog(
      app,
      createdBlogId,
      { content: invalidPostContents.content_01 },
      testStatus
    );

    const createPostForBlogResponse_10: any = await createPostForBlog(
      app,
      createdBlogId,
      { content: invalidPostContents.content_02 },
      testStatus
    );

    const createPostForBlogResponse_11: any = await createPostForBlog(
      app,
      createdBlogId,
      { content: invalidPostContents.content_03 },
      testStatus
    );

    const getPostListByBlogIdResponse: PaginatedPostListOutputDTO = await getPostListByBlogId(app, createdBlogId);
    expect(getPostListByBlogIdResponse.items).toBeInstanceOf(Array);
    expect(getPostListByBlogIdResponse.items.length).toBe(0);
    expect(getPostListByBlogIdResponse.totalCount).toBe(0);
    expect(createPostForBlogResponse_01.errorsMessages[0].field).toBe('title');
    expect(createPostForBlogResponse_01.errorsMessages[0].message).toBe('Field "title" must not be empty');
    expect(createPostForBlogResponse_02.errorsMessages[0].field).toBe('title');

    expect(createPostForBlogResponse_03.errorsMessages[0].message).toBe(
      'Field "title" must be between 1 and 30 characters'
    );

    expect(createPostForBlogResponse_03.errorsMessages[0].field).toBe('title');

    expect(createPostForBlogResponse_03.errorsMessages[0].message).toBe(
      'Field "title" must be between 1 and 30 characters'
    );

    expect(createPostForBlogResponse_04.errorsMessages[0].field).toBe('title');

    expect(createPostForBlogResponse_04.errorsMessages[0].message).toBe(
      'Field "title" must be between 1 and 30 characters'
    );

    expect(createPostForBlogResponse_05.errorsMessages[0].field).toBe('title');
    expect(createPostForBlogResponse_05.errorsMessages[0].message).toBe('Field "title" must be a string');
    expect(createPostForBlogResponse_06.errorsMessages[0].field).toBe('shortDescription');
    expect(createPostForBlogResponse_06.errorsMessages[0].message).toBe('Field "shortDescription" must not be empty');
    expect(createPostForBlogResponse_07.errorsMessages[0].field).toBe('shortDescription');
    expect(createPostForBlogResponse_07.errorsMessages[0].message).toBe('Field "shortDescription" must not be empty');
    expect(createPostForBlogResponse_08.errorsMessages[0].field).toBe('shortDescription');
    expect(createPostForBlogResponse_08.errorsMessages[0].message).toBe('Field "shortDescription" must be a string');
    expect(createPostForBlogResponse_09.errorsMessages[0].field).toBe('content');
    expect(createPostForBlogResponse_09.errorsMessages[0].message).toBe('Field "content" must not be empty');
    expect(createPostForBlogResponse_10.errorsMessages[0].field).toBe('content');
    expect(createPostForBlogResponse_10.errorsMessages[0].message).toBe('Field "content" must not be empty');
    expect(createPostForBlogResponse_11.errorsMessages[0].field).toBe('content');
    expect(createPostForBlogResponse_11.errorsMessages[0].message).toBe('Field "content" must be a string');
  });

  it('❌ 017 should not return a list of posts for a blog by an invalid ID; 003. GET /api/blogs/:blogId/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    await Promise.all([createPostForBlog(app, createdBlogId), createPostForBlog(app, createdBlogId)]);
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    const getPostListByBlogIdResponse_01: any = await getPostListByBlogId(
      app,
      invalidBlogIds.id_01,
      undefined,
      testStatus
    );

    const getPostListByBlogIdResponse_02: any = await getPostListByBlogId(
      app,
      invalidBlogIds.id_02,
      undefined,
      testStatus
    );

    const getPostListByBlogIdResponse_03: any = await getPostListByBlogId(
      app,
      invalidBlogIds.id_03,
      undefined,
      testStatus
    );

    const getPostListByBlogIdResponse_04: any = await getPostListByBlogId(
      app,
      invalidBlogIds.id_04,
      undefined,
      testStatus
    );

    expect(getPostListByBlogIdResponse_01.errorsMessages[0].field).toBe('blogId');
    expect(getPostListByBlogIdResponse_01.errorsMessages[0].message).toBe('Field "blogId" must be an ObjectId');
    expect(getPostListByBlogIdResponse_02.errorsMessages[0].field).toBe('blogId');
    expect(getPostListByBlogIdResponse_02.errorsMessages[0].message).toBe('Field "blogId" must be an ObjectId');
    expect(getPostListByBlogIdResponse_03.errorsMessages[0].field).toBe('blogId');
    expect(getPostListByBlogIdResponse_03.errorsMessages[0].message).toBe('Field "blogId" must be an ObjectId');
    expect(getPostListByBlogIdResponse_04.errorsMessages[0].field).toBe('blogId');
    expect(getPostListByBlogIdResponse_04.errorsMessages[0].message).toBe('Field "blogId" must not be empty');
  });

  it('❌ 018 should not return a list of posts for a blog by an incorrect ID; 003. GET /api/blogs/:blogId/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    await Promise.all([createPostForBlog(app, createdBlogId), createPostForBlog(app, createdBlogId)]);

    await getPostListByBlogId(app, validBlogIds.id_01, undefined, HttpStatuses.NotFound_404);
  });

  it('❌ 019 should not return a list of posts for a blog by a correct ID when invalid pagination settings passed; 003. GET /api/blogs/:blogId/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const invalidUrl_01: string = `${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts?pageSize=${invalidPostsPaginationSettings.pageSize}&pageNumber=${validPostsPaginationSettings.pageNumber}&sortDirection=${validPostsPaginationSettings.sortDirection}&sortBy=${validPostsPaginationSettings.sortBy}`;
    const invalidUrl_02: string = `${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts?pageSize=${validPostsPaginationSettings.pageSize}&pageNumber=${invalidPostsPaginationSettings.pageNumber}&sortDirection=${validPostsPaginationSettings.sortDirection}&sortBy=${validPostsPaginationSettings.sortBy}`;
    const invalidUrl_03: string = `${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts?pageSize=${validPostsPaginationSettings.pageSize}&pageNumber=${validPostsPaginationSettings.pageNumber}&sortDirection=${invalidPostsPaginationSettings.sortDirection}&sortBy=${validPostsPaginationSettings.sortBy}`;
    const invalidUrl_04: string = `${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts?pageSize=${validPostsPaginationSettings.pageSize}&pageNumber=${validPostsPaginationSettings.pageNumber}&sortDirection=${validPostsPaginationSettings.sortDirection}&sortBy=${invalidPostsPaginationSettings.sortBy}`;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await Promise.all([
      createPostForBlog(app, createdBlogId),
      createPostForBlog(app, createdBlogId),
      createPostForBlog(app, createdBlogId),
      createPostForBlog(app, createdBlogId),
      createPostForBlog(app, createdBlogId),
      createPostForBlog(app, createdBlogId),
    ]);

    const getPostListByBlogIdResponse_01: any = await getPostListByBlogId(
      app,
      createdBlogId,
      invalidUrl_01,
      testStatus
    );

    const getPostListByBlogIdResponse_02: any = await getPostListByBlogId(
      app,
      createdBlogId,
      invalidUrl_02,
      testStatus
    );

    const getPostListByBlogIdResponse_03: any = await getPostListByBlogId(
      app,
      createdBlogId,
      invalidUrl_03,
      testStatus
    );

    const getPostListByBlogIdResponse_04: any = await getPostListByBlogId(
      app,
      createdBlogId,
      invalidUrl_04,
      testStatus
    );

    expect(getPostListByBlogIdResponse_01.errorsMessages[0].field).toBe('pageSize');

    expect(getPostListByBlogIdResponse_01.errorsMessages[0].message).toBe(
      'Field "pageSize" must be between 1 and 100 characters'
    );

    expect(getPostListByBlogIdResponse_02.errorsMessages[0].field).toBe('pageNumber');

    expect(getPostListByBlogIdResponse_02.errorsMessages[0].message).toBe(
      'Field "pageNumber" must be a positive integer'
    );

    expect(getPostListByBlogIdResponse_03.errorsMessages[0].field).toBe('sortDirection');
    expect(getPostListByBlogIdResponse_03.errorsMessages[0].message).toBe('Field "sortDirection" must be: asc, desc');
    expect(getPostListByBlogIdResponse_04.errorsMessages[0].field).toBe('sortBy');

    expect(getPostListByBlogIdResponse_04.errorsMessages[0].message).toBe(
      'Field "sortBy" must be: createdAt, title, shortDescription, content, blogId, blogName'
    );
  });
});
