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

interface BaseFormInputProps {
  label: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  description?: string;
  disabled?: boolean;
  options?: { label: string; value: string }[];
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
              className="w-full cursor-pointer"
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
                  className="cursor-pointer"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
