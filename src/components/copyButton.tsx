import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ClipboardCopy } from "lucide-react";

function CopyButton({ text }: { text: string }) {
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `Copied "${text}" to your clipboard.`,
      variant: "default",
    });
  };

  return (
    <Button type="button" onClick={handleCopy} variant="ghost">
      <ClipboardCopy className="w-4 h-4" />
    </Button>
  );
}

export { CopyButton };
