import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Copy, RotateCcw, Split } from "lucide-react";
import { Button } from "./components/ui/button";
import { useToast } from "./hooks/use-toast";
import { CopyButton } from "./components/copyButton";
import {
  ItemsForm,
  type ItemsFormHandle,
  type ItemsFormValues,
} from "./components/itemsForm/itemsForm";
import { formatCurrency } from "./lib/utils";
import { allocateProportional, fromCents, toCents } from "./lib/split";

type ItemizedItem = {
  name: string;
  price: number;
  tax: number;
  total: number;
};

function App() {
  const [values, setValues] = useState<ItemsFormValues | null>(null);
  const formRef = useRef<ItemsFormHandle>(null);

  const { toast } = useToast();

  const { items, subtotalCents, taxCents } = useMemo(() => {
    const list = values?.items ?? [];
    const priceCents = list.map((item) => toCents(item.price));
    const subtotal = priceCents.reduce((acc, c) => acc + c, 0);
    const tax = toCents(values?.tax ?? 0);
    const allocated = allocateProportional(priceCents, tax);

    const itemized: ItemizedItem[] = list.map((item, i) => ({
      name: item.name?.trim() ? item.name : `Item ${i + 1}`,
      price: fromCents(priceCents[i]),
      tax: fromCents(allocated[i]),
      total: fromCents(priceCents[i] + allocated[i]),
    }));

    return { items: itemized, subtotalCents: subtotal, taxCents: tax };
  }, [values]);

  const totals = {
    price: fromCents(subtotalCents),
    tax: fromCents(taxCents),
    total: fromCents(subtotalCents + taxCents),
  };

  const negativeTotal = subtotalCents > 0 && taxCents < 0;
  const hasResults = subtotalCents > 0 && !negativeTotal;

  const handleStartOver = () => {
    formRef.current?.reset();
  };

  const handleCopyAll = () => {
    const summary = items
      .map((item) => `${item.name}: ${formatCurrency(item.total)}`)
      .join("\n");
    navigator.clipboard.writeText(summary);
    toast({
      title: "Items Copied!",
      description:
        "All item names and totals have been copied to your clipboard.",
      variant: "default",
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:py-12">
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Split className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            splittr
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Split a bill's tax fairly across every item.
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <ItemsForm ref={formRef} onChange={setValues} />
        </section>

        {negativeTotal && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Your total is below the items' subtotal, so the tax would be
              negative. Double-check the total or the item prices.
            </p>
          </div>
        )}

        {!hasResults && !negativeTotal && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Add items and the total tax to see each item's fair share.
          </p>
        )}

        {hasResults && (
          <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-foreground">
                Itemized bill
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleStartOver}
                className="text-muted-foreground"
              >
                <RotateCcw className="h-4 w-4" />
                Start over
              </Button>
            </div>

            {/* Desktop / tablet table */}
            <div className="hidden overflow-hidden rounded-lg border border-border sm:block">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground">
                    <th className="px-4 py-2.5 text-left font-medium">Item</th>
                    <th className="px-4 py-2.5 text-right font-medium">Price</th>
                    <th className="px-4 py-2.5 text-right font-medium">Tax</th>
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
                    <td className="px-4 py-2.5 font-medium text-foreground">
                      Total
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      {formatCurrency(totals.price)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      {formatCurrency(totals.tax)}
                    </td>
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
                <div
                  key={index}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">
                      {item.name}
                    </span>
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
                    <span className="tabular-nums">
                      Tax {formatCurrency(item.tax)}
                    </span>
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

            <div className="mt-5">
              <Button
                type="button"
                onClick={handleCopyAll}
                className="w-full sm:w-auto"
              >
                <Copy className="h-4 w-4" />
                Copy all items and totals
              </Button>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center">
        <a
          href="https://www.buymeacoffee.com/twoplustwoone"
          target="_blank"
          rel="noreferrer"
          className="inline-block opacity-80 transition-opacity hover:opacity-100"
        >
          <img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
            alt="Buy Me A Coffee"
            className="h-10 w-40"
          />
        </a>
      </footer>
    </div>
  );
}

export default App;
