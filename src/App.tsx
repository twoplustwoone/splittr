import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Copy, RotateCcw, Split } from "lucide-react";
import { Button } from "./components/ui/button";
import { useToast } from "./hooks/use-toast";
import {
  ItemsForm,
  type ItemsFormHandle,
  type ItemsFormValues,
} from "./components/itemsForm/itemsForm";
import { ItemizedTable } from "./components/results/itemizedTable";
import { PerPersonSummary } from "./components/results/perPersonSummary";
import { formatCurrency } from "./lib/utils";
import { computeSplit, type SplitInput } from "./lib/split";

const EMPTY: SplitInput = {
  items: [],
  people: [],
  tax: 0,
  tip: { mode: "percent", value: 0 },
};

function App() {
  const [values, setValues] = useState<ItemsFormValues | null>(null);
  const formRef = useRef<ItemsFormHandle>(null);

  const { toast } = useToast();

  const result = useMemo(() => computeSplit(values ?? EMPTY), [values]);

  const hasPeople = (values?.people?.length ?? 0) > 0;
  const negativeTotal = result.subtotalCents > 0 && result.taxCents < 0;
  const hasResults = result.subtotalCents > 0 && !negativeTotal;
  const showTip = result.tipCents > 0;

  const handleStartOver = () => {
    formRef.current?.reset();
  };

  const handleCopyAll = () => {
    const summary = hasPeople
      ? result.perPerson
          .map((p) => `${p.name}: ${formatCurrency(p.total)}`)
          .join("\n")
      : result.itemized
          .map((item) => `${item.name}: ${formatCurrency(item.total)}`)
          .join("\n");
    navigator.clipboard.writeText(summary);
    toast({
      title: "Copied!",
      description: hasPeople
        ? "Per-person totals copied to your clipboard."
        : "All item names and totals copied to your clipboard.",
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
            Split a bill fairly — tax, tip, and every item.
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
              Your tax is negative — double-check the tax amount or the item
              prices.
            </p>
          </div>
        )}

        {!hasResults && !negativeTotal && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Add items and the total tax to see each item's fair share — add
            people to split it per person.
          </p>
        )}

        {hasResults && (
          <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-foreground">
                {hasPeople ? "Who owes what" : "Itemized bill"}
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

            {hasPeople ? (
              <div className="space-y-6">
                <PerPersonSummary
                  perPerson={result.perPerson}
                  unassigned={result.unassigned}
                  showTip={showTip}
                />
                <div>
                  <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Full breakdown
                  </h3>
                  <ItemizedTable
                    items={result.itemized}
                    totals={result.totals}
                    showTip={showTip}
                  />
                </div>
              </div>
            ) : (
              <ItemizedTable
                items={result.itemized}
                totals={result.totals}
                showTip={showTip}
              />
            )}

            <div className="mt-5">
              <Button
                type="button"
                onClick={handleCopyAll}
                className="w-full sm:w-auto"
              >
                <Copy className="h-4 w-4" />
                {hasPeople ? "Copy per-person totals" : "Copy all items and totals"}
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
