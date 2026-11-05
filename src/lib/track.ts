// Events must never contain personal data (name, email, phone).
export type FunnelEvent =
  | "quiz_started"
  | "quiz_question_answered"
  | "quiz_completed"
  | "quiz_result_viewed"
  | "free_recipes_clicked"
  | "free_recipes_page_viewed"
  | "full_product_clicked";

export function trackEvent(name: FunnelEvent, props?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.track?.(`project.${name}`, props);
}
