import photo from "@/assets/mariana-nutri.jpg.asset.json";

export function BrandHeader({ size = "lg" }: { size?: "sm" | "lg" }) {
  const img = size === "lg" ? "h-24 w-24" : "h-11 w-11";
  return (
    <div className={size === "lg" ? "flex flex-col items-center gap-3" : "flex items-center gap-3"}>
      <div className={`${img} shrink-0 overflow-hidden rounded-full ring-4 ring-primary-soft`}>
        <img src={photo.url} alt="Foto de Mariana Nutri" className="h-full w-full object-cover" width={480} height={480} />
      </div>
      <div className="flex items-center gap-1.5">
        <span className={size === "lg" ? "text-lg font-semibold" : "text-base font-semibold"}>Mariana Nutri</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 text-primary">
          <path fill="currentColor" d="M12 1.5l2.6 2 3.3-.2.9 3.2 2.7 1.9-1.1 3.1 1.1 3.1-2.7 1.9-.9 3.2-3.3-.2-2.6 2-2.6-2-3.3.2-.9-3.2L2.4 15.6l1.1-3.1-1.1-3.1 2.7-1.9.9-3.2 3.3.2z" />
          <path fill="none" stroke="var(--primary-foreground)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M8 12.3l2.6 2.5L16 9.5" />
        </svg>
      </div>
    </div>
  );
}
