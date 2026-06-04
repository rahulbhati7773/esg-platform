import type { ReactNode } from "react";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export type FormSelectOption = {
  value: string;
  label: string;
};

export type FormSelectGroup = {
  label: string;
  options: FormSelectOption[];
};

type FormSelectProps = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  options?: FormSelectOption[];
  groups?: FormSelectGroup[];
  "aria-label"?: string;
};

export function FormSelect({
  id,
  value,
  onValueChange,
  placeholder = "Select…",
  disabled,
  options = [],
  groups = [],
  "aria-label": ariaLabel,
}: FormSelectProps) {
  const hasValue = value !== "" && value !== "0";

  return (
    <Select.Root
      value={hasValue ? value : undefined}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <Select.Trigger id={id} className="form-trigger" aria-label={ariaLabel}>
        <span className="form-trigger-value">
          <Select.Value placeholder={placeholder} />
        </span>
        <Select.Icon className="form-trigger-icon shrink-0">
          <ChevronDown className="h-4 w-4" aria-hidden />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="form-dropdown min-w-[var(--radix-select-trigger-width)]"
          position="popper"
          sideOffset={6}
          align="start"
        >
          <Select.Viewport className="scroll-themed form-dropdown-viewport">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
            {groups.map((group) => (
              <Select.Group key={group.label}>
                <Select.Label className="form-dropdown-label">
                  {group.label}
                </Select.Label>
                {group.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select.Group>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function SelectItem({
  children,
  value,
}: {
  children: ReactNode;
  value: string;
}) {
  return (
    <Select.Item value={value} className="form-dropdown-item">
      <Select.ItemIndicator className="form-dropdown-check">
        <Check className="h-3.5 w-3.5" aria-hidden />
      </Select.ItemIndicator>
      <Select.ItemText>{children}</Select.ItemText>
    </Select.Item>
  );
}
