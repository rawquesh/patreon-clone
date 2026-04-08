import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from '@/database/schemas/subscription';
import { PromotionRedemption } from '@/database/schemas/promotion';

@Injectable()
export class PromotionsSchedulerService {
  private readonly logger = new Logger(PromotionsSchedulerService.name);

  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(PromotionRedemption.name)
    private redemptionModel: Model<PromotionRedemption>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredPromotions() {
    this.logger.log('Checking for expired promotional subscriptions...');
    const now = new Date();

    try {
      const expiredTrials = await this.subscriptionModel.find({
        isTrial: true,
        status: 'active',
        trialEndDate: { $lt: now },
      });

      for (const trial of expiredTrials) {
        this.logger.log(
          `Expiring trial subscription ${trial._id} for user ${trial.subscriber}`,
        );

        await this.subscriptionModel.findByIdAndUpdate(trial._id, {
          $set: {
            status: 'expired',
            expiryDate: now,
          },
        });

        if (trial.membership) {
          await this.subscriptionModel.findByIdAndUpdate(trial.membership, {
            $inc: { subscriberCount: -1 },
          });
        }
      }

      await this.redemptionModel.updateMany(
        {
          expiryDate: { $lt: now },
          isExpired: false,
        },
        {
          $set: { isExpired: true },
        },
      );

      this.logger.log(
        `Processed ${expiredTrials.length} expired trial subscriptions`,
      );
    } catch (error) {
      this.logger.error('Error processing expired promotions:', error.stack);
    }
  }
}
