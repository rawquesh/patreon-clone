"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const members_service_1 = require("./members.service");
const csv_writer_1 = require("csv-writer");
const members_dto_1 = require("./members.dto");
let MembersController = class MembersController {
    constructor(membersService) {
        this.membersService = membersService;
    }
    async getMembers(req, queryParams) {
        try {
            const userId = req.user.userId;
            if (!userId) {
                throw new common_1.BadRequestException('User not authenticated');
            }
            return await this.membersService.getMembers(userId, queryParams);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to fetch members: ${error.message}`);
        }
    }
    async exportMembersToCSV(req, queryParams, res) {
        try {
            const userId = req.user.userId;
            if (!userId) {
                throw new common_1.BadRequestException('User not authenticated');
            }
            const exportParams = {
                ...queryParams,
                page: 1,
                limit: 1000,
            };
            const { members } = await this.membersService.getMembers(userId, exportParams);
            if (!members || members.length === 0) {
                throw new common_1.NotFoundException('No members found matching the criteria');
            }
            const csvData = members.map((member) => ({
                id: member.id,
                name: member.name || 'N/A',
                email: member.email || 'N/A',
                tier: member.tier?.name || 'N/A',
                joinDate: member.joinDate
                    ? new Date(member.joinDate).toLocaleDateString()
                    : 'N/A',
                status: member.status,
                totalPaid: `$${member.totalPaid.toFixed(2)}`,
            }));
            const csvStringifier = (0, csv_writer_1.createObjectCsvStringifier)({
                header: [
                    { id: 'id', title: 'ID' },
                    { id: 'name', title: 'Name' },
                    { id: 'email', title: 'Email' },
                    { id: 'tier', title: 'Membership Tier' },
                    { id: 'joinDate', title: 'Join Date' },
                    { id: 'status', title: 'Status' },
                    { id: 'totalPaid', title: 'Total Paid' },
                ],
            });
            const csvString = csvStringifier.getHeaderString() +
                csvStringifier.stringifyRecords(csvData);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=members.csv');
            return res.send(csvString);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to export members: ${error.message}`);
        }
    }
};
exports.MembersController = MembersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, members_dto_1.GetMembersDto]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, members_dto_1.GetMembersDto, Object]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "exportMembersToCSV", null);
exports.MembersController = MembersController = __decorate([
    (0, common_1.Controller)('members'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [members_service_1.MembersService])
], MembersController);
//# sourceMappingURL=members.controller.js.map