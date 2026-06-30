import React, { forwardRef } from "react";
import { Control } from "react-hook-form";
import { z } from "zod";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { highlightText } from "@/lib/utils";
import { itemsFormSchema } from "../itemsForm/schema";

interface ItemProps {
  control: Control<z.infer<typeof itemsFormSchema>>;
  index: number;
  field: { id: string };
  canRemove: boolean;
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
    return (
      <div className="flex items-start gap-2">
        <FormField
          control={control}
          name={`items.${index}.name` as `items.${number}.name`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="sr-only">Item {index + 1} name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  data-index={`${index}-name`}
                  placeholder="Item name"
                  onKeyDown={(e) => handleKeyDown(e, index, "name")}
                  onFocus={highlightText}
                  ref={ref}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`items.${index}.price` as `items.${number}.price`}
          render={({ field }) => (
            <FormItem className="w-28 shrink-0 sm:w-36">
              <FormLabel className="sr-only">Item {index + 1} price</FormLabel>
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
                    className="pl-7 text-right tabular-nums"
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
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => remove(index)}
          disabled={!canRemove}
          aria-label={`Remove item ${index + 1}`}
          className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);

Item.displayName = "Item";

export { Item };
