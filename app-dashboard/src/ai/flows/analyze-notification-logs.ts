'use server';

/**
 * @fileOverview An anomaly detection AI agent for notification logs.
 *
 * - analyzeNotificationLogs - A function that analyzes notification logs for anomalies.
 * - AnalyzeNotificationLogsInput - The input type for the analyzeNotificationLogs function.
 * - AnalyzeNotificationLogsOutput - The return type for the analyzeNotificationLogs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeNotificationLogsInputSchema = z.object({
  notificationLogs: z
    .string()
    .describe('The notification logs to analyze.'),
});
export type AnalyzeNotificationLogsInput = z.infer<typeof AnalyzeNotificationLogsInputSchema>;

const AnalyzeNotificationLogsOutputSchema = z.object({
  anomalies: z.array(z.string()).describe('The anomalies found in the notification logs.'),
  summary: z.string().describe('A summary of the anomalies found.'),
});
export type AnalyzeNotificationLogsOutput = z.infer<typeof AnalyzeNotificationLogsOutputSchema>;

export async function analyzeNotificationLogs(input: AnalyzeNotificationLogsInput): Promise<AnalyzeNotificationLogsOutput> {
  return analyzeNotificationLogsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeNotificationLogsPrompt',
  input: {schema: AnalyzeNotificationLogsInputSchema},
  output: {schema: AnalyzeNotificationLogsOutputSchema},
  prompt: `You are an expert at analyzing notification logs to identify anomalies.

You will be provided with notification logs, and you will identify any anomalies in the logs.

Notification Logs: {{{notificationLogs}}}

Output the anomalies found, and a summary of the anomalies found.`,
});

const analyzeNotificationLogsFlow = ai.defineFlow(
  {
    name: 'analyzeNotificationLogsFlow',
    inputSchema: AnalyzeNotificationLogsInputSchema,
    outputSchema: AnalyzeNotificationLogsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
