import * as Popover from "@radix-ui/react-popover";
import { format, isValid, parseISO } from "date-fns";
import { Calendar } from "lucide-react";
import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "../../lib/cn.js";

type FormDatePickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

function toDate(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
}

function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function FormDatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  "aria-label": ariaLabel,
}: FormDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => toDate(value), [value]);

  const label = selected ? format(selected, "dd MMM yyyy") : placeholder;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild disabled={disabled}>
        <button
          id={id}
          type="button"
          aria-label={ariaLabel}
          className={cn(
            "form-trigger justify-between text-left font-normal",
            !selected && "text-[var(--text-subtle)]",
          )}
        >
          <span className="truncate">{label}</span>
          <Calendar className="h-4 w-4 shrink-0 text-[var(--text-subtle)]" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="form-popover"
          align="start"
          sideOffset={6}
        >
          {selected && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="mb-2 w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
            >
              Clear date
            </button>
          )}
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (!date) {
                return;
              }
              onChange(toIsoDate(date));
              setOpen(false);
            }}
            defaultMonth={selected}
            className="form-calendar"
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
