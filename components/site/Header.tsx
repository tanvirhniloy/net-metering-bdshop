"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/#equipment", label: "Solar Equipment" },
  { href: "/#about-net-metering", label: "About Net Metering" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="bg-grad-strip h-1" aria-hidden />
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded px-3 py-2 text-sm font-medium text-ink hover:bg-tint hover:text-brand">
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded border border-line md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-white md:hidden">
          <ul className="mx-auto max-w-[1200px] px-2 py-2">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="block rounded px-3 py-3 text-sm font-medium text-ink hover:bg-tint"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
