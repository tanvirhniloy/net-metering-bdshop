import Image from "next/image";
import Link from "next/link";

/** Uses public/netMetering.png. Replace that file to change the logo (set width/height to the PNG's pixel size). */
export function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Net Metering - home"
      className={onDark ? "inline-block rounded bg-white px-3 py-2" : "inline-block"}
    >
      <Image src="/netMetering.png" alt="Net Metering" width={984} height={192} priority className="h-9 w-auto" />
    </Link>
  );
}