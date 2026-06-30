import { ReactNode } from "react";

interface HelpTextProps {
  children: ReactNode;
  text: string;
}

export const HelpText = ({ children, text }: HelpTextProps) => {
  return (
    <div className="flex flex-col">
      <div>{children}</div>
      <div className="mt-0.5 text-end text-[0.6875rem] leading-tight text-muted-foreground">
        {text}
      </div>
    </div>
  );
};
