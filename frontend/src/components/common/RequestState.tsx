import React from 'react';
import { CircleAlert, Inbox, RotateCcw } from 'lucide-react';

interface LoadingStateProps {
  label: string;
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ label }) => (
  <div role="status" aria-live="polite" className="flex min-h-36 items-center justify-center gap-3 px-4 py-10 text-sm text-slate-600">
    <span aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" />
    <span>{label}</span>
  </div>
);

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-6 text-center text-sm text-red-900 sm:flex-row sm:justify-between sm:text-left">
    <div className="flex items-start gap-2.5">
      <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
      <p>{message}</p>
    </div>
    {onRetry && (
      <button type="button" onClick={onRetry} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 font-semibold text-red-800 hover:bg-red-100">
        <RotateCcw aria-hidden="true" className="h-4 w-4" />
        Retry
      </button>
    )}
  </div>
);

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionLabel, onAction }) => (
  <div role="status" className="flex flex-col items-center rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
    <Inbox aria-hidden="true" className="mb-3 h-8 w-8 text-slate-400" />
    <h2 className="text-base font-bold text-slate-900">{title}</h2>
    <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-600">{description}</p>
    {actionLabel && onAction && (
      <button type="button" onClick={onAction} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
        {actionLabel}
      </button>
    )}
  </div>
);