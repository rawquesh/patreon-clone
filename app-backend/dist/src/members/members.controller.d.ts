import { MembersService } from './members.service';
import { Response } from 'express';
import { GetMembersDto, MembersResponseDto } from './members.dto';
export declare class MembersController {
    private readonly membersService;
    constructor(membersService: MembersService);
    getMembers(req: any, queryParams: GetMembersDto): Promise<MembersResponseDto>;
    exportMembersToCSV(req: any, queryParams: GetMembersDto, res: Response): Promise<Response<any, Record<string, any>>>;
}
