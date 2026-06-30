import React, { forwardRef } from "react";
import { Control, useWatch } from "react-hook-form";
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
import { cn, highlightText } from "@/lib/utils";
import { getInitials, personColorClass } from "@/lib/people";
import { itemsFormSchema } from "../itemsForm/schema";

type Person = { id: string; name: string };

interface ItemProps {
  control: Control<z.infer<typeof itemsFormSchema>>;
  index: number;
  field: { id: string };
  canRemove: boolean;
  people: Person[];
  onRemove: (index: number) => void;
  onToggleAssignee: (index: number, personId: string) => void;
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
      people,
      onRemove: remove,
      onToggleAssignee,
      onKeyDown: handleKeyDown,
      onPriceChange,
    }: ItemProps,
    ref: React.ForwardedRef<HTMLInputElement>
  ) => {
    const assignees =
      (useWatch({
        control,
        name: `items.${index}.assignees` as `items.${number}.assignees`,
      }) as string[] | undefined) ?? [];

    return (
      <div className="space-y-2">
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

        {people.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pl-0.5">
            {people.map((person, personIndex) => {
              const active = assignees.includes(person.id);
              return (
                <button
                  key={person.id}
                  type="button"
                  data-testid={`assign-${index}-${personIndex}`}
                  onClick={() => onToggleAssignee(index, person.id)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors",
                    active
                      ? cn("border-transparent text-white", personColorClass(personIndex))
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  <span className="text-[0.625rem] font-semibold">
                    {getInitials(person.name)}
                  </span>
                  {person.name}
                </button>
              );
            })}
            {assignees.length === 0 && (
              <span className="text-xs text-amber-600">Unassigned</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Item.displayName = "Item";

export { Item };
