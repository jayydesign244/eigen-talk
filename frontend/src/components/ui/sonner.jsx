import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon
} from "lucide-react";
import { Toaster as Sonner } from "sonner";
import { useTheme } from "@/components/theme-provider";

/**
 * Toasts are hard-edged cards with a colour bar on the left that carries the
 * status, so meaning never depends on the icon colour alone.
 */
const Toaster = ({ ...props }) => {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme}
      position="bottom-right"
      gap={10}
      offset={20}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-success-ink" />,
        info: <InfoIcon className="size-4 text-info-ink" />,
        warning: <TriangleAlertIcon className="size-4 text-warning-ink" />,
        error: <OctagonXIcon className="size-4 text-destructive-ink" />,
        loading: <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast !rounded-none !border !border-border !bg-popover !text-popover-foreground !shadow-none !font-sans border-l-4! data-[type=success]:!border-l-success data-[type=error]:!border-l-destructive data-[type=warning]:!border-l-warning data-[type=info]:!border-l-info data-[type=default]:!border-l-foreground",
          title: "!font-bold !text-[13px]",
          description: "!text-muted-foreground !text-xs",
          actionButton:
            "!rounded-none !bg-primary !text-primary-foreground !font-bold !text-xs !h-7 !px-3",
          cancelButton: "!rounded-none !bg-muted !text-foreground !font-bold !text-xs !h-7 !px-3",
          closeButton: "!rounded-none !border-border !bg-popover !text-muted-foreground hover:!text-foreground"
        }
      }}
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "0px"
      }}
      {...props}
    />
  );
};

export { Toaster };
