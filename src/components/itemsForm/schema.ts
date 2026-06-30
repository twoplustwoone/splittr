import { z } from "zod";
import { itemObject } from "../item/schema";

export const personObject = z.object({
  id: z.string(),
  name: z.string(),
});

export const tipObject = z.object({
  mode: z.enum(["percent", "amount"]),
  value: z.preprocess(
    (val) => (val === "" || val === undefined ? 0 : parseFloat(val as string)),
    z.number().min(0)
  ),
});

export const itemsFormSchema = z.object({
  items: z.array(itemObject),
  people: z.array(personObject).default([]),
  tax: z.preprocess(
    (val) => (val === "" ? undefined : parseFloat(val as string)),
    z.number({
      required_error: "Tax must be a number",
      invalid_type_error: "Tax must be a number",
    })
  ),
  tip: tipObject,
});
