'use server';

import type { AnalyzeNotificationLogsOutput } from '@/ai/flows/analyze-notification-logs';
import { analyzeNotificationLogs } from '@/ai/flows/analyze-notification-logs';

type FormState = {
  data: AnalyzeNotificationLogsOutput | null;
  error: string | null;
};

export async function analyzeLogsAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const logs = formData.get('logs') as string;

  if (!logs || logs.trim().length === 0) {
    return { data: null, error: 'Notification logs cannot be empty.' };
  }

  try {
    const result = await analyzeNotificationLogs({ notificationLogs: logs });
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    return { data: null, error: `Analysis failed: ${errorMessage}` };
  }
}
