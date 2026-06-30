import { Control, useWatch } from "react-hook-form";
import { cn, highlightText } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ItemsFormValues } from "./itemsForm";

type TipMode = "percent" | "amount";

export function TipField({
  control,
  onModeChange,
  onValueChange,
}: {
  control: Control<ItemsFormValues>;
  onModeChange: (mode: TipMode) => void;
  onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const mode = (useWatch({ control, name: "tip.mode" }) ?? "percent") as TipMode;

  return (
    <FormItem className="flex flex-col">
      <FormLabel className="font-medium text-muted-foreground">
        Tip <span className="font-normal">(optional)</span>
      </FormLabel>
      <div className="flex gap-2">
        <div className="flex shrink-0 rounded-md border border-input bg-background p-0.5">
          {(["percent", "amount"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              aria-pressed={mode === m}
              className={cn(
                "w-9 rounded-[0.3rem] py-1 text-sm font-medium transition-colors",
                mode === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "percent" ? "%" : "$"}
            </button>
          ))}
        </div>
        <FormField
          control={control}
          name="tip.value"
          render={({ field }) => (
            <div className="relative flex-1">
              {mode === "amount" && (
                <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
              )}
              {mode === "percent" && (
                <span className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
              )}
              <FormControl>
                <Input
                  {...field}
                  placeholder={mode === "percent" ? "0" : "0.00"}
                  className={cn(
                    "tabular-nums",
                    mode === "amount" ? "pl-7" : "pr-7"
                  )}
                  onFocus={highlightText}
                  type="number"
                  step={mode === "percent" ? "1" : "0.01"}
                  onChange={onValueChange}
                />
              </FormControl>
            </div>
          )}
        />
      </div>
    </FormItem>
  );
}
