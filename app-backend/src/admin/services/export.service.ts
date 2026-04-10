import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/database/schemas/user';
import { Subscription } from '@/database/schemas/subscription/subscription.schema';
import { PayoutRequest } from '@/database/schemas/payout/payout.schema';
import { PostReport } from '@/database/schemas/report/post-report.schema';
import { UserReport } from '@/database/schemas/report/user-report.schema';

@Injectable()
export class ExportService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<Subscription>,
    @InjectModel(PayoutRequest.name) private payoutRequestModel: Model<PayoutRequest>,
    @InjectModel(PostReport.name) private postReportModel: Model<PostReport>,
    @InjectModel(UserReport.name) private userReportModel: Model<UserReport>,
  ) {}

  private toCSV(headers: string[], rows: any[][]): string {
    const escape = (v: any) => {
      const s = String(v ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    const lines = [
      headers.map(escape).join(','),
      ...rows.map((row) => row.map(escape).join(',')),
    ];
    return lines.join('\n');
  }

  async exportUsers(params: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<{ csv: string; filename: string }> {
    const filter: any = {};
    if (params.status === 'creator') filter.isCreator = true;
    if (params.status === 'member') filter.isCreator = { $ne: true };
    if (params.startDate) filter.createdAt = { $gte: new Date(params.startDate) };
    if (params.endDate) {
      filter.createdAt = { ...filter.createdAt, $lte: new Date(params.endDate) };
    }

    const users = await this.userModel
      .find(filter)
      .select('email displayName firstName lastName isCreator creatorStatus lifetimeEarnings availableBalance pendingBalance countryOfResidence createdAt isDeactivated')
      .lean()
      .exec();

    const headers = ['Email', 'Display Name', 'First Name', 'Last Name', 'Is Creator', 'Creator Status', 'Lifetime Earnings', 'Available Balance', 'Pending Balance', 'Country', 'Joined', 'Deactivated'];
    const rows = users.map((u: any) => [
      u.email,
      u.displayName,
      u.firstName,
      u.lastName,
      u.isCreator ? 'Yes' : 'No',
      u.creatorStatus || '',
      u.lifetimeEarnings || 0,
      u.availableBalance || 0,
      u.pendingBalance || 0,
      u.countryOfResidence || '',
      u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '',
      u.isDeactivated ? 'Yes' : 'No',
    ]);

    return {
      csv: this.toCSV(headers, rows),
      filename: `users_export_${new Date().toISOString().split('T')[0]}.csv`,
    };
  }

  async exportSubscriptions(params: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<{ csv: string; filename: string }> {
    const filter: any = {};
    if (params.status) filter.status = params.status;
    if (params.startDate) filter.createdAt = { $gte: new Date(params.startDate) };
    if (params.endDate) {
      filter.createdAt = { ...filter.createdAt, $lte: new Date(params.endDate) };
    }

    const subs = await this.subscriptionModel
      .find(filter)
      .populate('subscriber', 'displayName email firstName lastName')
      .populate('creator', 'displayName creatorUsername email')
      .populate('membership', 'name monthlyRate')
      .lean()
      .exec();

    const headers = ['Subscriber Name', 'Subscriber Email', 'Creator Name', 'Creator Username', 'Membership', 'Monthly Rate', 'Status', 'Start Date', 'End Date', 'Created'];
    const rows = subs.map((s: any) => [
      `${s.subscriber?.firstName || ''} ${s.subscriber?.lastName || ''}`.trim() || s.subscriber?.displayName || '',
      s.subscriber?.email || '',
      s.creator?.displayName || s.creator?.creatorUsername || '',
      s.creator?.creatorUsername || '',
      s.membership?.name || '',
      s.membership?.monthlyRate || s.monthlyRate || 0,
      s.status,
      s.currentPeriodStart ? new Date(s.currentPeriodStart).toISOString().split('T')[0] : '',
      s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toISOString().split('T')[0] : '',
      s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : '',
    ]);

    return {
      csv: this.toCSV(headers, rows),
      filename: `subscriptions_export_${new Date().toISOString().split('T')[0]}.csv`,
    };
  }

  async exportPayouts(params: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<{ csv: string; filename: string }> {
    const filter: any = {};
    if (params.status) filter.status = params.status;
    if (params.startDate) filter.createdAt = { $gte: new Date(params.startDate) };
    if (params.endDate) {
      filter.createdAt = { ...filter.createdAt, $lte: new Date(params.endDate) };
    }

    const payouts = await this.payoutRequestModel
      .find(filter)
      .populate('creator', 'displayName creatorUsername email')
      .lean()
      .exec();

    const headers = ['Creator Name', 'Creator Username', 'Creator Email', 'Amount', 'Status', 'Stripe Transfer ID', 'Requested At', 'Completed At', 'Failure Reason'];
    const rows = payouts.map((p: any) => [
      p.creator?.displayName || '',
      p.creator?.creatorUsername || '',
      p.creator?.email || '',
      p.amount || 0,
      p.status,
      p.stripeTransferId || '',
      p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '',
      p.completedAt ? new Date(p.completedAt).toISOString().split('T')[0] : '',
      p.failureReason || '',
    ]);

    return {
      csv: this.toCSV(headers, rows),
      filename: `payouts_export_${new Date().toISOString().split('T')[0]}.csv`,
    };
  }

  async exportReports(params: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<{ csv: string; filename: string }> {
    const postFilter: any = {};
    const userFilter: any = {};

    if (params.status) {
      postFilter.status = params.status;
      userFilter.status = params.status;
    }
    if (params.startDate) {
      const sd = new Date(params.startDate);
      postFilter.createdAt = { $gte: sd };
      userFilter.createdAt = { $gte: sd };
    }
    if (params.endDate) {
      const ed = new Date(params.endDate);
      postFilter.createdAt = { ...postFilter.createdAt, $lte: ed };
      userFilter.createdAt = { ...userFilter.createdAt, $lte: ed };
    }

    const [postReports, userReports] = await Promise.all([
      this.postReportModel
        .find(postFilter)
        .populate('reportedBy', 'displayName email')
        .lean()
        .exec(),
      this.userReportModel
        .find(userFilter)
        .populate('reportedBy', 'displayName email')
        .lean()
        .exec(),
    ]);

    const headers = ['Type', 'Reported By', 'Reason', 'Description', 'Status', 'Admin Notes', 'Created At', 'Reviewed At'];
    const rows: any[][] = [
      ...postReports.map((r: any) => [
        'Post',
        r.reportedBy?.displayName || r.reportedBy?.email || '',
        r.reason,
        r.description || '',
        r.status,
        r.adminNotes || '',
        r.createdAt ? new Date(r.createdAt).toISOString() : '',
        r.reviewedAt ? new Date(r.reviewedAt).toISOString() : '',
      ]),
      ...userReports.map((r: any) => [
        'User',
        r.reportedBy?.displayName || r.reportedBy?.email || '',
        r.reason,
        r.description || '',
        r.status,
        r.adminNotes || '',
        r.createdAt ? new Date(r.createdAt).toISOString() : '',
        r.reviewedAt ? new Date(r.reviewedAt).toISOString() : '',
      ]),
    ];

    return {
      csv: this.toCSV(headers, rows),
      filename: `reports_export_${new Date().toISOString().split('T')[0]}.csv`,
    };
  }
}
