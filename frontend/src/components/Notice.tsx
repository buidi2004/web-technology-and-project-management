import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Inline error notice with an optional retry action. */
export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-body text-destructive"
    >
      <AlertCircle aria-hidden className="size-4 flex-none" />
      <span className="min-w-0 flex-1">{message}</span>
      {onRetry && (
        <Button size="xs" variant="outline" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}

/** Inline success notice. */
export function SuccessNotice({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-body text-success"
    >
      {message}
    </div>
  );
}
