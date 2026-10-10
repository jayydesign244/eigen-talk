import { PlusIcon } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Accordion(props) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({ className, ...props }) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-border last:border-b-0", className)}
      {...props}
    />
  );
}

/** The plus turns into a cross as the panel opens. */
function AccordionTrigger({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion flex flex-1 items-center justify-between gap-4 py-4 text-left text-[15px] font-bold tracking-[0.01em] transition-colors outline-hidden hover:text-foreground/80 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45",
          className
        )}
        {...props}
      >
        {children}
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full border-[0.8px] border-border transition-colors group-hover/accordion:border-foreground/60 group-data-[state=open]/accordion:border-foreground group-data-[state=open]/accordion:bg-foreground group-data-[state=open]/accordion:text-background">
          <PlusIcon className="pointer-events-none size-3.5 transition-transform duration-300 ease-[var(--ease-standard)] group-data-[state=open]/accordion:rotate-45" strokeWidth={2.5} />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pt-0 pb-4 leading-relaxed", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
