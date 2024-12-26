import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import {
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { z } from "zod";
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

type ItemsFormProps = {
  onSubmit: SubmitHandler<z.infer<typeof itemsFormSchema>>;
};

export const ItemsForm = ({ onSubmit }: ItemsFormProps) => {
  const form = useForm<z.infer<typeof itemsFormSchema>>({
    resolver: zodResolver(itemsFormSchema),
    defaultValues: {
      items: [{ name: "Item 1", price: 0.0 }],
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

  const firstItemRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (firstItemRef.current) {
      firstItemRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const total = watchItems.reduce((acc, { price }) => acc + price, 0);
    form.setValue("totalPrice", total + watchTax);
  }, [fields, form, watchItems, watchTax, watchTotalPrice]);
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
  );
};
