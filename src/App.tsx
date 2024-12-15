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
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { useEffect, useState } from "react";
import { ClipboardCopy } from "lucide-react";
import { useToast } from "./hooks/use-toast";

function CopyButton({ text }: { text: string }) {
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `Copied "${text}" to your clipboard.`,
      variant: "default",
    });
  };

  return (
    <Button
      // type="button"
      type="button"
      onClick={handleCopy}
      variant={"ghost"}
      // className="flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm font-medium"
    >
      <ClipboardCopy className="w-4 h-4" />
    </Button>
  );
}

const itemObject = z.object({
  name: z.string().nonempty("Name is required"),
  price: z.preprocess(
    (val) =>
      val === "" || val === undefined ? undefined : parseFloat(val as string),
    z
      .number({
        required_error: "Price is required",
        invalid_type_error: "Price must be a number",
      })
      .min(0, "Price cannot be less than 0")
  ),
});

const formSchema = z
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
      items: [{ name: "", price: 0.0 }],
      tax: 0.0,
      totalPrice: 0.0,
    },
    mode: "onBlur",
  });

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

  // Watch for changes to tax and to total price. If the user changes the total tax field, the total price should be recalculated. If the user changes the total price field, the total tax should be recalculated.
  useEffect(() => {
    const total = watchItems.reduce((acc, { price }) => acc + price, 0);
    form.setValue("totalPrice", total + watchTax);
  }, [fields, form, watchItems, watchTax, watchTotalPrice]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Submitted data:", values);
    // Itemize the bill
    const { items, tax, totalPrice } = values;
    const itemized = items.map(({ name, price }) => {
      const taxProportion = (price / totalPrice) * tax;
      return {
        name,
        price,
        tax: taxProportion,
        total: price + taxProportion,
      };
    });
    setItemizedItems(itemized);
  };

  const highlightText = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const canRemove = fields.length > 1;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center text-gray-700 mb-6">
          splittr
        </h1>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {fields.map((field, index) => (
              <Item
                form={form}
                index={index}
                field={field}
                highlightText={highlightText}
                canRemove={canRemove}
                remove={remove}
                key={field.id}
              />
            ))}

            {/* Add Item Button */}
            <div className="mt-4 flex justify-start">
              <Button
                type="button"
                onClick={() => append({ name: "", price: 0 })}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md"
              >
                Add Item
              </Button>
            </div>

            {/* Sticky Footer Summary */}
            <div className="mt-4 sticky bottom-0 bg-white shadow-inner p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total Tax Field */}
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
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
                {/* Total Price Field */}
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
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-6">
              {/* <Button
                type="button"
                onClick={() => append({ name: "", price: 0 })}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md"
              >
                Add Item
              </Button> */}
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow-md"
              >
                Itemize
              </Button>
            </div>
          </form>
        </Form>

        {/* Itemized Bill Table */}
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
                      <td className="border-b group-last:border-b-0 px-4 py-2 text-right text-gray-700 gap-1 flex justify-end items-center">
                        ${item.total.toFixed(2)}
                        <CopyButton text={item.total.toFixed(2)} />
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
    </div>
  );
}

function Item({
  form,
  index,
  field,
  highlightText,
  canRemove,
  remove,
}: {
  form: ReturnType<typeof useForm<z.infer<typeof formSchema>>>;
  index: number;
  field: { id: string };
  highlightText: (event: React.FocusEvent<HTMLInputElement>) => void;
  canRemove: boolean;
  remove: (index: number) => void;
}) {
  const currentName = useWatch({
    control: form.control,
    name: `items.${index}.name`,
  });
  const currentPrice = useWatch({
    control: form.control,
    name: `items.${index}.price`,
  });
  return (
    <Collapsible defaultOpen key={field.id} className="mb-4">
      <div className="border border-gray-200 rounded-md shadow-sm">
        <CollapsibleTrigger className="w-full flex justify-between items-center bg-gray-50 px-4 py-3 rounded-t-md hover:bg-gray-100 focus:ring focus:ring-blue-200 shadow-md active:scale-95 transition-all">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-lg text-gray-700">
              {currentName || `Item ${index + 1}`}
            </h3>
          </div>
          <span className="font-medium text-gray-600">
            ${currentPrice || 0}
          </span>
        </CollapsibleTrigger>

        <CollapsibleContent className="bg-gray-100 px-4 py-4 rounded-b-md">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_auto] gap-6 items-start">
            <FormField
              control={form.control}
              name={`items.${index}.name`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="font-medium text-gray-600">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter item name"
                      className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1 min-h-[20px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`items.${index}.price`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="font-medium text-gray-600">
                    Price
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter price"
                      onFocus={highlightText}
                      className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                      onChange={(e) => {
                        field.onChange(parseFloat(e.target.value));
                      }}
                      type="number"
                      step="0.01"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1 min-h-[20px]" />
                </FormItem>
              )}
            />
            {canRemove && (
              <div className="pt-0.5 mt-5">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                  className="text-sm text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-md shadow-sm"
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default App;
