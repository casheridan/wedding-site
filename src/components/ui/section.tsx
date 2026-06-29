import { cn } from "@/lib/utils";
import { Container } from "./container";

export function Section({
  eyebrow,
  title,
  description,
  className,
  containerClassName,
  children,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
  containerClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={cn("py-16 sm:py-24", className)}>
      <Container className={containerClassName}>
        {(eyebrow || title || description) && (
          <div className="mx-auto mb-12 max-w-2xl text-center">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && (
              <h2 className="mt-3 text-3xl sm:text-4xl text-sage-800">{title}</h2>
            )}
            {description && (
              <p className="mt-4 text-base leading-relaxed text-ink/70">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
