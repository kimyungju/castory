"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6">
      <h2 className="text-24 font-bold text-white-1 uppercase">
        Something went wrong
      </h2>
      <p className="text-16 text-white-4 max-w-md text-center">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="bg-orange-1 text-charcoal px-6 py-3 font-bold uppercase tracking-wide hover:bg-orange-1/80 transition-colors cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}
