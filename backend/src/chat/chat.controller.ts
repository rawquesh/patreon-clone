import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Inject,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
  forwardRef,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import {
  CreateDirectChatDto,
  CreateGroupChatDto,
  GetMessagesQueryDto,
  GetMessageDatesQueryDto,
  MarkMessagesReadDto,
  MessageDto,
  SendMessageDto,
  UpdateGroupChatDto,
} from './chat.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatGateway } from './chat.gateway';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post('group')
  async createGroupChat(
    @Request() req,
    @Body(new ValidationPipe()) createChatDto: CreateGroupChatDto,
  ) {
    return this.chatService.createGroupChat(req.user.userId, createChatDto);
  }

  @Post('direct')
  async createDirectChat(
    @Request() req,
    @Body(new ValidationPipe()) createChatDto: CreateDirectChatDto,
  ) {
    return this.chatService.createDirectChat(req.user.userId, createChatDto);
  }

  @Get()
  async getUserChats(@Request() req) {
    return this.chatService.getUserChats(req.user.userId);
  }

  @Get(':id')
  async getChat(@Request() req, @Param('id') id: string) {
    return this.chatService.getChat(req.user.userId, id);
  }

  @Put(':id')
  async updateGroupChat(
    @Request() req,
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateChatDto: UpdateGroupChatDto,
  ) {
    return this.chatService.updateGroupChat(req.user.userId, id, updateChatDto);
  }

  @Delete(':id')
  async deleteChat(@Request() req, @Param('id') id: string) {
    return this.chatService.deleteChat(req.user.userId, id);
  }

  @Post(':id/messages')
  @UseInterceptors(
    FileInterceptor('attachment', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async sendMessage(
    @Request() req,
    @Param('id') chatId: string,
    @Body(new ValidationPipe()) sendMessageDtoBody: SendMessageDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType:
              /(jpg|jpeg|png|gif|pdf|doc|docx|txt|mp3|m4a|aac|mp4|mov|avi|webp)$/i,
          }),
        ],
        fileIsRequired: false,
        exceptionFactory: (error) => {
          if (error.includes('Expected a file')) {
            return new BadRequestException(
              'File upload failed: Unexpected error during file processing.',
            );
          }
          return new BadRequestException(`File validation failed: ${error}`);
        },
      }),
    )
    attachment?: Express.Multer.File,
  ): Promise<MessageDto> {
    if (!sendMessageDtoBody?.content && !attachment) {
      throw new BadRequestException(
        'Message content or attachment is required',
      );
    }

    const messageDto = await this.chatService.sendMessage(
      req.user.userId,
      chatId,
      sendMessageDtoBody,
      attachment,
    );

    if (messageDto) {
      this.chatGateway.broadcastNewMessage(chatId, messageDto);
    }

    return messageDto;
  }

  @Get(':id/messages')
  async getMessages(
    @Request() req,
    @Param('id') id: string,
    @Query(new ValidationPipe({ transform: true })) query: GetMessagesQueryDto,
  ) {
    return this.chatService.getMessages(req.user.userId, id, query);
  }

  @Get(':id/message-dates')
  async getMessageDates(
    @Request() req,
    @Param('id') id: string,
    @Query(new ValidationPipe({ transform: true }))
    query: GetMessageDatesQueryDto,
  ) {
    return this.chatService.getMessageDates(req.user.userId, id, query);
  }

  @Post(':id/read')
  async markMessagesAsRead(
    @Request() req,
    @Param('id') id: string,
    @Body(new ValidationPipe()) markReadDto: MarkMessagesReadDto,
  ) {
    return this.chatService.markMessagesAsRead(
      req.user.userId,
      id,
      markReadDto,
    );
  }

  @Post(':id/join')
  async joinChat(@Request() req, @Param('id') id: string) {
    return this.chatService.joinChat(req.user.userId, id);
  }

  @Post(':id/leave')
  async leaveChat(@Request() req, @Param('id') id: string) {
    return this.chatService.leaveChat(req.user.userId, id);
  }

  @Get('unread/count')
  async getTotalUnreadCount(@Request() req) {
    const count = await this.chatService.getTotalUnreadCount(req.user.userId);
    return { count };
  }
}
