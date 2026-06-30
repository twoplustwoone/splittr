import { zodResolver } from "@hookform/resolvers/zod";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Item } from "@/components/item/item";
import { highlightText } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { itemsFormSchema } from "./schema";
import { HelpText } from "../helpText/helpText";

export type ItemsFormValues = z.infer<typeof itemsFormSchema>;

type ItemsFormProps = {
  onChange: (values: ItemsFormValues) => void;
};

export type ItemsFormHandle = {
  reset: () => void;
};

const defaultValues = {
  items: [{ name: "Item 1", price: 0.0 }],
  tax: 0.0,
  totalPrice: 0.0,
};

const num = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const useAutoFocusFirstItem = () => {
  const firstItemRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (firstItemRef.current) {
      firstItemRef.current.focus();
    }
  }, []);

  return { firstItemRef };
};

export const ItemsForm = forwardRef<ItemsFormHandle, ItemsFormProps>(
  ({ onChange }, ref) => {
    const form = useForm<ItemsFormValues>({
      resolver: zodResolver(itemsFormSchema),
      defaultValues,
      mode: "onBlur",
    });
    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "items",
    });

    const [isManualTotal, setIsManualTotal] = useState(false);

    const watchItems = useWatch({ control: form.control, name: "items" });
    const watchTax = useWatch({ control: form.control, name: "tax" });
    const watchTotalPrice = useWatch({
      control: form.control,
      name: "totalPrice",
    });

    const { firstItemRef } = useAutoFocusFirstItem();

    useImperativeHandle(ref, () => ({
      reset: () => {
        setIsManualTotal(false);
        form.reset(defaultValues);
        setTimeout(() => firstItemRef.current?.focus(), 0);
      },
    }));

    const handleItemPriceChange = (
      index: number,
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      setIsManualTotal(false); // user changed an item => revert to "auto" total
      const priceValue = parseFloat(e.target.value) || 0;

      form.setValue(`items.${index}.price`, priceValue);
    };

    const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsManualTotal(false);
      const newTax = parseFloat(e.target.value) || 0;
      form.setValue("tax", newTax);
    };

    const handleTotalPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsManualTotal(true);
      const newTotal = parseFloat(e.target.value) || 0;
      form.setValue("totalPrice", newTotal);

      const subtotal = watchItems.reduce((acc, { price }) => acc + num(price), 0);
      form.setValue("tax", newTotal - subtotal);
    };

    // Keep tax <-> total in sync when the user is editing items/tax.
    useEffect(() => {
      if (!isManualTotal) {
        const subtotal = watchItems.reduce(
          (acc, { price }) => acc + num(price),
          0
        );
        const newTotal = subtotal + num(watchTax);

        if (newTotal !== watchTotalPrice) {
          form.setValue("totalPrice", newTotal);
        }
      }
    }, [isManualTotal, watchItems, watchTax, watchTotalPrice, form]);

    // Emit a sanitized snapshot live so results recompute as you type.
    useEffect(() => {
      onChange({
        items: (watchItems ?? []).map((item) => ({
          name: item.name,
          price: num(item.price),
        })),
        tax: num(watchTax),
        totalPrice: num(watchTotalPrice),
      });
    }, [watchItems, watchTax, watchTotalPrice, onChange]);

    const handleKeyDown = (
      e: React.KeyboardEvent,
      currentIndex: number,
      fieldType: "name" | "price" | "totals"
    ) => {
      if (e.key !== "Enter") return;
      e.preventDefault();

      if (fieldType === "name") {
        document
          .querySelector<HTMLInputElement>(
            `[data-index='${currentIndex}-price']`
          )
          ?.focus();
      } else if (fieldType === "price") {
        const nextNameInput = document.querySelector<HTMLInputElement>(
          `[data-index='${currentIndex + 1}-name']`
        );
        if (nextNameInput) {
          nextNameInput.focus();
        } else {
          append({ name: `Item ${fields.length + 1}`, price: 0 });
          setTimeout(() => {
            document
              .querySelector<HTMLInputElement>(
                `[data-index='${fields.length}-name']`
              )
              ?.focus();
          }, 0);
        }
      } else {
        (e.target as HTMLInputElement).blur();
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-2 flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span className="flex-1">Item</span>
            <span className="w-28 text-right sm:w-36">Price</span>
            {/* spacer to align with the remove button */}
            <span className="h-9 w-9 shrink-0" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <Item
                control={form.control}
                index={index}
                field={field}
                canRemove={fields.length > 1}
                onRemove={remove}
                key={field.id}
                onKeyDown={handleKeyDown}
                ref={index === 0 ? firstItemRef : null} // ref for the first input
                onPriceChange={(e) => handleItemPriceChange(index, e)}
              />
            ))}
          </div>

          <div className="mt-3 flex justify-start">
            <HelpText text={"Enter ↵"}>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({ name: `Item ${fields.length + 1}`, price: 0 })
                }
              >
                <Plus className="h-4 w-4" />
                Add item
              </Button>
            </HelpText>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="tax"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-medium text-muted-foreground">
                      Total tax
                    </FormLabel>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="0.00"
                          className="pl-7 tabular-nums"
                          onFocus={highlightText}
                          type="number"
                          step="0.01"
                          onChange={handleTaxChange}
                          onKeyDown={(e) => handleKeyDown(e, -1, "totals")}
                          data-testid="tax-input"
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="mt-1 text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalPrice"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-medium text-muted-foreground">
                      Total price
                    </FormLabel>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="0.00"
                          className="pl-7 tabular-nums"
                          onFocus={highlightText}
                          type="number"
                          step="0.01"
                          onChange={handleTotalPriceChange}
                          onKeyDown={(e) => handleKeyDown(e, -1, "totals")}
                          data-testid="total-price-input"
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="mt-1 text-sm" />
                  </FormItem>
                )}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Enter the total tax or the final total — we'll keep the other in
              sync automatically.
            </p>
          </div>
        </form>
      </Form>
    );
  }
);

ItemsForm.displayName = "ItemsForm";
