import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-4 px-4 py-6" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-16 w-full" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
