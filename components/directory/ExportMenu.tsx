"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";

interface Props {
  disabled: boolean;
  onExport: (f: "xlsx" | "csv") => Promise<void>;
}

export function ExportMenu({ disabled, onExport }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const run = async (f: "xlsx" | "csv") => {
    setBusy(true);
    setError(null);
    try {
      await onExport(f);
      setOpen(false);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" className="btn btn-outline" disabled={disabled} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
        Export
        <ChevronDown className="h-4 w-4 text-muted" aria-hidden />
      </button>
      {open && (
        <div role="menu" aria-label="Export format" className="absolute right-0 z-30 mt-1 w-56 rounded-md border border-line bg-white py-1 shadow-md">
          <button role="menuitem" type="button" disabled={busy} onClick={() => run("xlsx")} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-tint">
            <FileSpreadsheet className="h-4 w-4 text-brand" aria-hidden /> Excel (.xlsx)
          </button>
          <button role="menuitem" type="button" disabled={busy} onClick={() => run("csv")} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-tint">
            <FileText className="h-4 w-4 text-brand" aria-hidden /> CSV (.csv)
          </button>
          <p className="border-t border-line px-3 py-2 text-xs text-muted">Exports the current filtered results.</p>
          {error && <p role="alert" className="px-3 pb-2 text-xs text-red-700">{error}</p>}
        </div>
      )}
    </div>
  );
}
