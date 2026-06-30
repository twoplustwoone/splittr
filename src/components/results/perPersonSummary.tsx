import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";
import { CopyButton } from "@/components/copyButton";
import { cn, formatCurrency } from "@/lib/utils";
import { getInitials, personColorClass } from "@/lib/people";
import type { PersonResult, SplitResult } from "@/lib/split";

export function PerPersonSummary({
  perPerson,
  unassigned,
  showTip,
}: {
  perPerson: PersonResult[];
  unassigned: SplitResult["unassigned"];
  showTip: boolean;
}) {
  return (
    <div className="space-y-3">
      {perPerson.map((person, index) => (
        <Collapsible
          key={person.id}
          className="group rounded-xl border border-border"
        >
          <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
                personColorClass(index)
              )}
            >
              {getInitials(person.name)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-foreground">
                {person.name}
              </div>
              <div className="text-xs text-muted-foreground">
                Items {formatCurrency(person.subtotal)} · Tax{" "}
                {formatCurrency(person.tax)}
                {showTip && <> · Tip {formatCurrency(person.tip)}</>}
              </div>
            </div>
            <span className="shrink-0 text-lg font-bold tabular-nums text-primary">
              {formatCurrency(person.total)}
            </span>
            <CopyButton text={person.total.toFixed(2)} />
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="border-t border-border px-4 py-3">
            {person.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No items assigned yet.
              </p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {person.items.map((item, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="tabular-nums text-foreground">
                      {formatCurrency(item.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CollapsibleContent>
        </Collapsible>
      ))}

      {unassigned.count > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm">
          <span className="font-medium text-amber-800">
            Unassigned ({unassigned.count}{" "}
            {unassigned.count === 1 ? "item" : "items"})
          </span>
          <span className="tabular-nums font-semibold text-amber-800">
            {formatCurrency(unassigned.total)}
          </span>
        </div>
      )}
    </div>
  );
}
