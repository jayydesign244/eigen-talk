import { cva } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/** Toggle in the CRED 2026 style: 8px corners; "on" fills with the soft accent and darkens the label. */
const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold whitespace-nowrap transition-colors duration-150 outline-hidden hover:bg-accent focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent text-foreground",
        outline: "border-[0.8px] border-border-cool bg-transparent text-muted-foreground hover:text-foreground data-[state=on]:border-foreground/80 data-[state=on]:bg-card data-[state=on]:shadow-soft",
      },
      size: {
        default: "h-10 min-w-10 px-2.5",
        sm: "h-8 min-w-8 px-2 text-[13px]",
        lg: "h-12 min-w-12 px-3",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

function Toggle({ className, variant, size, ...props }) {
  return <TogglePrimitive.Root data-slot="toggle" className={cn(toggleVariants({ variant, size, className }))} {...props} />;
}

export { Toggle, toggleVariants };
