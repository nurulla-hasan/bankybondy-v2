import * as React from "react";
import { toast as sonnerToast, type ExternalToast } from "sonner";

export type ToastType = "success" | "error" | "info" | "warning" | "loading" | "default";

export interface ToastAddOptions extends Omit<ExternalToast, "description"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  type?: ToastType;
}

/**
 * Simple success toast
 * Usage:
 * successToast("Welcome Back");
 * successToast("Registration Initiated", "Check your email for the code.");
 */
export function successToast(
  message: React.ReactNode,
  description?: React.ReactNode,
  options?: ExternalToast
) {
  return sonnerToast.success(message, {
    description,
    ...options,
  });
}

/**
 * Simple error toast
 * Usage:
 * errorToast("Invalid credentials");
 * errorToast("Registration Failed", getErrorMessage(err));
 */
export function errorToast(
  message: React.ReactNode,
  description?: React.ReactNode,
  options?: ExternalToast
) {
  return sonnerToast.error(message, {
    description,
    ...options,
  });
}

/**
 * Simple info toast
 */
export function infoToast(
  message: React.ReactNode,
  description?: React.ReactNode,
  options?: ExternalToast
) {
  return sonnerToast.info(message, {
    description,
    ...options,
  });
}

/**
 * Simple warning toast
 */
export function warningToast(
  message: React.ReactNode,
  description?: React.ReactNode,
  options?: ExternalToast
) {
  return sonnerToast.warning(message, {
    description,
    ...options,
  });
}

/**
 * Object-based toast utility for structured options
 */
export function addToast({
  title,
  description,
  type = "default",
  ...rest
}: ToastAddOptions) {
  const options: ExternalToast = {
    description,
    ...rest,
  };

  switch (type) {
    case "success":
      return sonnerToast.success(title, options);
    case "error":
      return sonnerToast.error(title, options);
    case "warning":
      return sonnerToast.warning(title, options);
    case "info":
      return sonnerToast.info(title, options);
    case "loading":
      return sonnerToast.loading(title, options);
    default:
      return sonnerToast(title, options);
  }
}

export const toast = sonnerToast;
export default sonnerToast;
