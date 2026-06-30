import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Check, ClipboardCopy } from "lucide-react";

function CopyButton({ text }: { text: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1200);
    toast({
      title: "Copied!",
      description: `Copied "${text}" to your clipboard.`,
      variant: "default",
    });
  };

  return (
    <Button
      type="button"
      onClick={handleCopy}
      variant="ghost"
      size="icon"
      aria-label="Copy total"
      className="h-8 w-8 text-muted-foreground hover:text-foreground"
    >
      {copied ? (
        <Check className="h-4 w-4 text-primary" />
      ) : (
        <ClipboardCopy className="h-4 w-4" />
      )}
    </Button>
  );
}

export { CopyButton };
