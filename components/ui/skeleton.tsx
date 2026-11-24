import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded bg-slate-200/70 motion-reduce:animate-none", className)} aria-hidden />;
}
