import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";

import { cn } from "~/lib/utils";
import { CheckIcon } from "lucide-react";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-full border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-[var(--luci-accent)] focus-visible:ring-2 focus-visible:ring-[var(--luci-accent)]/50 disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-[var(--luci-accent)] data-checked:bg-[var(--luci-accent)] data-checked:text-white",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3"
      >
        <CheckIcon strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
