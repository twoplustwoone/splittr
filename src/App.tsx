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
    reValidateMode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Submitted data:", values);
  };

  const canRemove = fields.length > 1;

  const highlightText = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  return (
    <>
      <h1>splittr</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-center">
              <FormField
                control={form.control}
                name={`items.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Item Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.price`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        onFocus={highlightText}
                        placeholder="Item Price"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {canRemove && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <div className="mt-4">
            <Button
              type="button"
              onClick={() => append({ name: "", price: 0 })}
            >
              Add Item
            </Button>
            <Button type="submit" className="ml-2">
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}

export default App;
