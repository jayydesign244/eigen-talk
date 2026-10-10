import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CRED's payment receipt: a coloured band behind the head ("PAID INSTANTLY VIA
 * CRED" with an overlapping check + payee pair), a paper card with the serif
 * payee, the big amount, a caps reference line and a vertical monospace stamp,
 * and actions at the foot.
 */
function Receipt({ className, tone = "success", status, title, amount, reference, stamp, avatar, actions, children, ...props }) {
  return (
    <section data-slot="receipt" className={cn("relative isolate flex flex-col items-center px-6 pb-6", className)} {...props}>
      <div className={cn("absolute inset-x-0 top-0 -z-10 h-[62%]", tone === "success" ? "bg-success" : "bg-brand")} />
      <div className="flex items-center pt-6">
        <span className="flex size-12 items-center justify-center rounded-full border-2 border-white bg-pop-black text-white">
          <CheckIcon className="size-6" strokeWidth={3} />
        </span>
        {avatar && <span className="-ml-3 flex size-12 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-surface-2">{avatar}</span>}
      </div>
      {status && <p className="text-caps mt-3 text-[10px] tracking-[0.2em] text-pop-black">{status}</p>}
      <div className="relative mt-5 flex w-full max-w-72 flex-col items-center gap-2 bg-pop-white px-5 pt-6 pb-5 text-center text-pop-black shadow-[0_10px_30px_rgb(0_0_0/0.18)]">
        {stamp && (
          <span className="absolute top-1/2 right-1.5 -translate-y-1/2 rotate-90 font-mono text-[8px] tracking-[0.1em] whitespace-nowrap text-pop-black/50">{stamp}</span>
        )}
        {title && <p className="font-display text-xl">{title}</p>}
        {children}
        {amount && <p className="text-4xl font-extrabold tabular">{amount}</p>}
        {reference && <p className="text-caps text-[9px] tracking-[0.2em] text-pop-black/45">{reference}</p>}
        {actions && <div className="mt-3 flex w-full gap-2 [&>*]:flex-1">{actions}</div>}
      </div>
    </section>
  );
}

export { Receipt };
