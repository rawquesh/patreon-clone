import { S3Service } from '../s3/s3.service';
import { ChatService } from './chat.service';
export declare class ChatUploadsController {
    private readonly s3Service;
    private readonly chatService;
    constructor(s3Service: S3Service, chatService: ChatService);
    uploadAttachment(req: any, chatId: string, file: Express.Multer.File): Promise<{
        success: boolean;
        fileUrl: string;
        fileName: string;
        fileType: string;
        fileSize: number;
    }>;
}
