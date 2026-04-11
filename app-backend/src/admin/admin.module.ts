import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './controllers/reports.controller';
import { ModerationController } from './controllers/moderation.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { CreatorsController } from './controllers/creators.controller';
import { MembersController } from './controllers/members.controller';
import { ContentController } from './controllers/content.controller';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { PayoutsController } from './controllers/payouts.controller';
import { ReportsService } from './services/reports.service';
import { ModerationService } from './services/moderation.service';
import { DashboardService } from './services/dashboard.service';
import { CreatorsService } from './services/creators.service';
import { MembersService } from './services/members.service';
import { ContentService } from './services/content.service';
import { SubscriptionsService } from './services/subscriptions.service';
import { PayoutsService } from './services/payouts.service';
import {
  PostReport,
  PostReportSchema,
} from '@/database/schemas/report/post-report.schema';
import {
  UserReport,
  UserReportSchema,
} from '@/database/schemas/report/user-report.schema';
import {
  WithheldPost,
  WithheldPostSchema,
  WithheldUser,
  WithheldUserSchema,
} from '@/database/schemas/report/withheld.schema';
import { Post, PostSchema } from '@/database/schemas/post';
import { User, UserSchema } from '@/database/schemas/user';
import {
  Subscription,
  SubscriptionSchema,
} from '@/database/schemas/subscription/subscription.schema';
import {
  PayoutRequest,
  PayoutRequestSchema,
} from '@/database/schemas/payout/payout.schema';
import { Membership, MembershipSchema } from '@/database/schemas/membership/membership.schema';
import { Notification, NotificationSchema } from '@/database/schemas/notification';
import { PaymentsModule } from '@/payments/payments.module';

// Platform Settings (SettingsService is now global via PlatformSettingsModule)
import { SettingsController } from './controllers/settings.controller';
import { PlatformSetting, PlatformSettingSchema } from './schemas/platform-setting.schema';

// NEW: Audit Log
import { AuditLogController } from './controllers/audit-log.controller';
import { AuditLogService } from './services/audit-log.service';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';

// Admin Users
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminUsersService } from './services/admin-users.service';

// NEW: Bulk Operations
import { BulkOperationsController } from './controllers/bulk-operations.controller';
import { BulkOperationsService } from './services/bulk-operations.service';

// NEW: Admin Analytics
import { AnalyticsController } from './controllers/analytics.controller';
import { AdminAnalyticsService } from './services/analytics.service';

// NEW: Data Export
import { ExportController } from './controllers/export.controller';
import { ExportService } from './services/export.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostReport.name, schema: PostReportSchema },
      { name: UserReport.name, schema: UserReportSchema },
      { name: WithheldPost.name, schema: WithheldPostSchema },
      { name: WithheldUser.name, schema: WithheldUserSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: PayoutRequest.name, schema: PayoutRequestSchema },
      { name: Membership.name, schema: MembershipSchema },
      // NEW schemas
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    forwardRef(() => PaymentsModule),
  ],
  controllers: [
    ReportsController,
    ModerationController,
    DashboardController,
    CreatorsController,
    MembersController,
    ContentController,
    SubscriptionsController,
    PayoutsController,
    // NEW controllers
    SettingsController,
    AuditLogController,
    AdminUsersController,
    BulkOperationsController,
    AnalyticsController,
    ExportController,
  ],
  providers: [
    ReportsService,
    ModerationService,
    DashboardService,
    CreatorsService,
    MembersService,
    ContentService,
    SubscriptionsService,
    PayoutsService,
    // NEW providers
    AuditLogService,
    AdminUsersService,
    BulkOperationsService,
    AdminAnalyticsService,
    ExportService,
  ],
  exports: [
    ReportsService,
    ModerationService,
    AuditLogService,
  ],
})
export class AdminModule {}
