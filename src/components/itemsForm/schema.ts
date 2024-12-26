import { z } from "zod";
import { itemObject } from "../item/schema";

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
