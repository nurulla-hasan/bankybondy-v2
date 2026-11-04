"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "./password-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/common/multi-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import CustomCalendar from "@/components/common/custom-calender";
import { CalendarIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";



interface BaseFormInputProps {
  label: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  description?: string;
  disabled?: boolean;
  options?: { label: string; value: string }[];
  onSearchChange?: (val: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  inputMode?:

    | "none"
    | "text"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal"
    | "search";

  maxLength?: number;
  step?: string | number;
  min?: string | number;
  max?: string | number;
  className?: string;
}

export type FormInputProps = BaseFormInputProps &
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

function FormInputField({
  field,
  label,
  placeholder,
  type = "text",
  autoComplete,
  description,
  disabled,
  options,
  onSearchChange,
  onLoadMore,
  hasMore,
  isLoadingMore,
  inputMode,
  maxLength,
  step,
  min,
  max,
  className,
}: BaseFormInputProps & {
  field: AnyFieldApi;
}) {


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

  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <FieldContent>
        {type === "password" ? (
          <PasswordInput
            id={field.name}
            name={field.name}
            value={(field.state.value as string) ?? ""}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            disabled={disabled}
            maxLength={maxLength}
            aria-invalid={isInvalid}
          />
        ) : type === "textarea" ? (
          <Textarea
            id={field.name}
            name={field.name}
            value={(field.state.value as string) ?? ""}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            aria-invalid={isInvalid}
          />
        ) : type === "select" ? (
          <Select
            value={(field.state.value as string) || null}
            onValueChange={(val) => {
              field.handleChange(val ?? "");
            }}
            disabled={disabled}
          >
            <SelectTrigger
              id={field.name}
              className="w-full"
              aria-invalid={isInvalid}
            >
              <SelectValue placeholder={placeholder}>
                {(val) => {
                  if (!val) {
                    const emptyOpt = options?.find((opt) => opt.value === "");
                    return emptyOpt?.label || placeholder;
                  }
                  const found = options?.find((opt) => opt.value === val);
                  return found?.label || placeholder;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options?.map((opt) => (
                <SelectItem
                  key={opt.value || "empty-default"}
                  value={opt.value}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : type === "multi-select" ? (
          <MultiSelect
            options={options || []}
            selected={(field.state.value as string[]) || []}
            onChange={(vals) => field.handleChange(vals)}
            placeholder={placeholder}
            disabled={disabled}
            onSearchChange={onSearchChange}
            onLoadMore={onLoadMore}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          />

        ) : type === "date" ? (
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={disabled}
                  aria-invalid={isInvalid}
                  className="w-full justify-between"
                >
                  <span className={field.state.value ? "text-foreground" : "text-muted-foreground"}>
                    {field.state.value
                      ? formatDate(field.state.value as string, "dd MMM, yyyy")
                      : placeholder || "Select date"}
                  </span>
                  <CalendarIcon className="size-4 opacity-50 shrink-0 ml-2" />
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0" align="start">
              <CustomCalendar
                selected={
                  field.state.value
                    ? new Date(field.state.value as string)
                    : undefined
                }
                onSelect={(d) => {
                  if (d) {
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, "0");
                    const dd = String(d.getDate()).padStart(2, "0");
                    field.handleChange(`${yyyy}-${mm}-${dd}`);
                  } else {
                    field.handleChange("");
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        ) : (
          <Input

            id={field.name}
            name={field.name}
            type={type}
            step={step}
            min={min}
            max={max}
            value={(field.state.value as string | number) ?? ""}
            onBlur={field.handleBlur}
            onChange={(e) =>
              field.handleChange(
                type === "number"
                  ? e.target.value === ""
                    ? ""
                    : Number(e.target.value)
                  : e.target.value
              )
            }
            placeholder={placeholder}
            autoComplete={autoComplete}
            disabled={disabled}
            inputMode={inputMode}
            maxLength={maxLength}
            aria-invalid={isInvalid}
          />
        )}
        {description && <FieldDescription>{description}</FieldDescription>}
        {isInvalid && <FieldError errors={errorList} />}
      </FieldContent>
    </Field>
  );
}

export function FormInput(props: FormInputProps) {
  if ("form" in props && props.form) {
    const { form, name, ...rest } = props;
    const FormField = form.Field;
    return (
      <FormField name={name}>
        {(field: AnyFieldApi) => (
          <FormInputField field={field} {...rest} />
        )}
      </FormField>
    );
  }

  if ("field" in props && props.field) {
    const { field, ...rest } = props;
    return <FormInputField field={field} {...rest} />;
  }

  return null;
}
