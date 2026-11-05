export type Profile = "praticidade" | "organizacao" | "variedade" | "descomplicada";

type Opt = { label: string; score?: Partial<Record<Profile, number>> };
export type Question =
  | { id: string; type: "single" | "multi"; title: string; options: Opt[] }
  | { id: string; type: "text"; title: string; placeholder: string };

const P = (p: Profile, n = 1) => ({ [p]: n });

export const QUESTIONS: Question[] = [
  { id: "objetivo", type: "single", title: "O que você mais gostaria de melhorar na sua alimentação?", options: [
    { label: "Comer de forma mais equilibrada", score: P("descomplicada") },
    { label: "Organizar melhor minhas refeições", score: P("organizacao", 2) },
    { label: "Preparar receitas mais práticas", score: P("praticidade", 2) },
    { label: "Ter mais variedade no dia a dia", score: P("variedade", 2) },
    { label: "Cozinhar mais em casa", score: P("descomplicada", 2) },
  ]},
  { id: "dificuldade", type: "multi", title: "Qual é sua maior dificuldade na hora de preparar refeições?", options: [
    { label: "Falta de tempo", score: P("praticidade", 2) },
    { label: "Falta de ideias", score: P("variedade", 2) },
    { label: "Acabo repetindo sempre as mesmas refeições", score: P("variedade", 2) },
    { label: "Dificuldade para me organizar", score: P("organizacao", 2) },
    { label: "Não sei combinar os ingredientes", score: P("descomplicada", 2) },
    { label: "Minha rotina é muito corrida", score: P("praticidade", 2) },
  ]},
  { id: "rotina", type: "single", title: "Como costuma ser sua rotina durante a semana?", options: [
    { label: "Muito corrida, quase não tenho tempo", score: P("praticidade", 2) },
    { label: "Corrida, mas consigo cozinhar um pouco", score: P("organizacao") },
    { label: "Tenho tempo para preparar minhas refeições", score: P("variedade") },
    { label: "Minha rotina muda bastante", score: P("organizacao", 2) },
  ]},
  { id: "tempo", type: "single", title: "Quanto tempo você costuma ter para preparar uma refeição?", options: [
    { label: "Até 10 minutos", score: P("praticidade", 2) },
    { label: "De 10 a 20 minutos", score: P("praticidade") },
    { label: "De 20 a 30 minutos", score: P("descomplicada") },
    { label: "Mais de 30 minutos", score: P("variedade") },
  ]},
  { id: "tipos", type: "multi", title: "Que tipos de receitas você gostaria de encontrar?", options: [
    { label: "Café da manhã" }, { label: "Almoço e jantar" },
    { label: "Lanches rápidos", score: P("praticidade") },
    { label: "Receitas para air fryer", score: P("praticidade") },
    { label: "Sobremesas", score: P("variedade") },
    { label: "Sucos e bebidas", score: P("variedade") },
    { label: "Marmitas e organização semanal", score: P("organizacao", 2) },
  ]},
  { id: "equipamentos", type: "multi", title: "Quais equipamentos você costuma ter disponíveis?", options: [
    { label: "Fogão" }, { label: "Air fryer" }, { label: "Forno" },
    { label: "Liquidificador" }, { label: "Micro-ondas" },
    { label: "Tenho poucos equipamentos", score: P("descomplicada", 2) },
  ]},
  { id: "preferencias", type: "multi", title: "O que mais importa para você em uma receita?", options: [
    { label: "Ingredientes simples", score: P("descomplicada") },
    { label: "Economia", score: P("descomplicada") },
    { label: "Preparo rápido", score: P("praticidade", 2) },
    { label: "Poucas etapas", score: P("praticidade") },
    { label: "Variedade durante a semana", score: P("variedade", 2) },
    { label: "Instruções bem explicadas", score: P("descomplicada", 2) },
  ]},
  { id: "obstaculos", type: "multi", title: "O que costuma atrapalhar você na hora de cozinhar?", options: [
    { label: "Não tenho todos os ingredientes em casa", score: P("organizacao") },
    { label: "As receitas parecem complicadas", score: P("descomplicada", 2) },
    { label: "Não consigo me planejar", score: P("organizacao", 2) },
    { label: "Tenho pouca experiência na cozinha", score: P("descomplicada", 2) },
    { label: "Falta motivação", score: P("variedade") },
    { label: "É difícil agradar todo mundo em casa", score: P("variedade", 2) },
  ]},
  { id: "decisao", type: "single", title: "Como você costuma decidir o que vai comer?", options: [
    { label: "Planejo as refeições da semana", score: P("variedade") },
    { label: "Planejo apenas algumas refeições", score: P("organizacao") },
    { label: "Decido na hora", score: P("organizacao", 2) },
    { label: "Costumo comprar refeições prontas", score: P("praticidade", 2) },
    { label: "Estou tentando criar uma rotina", score: P("organizacao", 2) },
  ]},
  { id: "util", type: "multi", title: "O que faria um material de receitas ser realmente útil para você?", options: [
    { label: "Receitas organizadas por categoria", score: P("organizacao") },
    { label: "Lista de ingredientes", score: P("organizacao") },
    { label: "Modo de preparo explicado", score: P("descomplicada") },
    { label: "Sugestões para a semana", score: P("organizacao") },
    { label: "Receitas rápidas", score: P("praticidade") },
    { label: "Receitas econômicas", score: P("descomplicada") },
    { label: "Bônus de sucos e bebidas", score: P("variedade") },
  ]},
  { id: "formato", type: "single", title: "Como você prefere acessar suas receitas?", options: [
    { label: "PDF para celular" }, { label: "PDF para imprimir" },
    { label: "Página online" }, { label: "Qualquer formato fácil de consultar" },
  ]},
  { id: "nome", type: "text", title: "Como podemos chamar você?", placeholder: "Seu primeiro nome" },
];

export type Answers = Record<string, string | string[] | undefined>;

const ORDER: Profile[] = ["praticidade", "organizacao", "variedade", "descomplicada"];

export function computeProfile(answers: Answers): Profile {
  const s: Record<Profile, number> = { praticidade: 0, organizacao: 0, variedade: 0, descomplicada: 0 };
  for (const q of QUESTIONS) {
    if (q.type === "text") continue;
    const a = answers[q.id];
    const picked = Array.isArray(a) ? a : a ? [a] : [];
    for (const label of picked) {
      const o = q.options.find((x) => x.label === label);
      for (const [k, v] of Object.entries(o?.score ?? {})) s[k as Profile] += v ?? 0;
    }
  }
  return ORDER.reduce<Profile>((best, p) => (s[p] > s[best] ? p : best), "praticidade");
}

export const PROFILES: Record<Profile, { name: string; text: string }> = {
  praticidade: {
    name: "Praticidade",
    text: "Você valoriza soluções simples para uma rotina corrida. Receitas rápidas, com poucos ingredientes e etapas fáceis de acompanhar podem ajudar a deixar seu dia a dia na cozinha mais leve.",
  },
  organizacao: {
    name: "Organização",
    text: "Você gosta de saber o que vem pela frente. Receitas que rendem bem, ideias de marmitas e sugestões para a semana podem ajudar a trazer mais tranquilidade para a sua rotina.",
  },
  variedade: {
    name: "Variedade",
    text: "Você gosta de sair do óbvio e experimentar coisas novas. Receitas diferentes para cada momento do dia, sobremesas e bebidas podem trazer mais sabor e novidade para a sua semana.",
  },
  descomplicada: {
    name: "Cozinha descomplicada",
    text: "Você quer cozinhar mais em casa sem complicação. Receitas com ingredientes simples, passo a passo bem explicado e poucos utensílios podem deixar a cozinha um lugar mais gostoso para você.",
  },
};
