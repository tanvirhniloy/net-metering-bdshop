import { AlertTriangle } from "lucide-react";
import type { Dataset, EquipmentRecord } from "@/lib/types";

export function RowDetails({ ds, rec }: { ds: Dataset; rec: EquipmentRecord }) {
  return (
    <div className="bg-tint px-4 py-4">
      <dl className="grid gap-x-8 gap-y-0 md:grid-cols-2">
        {ds.columns.map((c) => {
          const v = rec.values[c.key];
          return (
            <div key={c.key} className="grid grid-cols-[minmax(0,9rem)_1fr] gap-3 border-b border-line py-2 text-sm md:grid-cols-[minmax(0,12rem)_1fr]">
              <dt className="text-muted">{c.label}</dt>
              <dd className={v ? "whitespace-pre-line [overflow-wrap:anywhere]" : "text-muted"}>{v || "Not specified"}</dd>
            </div>
          );
        })}
      </dl>
      {rec.flags.length > 0 && (
        <div className="mt-3 flex gap-2 rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900" role="note">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Flagged for review in the source data</p>
            <ul className="mt-1 list-disc pl-4">
              {rec.flags.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
