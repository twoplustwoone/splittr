import React, { forwardRef } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";
import { Control, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { formSchema } from "@/App";

export const itemObject = z.object({
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

interface ItemProps {
  control: Control<z.infer<typeof formSchema>>;
  index: number;
  field: { id: string };
  highlightText: (event: React.FocusEvent<HTMLInputElement>) => void;
  canRemove: boolean;
  remove: (index: number) => void;
  handleKeyDown: (
    e: React.KeyboardEvent,
    currentIndex: number,
    fieldType: "name" | "price"
  ) => void;
}

const Item = forwardRef<HTMLInputElement, ItemProps>(
  (
    {
      control,
      index,
      field,
      highlightText,
      canRemove,
      remove,
      handleKeyDown,
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
      <Collapsible defaultOpen key={field.id} className="mb-4">
        <div className="border border-gray-200 rounded-md shadow-sm">
          <CollapsibleTrigger className="w-full flex justify-between items-center bg-gray-50 px-4 py-3 rounded-t-md hover:bg-gray-100 focus:ring focus:ring-blue-200 shadow-md active:scale-95 transition-all">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg text-gray-700">
                {typeof currentName === "string"
                  ? currentName
                  : `Item ${index + 1}`}
              </h3>
            </div>
            <span className="font-medium text-gray-600">
              ${typeof currentPrice === "number" ? currentPrice : 0}
            </span>
          </CollapsibleTrigger>

          <CollapsibleContent className="bg-gray-100 px-4 py-4 rounded-b-md">
            <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_auto] gap-6 items-start">
              <FormField
                control={control}
                name={`items.${index}.name` as `items.${number}.name`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-medium text-gray-600">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        data-index={`${index}-name`}
                        placeholder="Enter item name"
                        className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                        onKeyDown={(e) => handleKeyDown(e, index, "name")}
                        onFocus={highlightText}
                        ref={ref}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm mt-1 min-h-[20px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`items.${index}.price` as `items.${number}.price`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-medium text-gray-600">
                      Price
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        data-index={`${index}-price`}
                        placeholder="Enter price"
                        onFocus={highlightText}
                        className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                        onKeyDown={(e) => handleKeyDown(e, index, "price")}
                        type="number"
                        step="0.01"
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm mt-1 min-h-[20px]" />
                  </FormItem>
                )}
              />
              {canRemove && (
                <div className="mt-5 pt-0.5">
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
);

Item.displayName = "Item";

export { Item };
