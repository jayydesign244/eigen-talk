import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { cn } from "@/lib/utils";

function InputOTP({ className, containerClassName, ...props }) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn("flex items-center gap-3 has-disabled:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }) {
  return <div data-slot="input-otp-group" className={cn("flex items-center gap-1.5", className)} {...props} />;
}

/** Each digit is its own rounded key; the active one lifts on a soft shadow. */
function InputOTPSlot({ index, className, ...props }) {
  const ctx = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = ctx?.slots[index] ?? {};
  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      data-filled={Boolean(char)}
      className={cn(
        "relative flex h-12 w-10 items-center justify-center rounded-md border border-input bg-card font-mono text-lg font-bold transition-[border-color,transform] duration-150 outline-hidden aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-foreground data-[active=true]:shadow-soft data-[filled=true]:border-muted-foreground/60",
        className
      )}
      {...props}
    >
      {char && <span className="animate-pop">{char}</span>}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-0.5 animate-blink rounded-full bg-caret" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator(props) {
  return (
    <div data-slot="input-otp-separator" role="separator" className="h-0.5 w-3 bg-muted-foreground/60" {...props} />
  );
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
