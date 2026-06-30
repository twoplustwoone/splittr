import { CopyButton } from "@/components/copyButton";
import { formatCurrency } from "@/lib/utils";
import type { ItemizedRow } from "@/lib/split";

type Totals = { subtotal: number; tax: number; tip: number; total: number };

export function ItemizedTable({
  items,
  totals,
  showTip,
}: {
  items: ItemizedRow[];
  totals: Totals;
  showTip: boolean;
}) {
  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-hidden rounded-lg border border-border sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground">
              <th className="px-4 py-2.5 text-left font-medium">Item</th>
              <th className="px-4 py-2.5 text-right font-medium">Price</th>
              <th className="px-4 py-2.5 text-right font-medium">Tax</th>
              {showTip && (
                <th className="px-4 py-2.5 text-right font-medium">Tip</th>
              )}
              <th className="px-4 py-2.5 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={index}
                className="border-t border-border transition-colors hover:bg-muted/40"
              >
                <td className="px-4 py-2.5 font-medium text-foreground">
                  {item.name}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                  {formatCurrency(item.price)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                  {formatCurrency(item.tax)}
                </td>
                {showTip && (
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {formatCurrency(item.tip)}
                  </td>
                )}
                <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-foreground">
                  <div className="flex items-center justify-end gap-1">
                    {formatCurrency(item.total)}
                    <CopyButton text={item.total.toFixed(2)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/30">
              <td className="px-4 py-2.5 font-medium text-foreground">Total</td>
              <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                {formatCurrency(totals.subtotal)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                {formatCurrency(totals.tax)}
              </td>
              {showTip && (
                <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                  {formatCurrency(totals.tip)}
                </td>
              )}
              <td className="px-4 py-2.5 text-right tabular-nums font-bold text-primary">
                {formatCurrency(totals.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-foreground">{item.name}</span>
              <div className="flex items-center gap-1">
                <span className="tabular-nums font-semibold text-foreground">
                  {formatCurrency(item.total)}
                </span>
                <CopyButton text={item.total.toFixed(2)} />
              </div>
            </div>
            <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
              <span className="tabular-nums">
                Price {formatCurrency(item.price)}
              </span>
              <span className="tabular-nums">Tax {formatCurrency(item.tax)}</span>
              {showTip && (
                <span className="tabular-nums">
                  Tip {formatCurrency(item.tip)}
                </span>
              )}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
          <span className="font-medium text-foreground">Total</span>
          <span className="tabular-nums font-bold text-primary">
            {formatCurrency(totals.total)}
          </span>
        </div>
      </div>
    </>
  );
}
