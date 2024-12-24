import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const highlightText = (event: React.FocusEvent<HTMLInputElement>) => {
  event.target.select();
};
