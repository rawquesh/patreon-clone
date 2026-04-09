import {
  Controller,
  Post,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { S3Service } from '../s3/s3.service';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { business } from '@/config';

@Controller('chat-uploads')
@UseGuards(AuthGuard('jwt'))
export class ChatUploadsController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly chatService: ChatService,
  ) {}

  @Post(':chatId')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadAttachment(
    @Request() req,
    @Param('chatId') chatId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const hasAccess = await this.chatService.checkChatAccess(
        req.user.userId,
        chatId,
      );
      if (!hasAccess) {
        throw new BadRequestException('You do not have access to this chat');
      }

      const fileUrl = await this.s3Service.uploadFile(
        file,
        `chats/${chatId}/${new Date().toISOString()}-${file.originalname}`,
        business.s3.defaultBucket,
      );

      return {
        success: true,
        fileUrl,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload attachment: ${error.message}`,
      );
    }
  }
}
