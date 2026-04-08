import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { S3Service } from './s3.service';

class CreateVideoUploadSessionDto {
  fileName: string;
  fileType: string;
  fileSize: number;
  parts?: number;
}

class CompleteVideoUploadDto {
  uploadId: string;
  key: string;
  bucket: string;
  parts: { partNumber: number; eTag: string }[];
}

@Controller('s3')
@UseGuards(AuthGuard('jwt'))
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('videos/upload-session')
  async createVideoUploadSession(
    @Body() body: CreateVideoUploadSessionDto,
  ): Promise<{
    uploadId: string;
    key: string;
    bucket: string;
    partSize: number;
    presignedUrls: { partNumber: number; url: string }[];
  }> {
    console.log(body);
    const { fileName, fileType, fileSize } = body;

    if (!fileName || !fileType || !fileSize) {
      throw new BadRequestException(
        'fileName, fileType and fileSize are required',
      );
    }

    try {
      const result = await this.s3Service.createMultipartUploadSession({
        fileName,
        fileType,
        fileSize,
        bucket: 'patreon-clone-assets',
        folder: 'videos',
      });
      console.log(result);
      return result;
    } catch (error) {
      throw new BadRequestException(
        `Failed to create upload session: ${error.message}`,
      );
    }
  }

  @Post('videos/complete-upload')
  async completeVideoUpload(@Body() body: CompleteVideoUploadDto): Promise<{
    videoUrl: string;
    message: string;
  }> {
    console.log({ body });
    const { uploadId, key, parts } = body;

    if (!uploadId || !key || !parts || parts.length === 0) {
      throw new BadRequestException(
        'uploadId, key, bucket, and parts array are required',
      );
    }

    const bucket = 'patreon-clone-assets';

    try {
      const videoUrl = await this.s3Service.completeMultipartUpload({
        uploadId,
        key,
        bucket,
        parts,
      });

      return {
        videoUrl,
        message: 'Video upload completed successfully',
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        `Failed to complete upload: ${error.message}`,
      );
    }
  }
}
