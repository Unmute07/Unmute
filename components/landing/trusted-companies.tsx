"use client";

type TrustedCompaniesProps = {
  title?: string;
  description?: string;
  companies: string[];
};

export function TrustedCompanies({
  title = "Trusted by ambitious teams",
  description,
  companies,
}: TrustedCompaniesProps) {
  return (
    <section className="section-container py-10 sm:py-16">
      <div className="rounded-[2rem] border border-border/70 bg-card/60 px-6 py-8 shadow-sm sm:px-8 lg:px-12">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">{title}</p>
        {description ? <p className="mt-3 text-center text-sm text-muted-foreground">{description}</p> : null}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {companies.map((name) => (
            <div key={name} className="flex h-12 items-center justify-center rounded-full border border-border/70 bg-background/70 text-sm font-semibold text-muted-foreground">
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
