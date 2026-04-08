export type PayoutStatus = 'pending' | 'approved' | 'rejected';

export type Payout = {
  id: string;
  creator: {
    name: string;
    avatar: string;
  };
  amount: number;
  requestDate: string;
  status: PayoutStatus;
  processedDate?: string;
};
