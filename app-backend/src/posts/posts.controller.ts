/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Request,
  BadRequestException,
  Query,
  Get,
  Param,
  Post as PostMethod,
  Put,
  NotFoundException,
  Delete,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { S3Service } from '@/s3/s3.service';
import {
  CommentsQueryDto,
  CreateAudioPostDto,
  CreateImagePostDto,
  CreateLinkPostDto,
  CreateTextPostDto,
  CreateVideoPostDto,
  FetchPostsDto,
  UpdateAudioPostDto,
  UpdateImagePostDto,
  UpdateLinkPostDto,
  UpdateTextPostDto,
  UpdateVideoPostDto,
} from './posts.dto';
import { Post, PostStatus, PostType } from '@/schemas/posts.schema';
import { MembershipsService } from '@/memberships/memberships.service';
import { NotificationGeneratorService } from '../notifications/notification-generator.service';
import * as cheerio from 'cheerio';
import { OptionalJwtAuthGuard } from '@/auth/optional-auth-guard';
import * as sharp from 'sharp';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly s3Service: S3Service,
    private readonly membershipsService: MembershipsService,
    private readonly notificationGenerator: NotificationGeneratorService,
  ) {}

  @Get('by-creator/:creatorId')
  @UseGuards(OptionalJwtAuthGuard)
  async findPublishedPostsByCreator(
    @Param('creatorId') creatorId: string,
    @Query() fetchPostsDto: FetchPostsDto,
    @Request() req,
  ) {
    console.log('findPublishedPostsByCreator');
    const userId = fetchPostsDto.userId || req.user?.userId;
    const { posts, total } =
      await this.postsService.findPublishedPostsByCreator(
        creatorId,
        fetchPostsDto,
        userId,
      );
    const { memberships } = await this.membershipsService.getCreatorMemberships(
      creatorId,
      {},
    );

    const transformedPosts = await Promise.all(
      posts.map(async (post) => {
        const tierAccess = post.tierAccess
          .map((ta) => memberships.find((m) => m.id === ta))
          .filter((ta) => Boolean(ta));
        try {
          const hasAccess = await this.postsService.checkPostAccess(
            userId,
            post,
          );

          const postObj =
            post instanceof Object && typeof post.toObject === 'function'
              ? post.toObject()
              : { ...post };

          let previewText = '';
          if (postObj.textContent) {
            const $ = cheerio.load(postObj.textContent);
            const plainText = $.root().text();

            if (plainText.length <= 150) {
              previewText = postObj.textContent;
            } else {
              let truncatedHtml = '';
              let currentLength = 0;
              const limit = 150;

              $('body')
                .children()
                .each((i, el) => {
                  if (currentLength >= limit) {
                    return false;
                  }

                  const element = $(el);
                  const elementText = element.text();

                  if (currentLength + elementText.length <= limit) {
                    truncatedHtml += $.html(element);
                    currentLength += elementText.length;
                  } else {
                    const remainingLength = limit - currentLength;
                    let truncatedText = elementText.substring(
                      0,
                      remainingLength,
                    );

                    const lastSpace = truncatedText.lastIndexOf(' ');
                    if (lastSpace > 0) {
                      truncatedText = truncatedText.substring(0, lastSpace);
                    }

                    const clonedElement = element.clone();
                    clonedElement.text(truncatedText + '...');
                    truncatedHtml += $.html(clonedElement);

                    currentLength = limit;
                  }
                });
              previewText = truncatedHtml;
            }
          } else if (postObj.description) {
            previewText = postObj.description;
          }

          const thumbnail = postObj.thumbnailUrl;
          // if (!thumbnail && postObj.mediaUrls && postObj.mediaUrls.length > 0) {
          //   thumbnail = postObj.mediaUrls[0];
          // }

          const creator = postObj.creator || {};
          const creatorIdStr =
            typeof creator === 'object'
              ? creator._id?.toString()
              : creator?.toString();
          // delete postObj.textContent;
          postObj.description = previewText;
          const formattedPost = {
            ...postObj,
            previewText,
            thumbnail,
            creator: {
              id: creatorIdStr || '',
              displayName:
                creator.displayName || creator.creatorUsername || 'Unknown',
              profilePicture: creator.profilePicture,
              username: creator.creatorUsername || '',
              category: creator.creatorCategory || '',
            },
            likesCount: postObj.likeCount || 0,
            commentsCount: postObj.commentCount || 0,
            publishDate: this.postsService.formatDate(postObj.createdAt),
            postType: this.postsService.getReadablePostType(postObj.type),
            isRestrictedView: !hasAccess,
            videoUrl: postObj.videoUrl,
            tierAccess,
            // previewText,
          };
          if (!hasAccess) {
            return {
              ...this.postsService.filterPostForListing(formattedPost, false),
              hasAccess,
            };
          }
          return { ...formattedPost, hasAccess };
        } catch (error) {
          console.error(`Error processing post ${post._id || post.id}:`, error);
          return {
            id: post._id?.toString() || post.id || 'unknown',
            title: post.title || 'Error loading post',
            isRestrictedView: true,
            error: true,
          };
        }
      }),
    );

    return {
      posts: transformedPosts.filter((post) => !post.error),
      pagination: {
        total,
        page: fetchPostsDto.page || 1,
        limit: fetchPostsDto.limit || 10,
        totalPages: Math.ceil(total / (fetchPostsDto.limit || 10)),
      },
    };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAllPublishedPosts(
    @Query() fetchPostsDto: FetchPostsDto,
    @Request() req,
  ) {
    const userId = req.user?.userId;
    const { posts, total } = await this.postsService.findPublishedPosts(
      fetchPostsDto,
      userId,
    );

    const transformedPosts = await Promise.all(
      posts.map(async (post) => {
        const tierAccessDetails = await Promise.all(
          (post.tierAccess || []).map(async (memberId) => {
            try {
              const membership =
                await this.membershipsService.getMembershipById(memberId);
              return {
                id: memberId,
                name: membership.name,
              };
            } catch (error) {
              ////console.log(error);
              return {
                id: memberId,
                name: 'Unknown Tier',
              };
            }
          }),
        );

        return {
          id: post._id,
          title: post.title,
          publishDate: this.formatDate(post.createdAt),
          tierAccess: tierAccessDetails,
          postType: this.getReadablePostType(post.type),
          thumbnail: this.getThumbnailForPost(post),
          description:
            post.description ||
            post.previewText ||
            post.textContent?.substring(0, 150),
          creator: {
            id: post.creator._id,
            name: post.creator.displayName || post.creator.creatorUsername,
            profilePicture: post.creator.profilePicture,
          },
          isRestrictedView: post.isRestrictedView,
        };
      }),
    );

    return {
      posts: transformedPosts,
      pagination: {
        total,
        page: fetchPostsDto.page || 1,
        limit: fetchPostsDto.limit || 10,
        totalPages: Math.ceil(total / (fetchPostsDto.limit || 10)),
      },
    };
  }

  @Get('drafts')
  @UseGuards(AuthGuard('jwt'))
  async findMyDrafts(@Request() req) {
    ////console.log('Drafts');
    const drafts = await this.postsService.findByCreator(req.user.userId, {
      status: PostStatus.DRAFT,
    });

    const transformedDrafts = await Promise.all(
      drafts.map(async (draft) => {
        const tierAccessDetails = await Promise.all(
          (draft.tierAccess || []).map(async (memberId) => {
            try {
              const membership =
                await this.membershipsService.getMembershipById(memberId);
              return {
                id: memberId,
                name: membership.name,
              };
            } catch (error) {
              ////console.log(error);
              return {
                id: memberId,
                name: 'Unknown Tier',
              };
            }
          }),
        );

        return {
          id: draft._id,
          title: draft.title,
          createdAt: draft.createdAt,
          updatedAt: draft.updatedAt,
          type: draft.type,
          postType: this.getReadablePostType(draft.type),
          tierAccess: tierAccessDetails,
          status: draft.status,
        };
      }),
    );

    return {
      drafts: transformedDrafts,
    };
  }

  @Get('my-posts')
  @UseGuards(AuthGuard('jwt'))
  async findMyPosts(@Request() req, @Query() fetchPostsDto: FetchPostsDto) {
    const { posts, total } =
      await this.postsService.findPublishedPostsByCreator(
        req.user.userId,
        fetchPostsDto,
      );

    const transformedPosts = await Promise.all(
      posts.map(async (post) => {
        const tierAccessDetails = await Promise.all(
          (post.tierAccess || []).map(async (memberId) => {
            try {
              const membership =
                await this.membershipsService.getMembershipById(memberId);
              return {
                id: memberId,
                name: membership.name,
              };
            } catch (error) {
              ////console.log(error);
              return {
                id: memberId,
                name: 'Unknown Tier',
              };
            }
          }),
        );

        return {
          id: post.id,
          title: post.title,
          publishDate: this.formatDate(post.createdAt),
          tierAccess: tierAccessDetails,
          postType: this.getReadablePostType(post.type),
          thumbnail: this.getThumbnailForPost(post),
          status: post.status,
          collections: post.collections,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        };
      }),
    );

    return {
      posts: transformedPosts,
      pagination: {
        total,
        page: fetchPostsDto.page || 1,
        limit: fetchPostsDto.limit || 10,
        totalPages: Math.ceil(total / (fetchPostsDto.limit || 10)),
      },
    };
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getPostById(
    @Request() req,
    @Param('id') id: string,
    @Query() query: { userId: string },
  ) {
    const userId = query.userId || req.user?.userId;
    return await this.postsService.getPostById(id, userId);
  }

  @PostMethod('text')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('attachments', 10))
  async createTextPost(
    @Request() req,
    @Body() createTextPostDto: CreateTextPostDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    const attachments = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const fileUrl = await this.s3Service.uploadFile(
            file,
            'attachments',
            'patreon-clone-assets',
          );
          attachments.push({
            url: fileUrl,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedAt: new Date(),
          });
        } catch (error) {
          console.error(`Failed to upload file ${file.originalname}:`, error);
        }
      }
    }
    const post = await this.postsService.createTextPost({
      type: PostType.TEXT,
      creator: req.user.userId,
      title: createTextPostDto.title,
      textContent: createTextPostDto.textContent,
      tags: createTextPostDto.tags,
      collections: createTextPostDto.collections,
      status: createTextPostDto.isDraft
        ? PostStatus.DRAFT
        : PostStatus.PUBLISHED,
      tierAccess: createTextPostDto.tierAccess || [],
      attachments,
    });
    return post;
  }

  @Put('text/:id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('attachments', 10))
  async updateTextPost(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTextPostDto: UpdateTextPostDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    const post = await this.postsService.findById(id);
    if (!post || post.creator._id.toString() !== req.user.userId) {
      throw new NotFoundException('Post not found or unauthorized');
    }
    const newAttachments = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const fileUrl = await this.s3Service.uploadFile(
            file,
            'attachments',
            'patreon-clone-assets',
          );
          newAttachments.push({
            url: fileUrl,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedAt: new Date(),
          });
        } catch (error) {
          console.error(`Failed to upload file ${file.originalname}:`, error);
        }
      }
    }
    let existingAttachments = [];
    if (post.attachments && post.attachments.length > 0) {
      if (updateTextPostDto.existingAttachments) {
        existingAttachments = post.attachments.filter((attachment) =>
          updateTextPostDto.existingAttachments.includes(
            attachment._id.toString() || '',
          ),
        );
      }
    }
    const attachments = [...existingAttachments, ...newAttachments];
    const updatedPost = await this.postsService.updatePost(id, {
      title: updateTextPostDto.title,
      textContent: updateTextPostDto.textContent,
      tags: updateTextPostDto.tags,
      collections: updateTextPostDto.collections,
      status: updateTextPostDto.isDraft
        ? PostStatus.DRAFT
        : PostStatus.PUBLISHED,
      tierAccess: updateTextPostDto.tierAccess || [],
      attachments,
    });
    return updatedPost;
  }

  @PostMethod('video')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'videoFile', maxCount: 1 },
      { name: 'attachments', maxCount: 10 },
    ]),
  )
  async createVideoPost(
    @Request() req,
    @Body() createVideoPostDto: CreateVideoPostDto,
    @UploadedFiles()
    files: {
      videoFile?: Express.Multer.File[];
      attachments?: Express.Multer.File[];
    },
  ) {
    console.log('createVideoPost - Request received:', {
      userId: req.user?.userId,
      hasVideoUrl: !!createVideoPostDto.videoUrl,
      hasVideoFile: !!files?.videoFile?.[0],
      attachmentsCount: files?.attachments?.length || 0,
    });
    console.log('createVideoPostDto:', createVideoPostDto);

    // Determine final video URL (either provided URL or uploaded file URL)
    let finalVideoUrl = createVideoPostDto.videoUrl;
    if (!finalVideoUrl && files?.videoFile?.[0]) {
      const video = files.videoFile[0];
      if (!video.mimetype.startsWith('video/')) {
        throw new BadRequestException('Invalid video file format');
      }

      // Log video upload start
      const uploadStartTime = Date.now();
      const fileSizeMB = (video.size / (1024 * 1024)).toFixed(2);
      console.log('Video upload started:', {
        fileName: video.originalname,
        fileSize: `${fileSizeMB} MB (${video.size} bytes)`,
        mimeType: video.mimetype,
        bucket: 'patreon-clone-assets',
        folder: 'videos',
        timestamp: new Date().toISOString(),
        uploadStartTime,
      });

      try {
        // Upload videos to patreon-clone-assets bucket per requirement
        finalVideoUrl = await this.s3Service.uploadFile(
          video,
          'videos',
          'patreon-clone-assets',
        );

        // Log video upload completion
        const uploadEndTime = Date.now();
        const uploadDuration = uploadEndTime - uploadStartTime;
        const uploadDurationSeconds = (uploadDuration / 1000).toFixed(2);
        const uploadSpeedMBps = (
          parseFloat(fileSizeMB) /
          (uploadDuration / 1000)
        ).toFixed(2);

        console.log('Video upload completed:', {
          fileName: video.originalname,
          fileSize: `${fileSizeMB} MB (${video.size} bytes)`,
          uploadDuration: `${uploadDurationSeconds} seconds (${uploadDuration}ms)`,
          uploadSpeed: `${uploadSpeedMBps} MB/s`,
          finalVideoUrl,
          timestamp: new Date().toISOString(),
          uploadEndTime,
        });
      } catch (error) {
        const uploadEndTime = Date.now();
        const uploadDuration = uploadEndTime - uploadStartTime;
        console.error('Video upload failed:', {
          fileName: video.originalname,
          fileSize: `${fileSizeMB} MB (${video.size} bytes)`,
          uploadDuration: `${(uploadDuration / 1000).toFixed(2)} seconds (${uploadDuration}ms)`,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        throw new BadRequestException(
          `Failed to upload video file: ${error.message}`,
        );
      }
    }
    if (!finalVideoUrl) {
      throw new BadRequestException('Provide a videoUrl or upload a videoFile');
    }

    // Handle optional attachments (keep existing behavior and bucket)
    const attachments = [];
    if (files?.attachments?.length) {
      console.log(
        `Starting upload of ${files.attachments.length} attachment(s)`,
      );
      for (let i = 0; i < files.attachments.length; i++) {
        const file = files.attachments[i];
        const attachmentStartTime = Date.now();
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

        console.log(
          `Attachment ${i + 1}/${files.attachments.length} upload started:`,
          {
            fileName: file.originalname,
            fileSize: `${fileSizeMB} MB (${file.size} bytes)`,
            mimeType: file.mimetype,
            timestamp: new Date().toISOString(),
          },
        );

        try {
          const fileUrl = await this.s3Service.uploadFile(
            file,
            'video-post-attachments',
            'patreon-clone-assets',
          );

          const attachmentEndTime = Date.now();
          const attachmentDuration = attachmentEndTime - attachmentStartTime;
          const attachmentDurationSeconds = (attachmentDuration / 1000).toFixed(
            2,
          );

          console.log(
            `Attachment ${i + 1}/${files.attachments.length} upload completed:`,
            {
              fileName: file.originalname,
              fileSize: `${fileSizeMB} MB (${file.size} bytes)`,
              uploadDuration: `${attachmentDurationSeconds} seconds (${attachmentDuration}ms)`,
              fileUrl,
              timestamp: new Date().toISOString(),
            },
          );

          attachments.push({
            url: fileUrl,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedAt: new Date(),
          });
        } catch (error) {
          const attachmentEndTime = Date.now();
          const attachmentDuration = attachmentEndTime - attachmentStartTime;
          console.error(
            `Attachment ${i + 1}/${files.attachments.length} upload failed:`,
            {
              fileName: file.originalname,
              fileSize: `${fileSizeMB} MB (${file.size} bytes)`,
              uploadDuration: `${(attachmentDuration / 1000).toFixed(2)} seconds (${attachmentDuration}ms)`,
              error: error.message,
              timestamp: new Date().toISOString(),
            },
          );
          throw new BadRequestException(
            `Failed to upload attachment: ${error.message}`,
          );
        }
      }
      console.log(
        `All ${attachments.length} attachment(s) uploaded successfully`,
      );
    }

    const postCreationStartTime = Date.now();
    console.log('Creating video post in database:', {
      userId: req.user.userId,
      title: createVideoPostDto.title,
      videoUrl: finalVideoUrl,
      status: createVideoPostDto.isDraft
        ? PostStatus.DRAFT
        : PostStatus.PUBLISHED,
      attachmentsCount: attachments.length,
      timestamp: new Date().toISOString(),
    });

    const post = await this.postsService.createVideoPost(
      req.user.userId,
      {
        ...createVideoPostDto,
        videoUrl: finalVideoUrl,
        status: createVideoPostDto.isDraft
          ? PostStatus.DRAFT
          : PostStatus.PUBLISHED,
      },
      attachments,
    );

    const postCreationEndTime = Date.now();
    const postCreationDuration = postCreationEndTime - postCreationStartTime;
    console.log('Video post created successfully:', {
      postId: post._id?.toString() || post.id,
      title: post.title,
      videoUrl: post.videoUrl,
      status: post.status,
      creationDuration: `${(postCreationDuration / 1000).toFixed(2)} seconds (${postCreationDuration}ms)`,
      timestamp: new Date().toISOString(),
    });

    return post;
  }

  @Put('video/:id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('attachments', 10))
  async updateVideoPost(
    @Request() req,
    @Param('id') id: string,
    @Body() updateVideoPostDto: UpdateVideoPostDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    ////console.log(updateVideoPostDto);
    const post = await this.postsService.findById(id);
    if (!post || post.creator._id.toString() !== req.user.userId) {
      throw new NotFoundException('Post not found or unauthorized');
    }
    const newAttachments = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const fileUrl = await this.s3Service.uploadFile(
            file,
            'video-post-attachments',
            'patreon-clone-assets',
          );
          newAttachments.push({
            url: fileUrl,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedAt: new Date(),
          });
        } catch (error) {
          console.error(`Failed to upload file ${file.originalname}:`, error);
        }
      }
    }
    let existingAttachments = [];
    if (post.attachments && post.attachments.length > 0) {
      if (updateVideoPostDto.existingAttachments) {
        existingAttachments = post.attachments.filter((attachment) =>
          updateVideoPostDto.existingAttachments.includes(
            attachment._id.toString() || '',
          ),
        );
      }
    }
    const videoInfo = updateVideoPostDto.videoUrl
      ? this.postsService.extractVideoInfo(updateVideoPostDto.videoUrl)
      : {
          platform: post.videoProvider,
          videoId: post.videoId,
          thumbnailUrl: post.thumbnailUrl,
        };
    const attachments = [...existingAttachments, ...newAttachments];
    const updatedPost = await this.postsService.updatePost(id, {
      title: updateVideoPostDto.title,
      description: updateVideoPostDto.description,
      videoUrl: updateVideoPostDto.videoUrl || post.videoUrl,
      videoId: videoInfo.videoId,
      videoProvider: videoInfo.platform,
      thumbnailUrl: videoInfo.thumbnailUrl,
      tags: updateVideoPostDto.tags,
      collections: updateVideoPostDto.collections,
      status: updateVideoPostDto.isDraft
        ? PostStatus.DRAFT
        : PostStatus.PUBLISHED,
      tierAccess: updateVideoPostDto.tierAccess || [],
      attachments,
    });
    return updatedPost;
  }
  @PostMethod('audio')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audioFile', maxCount: 1 },
      { name: 'attachments', maxCount: 10 },
    ]),
  )
  async createAudioPost(
    @Request() req,
    @Body() createAudioPostDto: CreateAudioPostDto,
    @UploadedFiles()
    files: {
      audioFile?: Express.Multer.File[];
      attachments?: Express.Multer.File[];
    },
  ) {
    if (!files.audioFile?.[0]) {
      throw new BadRequestException('Audio file is required');
    }
    const audioFile = files.audioFile[0];
    if (!audioFile.mimetype.startsWith('audio/')) {
      throw new BadRequestException('Invalid audio file format');
    }
    let audioFileUrl: string;
    try {
      audioFileUrl = await this.s3Service.uploadFile(
        audioFile,
        'audio',
        'patreon-clone-assets',
      );
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload audio file: ${error.message}`,
      );
    }
    const attachments = [];
    if (files.attachments?.length > 0) {
      for (const file of files.attachments) {
        try {
          const fileUrl = await this.s3Service.uploadFile(
            file,
            'audio-post-attachments',
            'patreon-clone-assets',
          );
          attachments.push({
            url: fileUrl,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedAt: new Date(),
          });
        } catch (error) {
          console.error(
            `Failed to upload attachment ${file.originalname}:`,
            error,
          );
        }
      }
    }
    return this.postsService.createAudioPost(
      req.user.userId,
      {
        ...createAudioPostDto,
        status: createAudioPostDto.isDraft
          ? PostStatus.DRAFT
          : PostStatus.PUBLISHED,
      },
      audioFileUrl,
      attachments,
    );
  }

  @Put('audio/:id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audioFile', maxCount: 1 },
      { name: 'attachments', maxCount: 10 },
    ]),
  )
  async updateAudioPost(
    @Request() req,
    @Param('id') id: string,
    @Body() updateAudioPostDto: UpdateAudioPostDto,
    @UploadedFiles()
    files: {
      audioFile?: Express.Multer.File[];
      attachments?: Express.Multer.File[];
    },
  ) {
    const post = await this.postsService.findById(id);
    if (!post || post.creator._id.toString() !== req.user.userId) {
      throw new NotFoundException('Post not found or unauthorized');
    }
    let audioFileUrl: string | undefined = undefined;
    if (files.audioFile?.[0]) {
      const audioFile = files.audioFile[0];
      if (!audioFile.mimetype.startsWith('audio/')) {
        throw new BadRequestException('Invalid audio file format');
      }
      try {
        audioFileUrl = await this.s3Service.uploadFile(
          audioFile,
          'audio',
          'patreon-clone-assets',
        );
      } catch (error) {
        throw new BadRequestException(
          `Failed to upload audio file: ${error.message}`,
        );
      }
    }
    if (!audioFileUrl) {
      audioFileUrl =
        updateAudioPostDto.existingAudioFileUrl || post.mediaUrls?.[0];
    }
    const newAttachments = [];
    if (files.attachments?.length > 0) {
      for (const file of files.attachments) {
        try {
          const fileUrl = await this.s3Service.uploadFile(
            file,
            'audio-post-attachments',
            'patreon-clone-assets',
          );
          newAttachments.push({
            url: fileUrl,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedAt: new Date(),
          });
        } catch (error) {
          console.error(
            `Failed to upload attachment ${file.originalname}:`,
            error,
          );
        }
      }
    }
    let existingAttachments = [];
    if (post.attachments && post.attachments.length > 0) {
      if (updateAudioPostDto.existingAttachments) {
        existingAttachments = post.attachments.filter((attachment) =>
          updateAudioPostDto.existingAttachments.includes(
            attachment._id.toString() || '',
          ),
        );
      }
    }
    const attachments = [...existingAttachments, ...newAttachments];
    const updatedPost = await this.postsService.updatePost(id, {
      title: updateAudioPostDto.title,
      description: updateAudioPostDto.description,
      mediaUrls: [audioFileUrl],
      tags: updateAudioPostDto.tags,
      collections: updateAudioPostDto.collections,
      status: updateAudioPostDto.isDraft
        ? PostStatus.DRAFT
        : PostStatus.PUBLISHED,
      tierAccess: updateAudioPostDto.tierAccess || [],
      attachments,
    });
    return updatedPost;
  }

  @PostMethod('image')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 10 },
        { name: 'attachments', maxCount: 10 },
      ],
      {
        limits: {
          fileSize: 10 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
          if (
            file.fieldname === 'images' &&
            !file.mimetype.startsWith('image/')
          ) {
            return cb(new BadRequestException('Invalid image format'), false);
          }
          cb(null, true);
        },
      },
    ),
  )
  async createImagePost(
    @Request() req,
    @Body() createImagePostDto: CreateImagePostDto,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      attachments?: Express.Multer.File[];
    },
  ) {
    if (!files?.images?.length) {
      throw new BadRequestException('At least one image is required');
    }

    const firstImage = files.images[0];
    let blurredThumbnailUrl = '';

    try {
      const blurredImageBuffer = await sharp(firstImage.buffer)
        .blur(20)
        .toBuffer();

      const blurredImageFile: Express.Multer.File = {
        ...firstImage,
        buffer: blurredImageBuffer,
        originalname: `thumbnail-blurred-${firstImage.originalname}`,
      };

      blurredThumbnailUrl = await this.s3Service.uploadFile(
        blurredImageFile,
        'images/thumbnails',
        'patreon-clone-assets',
      );
    } catch (error) {
      console.error('Failed to create or upload blurred thumbnail:', error);
    }

    const imageUrls = [];
    for (const image of files.images) {
      try {
        const imageUrl = await this.s3Service.uploadFile(
          image,
          'images',
          'patreon-clone-assets',
        );
        imageUrls.push(imageUrl);
      } catch (error) {
        console.error(`Failed to upload image ${image.originalname}:`, error);
        throw new BadRequestException(
          `Failed to upload image: ${error.message}`,
        );
      }
    }

    const attachments = [];
    if (files.attachments?.length) {
      for (const file of files.attachments) {
        try {
          const fileUrl = await this.s3Service.uploadFile(
            file,
            'image-post-attachments',
            'patreon-clone-assets',
          );
          attachments.push({
            url: fileUrl,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedAt: new Date(),
          });
        } catch (error) {
          console.error(
            `Failed to upload attachment ${file.originalname}:`,
            error,
          );
        }
      }
    }

    return this.postsService.createImagePost(
      req.user.userId,
      {
        ...createImagePostDto,
        status: createImagePostDto.isDraft
          ? PostStatus.DRAFT
          : PostStatus.PUBLISHED,
        thumbnailUrl: blurredThumbnailUrl || imageUrls[0],
      },
      imageUrls,
      attachments,
    );
  }

  @Put('image/:id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 10 },
        { name: 'attachments', maxCount: 10 },
      ],
      {
        limits: {
          fileSize: 10 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
          if (
            file.fieldname === 'images' &&
            !file.mimetype.startsWith('image/')
          ) {
            return cb(new BadRequestException('Invalid image format'), false);
          }
          cb(null, true);
        },
      },
    ),
  )
  async updateImagePost(
    @Request() req,
    @Param('id') id: string,
    @Body() updateImagePostDto: UpdateImagePostDto,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      attachments?: Express.Multer.File[];
    },
  ) {
    const post = await this.postsService.findById(id);
    if (!post || post.creator._id.toString() !== req.user.userId) {
      throw new NotFoundException('Post not found or unauthorized');
    }
    const newImageUrls = [];
    if (files.images?.length) {
      for (const image of files.images) {
        try {
          const imageUrl = await this.s3Service.uploadFile(
            image,
            'images',
            'patreon-clone-assets',
          );
          newImageUrls.push(imageUrl);
        } catch (error) {
          console.error(`Failed to upload image ${image.originalname}:`, error);
        }
      }
    }
    let existingImageUrls = [];
    if (post.mediaUrls && post.mediaUrls.length > 0) {
      if (updateImagePostDto.existingImages) {
        existingImageUrls = post.mediaUrls.filter((url) =>
          updateImagePostDto.existingImages.includes(url),
        );
      }
    }
    const newAttachments = [];
    if (files.attachments?.length) {
      for (const file of files.attachments) {
        try {
          const fileUrl = await this.s3Service.uploadFile(
            file,
            'image-post-attachments',
            'patreon-clone-assets',
          );
          newAttachments.push({
            url: fileUrl,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedAt: new Date(),
          });
        } catch (error) {
          console.error(
            `Failed to upload attachment ${file.originalname}:`,
            error,
          );
        }
      }
    }
    let existingAttachments = [];
    if (post.attachments && post.attachments.length > 0) {
      if (updateImagePostDto.existingAttachments) {
        existingAttachments = post.attachments.filter((attachment) =>
          updateImagePostDto.existingAttachments.includes(
            attachment._id.toString() || '',
          ),
        );
      }
    }
    const imageUrls = [...existingImageUrls, ...newImageUrls];
    const attachments = [...existingAttachments, ...newAttachments];
    if (imageUrls.length === 0) {
      throw new BadRequestException('At least one image is required');
    }
    const updatedPost = await this.postsService.updatePost(id, {
      title: updateImagePostDto.title,
      description: updateImagePostDto.description,
      mediaUrls: imageUrls,
      tags: updateImagePostDto.tags,
      collections: updateImagePostDto.collections,
      status: updateImagePostDto.isDraft
        ? PostStatus.DRAFT
        : PostStatus.PUBLISHED,
      tierAccess: updateImagePostDto.tierAccess || [],
      attachments,
    });
    return updatedPost;
  }

  @PostMethod('link')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FilesInterceptor('attachments', 10, {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async createLinkPost(
    @Request() req,
    @Body() createLinkPostDto: CreateLinkPostDto,
    @UploadedFiles() attachmentFiles: Express.Multer.File[] = [],
  ) {
    const attachments = [];
    if (attachmentFiles.length > 0) {
      for (const file of attachmentFiles) {
        try {
          const fileUrl = await this.s3Service.uploadFile(
            file,
            'link-post-attachments',
            'patreon-clone-assets',
          );
          attachments.push({
            url: fileUrl,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedAt: new Date(),
          });
        } catch (error) {
          console.error(
            `Failed to upload attachment ${file.originalname}:`,
            error,
          );
        }
      }
    }
    try {
      return this.postsService.createLinkPost(
        req.user.userId,
        {
          ...createLinkPostDto,
          status: createLinkPostDto.isDraft
            ? PostStatus.DRAFT
            : PostStatus.PUBLISHED,
        },
        attachments,
      );
    } catch (error) {
      throw new BadRequestException(
        `Failed to create link post: ${error.message}`,
      );
    }
  }

  @Put('link/:id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FilesInterceptor('attachments', 10, {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async updateLinkPost(
    @Request() req,
    @Param('id') id: string,
    @Body() updateLinkPostDto: UpdateLinkPostDto,
    @UploadedFiles() attachmentFiles: Express.Multer.File[] = [],
  ) {
    const post = await this.postsService.findById(id);
    if (!post || post.creator._id.toString() !== req.user.userId) {
      throw new NotFoundException('Post not found or unauthorized');
    }
    const newAttachments = [];
    if (attachmentFiles.length > 0) {
      for (const file of attachmentFiles) {
        try {
          const fileUrl = await this.s3Service.uploadFile(
            file,
            'link-post-attachments',
            'patreon-clone-assets',
          );
          newAttachments.push({
            url: fileUrl,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedAt: new Date(),
          });
        } catch (error) {
          console.error(
            `Failed to upload attachment ${file.originalname}:`,
            error,
          );
        }
      }
    }
    let existingAttachments = [];
    if (post.attachments && post.attachments.length > 0) {
      if (updateLinkPostDto.existingAttachments) {
        existingAttachments = post.attachments.filter((attachment) =>
          updateLinkPostDto.existingAttachments.includes(
            attachment._id.toString() || '',
          ),
        );
      }
    }
    const attachments = [...existingAttachments, ...newAttachments];
    const updatedPost = await this.postsService.updatePost(id, {
      title: updateLinkPostDto.title,
      description: updateLinkPostDto.description,
      linkUrl: updateLinkPostDto.linkUrl,
      tags: updateLinkPostDto.tags,
      collections: updateLinkPostDto.collections,
      status: updateLinkPostDto.isDraft
        ? PostStatus.DRAFT
        : PostStatus.PUBLISHED,
      tierAccess: updateLinkPostDto.tierAccess || [],
      attachments,
    });
    return updatedPost;
  }

  private formatDate(date: Date): string {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const d = new Date(date);
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  private getReadablePostType(type: string): string {
    const typeMap = {
      [PostType.TEXT]: 'Text',
      [PostType.IMAGE]: 'Picture',
      [PostType.AUDIO]: 'Audio',
      [PostType.VIDEO]: 'Video',
      [PostType.LINK]: 'Link',
    };
    return typeMap[type] || type;
  }

  private getThumbnailForPost(post: Post): string {
    if (post.type === PostType.IMAGE && post.mediaUrls?.length) {
      return post.mediaUrls[0];
    }

    if (post.type === PostType.VIDEO && post.thumbnailUrl) {
      return post.thumbnailUrl;
    }

    return post.thumbnailUrl || '/default-thumbnail.png';
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deletePost(@Request() req, @Param('id') id: string) {
    const post = await this.postsService.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.creator._id.toString() !== req.user.userId) {
      throw new UnauthorizedException('You can only delete your own posts');
    }
    const deletedPost = await this.postsService.softDelete(id);
    return { message: 'Post deleted successfully', id: deletedPost._id };
  }

  @Delete('permanent/:id')
  @UseGuards(AuthGuard('jwt'))
  async permanentDeletePost(@Request() req, @Param('id') id: string) {
    const post = await this.postsService.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.creator._id.toString() !== req.user.userId) {
      throw new UnauthorizedException('You can only delete your own posts');
    }
    if (post.attachments && post.attachments.length > 0) {
      for (const attachment of post.attachments) {
        try {
          await this.s3Service.deleteFile(
            attachment.url,
            this.getBucketNameForPostType(post.type),
          );
        } catch (error) {
          console.error(
            `Failed to delete attachment ${attachment.url}:`,
            error,
          );
        }
      }
    }
    if (post.mediaUrls && post.mediaUrls.length > 0) {
      for (const mediaUrl of post.mediaUrls) {
        try {
          await this.s3Service.deleteFile(
            mediaUrl,
            this.getBucketNameForPostType(post.type),
          );
        } catch (error) {
          console.error(`Failed to delete media ${mediaUrl}:`, error);
        }
      }
    }
    await this.postsService.permanentDelete(id);
    return { message: 'Post permanently deleted', id };
  }

  private getBucketNameForPostType(type: PostType): string {
    const bucketMap = {
      [PostType.TEXT]: 'patreon-clone-assets',
      [PostType.IMAGE]: 'patreon-clone-assets',
      [PostType.AUDIO]: 'patreon-clone-assets',
      [PostType.VIDEO]: 'patreon-clone-assets',
      [PostType.LINK]: 'patreon-clone-assets',
    };
    return bucketMap[type] || 'patreon-clone-assets';
  }

  @PostMethod(':id/publish')
  @UseGuards(AuthGuard('jwt'))
  async publishPost(@Request() req, @Param('id') id: string) {
    const post = await this.postsService.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.creator._id.toString() !== req.user.userId) {
      throw new UnauthorizedException('You can only publish your own posts');
    }

    if (post.status === PostStatus.PUBLISHED) {
      return { message: 'Post is already published', id: post._id };
    }

    const updatedPost = await this.postsService.updatePost(id, {
      status: PostStatus.PUBLISHED,
    });

    const tierAccessDetails = await Promise.all(
      (updatedPost.tierAccess || []).map(async (memberId) => {
        try {
          const membership =
            await this.membershipsService.getMembershipById(memberId);
          return {
            id: memberId,
            name: membership.name,
          };
        } catch (error) {
          ////console.log(error);
          return {
            id: memberId,
            name: 'Unknown Tier',
          };
        }
      }),
    );

    try {
      await this.notificationGenerator.generateNewPostNotification(
        req.user.userId,
        updatedPost._id.toString(),
        updatedPost.title,
      );
    } catch (error) {
      console.error('Failed to generate post notifications:', error);
    }

    return {
      message: 'Post published successfully',
      post: {
        ...updatedPost.toObject(),
        tierAccess: tierAccessDetails,
      },
    };
  }

  @PostMethod(':id/unpublish')
  @UseGuards(AuthGuard('jwt'))
  async unpublishPost(@Request() req, @Param('id') id: string) {
    const post = await this.postsService.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.creator._id.toString() !== req.user.userId) {
      throw new UnauthorizedException('You can only unpublish your own posts');
    }

    if (post.status === PostStatus.DRAFT) {
      return { message: 'Post is already unpublished', id: post._id };
    }

    const updatedPost = await this.postsService.updatePost(id, {
      status: PostStatus.DRAFT,
    });

    const tierAccessDetails = await Promise.all(
      (updatedPost.tierAccess || []).map(async (memberId) => {
        try {
          const membership =
            await this.membershipsService.getMembershipById(memberId);
          return {
            id: memberId,
            name: membership.name,
          };
        } catch (error) {
          ////console.log(error);
          return {
            id: memberId,
            name: 'Unknown Tier',
          };
        }
      }),
    );

    return {
      message: 'Post unpublished and moved to drafts',
      post: {
        ...updatedPost.toObject(),
        tierAccess: tierAccessDetails,
      },
    };
  }

  @PostMethod(':id/like')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async likePost(@Request() req, @Param('id') postId: string) {
    try {
      const userId = req.user.userId;
      const post = await this.postsService.findById(postId);

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      const alreadyLiked = await this.postsService.hasUserLikedPost(
        userId,
        postId,
      );
      if (alreadyLiked) {
        return { message: 'Post already liked', liked: true };
      }

      await this.postsService.likePost(userId, postId);

      if (userId !== post.creator._id.toString()) {
        await this.notificationGenerator.generateLikeNotification(
          postId,
          userId,
          post.creator._id.toString(),
        );
      }

      return { message: 'Post liked successfully', liked: true };
    } catch (error) {
      throw new BadRequestException(`Failed to like post: ${error.message}`);
    }
  }

  @Delete(':id/like')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async unlikePost(@Request() req, @Param('id') postId: string) {
    try {
      const userId = req.user.userId;
      const post = await this.postsService.findById(postId);

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      const hasLiked = await this.postsService.hasUserLikedPost(userId, postId);
      if (!hasLiked) {
        return { message: 'Post not liked', liked: false };
      }

      await this.postsService.unlikePost(userId, postId);

      return { message: 'Post unliked successfully', liked: false };
    } catch (error) {
      throw new BadRequestException(`Failed to unlike post: ${error.message}`);
    }
  }

  @PostMethod(':id/comments')
  @UseGuards(AuthGuard('jwt'))
  async addComment(
    @Request() req,
    @Param('id') postId: string,
    @Body() commentData: { text: string; parentId?: string },
  ) {
    try {
      const userId = req.user.userId;
      const comment = await this.postsService.addComment(
        userId,
        postId,
        commentData.text,
        commentData.parentId,
      );

      const response = {
        id: comment._id.toString(),
        text: comment.text,
        user: {
          id: userId,
          displayName: req.user.displayName || 'User',
          profilePicture: req.user.profilePicture,
        },
        createdAt: comment.createdAt,
        parentId: comment.parentComment?.toString(),
        likesCount: 0,
        isLiked: false,
      };

      if (commentData.parentId) {
        try {
          const post = await this.postsService.findById(postId);
          if (post) {
            const parentComment = post.comments?.find(
              (c) => c._id.toString() === commentData.parentId,
            );

            if (parentComment && parentComment.user) {
              await this.notificationGenerator.generateCommentReplyNotification(
                postId,
                comment._id.toString(),
                userId,
                parentComment.user.toString(),
                commentData.text,
              );
            }
          }
        } catch (error) {
          console.error(
            'Failed to generate comment reply notification:',
            error,
          );
        }
      } else {
        try {
          const post = await this.postsService.findById(postId);
          console.log('GENERATING COMMENT NOTIFICATION');
          console.log(
            post && post.creator && post.creator._id.toString() !== userId,
          );
          if (post && post.creator && post.creator._id.toString() !== userId) {
            await this.notificationGenerator.generateCommentNotification(
              postId,
              userId,
              post.creator._id.toString(),
              commentData.text,
            );
          }
        } catch (error) {
          console.error('Failed to generate comment notification:', error);
        }
      }

      return response;
    } catch (error) {
      throw new BadRequestException(`Failed to add comment: ${error.message}`);
    }
  }

  @Get(':id/comments')
  async getPostComments(
    @Param('id') postId: string,
    @Query() query: CommentsQueryDto,
    @Request() req,
  ) {
    try {
      const userId = req.user?.userId;

      const allComments = await this.postsService.getPostComments(
        postId,
        userId,
      );

      ////console.log(`Found ${allComments.length} comments for post ${postId}`);

      const startIndex = (query.page - 1) * query.limit;
      const endIndex = startIndex + query.limit;
      const paginatedComments = allComments.slice(startIndex, endIndex);

      return {
        comments: paginatedComments,
        pagination: {
          total: allComments.length,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(allComments.length / query.limit),
        },
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw new BadRequestException(
        `Failed to fetch comments: ${error.message}`,
      );
    }
  }

  @Get(':id/likes')
  async getPostLikes(
    @Param('id') postId: string,
    @Query() query: CommentsQueryDto,
  ) {
    try {
      const allLikes = await this.postsService.getPostLikes(postId);

      ////console.log(`Found ${allLikes.length} likes for post ${postId}`);

      // const startIndex = (query.page - 1) * query.limit;
      // const endIndex = startIndex + query.limit;
      // const paginatedLikes = allLikes.slice(startIndex, endIndex);

      return {
        likes: allLikes,
        pagination: {
          total: allLikes.length,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(allLikes.length / query.limit),
        },
      };
    } catch (error) {
      console.error('Error fetching likes:', error);
      throw new BadRequestException(`Failed to fetch likes: ${error.message}`);
    }
  }

  @Get(':id/liked')
  @UseGuards(AuthGuard('jwt'))
  async hasUserLikedPost(@Param('id') postId: string, @Request() req) {
    try {
      const userId = req.user.userId;
      const hasLiked = await this.postsService.hasUserLikedPost(userId, postId);

      return {
        liked: hasLiked,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to check like status: ${error.message}`,
      );
    }
  }

  private transformPostForFrontend(post: any, isRestricted: boolean): any {
    return {
      id: post._id.toString(),
      title: post.title,
      publishDate: this.formatDate(post.createdAt),
      type: this.getPostType(post.type).toLowerCase(),
      postType: this.getReadablePostType(post.type),
      thumbnail: this.getThumbnailForPost(post),
      mediaUrl: isRestricted ? undefined : this.getMediaUrlForPost(post),
      description:
        post.description ||
        post.previewText ||
        (post.textContent ? post.textContent.substring(0, 150) : ''),
      body: isRestricted ? '' : post.textContent || post.description || '',
      tierAccess: post.tierAccess || [],
      isLocked: isRestricted,
      // Add dummy data for now, these could be real in future
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 30),
      createdAt: post.createdAt.toISOString(),
    };
  }
  private getPostType(type: PostType): string {
    switch (type) {
      case PostType.TEXT:
        return 'text';
      case PostType.IMAGE:
        return 'image';
      case PostType.VIDEO:
        return 'video';
      case PostType.AUDIO:
        return 'audio';
      case PostType.LINK:
        return 'link';
      default:
        return 'text';
    }
  }

  private getMediaUrlForPost(post: Post): string | undefined {
    switch (post.type) {
      case PostType.IMAGE:
        return post.mediaUrls && post.mediaUrls.length > 0
          ? post.mediaUrls[0]
          : undefined;
      case PostType.VIDEO:
        return post.videoUrl;
      case PostType.AUDIO:
        return post.mediaUrls && post.mediaUrls.length > 0
          ? post.mediaUrls[0]
          : undefined;
      default:
        return undefined;
    }
  }

  @PostMethod(':postId/comments/:commentId/like')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async likeComment(
    @Request() req,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    ////console.log('Like comment');
    ////console.log({ postId, commentId });
    try {
      const userId = req.user.userId;
      return await this.postsService.likeComment(userId, postId, commentId);
    } catch (error) {
      throw new BadRequestException(`Failed to like comment: ${error.message}`);
    }
  }

  @Delete(':postId/comments/:commentId/like')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async unlikeComment(
    @Request() req,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    try {
      const userId = req.user.userId;
      return await this.postsService.unlikeComment(userId, postId, commentId);
    } catch (error) {
      throw new BadRequestException(
        `Failed to unlike comment: ${error.message}`,
      );
    }
  }

  @Get(':postId/comments/:commentId/likes')
  @UseGuards(AuthGuard('jwt'))
  async getCommentLikes(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Query() query: CommentsQueryDto,
  ) {
    try {
      const likes = await this.postsService.getCommentLikes(postId, commentId);

      const startIndex = (query.page - 1) * query.limit;
      const endIndex = startIndex + query.limit;
      const paginatedLikes = likes.slice(startIndex, endIndex);

      return {
        likes: paginatedLikes,
        pagination: {
          total: likes.length,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(likes.length / query.limit),
        },
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch comment likes: ${error.message}`,
      );
    }
  }

  @Get(':postId/comments/:commentId/liked')
  @UseGuards(AuthGuard('jwt'))
  async hasUserLikedComment(
    @Request() req,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    try {
      const userId = req.user.userId;
      const hasLiked = await this.postsService.isCommentLiked(
        userId,
        postId,
        commentId,
      );

      return {
        liked: hasLiked,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to check like status: ${error.message}`,
      );
    }
  }

  @Delete(':postId/comments/:commentId')
  @UseGuards(AuthGuard('jwt'))
  async deleteComment(
    @Request() req,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    try {
      const userId = req.user.userId;
      const result = await this.postsService.deleteComment(
        userId,
        postId,
        commentId,
      );

      return {
        success: result.success,
        message: `Successfully deleted ${result.deletedCount} comment(s)`,
        deletedCount: result.deletedCount,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to delete comment: ${error.message}`,
      );
    }
  }

  @Put(':postId/comments/:commentId')
  @UseGuards(AuthGuard('jwt'))
  async editComment(
    @Request() req,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() body: { text: string },
  ) {
    try {
      const userId = req.user.userId;
      const updatedComment = await this.postsService.editComment(
        userId,
        postId,
        commentId,
        body.text,
      );

      return updatedComment;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(`Failed to edit comment: ${error.message}`);
    }
  }
}
