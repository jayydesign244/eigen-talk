import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

const ToggleGroupContext = React.createContext({ size: "default", variant: "default", spacing: 0 });

/** With spacing 0 this is a segmented control: one outer rule, inverted active cell. */
function ToggleGroup({ className, variant, size, spacing = 0, children, ...props }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ "--gap": spacing }}
      className={cn("group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))]", className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({ className, children, variant, size, ...props }) {
  const context = React.useContext(ToggleGroupContext);
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({ variant: context.variant || variant, size: context.size || size }),
        "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10",
        "data-[spacing=0]:data-[variant=outline]:-ml-px data-[spacing=0]:data-[variant=outline]:first:ml-0",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
