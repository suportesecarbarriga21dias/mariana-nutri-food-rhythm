import type { ButtonHTMLAttributes, ReactNode } from "react";

export function PrimaryButton({ className = "", ...p }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className={`inline-flex min-h-14 w-full items-center justify-center rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-[0_8px_24px_-10px_var(--primary)] transition active:scale-[0.98] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent ${className}`}
    />
  );
}

export function GhostButton({ className = "", ...p }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className={`inline-flex min-h-14 items-center justify-center rounded-full border border-border bg-card px-5 text-base font-medium text-foreground transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent ${className}`}
    />
  );
}

export function OptionCard({ selected, multi, onClick, children }: { selected: boolean; multi: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-[15px] transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent ${
        selected ? "border-primary bg-primary-soft font-semibold text-accent-foreground" : "border-border bg-card"
      }`}
    >
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center border-2 ${multi ? "rounded-md" : "rounded-full"} ${
          selected ? "border-primary bg-primary text-primary-foreground" : "border-input"
        }`}
      >
        {selected && (
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        )}
      </span>
      <span className="min-w-0">{children}</span>
    </button>
  );
}

export function PhotoPlaceholder({ label = "Adicionar foto aqui", src }: { label?: string; src?: string | undefined }) {
  if (src) return <img src={src} alt="" className="aspect-square w-full rounded-2xl object-cover" loading="lazy" />;
  return (
    <div className="grid aspect-square w-full place-items-center rounded-2xl border-2 border-dashed border-input bg-secondary text-center text-sm text-muted-foreground">
      <span className="px-4">{label}</span>
    </div>
  );
}
