"use client";

import * as React from "react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { format, isValid } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";

import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CustomCalendar from "./custom-calender";
import { cn } from "@/lib/utils";

interface BaseFormDatePickerProps {
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  disabledDate?: (date: Date) => boolean;
  className?: string;
}

export type FormDatePickerProps = BaseFormDatePickerProps &
  (
    | {
        field: AnyFieldApi;
        form?: never;
        name?: never;
      }
    | {
        field?: never;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form: any;
        name: string;
      }
  );

function FormDatePickerField({
  field,
  label,
  placeholder = "Select date",
  description,
  disabled,
  disabledDate,
  className,
}: BaseFormDatePickerProps & {
  field: AnyFieldApi;
}) {
  const [open, setOpen] = React.useState(false);

  const rawErrors = field.state.meta.errors as unknown[] | undefined;
  const errorList = rawErrors?.length
    ? rawErrors.map((err: unknown) =>
        typeof err === "string"
          ? { message: err }
          : { message: (err as { message?: string })?.message ?? String(err) }
      )
    : undefined;

  const isInvalid = Boolean(
    (field.state.meta.isTouched || (field.form?.state.submissionAttempts ?? 0) > 0) &&
    !field.state.meta.isValid &&
    errorList &&
    errorList.length > 0
  );

  const rawValue = field.state.value as string | Date | undefined;

  const selectedDate = React.useMemo(() => {
    if (!rawValue) return undefined;
    if (rawValue instanceof Date) return isValid(rawValue) ? rawValue : undefined;
    try {
      const parsed = new Date(rawValue);
      return isValid(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }, [rawValue]);

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      field.handleChange("");
    } else {
      field.handleChange(format(date, "yyyy-MM-dd"));
    }
    field.handleBlur();
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    field.handleChange("");
    field.handleBlur();
  };

  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <FieldContent>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors outline-hidden select-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 cursor-pointer",
              !selectedDate && "text-muted-foreground",
              isInvalid && "border-destructive text-destructive"
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
              <span>
                {selectedDate ? format(selectedDate, "PPP") : placeholder}
              </span>
            </div>

            {selectedDate && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleClear(e as unknown as React.MouseEvent);
                  }
                }}
                className="cursor-pointer rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Clear date"
              >
                <X className="size-3.5" />
              </span>
            )}
          </PopoverTrigger>

          <PopoverContent
            align="start"
            sideOffset={4}
            className="w-auto p-0 border border-border bg-popover text-popover-foreground shadow-2xl rounded-xl ring-1 ring-border/50 z-100 overflow-hidden"
          >
            <CustomCalendar
              selected={selectedDate}
              onSelect={handleSelect}
              onClose={() => setOpen(false)}
              disabled={disabledDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {description && <FieldDescription>{description}</FieldDescription>}
        {isInvalid && <FieldError errors={errorList} />}
      </FieldContent>
    </Field>
  );
}

export function FormDatePicker(props: FormDatePickerProps) {
  if ("form" in props && props.form) {
    const { form, name, ...rest } = props;
    const FormField = form.Field;
    return (
      <FormField name={name}>
        {(field: AnyFieldApi) => (
          <FormDatePickerField field={field} {...rest} />
        )}
      </FormField>
    );
  }

  if ("field" in props && props.field) {
    const { field, ...rest } = props;
    return <FormDatePickerField field={field} {...rest} />;
  }

  return null;
}

export default FormDatePicker;
