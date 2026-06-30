import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const highlightText = (event: React.FocusEvent<HTMLInputElement>) => {
  event.target.select();
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatCurrency = (value: number) => {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
};
