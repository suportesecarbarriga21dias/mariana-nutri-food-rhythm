/**
 * Receitas gratuitas. Substitua os espaços reservados pelas receitas reais.
 * image: URL da foto quadrada (1:1). time e link são opcionais.
 */
export type Recipe = {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  time?: string;
  image?: string;
  link?: string;
  placeholder?: boolean;
};

const slot = (n: number): Recipe => ({
  title: `Receita ${n} — espaço reservado`,
  description: "Adicione aqui uma breve descrição da receita.",
  ingredients: ["Adicione os ingredientes aqui"],
  steps: ["Adicione o modo de preparo aqui"],
  placeholder: true,
});

export const FREE_RECIPES: Recipe[] = [slot(1), slot(2), slot(3), slot(4)];

/** Apenas depoimentos reais e autorizados. Lista vazia = seção oculta. */
export type Testimonial = { text: string; name: string; photo?: string };
export const TESTIMONIALS: Testimonial[] = [];
