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
 * Toasts are rounded floating cards (12px, hairline, soft shadow). The status
 * is carried by a tinted icon chip and the words, never by colour alone.
 */
const Toaster = ({ ...props }) => {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme}
      position="top-center"
      gap={10}
      offset={72}
      mobileOffset={64}
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
            "group toast !rounded-xl !border-[0.8px] !border-border !bg-popover !text-popover-foreground !shadow-[var(--elev-float)] !font-sans",
          title: "!font-semibold !text-[13px] !tracking-[0.03em]",
          description: "!text-muted-foreground !text-xs",
          actionButton:
            "!rounded-md !bg-primary !text-primary-foreground !font-bold !text-[11px] !h-8 !px-3",
          cancelButton: "!rounded-md !bg-chip !text-foreground !font-bold !text-[11px] !h-8 !px-3",
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
