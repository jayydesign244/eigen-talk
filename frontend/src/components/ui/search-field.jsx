import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { SearchIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Search inputs from CRED:
 *  - outline: square field with a 1px rule ("got a place in mind?", "search bank").
 *  - pill:    the dark rounded pill on UPI screens ("pay to phone number"),
 *             often with a trailing chip such as the "123" keypad toggle.
 * A clear button appears when `value` is set and `onClear` is passed.
 */
const searchFieldVariants = cva(
  "group/search relative flex w-full items-center gap-3 text-sm transition-colors focus-within:border-foreground",
  {
    variants: {
      variant: {
        outline: "h-12 border border-input bg-card px-4 hover:border-muted-foreground/60",
        pill: "dark h-12 rounded-full border border-border-strong bg-pop-black px-5 text-foreground",
        filled: "h-11 rounded-md bg-surface-2 px-4",
      },
    },
    defaultVariants: { variant: "outline" },
  }
);

const SearchField = forwardRef(function SearchField(
  { className, variant, value, onClear, trailing, inputClassName, "aria-label": ariaLabel, placeholder, ...props },
  ref
) {
  return (
    <div data-slot="search-field" data-variant={variant} className={cn(searchFieldVariants({ variant }), className)}>
      <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <input
        ref={ref}
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent font-medium tracking-[0.02em] text-foreground outline-hidden placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden",
          inputClassName
        )}
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="flex size-6 shrink-0 items-center justify-center text-foreground outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring"
        >
          <XIcon className="size-4" />
        </button>
      )}
      {trailing}
    </div>
  );
});

/** The small boxed trailing toggle ("123" to open the number pad). */
function SearchFieldChip({ className, ...props }) {
  return (
    <button
      type="button"
      data-slot="search-field-chip"
      className={cn(
        "shrink-0 rounded-xs border border-current px-1 py-px font-mono text-[9px] leading-tight font-bold text-muted-foreground outline-hidden hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
        className
      )}
      {...props}
    />
  );
}

export { SearchField, SearchFieldChip, searchFieldVariants };
