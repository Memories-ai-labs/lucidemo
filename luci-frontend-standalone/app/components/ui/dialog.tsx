import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { XIcon } from "lucide-react";

function usePageVisible() {
  const [visible, setVisible] = React.useState(
    () => typeof document !== "undefined" && !document.hidden,
  );

  React.useEffect(() => {
    const handler = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  return visible;
}

function Dialog({ open, onOpenChange, ...props }: DialogPrimitive.Root.Props) {
  const visible = usePageVisible();

  // 页面隐藏时，忽略 open=true，直接当作关闭
  const effectiveOpen = visible ? open : false;

  // 如果页面隐藏时试图打开，通知外部保持关闭状态
  React.useEffect(() => {
    if (!visible && open) {
      onOpenChange?.(
        false,
        {} as Parameters<NonNullable<typeof onOpenChange>>[1],
      );
    }
  }, [visible, open, onOpenChange]);

  return (
    <DialogPrimitive.Root
      data-slot="dialog"
      open={effectiveOpen}
      onOpenChange={onOpenChange}
      {...props}
    />
  );
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ className, ...props }: DialogPrimitive.Close.Props) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      className={cn(
        "h-11 px-5 rounded-full bg-[var(--luci-accent)] hover:bg-[var(--luci-accent-hover)] text-white text-[14px] leading-[20px] font-normal transition-colors cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/40 backdrop-blur-md duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-[420px] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl bg-[var(--luci-surface-bg)] p-6 text-sm text-text-0 shadow-2xl duration-100 outline-none  data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex justify-end gap-2", className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-[20px] font-extrabold leading-[30px] ", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-[14px] leading-[20px] font-normal text-text-1 mb-3 mt-1 ",
        className,
      )}
      {...props}
    />
  );
}

function DialogCloseWhite({
  className,
  ...props
}: DialogPrimitive.Close.Props) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close-white"
      className={cn(
        "h-11 px-5 w-30 rounded-full bg-transparent border border-[var(--luci-border)] hover:bg-[var(--luci-surface-hover)] text-text-0 text-[14px] leading-[20px] font-normal transition-colors cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

function DialogCloseYellow({
  className,
  ...props
}: DialogPrimitive.Close.Props) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close-yellow"
      className={cn(
        "h-11 px-5 w-30 rounded-full bg-[var(--luci-accent)] hover:bg-[var(--luci-accent-hover)] text-white text-[14px] leading-[20px] font-normal transition-colors cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogCloseWhite,
  DialogCloseYellow,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
