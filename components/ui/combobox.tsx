"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Check, ChevronDown, Search } from "lucide-react";

export interface ComboOption {
  value: string;
  label: string;
  hint?: string;
}

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: ComboOption[];
  allLabel: string;
  disabled?: boolean;
  searchPlaceholder?: string;
}

/** Accessible searchable dropdown (combobox + listbox) with keyboard support. */
export function Combobox({ label, value, onChange, options, allLabel, disabled, searchPlaceholder = "Search..." }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const id = useId();

  const items = useMemo(() => {
    const all: ComboOption[] = [{ value: "", label: allLabel }, ...options];
    const t = q.trim().toLowerCase();
    return t ? all.filter((o) => o.value === "" ? allLabel.toLowerCase().includes(t) : o.label.toLowerCase().includes(t)) : all;
  }, [options, q, allLabel]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    input.current?.focus();
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => setActive(0), [q, open]);
  useEffect(() => {
    if (open) document.getElementById(`${id}-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open, id]);

  const close = (refocus = true) => {
    setOpen(false);
    setQ("");
    if (refocus) btn.current?.focus();
  };
  const choose = (v: string) => {
    onChange(v);
    close();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (items[active]) choose(items[active].value); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "Tab") close(false);
  };

  const current = options.find((o) => o.value === value)?.label ?? allLabel;

  return (
    <div ref={root} className="relative">
      <span id={`${id}-label`} className="label">{label}</span>
      <button
        ref={btn}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-btn`}
        id={`${id}-btn`}
        onClick={() => setOpen((v) => !v)}
        className="field flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={clsx("truncate", !value && "text-ink")}>{current}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted" aria-hidden />
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-md border border-line bg-white shadow-md sm:min-w-[16rem]">
          <div className="flex items-center gap-2 border-b border-line px-3">
            <Search className="h-4 w-4 text-muted" aria-hidden />
            <input
              ref={input}
              role="combobox"
              aria-expanded
              aria-controls={`${id}-list`}
              aria-activedescendant={items.length ? `${id}-opt-${active}` : undefined}
              aria-label={`Search ${label}`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKey}
              placeholder={searchPlaceholder}
              className="h-10 w-full bg-transparent text-sm placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <ul id={`${id}-list`} role="listbox" aria-label={label} className="max-h-64 overflow-auto py-1">
            {items.length === 0 && <li className="px-3 py-2 text-sm text-muted">No matches</li>}
            {items.map((o, i) => (
              <li
                key={o.value || "__all"}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={o.value === value}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o.value)}
                className={clsx(
                  "flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm",
                  i === active && "bg-tint",
                  o.value === value && "font-medium text-brand",
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Check className={clsx("h-4 w-4 shrink-0", o.value === value ? "opacity-100" : "opacity-0")} aria-hidden />
                  <span className="truncate">{o.label}</span>
                </span>
                {o.hint && <span className="shrink-0 text-xs text-muted">{o.hint}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
