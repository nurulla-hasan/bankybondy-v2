"use client";

import { useState, isValidElement, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "sm:max-w-sm",
  default: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
} as const;

interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  actionTrigger?: ReactNode;
  size?: keyof typeof sizeClasses;
  showClose?: boolean;
  className?: string;
}

export function Modal({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  title,
  description,
  children,
  actionTrigger,
  size = "default",
  showClose = false,
  className,
}: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {isValidElement(actionTrigger) && (
        <DialogTrigger render={actionTrigger} />
      )}

      <DialogContent
        className={cn(
          "flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0",
          sizeClasses[size],
          className,
        )}
      >
        {(title || description) && (
          <DialogHeader className="shrink-0 border-b border-border px-4 pt-4 pr-10 pb-4">
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-4">
          {children}
        </div>

        {showClose && (
          <DialogFooter className="mx-0 mb-0" showCloseButton />
        )}
      </DialogContent>
    </Dialog>
  );
}

