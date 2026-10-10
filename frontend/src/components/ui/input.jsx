import { cn } from "@/lib/utils";

/**
 * Square field with a 1px rule. Focus thickens the bottom rule into the
 * foreground colour (NeoPOP's input language) instead of a soft glow.
 */
const inputBase =
  "h-10 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm text-foreground transition-[border-color,box-shadow,background-color] duration-150 outline-hidden placeholder:text-muted-foreground/80 selection:bg-brand selection:text-brand-foreground file:mr-3 file:inline-flex file:h-7 file:border-0 file:bg-muted file:px-2 file:text-xs file:font-bold file:text-foreground hover:border-muted-foreground/60 focus-visible:border-foreground focus-visible:outline-hidden disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:border-destructive aria-invalid:shadow-[inset_0_-2px_0_0_var(--destructive)]";

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputBase, className)}
      {...props}
    />
  );
}

export { Input, inputBase };
