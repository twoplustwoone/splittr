import { z } from "zod";
import { Button } from "./components/ui/button";
import { useState } from "react";
import { useToast } from "./hooks/use-toast";
import { CopyButton } from "./components/copyButton";
import { ItemsForm } from "./components/itemsForm/itemsForm";
import { formSchema } from "./components/itemsForm/schema";

function App() {
  const [itemizedItems, setItemizedItems] = useState<
    { name: string; price: number; tax: number; total: number }[]
  >([]);

  const { toast } = useToast();

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gray-100 pt-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center text-gray-700 mb-6">
          splittr
        </h1>

        <ItemsForm onSubmit={handleSubmit} />

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
