"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <AlertTriangle className="mx-auto h-8 w-8 text-amber-600" aria-hidden />
      <h1 className="mt-4 text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted">
        The equipment directory could not be displayed. Please try again. If the problem continues, reload the page later.
      </p>
      <button onClick={reset} className="btn btn-primary mt-6">
        Try again
      </button>
    </div>
  );
}
