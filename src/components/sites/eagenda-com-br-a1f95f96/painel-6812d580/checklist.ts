import type { Data } from "@/lib/seiri/types";

/** The free plan every account starts on; choosing a plan means leaving it. */
export const FREE_PLAN = "Plano Gratuito";

const text = (map: Record<string, string | boolean>, key: string) => (typeof map[key] === "string" ? (map[key] as string).trim() : "");

export type ChecklistStep = { label: string; done: (data: Data) => boolean };

/**
 * The four steps the original lists, in its order, each with the rule that tells whether it is
 * done. The original knows this from the server; here every answer comes from what the browser has
 * saved on the screen the step points at, so walking the step actually ticks it off.
 *
 * The destinations live in the component: they come from ROUTES, which sits in a React module, and
 * keeping them out of here is what lets these rules be tested without a renderer.
 */
export const CHECKLIST_STEPS: ChecklistStep[] = [
  {
    label: "Adicionar logo e mensagem de boas-vindas",
    // Both halves of the step, from "Tela de Agendamento".
    done: (d) => Boolean(text(d.bookingScreen, "logo") && text(d.bookingScreen, "mensagem")),
  },
  {
    label: "Informar o e-mail de contato do negócio",
    done: (d) => Boolean(text(d.orgSettings, "email") || text(d.orgSettings, "from_email")),
  },
  {
    label: "Fazer um agendamento teste",
    done: (d) => d.appointments.length > 0,
  },
  {
    label: "Escolher seu plano",
    // Nothing in the prototype moves the account off the free plan, so this one stays pending.
    done: (d) => d.plan.name !== FREE_PLAN,
  },
];

/** Which steps are done, how many, and the first one still pending — what the header counts. */
export function checklistState(data: Data) {
  const done = CHECKLIST_STEPS.map((s) => s.done(data));
  const count = done.filter(Boolean).length;
  return { done, count, next: done.indexOf(false), percent: (count / CHECKLIST_STEPS.length) * 100 };
}
