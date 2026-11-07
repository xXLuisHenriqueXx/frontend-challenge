import { errorsFor, message } from "@/shared/lib/errors";
import { validationMessage } from "@/shared/lib/validation";
import type { ComponentProps } from "react";
import { useEffect, useId, useRef, useState } from "react";

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
const isField = (node: EventTarget | null): node is Field =>
  node instanceof HTMLInputElement ||
  node instanceof HTMLSelectElement ||
  node instanceof HTMLTextAreaElement;
const fields = (form: HTMLFormElement) =>
  Array.from(form.elements)
    .filter(isField)
    .filter((node) => node.type !== "hidden" && !node.disabled);

function focusFirstError(
  form: HTMLFormElement,
  errors: Record<string, string>,
) {
  fields(form)
    .find((field) => errors[field.name])
    ?.focus();
}
export function validateForm(form: HTMLFormElement) {
  const errors: Record<string, string> = {};
  for (const field of fields(form)) {
    if (!field.validity.valid)
      errors[field.name] = validationMessage(
        field.validity,
        "minLength" in field ? field.minLength : 0,
        field.validationMessage,
      );
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
    if (localRef.current) focusFirstError(localRef.current, next);
  };
  useEffect(() => {
    if (!error || error === apiError.current || !localRef.current) return;
    apiError.current = error;
    const apiFields = errorsFor(error);
    const first = fields(localRef.current).at(0);
    const next = Object.keys(apiFields).length
      ? apiFields
      : first
        ? { [first.name]: message(error) }
        : {};
    setErrors(next);
    focusFirstError(localRef.current, next);
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
        const field = e.target;
        if (!isField(field)) return;
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
