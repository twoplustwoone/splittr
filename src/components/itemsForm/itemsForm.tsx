import { zodResolver } from "@hookform/resolvers/zod";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { z } from "zod";
import { Plus, Receipt } from "lucide-react";
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

type ItemsFormProps = {
  onSubmit: SubmitHandler<z.infer<typeof itemsFormSchema>>;
};

export type ItemsFormHandle = {
  reset: () => void;
};

const defaultValues = {
  items: [{ name: "Item 1", price: 0.0 }],
  tax: 0.0,
  totalPrice: 0.0,
};

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
  ({ onSubmit }, ref) => {
    const form = useForm<z.infer<typeof itemsFormSchema>>({
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

      const subtotal = watchItems.reduce((acc, { price }) => acc + price, 0);
      form.setValue("tax", newTotal - subtotal);
    };

    useEffect(() => {
      if (!isManualTotal) {
        const subtotal = watchItems.reduce((acc, { price }) => acc + price, 0);
        const newTotal = subtotal + watchTax;

        if (newTotal !== watchTotalPrice) {
          form.setValue("totalPrice", newTotal);
        }
      }
    }, [isManualTotal, watchItems, watchTax, watchTotalPrice, form]);

    const handleKeyDown = (
      e: React.KeyboardEvent,
      currentIndex: number,
      fieldType: "name" | "price" | "totals"
    ) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        form.handleSubmit(onSubmit)();
      } else if (e.key === "Enter") {
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
        } else if (fieldType === "totals") {
          form.handleSubmit(onSubmit)();
        }
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {fields.map((field, index) => (
            <Item
              control={form.control}
              index={index}
              field={field}
              canRemove={fields.length > 1}
              onRemove={remove}
              key={field.id}
              onKeyDown={handleKeyDown}
              name={`items.${index}.name`}
              ref={index === 0 ? firstItemRef : null} // Provide a ref for the first input
              onPriceChange={(e) => handleItemPriceChange(index, e)}
            />
          ))}

          <div className="mt-2 flex justify-start">
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
                    <FormControl>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          $
                        </span>
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
                      </div>
                    </FormControl>
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
                    <FormControl>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          $
                        </span>
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
                      </div>
                    </FormControl>
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

          <div className="mt-6 flex justify-end">
            <HelpText text={"⌘ / Ctrl + Enter ↵"}>
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                <Receipt className="h-4 w-4" />
                Itemize
              </Button>
            </HelpText>
          </div>
        </form>
      </Form>
    );
  }
);

ItemsForm.displayName = "ItemsForm";
