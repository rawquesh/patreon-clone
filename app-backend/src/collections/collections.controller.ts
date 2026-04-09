import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Put,
  NotFoundException,
  ForbiddenException,
  Delete,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CollectionsService } from './collections.service';
import { S3Service } from '../s3/s3.service';
import { business } from '@/config';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  AddPostToCollectionDto,
  RemovePostFromCollectionDto,
  GetCollectionPostsDto,
} from './collections.dto';
import { OptionalJwtAuthGuard } from '@/auth/optional-auth-guard';

@Controller('collections')
export class CollectionsController {
  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getMyCollections(@Request() req) {
    try {
      const collections = await this.collectionsService.findByCreator(
        req.user.userId,
      );

      return {
        collections,
        total: collections.length,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch collections: ${error.message}`,
      );
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('coverImage', {
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async updateCollection(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    try {
      const collection = await this.collectionsService.findById(id);

      if (!collection) {
        throw new NotFoundException('Collection not found');
      }

      if (collection.creator._id.toString() !== req.user.userId) {
        throw new ForbiddenException(
          'You can only update your own collections',
        );
      }

      let coverImageUrl = collection.coverImage;

      if (coverImage) {
        try {
          coverImageUrl = await this.s3Service.uploadFile(
            coverImage,
            'collections',
            business.s3.defaultBucket,
          );

          // Delete old cover image if it exists and is different
          if (
            collection.coverImage &&
            collection.coverImage !== coverImageUrl
          ) {
            try {
              await this.s3Service.deleteFile(
                collection.coverImage,
                'patreon-clone-collections',
              );
            } catch (error) {
              console.error('Failed to delete old cover image:', error);
            }
          }
        } catch (error) {
          throw new BadRequestException(
            `Failed to upload cover image: ${error.message}`,
          );
        }
      }

      return this.collectionsService.update(req.user.userId, id, {
        ...updateCollectionDto,
        coverImage: coverImageUrl,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update collection: ${error.message}`,
      );
    }
  }
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteCollection(@Request() req, @Param('id') id: string) {
    try {
      const collection = await this.collectionsService.findById(id);

      if (!collection) {
        throw new NotFoundException('Collection not found');
      }

      if (collection.creator._id.toString() !== req.user.userId) {
        throw new ForbiddenException(
          'You can only delete your own collections',
        );
      }

      // if (collection.coverImage) {
      //   try {
      //     await this.s3Service.deleteFile(
      //       collection.coverImage,
      //       'patreon-clone-collections',
      //     );
      //   } catch (s3Error) {
      //     console.error(
      //       `Failed to delete S3 object for collection ${id}:`,
      //       s3Error,
      //     );
      //   }
      // }

      await this.collectionsService.delete(id, req.user.userId);

      return { success: true, message: 'Collection deleted successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to delete collection: ${error.message}`,
      );
    }
  }

  @Get('by-creator/:creatorId')
  async getCollectionsByCreator(@Param('creatorId') creatorId: string) {
    try {
      const collections =
        await this.collectionsService.findByCreator(creatorId);

      return {
        collections,
        total: collections.length,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch collections: ${error.message}`,
      );
    }
  }

  @Get('creator/:creatorId')
  async getCreatorCollections(@Param('creatorId') creatorId: string) {
    try {
      const collections =
        await this.collectionsService.findByCreator(creatorId);

      const formattedCollections = collections.map((collection) => ({
        id: collection._id.toString(),
        title: collection.title,
        description: collection.description || '',
        coverImage: collection.coverImage,
        postCount: collection.postCount,
        createdAt: collection.createdAt,
      }));

      return {
        collections: formattedCollections,
        total: collections.length,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch creator collections: ${error.message}`,
      );
    }
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('coverImage', {
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @Request() req,
    @Body() createCollectionDto: CreateCollectionDto,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    let coverImageUrl: string | undefined;

    if (coverImage) {
      try {
        coverImageUrl = await this.s3Service.uploadFile(
          coverImage,
          'collections',
          business.s3.defaultBucket,
        );
      } catch (error) {
        throw new BadRequestException(
          `Failed to upload cover image: ${error.message}`,
        );
      }
    }

    return this.collectionsService.create(
      req.user.userId,
      createCollectionDto,
      coverImageUrl,
    );
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getCollectionById(@Request() req, @Param('id') id: string) {
    try {
      // Pass the user ID for access control checking
      const userId = req.user?.userId;

      const collection = await this.collectionsService.findById(id, userId);

      if (!collection) {
        throw new NotFoundException('Collection not found');
      }

      return collection;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to fetch collection: ${error.message}`,
      );
    }
  }

  @Post(':id/posts')
  @UseGuards(AuthGuard('jwt'))
  async addPostToCollection(
    @Request() req,
    @Param('id') id: string,
    @Body() addPostDto: AddPostToCollectionDto,
  ) {
    try {
      const result = await this.collectionsService.addPostToCollection(
        req.user.userId,
        id,
        addPostDto.postId,
      );

      return {
        success: true,
        message: 'Post added to collection',
        collection: result,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to add post to collection: ${error.message}`,
      );
    }
  }

  @Delete(':id/posts')
  @UseGuards(AuthGuard('jwt'))
  async removePostFromCollection(
    @Request() req,
    @Param('id') id: string,
    @Body() removePostDto: RemovePostFromCollectionDto,
  ) {
    try {
      const result = await this.collectionsService.removePostFromCollection(
        req.user.userId,
        id,
        removePostDto.postId,
      );

      return {
        success: true,
        message: 'Post removed from collection',
        collection: result,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to remove post from collection: ${error.message}`,
      );
    }
  }

  @Get(':id/posts')
  async getCollectionPosts(
    @Request() req,
    @Param('id') id: string,
    @Query() queryParams: GetCollectionPostsDto,
  ) {
    try {
      // Pass user ID if available for access control checking
      const userId = req.user?.userId;

      const result = await this.collectionsService.getCollectionPosts(
        id,
        queryParams,
        userId,
      );

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to fetch collection posts: ${error.message}`,
      );
    }
  }
}
