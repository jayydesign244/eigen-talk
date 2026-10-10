import { cn } from "@/lib/utils";

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm leading-relaxed text-foreground transition-[border-color,box-shadow] duration-150 outline-hidden placeholder:text-muted-foreground/80 hover:border-muted-foreground/60 focus-visible:border-foreground focus-visible:outline-hidden disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:border-destructive aria-invalid:shadow-[inset_0_-2px_0_0_var(--destructive)]",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
