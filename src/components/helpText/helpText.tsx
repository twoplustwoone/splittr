import { ReactNode } from "react";

interface HelpTextProps {
  children: ReactNode;
  text: string;
}

export const HelpText = ({ children, text }: HelpTextProps) => {
  return (
    <div className="flex flex-col">
      <div>{children}</div>
      <div className="text-xxs text-end">{text}</div>
    </div>
  );
};
