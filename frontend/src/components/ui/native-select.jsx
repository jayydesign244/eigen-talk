import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function NativeSelect({ className, size = "default", ...props }) {
  return (
    <div className="group/native-select relative w-fit has-[select:disabled]:opacity-50" data-slot="native-select-wrapper">
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(
          "h-10 w-full min-w-0 appearance-none border border-input bg-card px-3 pr-9 text-sm font-medium text-foreground transition-[border-color,box-shadow] duration-150 outline-hidden hover:border-muted-foreground/60 disabled:pointer-events-none disabled:cursor-not-allowed data-[size=sm]:h-8 data-[size=sm]:text-[13px]",
          "focus-visible:border-foreground focus-visible:shadow-[inset_0_-2px_0_0_var(--foreground)] focus-visible:outline-hidden",
          "aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
}

function NativeSelectOption({ className, ...props }) {
  return <option data-slot="native-select-option" className={cn("bg-popover text-popover-foreground", className)} {...props} />;
}

function NativeSelectOptGroup({ className, ...props }) {
  return <optgroup data-slot="native-select-optgroup" className={cn("bg-popover text-popover-foreground", className)} {...props} />;
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
