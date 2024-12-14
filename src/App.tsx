import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./components/ui/button";

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

const formSchema = z.object({
  items: z.array(itemObject),
  tax: z
    .preprocess((val) => parseFloat(val as string), z.number().optional())
    .optional(),
});

function App() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ name: "", price: 0 }],
      tax: 0,
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Submitted data:", values);
  };

  const highlightText = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const canRemove = fields.length > 1;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-gray-700 mb-8">
          splittr
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-[2fr_2fr_auto] gap-6 bg-gray-50 p-4 rounded-lg shadow-sm mb-4 items-start"
              >
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
                          placeholder="Enter item name"
                          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                          {...field}
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
                          placeholder="Enter price"
                          onFocus={highlightText}
                          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1 min-h-[20px]" />
                    </FormItem>
                  )}
                />
                {canRemove && (
                  <div className="lg:mt-0.5 lg:pt-5 flex justify-center items-center">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(index)}
                      className="text-sm text-red-600 bg-red-100 hover:bg-red-200 px-4 py-2 rounded-md shadow-sm min-w-[80px] md:min-w-[100px] flex justify-center"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ))}
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <Button
                type="button"
                onClick={() => append({ name: "", price: 0 })}
                className="w-full md:w-auto text-sm text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md shadow-md"
              >
                Add Item
              </Button>
              <Button
                type="submit"
                className="w-full md:w-auto text-sm text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md shadow-md"
              >
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default App;
