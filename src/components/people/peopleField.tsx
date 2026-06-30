import { useState } from "react";
import { Control, useFieldArray } from "react-hook-form";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials, personColorClass } from "@/lib/people";
import { Input } from "@/components/ui/input";
import type { ItemsFormValues } from "../itemsForm/itemsForm";

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `p_${Math.random().toString(36).slice(2)}`;

export function PeopleField({
  control,
}: {
  control: Control<ItemsFormValues>;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "people" });
  const [draft, setDraft] = useState("");

  const addPerson = () => {
    const name = draft.trim();
    if (!name) return;
    append({ id: makeId(), name });
    setDraft("");
  };

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        People
        <span className="font-normal normal-case tracking-normal">
          — optional, add to split per person
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {fields.map((field, index) => (
          <span
            key={field.id}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 text-sm font-medium text-white",
              personColorClass(index)
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-[0.625rem] font-semibold">
              {getInitials(field.name)}
            </span>
            {field.name}
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={`Remove ${field.name}`}
              className="ml-0.5 rounded-full p-0.5 hover:bg-white/25"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addPerson();
            }
          }}
          onBlur={addPerson}
          placeholder={fields.length ? "Add another" : "Add a person…"}
          className="h-8 w-36 flex-none"
          aria-label="Add a person"
        />
      </div>
    </div>
  );
}
