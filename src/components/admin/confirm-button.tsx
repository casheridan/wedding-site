"use client";

/**
 * A submit button bound to a server action via `formAction`, with a
 * confirmation prompt. Used for destructive actions inside admin forms.
 */
export function ConfirmButton({
  formAction,
  message,
  className,
  children,
}: {
  formAction: (formData: FormData) => void | Promise<void>;
  message: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      formAction={formAction}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
