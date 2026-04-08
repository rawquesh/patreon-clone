'use client';

import { useFormState, useFormStatus } from 'react-dom';

import { PageHeader } from '@/components/page-header';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, FileText, Loader2, ServerCrash, Terminal } from 'lucide-react';
import { analyzeLogsAction } from './actions';

const initialState = {
  data: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Bot className="mr-2 h-4 w-4" />
      )}
      Analyze Logs
    </Button>
  );
}

export default function AnomalyDetectionPage() {
  const [state, formAction] = useFormState(analyzeLogsAction, initialState);

  return (
    <>
      <PageHeader
        title="Anomaly Detection"
        description="Paste notification logs to identify anomalies using AI."
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText />
            <span>Notification Log Input</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <Textarea
              name="logs"
              placeholder="Paste your notification logs here... e.g., '[2024-07-29 10:00:00] INFO: User 123 logged in.'"
              className="min-h-[200px] font-mono text-sm"
              required
            />
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      {state.error && (
        <Alert variant="destructive" className="mt-6">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.data && (
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal />
                <span>Analysis Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{state.data.summary}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot />
                <span>Detected Anomalies</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.data.anomalies.length > 0 ? (
                <ul className="space-y-2">
                  {state.data.anomalies.map((anomaly, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-destructive" />
                      <span className="flex-1 font-mono text-sm text-destructive">
                        {anomaly}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  No anomalies were found in the provided logs.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
