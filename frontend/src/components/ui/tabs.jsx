import { cva } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Tabs({ className, orientation = "horizontal", ...props }) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn("group/tabs flex gap-3 data-[orientation=horizontal]:flex-col", className)}
      {...props}
    />
  );
}

/**
 * default: segmented block — the active tab is an inverted key.
 * line: editorial tabs — a thick rule slides under the active label.
 */
const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col group-data-[orientation=vertical]/tabs:items-stretch",
  {
    variants: {
      variant: {
        default: "border border-border bg-muted p-1 group-data-[orientation=horizontal]/tabs:h-10",
        line: "gap-5 border-b border-border bg-transparent group-data-[orientation=horizontal]/tabs:h-10 group-data-[orientation=vertical]/tabs:gap-1 group-data-[orientation=vertical]/tabs:border-r group-data-[orientation=vertical]/tabs:border-b-0",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function TabsList({ className, variant = "default", ...props }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-full flex-1 items-center justify-center gap-1.5 px-3 text-[13px] font-bold whitespace-nowrap text-muted-foreground transition-colors duration-150 outline-hidden hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45 group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start group-data-[orientation=vertical]/tabs:py-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=default]/tabs-list:data-[state=active]:bg-foreground group-data-[variant=default]/tabs-list:data-[state=active]:text-background",
        "group-data-[variant=line]/tabs-list:px-0 group-data-[variant=line]/tabs-list:data-[state=active]:text-foreground group-data-[orientation=vertical]/tabs:group-data-[variant=line]/tabs-list:pr-4",
        "after:absolute after:bg-foreground after:transition-transform after:duration-300 after:ease-[var(--ease-out-expo)] group-data-[variant=default]/tabs-list:after:hidden",
        "group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:-bottom-px group-data-[orientation=horizontal]/tabs:after:h-[3px] group-data-[orientation=horizontal]/tabs:after:origin-left group-data-[orientation=horizontal]/tabs:after:scale-x-0 group-data-[orientation=horizontal]/tabs:data-[state=active]:after:scale-x-100",
        "group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-px group-data-[orientation=vertical]/tabs:after:w-[3px] group-data-[orientation=vertical]/tabs:after:origin-top group-data-[orientation=vertical]/tabs:after:scale-y-0 group-data-[orientation=vertical]/tabs:data-[state=active]:after:scale-y-100",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-hidden data-[state=active]:animate-rise", className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants };
