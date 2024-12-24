import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useToast } from "./hooks/use-toast";
import { Item, itemObject } from "@/components/item";
import { CopyButton } from "./components/copyButton";
import { highlightText } from "./lib/utils";

export const formSchema = z
  .object({
    items: z.array(itemObject),
    tax: z.preprocess(
      (val) => (val === "" ? undefined : parseFloat(val as string)),
      z.number({
        required_error: "Tax must be a number",
        invalid_type_error: "Tax must be a number",
      })
    ),
    totalPrice: z.preprocess(
      (val) => (val === "" ? undefined : parseFloat(val as string)),
      z.number({
        required_error: "Total Price must be a number",
        invalid_type_error: "Total Price must be a number",
      })
    ),
  })
  .refine((data) => data.tax !== undefined || data.totalPrice !== undefined, {
    message: "Either tax or total price is required",
    path: ["tax", "totalPrice"],
  });

function App() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ name: "Item 1", price: 0.0 }],
      tax: 0.0,
      totalPrice: 0.0,
    },
    mode: "onBlur",
  });

  const firstItemRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (firstItemRef.current) {
      firstItemRef.current.focus();
    }
  }, []);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = useWatch({ control: form.control, name: "items" });
  const watchTax = useWatch({ control: form.control, name: "tax" });
  const watchTotalPrice = useWatch({
    control: form.control,
    name: "totalPrice",
  });

  const [itemizedItems, setItemizedItems] = useState<
    { name: string; price: number; tax: number; total: number }[]
  >([]);

  const { toast } = useToast();

  useEffect(() => {
    const total = watchItems.reduce((acc, { price }) => acc + price, 0);
    form.setValue("totalPrice", total + watchTax);
  }, [fields, form, watchItems, watchTax, watchTotalPrice]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const { items, tax, totalPrice } = values;
    const itemized = items.map(({ name, price }) => {
      const taxProportion = (price / (totalPrice - tax)) * tax;
      return {
        name,
        price,
        tax: taxProportion,
        total: price + taxProportion,
      };
    });
    setItemizedItems(itemized);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    currentIndex: number,
    fieldType: "name" | "price" | "totals"
  ) => {
    if (e.metaKey && e.key === "Enter") {
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
    <div className="min-h-screen flex flex-col items-center justify-between bg-gray-100 pt-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center text-gray-700 mb-6">
          splittr
        </h1>

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
                ref={index === 0 ? firstItemRef : null} // Provide a ref for the first input
              />
            ))}

            <div className="mt-4 flex justify-start">
              <Button
                type="button"
                onClick={() =>
                  append({ name: `Item ${fields.length + 1}`, price: 0 })
                }
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md"
              >
                Add Item
              </Button>
            </div>

            <div className="mt-4 sticky bottom-0 bg-white shadow-inner p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tax"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-medium text-gray-600">
                        Total Tax
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter total tax"
                          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md transition-all"
                          onFocus={highlightText}
                          type="number"
                          step="0.01"
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          onKeyDown={(e) => handleKeyDown(e, -1, "totals")}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalPrice"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-medium text-gray-600">
                        Total Price
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter total price"
                          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md transition-all"
                          onFocus={highlightText}
                          type="number"
                          step="0.01"
                          onKeyDown={(e) => handleKeyDown(e, -1, "totals")}
                          disabled
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow-md"
              >
                Itemize
              </Button>
            </div>
          </form>
        </Form>

        {itemizedItems.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">
              Itemized Bill
            </h2>
            <div className="overflow-x-auto">
              <table className="table-auto w-full border-collapse border rounded-md">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 text-left text-gray-600">
                      Name
                    </th>
                    <th className="border px-4 py-2 text-right text-gray-600">
                      Price
                    </th>
                    <th className="border px-4 py-2 text-right text-gray-600">
                      Tax
                    </th>
                    <th className="border px-4 py-2 text-right text-gray-600">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {itemizedItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 group">
                      <td className="border px-4 py-2 text-gray-700">
                        {item.name}
                      </td>
                      <td className="border px-4 py-2 text-right text-gray-700">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="border px-4 py-2 text-right text-gray-700">
                        ${item.tax.toFixed(2)}
                      </td>
                      <td className="border-b group-last:border-b-0 px-4 py-2 text-right text-gray-700">
                        <div className="h-full w-full gap-1 flex justify-end items-center">
                          ${item.total.toFixed(2)}
                          <CopyButton text={item.total.toFixed(2)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {itemizedItems.length > 0 && (
              <div className="mt-4 flex justify-center">
                <Button
                  type="button"
                  onClick={() => {
                    const summary = itemizedItems
                      .map((item) => `${item.name}: $${item.total.toFixed(2)}`)
                      .join("\n");
                    navigator.clipboard.writeText(summary);
                    toast({
                      title: "Items Copied!",
                      description:
                        "All item names and totals have been copied to your clipboard.",
                      variant: "default",
                    });
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md"
                >
                  Copy All Items and Totals
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="w-full bg-gray-50 border-t border-gray-200 py-4 mt-4 text-center sticky bottom-0 flex items-center justify-center">
        <a href="https://www.buymeacoffee.com/twoplustwoone" target="_blank">
          <img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
            alt="Buy Me A Coffee"
            className="h-12 w-48"
          />
        </a>
      </footer>
    </div>
  );
}

export default App;
