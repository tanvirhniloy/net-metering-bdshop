import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="BDSHOP Net Metering - home">
      <span
        aria-hidden
        className={`flex h-8 w-8 items-center justify-center rounded text-sm font-bold ${light ? "bg-white text-navy" : "bg-grad text-white"}`}
      >
        B
      </span>
      <span className={`text-base font-bold tracking-tight ${light ? "text-white" : "text-navy"}`}>BDSHOP</span>
      <span aria-hidden className={`h-5 w-px ${light ? "bg-white/30" : "bg-line"}`} />
      <span className={`text-sm font-medium ${light ? "text-white/80" : "text-muted"}`}>Net Metering</span>
    </Link>
  );
}
