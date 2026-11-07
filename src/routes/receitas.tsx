import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandHeader } from "@/components/funnel/BrandHeader";
import { PhotoPlaceholder, PrimaryButton } from "@/components/funnel/ui";
import { FREE_RECIPES, TESTIMONIALS } from "@/content/recipes";
import { SALES_PAGE_URL } from "@/config/site";
import { trackEvent } from "@/lib/track";

export const Route = createFileRoute("/receitas")({
  head: () => ({
    meta: [
      { title: "Suas receitas grátis | Mariana Nutri" },
      { name: "description", content: "Uma seleção gratuita de receitas da Mariana Nutri para trazer praticidade e variedade à sua rotina." },
      { property: "og:title", content: "Suas receitas grátis | Mariana Nutri" },
      { property: "og:description", content: "Receitas gratuitas para sua rotina, sem precisar comprar nada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Recipes,
});

function Recipes() {
  const [notice, setNotice] = useState(false);
  useEffect(() => { trackEvent("free_recipes_page_viewed"); }, []);

  const openBook = () => {
    trackEvent("full_product_clicked");
    if (SALES_PAGE_URL) window.location.href = SALES_PAGE_URL;
    else setNotice(true);
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-16 sm:px-8">
      <header className="flex items-center justify-between py-5">
        <BrandHeader size="sm" />
        <Link to="/" className="min-h-11 content-center text-sm text-muted-foreground underline">Refazer quiz</Link>
      </header>

      <section className="step-in mt-4 text-center">
        <span className="inline-block rounded-full bg-primary-soft px-4 py-1.5 text-sm font-semibold text-accent-foreground">100% gratuito · sem compra</span>
        <h1 className="mt-5 text-4xl leading-tight font-semibold">Suas receitas grátis chegaram!</h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">Uma seleção de ideias para trazer mais praticidade e variedade para sua rotina.</p>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Receitas gratuitas">
        {FREE_RECIPES.map((r, i) => (
          <article key={i} className="flex flex-col rounded-3xl border border-border bg-card p-4">
            <PhotoPlaceholder src={r.image} label="Adicionar foto da receita aqui" />
            <div className="mt-4 flex items-start justify-between gap-3">
              <h2 className={`text-xl font-semibold ${r.placeholder ? "text-muted-foreground" : ""}`}>{r.title}</h2>
              {r.time && <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-medium">{r.time}</span>}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
            <h3 className="mt-4 font-sans text-sm font-semibold">Ingredientes</h3>
            <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">{r.ingredients.map((x) => <li key={x}>{x}</li>)}</ul>
            <h3 className="mt-4 font-sans text-sm font-semibold">Modo de preparo</h3>
            <ol className="mt-1 list-decimal pl-5 text-sm text-muted-foreground">{r.steps.map((x) => <li key={x}>{x}</li>)}</ol>
            {r.link && <a href={r.link} className="mt-4 text-sm font-semibold text-primary underline">Ver receita completa</a>}
          </article>
        ))}
      </section>

      {TESTIMONIALS.length > 0 && (
        <section className="mt-14">
          <h2 className="text-center text-2xl font-semibold">O que dizem</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {TESTIMONIALS.map((t, i) => (
              <figure key={i} className="rounded-3xl border border-border bg-card p-5">
                {t.photo && <img src={t.photo} alt="" className="mb-3 h-14 w-14 rounded-2xl object-cover" />}
                <blockquote className="text-[15px]">“{t.text}”</blockquote>
                <figcaption className="mt-3 text-sm font-semibold">{t.name}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="mt-16 overflow-hidden rounded-3xl border border-sage/40 bg-sand p-7 sm:p-10">
        <div className="grid items-center gap-6 sm:grid-cols-[180px_1fr]">
          <div className="mx-auto w-40 sm:w-full"><PhotoPlaceholder label="Adicionar capa do livro aqui" /></div>
          <div className="text-center sm:text-left">
            <h2 className="text-3xl leading-tight font-semibold">Quer ter acesso ao livro completo?</h2>
            <p className="mt-3 text-muted-foreground">Conheça o material completo da Mariana Nutri e descubra ainda mais ideias para sua rotina na cozinha.</p>
            <PrimaryButton className="mt-6 sm:max-w-xs" onClick={openBook}>Ver o livro completo</PrimaryButton>
            {notice && <p role="status" className="mt-3 text-sm text-muted-foreground">Em breve! A página do livro completo ainda está sendo preparada.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
