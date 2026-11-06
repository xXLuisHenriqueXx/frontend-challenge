import { useEffect, useId, useRef, useState } from "react";
import { isAxiosError } from "axios";
import type { ComponentProps } from "react";
import type { ApiError } from "@/api/contracts";
import { message } from "@/api/client";

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
const fields = (form: HTMLFormElement) =>
  Array.from(form.elements)
    .filter(
      (node): node is Field =>
        node instanceof HTMLInputElement ||
        node instanceof HTMLSelectElement ||
        node instanceof HTMLTextAreaElement,
    )
    .filter((node) => node.type !== "hidden" && !node.disabled);
export function validateForm(form: HTMLFormElement) {
  const errors: Record<string, string> = {};
  for (const field of fields(form)) {
    if (!field.validity.valid)
      errors[field.name] = field.validity.valueMissing
        ? "Preencha este campo."
        : field.validity.typeMismatch
          ? "Informe um valor válido."
          : field.validity.tooShort
            ? `Use pelo menos ${(field as HTMLInputElement).minLength} caracteres.`
            : field.validity.patternMismatch
              ? "Confira o formato informado."
              : field.validationMessage;
  }
  const password = form.elements.namedItem("password"),
    confirmation = form.elements.namedItem("confirmPassword");
  if (
    password instanceof HTMLInputElement &&
    confirmation instanceof HTMLInputElement &&
    password.value !== confirmation.value
  )
    errors.confirmPassword = "As senhas devem coincidir.";
  return errors;
}
export function AccessibleForm({
  error,
  children,
  onSubmit,
  ref,
  ...props
}: ComponentProps<"form"> & { error?: unknown }) {
  const localRef = useRef<HTMLFormElement>(null),
    prefix = useId(),
    [errors, setErrors] = useState<Record<string, string>>({});
  const apiError = useRef<unknown>(undefined);
  const apply = (next: Record<string, string>) => {
    setErrors(next);
    const first =
      localRef.current &&
      fields(localRef.current).find((field) => next[field.name]);
    first?.focus();
  };
  useEffect(() => {
    if (!error || error === apiError.current || !localRef.current) return;
    apiError.current = error;
    const apiFields = isAxiosError<ApiError>(error)
      ? error.response?.data.fields
      : undefined;
    const first = fields(localRef.current).at(0);
    const next = Object.keys(apiFields ?? {}).length
      ? apiFields!
      : first
        ? { [first.name]: message(error) }
        : {};
    apply(next);
  }, [error]);
  useEffect(() => {
    if (!localRef.current) return;
    for (const field of fields(localRef.current)) {
      const errorId = `${prefix}-${field.name}-error`;
      const description = (field.getAttribute("aria-describedby") ?? "")
        .split(" ")
        .filter((id) => id && !id.startsWith(prefix));
      if (errors[field.name]) {
        field.setAttribute("aria-invalid", "true");
        field.dataset.formInvalid = "true";
        description.push(errorId);
      } else if (field.dataset.formInvalid === "true") {
        field.removeAttribute("aria-invalid");
        delete field.dataset.formInvalid;
      }
      if (description.length)
        field.setAttribute("aria-describedby", description.join(" "));
      else field.removeAttribute("aria-describedby");
    }
  }, [errors, prefix, children]);
  return (
    <form
      {...props}
      ref={(node) => {
        localRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      noValidate
      onInput={(e) => {
        props.onInput?.(e);
        const field = e.target as Field;
        if (errors[field.name])
          setErrors((old) => {
            const next = { ...old };
            delete next[field.name];
            return next;
          });
      }}
      onSubmit={(e) => {
        const next = validateForm(e.currentTarget);
        if (Object.keys(next).length) {
          e.preventDefault();
          apply(next);
          return;
        }
        setErrors({});
        onSubmit?.(e);
      }}
    >
      {Object.keys(errors).length > 0 && (
        <div role="alert" className="col-span-full mb-4 text-sm text-error">
          <p>Revise os campos indicados:</p>
          <ul>
            {Object.entries(errors).map(([name, text]) => (
              <li id={`${prefix}-${name}-error`} key={name}>
                {text}
              </li>
            ))}
          </ul>
        </div>
      )}
      {children}
    </form>
  );
}
