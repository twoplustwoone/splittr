import React, { forwardRef } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";
import { Control, useWatch } from "react-hook-form";
import { z } from "zod";
import { ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatCurrency, highlightText } from "@/lib/utils";
import { itemsFormSchema } from "../itemsForm/schema";

interface ItemProps {
  control: Control<z.infer<typeof itemsFormSchema>>;
  index: number;
  field: { id: string };
  canRemove: boolean;
  name: `items.${number}.name` | `items.${number}.price`;
  onRemove: (index: number) => void;
  onKeyDown: (
    e: React.KeyboardEvent,
    currentIndex: number,
    fieldType: "name" | "price"
  ) => void;
  onPriceChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Item = forwardRef<HTMLInputElement, ItemProps>(
  (
    {
      control,
      index,
      canRemove,
      onRemove: remove,
      onKeyDown: handleKeyDown,
      onPriceChange,
    }: ItemProps,
    ref: React.ForwardedRef<HTMLInputElement>
  ) => {
    const currentName = useWatch({
      control,
      name: `items.${index}.name` as `items.${number}.name`,
    });
    const currentPrice = useWatch({
      control,
      name: `items.${index}.price` as `items.${number}.price`,
    });

    return (
      <Collapsible defaultOpen className="group mb-3">
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
          <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 bg-muted/40 px-4 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
            <div className="flex min-w-0 items-center gap-2">
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
              <h3 className="truncate text-base font-semibold text-foreground">
                {typeof currentName === "string" && currentName.trim()
                  ? currentName
                  : `Item ${index + 1}`}
              </h3>
            </div>
            <span className="shrink-0 font-semibold tabular-nums text-foreground">
              {formatCurrency(
                typeof currentPrice === "number" ? currentPrice : 0
              )}
            </span>
          </CollapsibleTrigger>

          <CollapsibleContent className="border-t border-border px-4 py-4">
            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[2fr_2fr_auto]">
              <FormField
                control={control}
                name={`items.${index}.name` as `items.${number}.name`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-medium text-muted-foreground">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        data-index={`${index}-name`}
                        placeholder="Enter item name"
                        onKeyDown={(e) => handleKeyDown(e, index, "name")}
                        onFocus={highlightText}
                        ref={ref}
                      />
                    </FormControl>
                    <FormMessage className="mt-1 min-h-[20px] text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`items.${index}.price` as `items.${number}.price`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-medium text-muted-foreground">
                      Price
                    </FormLabel>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <FormControl>
                        <Input
                          {...field}
                          data-index={`${index}-price`}
                          placeholder="0.00"
                          onFocus={highlightText}
                          className="pl-7 tabular-nums"
                          onKeyDown={(e) => handleKeyDown(e, index, "price")}
                          type="number"
                          step="0.01"
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value));
                            onPriceChange?.(e);
                          }}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="mt-1 min-h-[20px] text-sm" />
                  </FormItem>
                )}
              />
              {canRemove && (
                <div className="flex md:mt-7">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    aria-label={`Remove item ${index + 1}`}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }
);

Item.displayName = "Item";

export { Item };
