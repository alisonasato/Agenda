"use client";

import { useRef, useState, type CSSProperties } from "react";
import { ActivityIcon, CalendarIcon, CaretDownIcon, CloseCircleIcon, UsersIcon } from "../shared/icons";
import { DateRangePopover, type Preset } from "../shared/DateRangePopover";
import { InlineFilter } from "../shared/InlineFilter";
import { useDismiss } from "../shared/useDismiss";

const AGENDAS = ["Agenda Principal"];
const STATUSES = [
  "Atendido",
  "Cancelado",
  "Cancelado Pelo Cliente",
  "Cancelado Via Google Agenda",
  "Confirmado",
  "Em Atendimento",
  "Não Compareceu",
  "Pendente Confirmação",
  "Aguardando Preenchimento De Acompanhantes",
  "Aguardando Preenchimento De Formulário",
  "Aguardando Confirmação De Pagamento",
];

const GROUPS = [
  { value: "nome", label: "Nome Completo" },
  { value: "email", label: "E-mail" },
  { value: "personal_identification_number", label: "CPF" },
  { value: "nome-email", label: "Nome e E-mail" },
  { value: "nome-email-telefone", label: "Nome, Email e Telefone" },
];

const SLOTS = 10;
const pad = (n: number) => String(n).padStart(2, "0");
const short = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
const long = (d: Date) => `${short(d)}/${d.getFullYear()}`;

/** Default window: the last 30 days, ending today. */
function defaultRange(today: Date) {
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
  return { from, to: today };
}

export function ClientsReport() {
  const [today] = useState(() => new Date());
  const [range] = useState(() => defaultRange(new Date()));
  const [agendas, setAgendas] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [group, setGroup] = useState("nome");
  // Results only change once "Aplicar filtros" is pressed, like the server-rendered original.
  const [applied, setApplied] = useState({ group: "nome" });
  const dirty = group !== applied.group;

  const [dateOpen, setDateOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);
  useDismiss(dateRef, dateOpen, () => setDateOpen(false));

  const appliedLabel = GROUPS.find((g) => g.value === applied.group)?.label ?? "";
  const rangeLabel = `${long(range.from)} – ${long(range.to)}`;

  const reset = () => {
    setAgendas([]);
    setStatuses([]);
    setGroup("nome");
    setApplied({ group: "nome" });
  };

  return (
    <>
      <form id="formFilter" className="hui-reveal" onSubmit={(e) => e.preventDefault()}>
        <div className="flex min-w-0">
          <div className="w-full md:w-auto flex items-center gap-2 min-w-0">
            <div className="hactionbar" role="group">
              <div className="hrail-track hactionbar-track">
                <div ref={dateRef} className="hdaterange">
                  <button
                    type="button"
                    className="hinline-trigger hdaterange-trigger hinline-trigger--bare is-active"
                    aria-expanded={dateOpen}
                    onClick={() => setDateOpen((o) => !o)}
                  >
                    <CalendarIcon className="hinline-icon w-4 h-4" />
                    <span className="hinline-label">
                      {short(range.from)} – {short(range.to)}
                    </span>
                    <span className="hinline-chevron" aria-hidden="true">
                      <CaretDownIcon className="w-3.5 h-3.5" />
                    </span>
                  </button>
                  {dateOpen && (
                    <DateRangePopover
                      preset={"Todos os períodos" as Preset}
                      today={today}
                      initialMonth={range.from}
                      onPreset={() => setDateOpen(false)}
                      onClear={() => setDateOpen(false)}
                    />
                  )}
                </div>

                <InlineFilter label="Agenda" icon={<CalendarIcon className="hinline-icon w-4 h-4" />} options={AGENDAS} values={agendas} onChange={setAgendas} />
                <InlineFilter label="Status" icon={<ActivityIcon className="hinline-icon w-4 h-4" />} options={STATUSES} values={statuses} onChange={setStatuses} />

                <span className="hactionbar-sep" aria-hidden="true" />

                <span id="report-apply-wrap" className="report-apply" style={{ display: dirty ? undefined : "none" }}>
                  <button type="button" id="report-apply-btn" className="hbtn hbtn--ghost hbtn--sm" onClick={() => setApplied({ group })}>
                    <span className="hactionbar-label">Aplicar filtros</span>
                  </button>
                </span>
                <button type="button" className="hbtn hbtn--ghost hbtn--sm" onClick={reset}>
                  <CloseCircleIcon className="w-4 h-4" />
                  <span className="hactionbar-label">Limpar filtros</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-8 min-w-0 hui-reveal">
          <div className="htaggroup">
            <span className="htaggroup-label">Agrupar por:</span>
            {GROUPS.map((g) => (
              <button key={g.value} type="button" className={`htag${g.value === group ? " htag--active" : ""}`} onClick={() => setGroup(g.value)}>
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </form>

      <div id="report-results" className="mt-6 md:mt-8">
        <div className="hui-reveal">
          <div className="hwidget-head">
            <div className="hwidget-titles">
              <h2 className="hwidget-title">Resultados</h2>
              <p className="hwidget-desc">
                {rangeLabel} · Agrupado por {appliedLabel}
              </p>
            </div>
            <div className="hwidget-actions" />
          </div>

          <div id="clients-report-table" className="mt-4">
            <div className="htable htable-is-empty" style={{ "--htable-head-h": "38px" } as CSSProperties}>
              <div className="htable-scroll">
                <table className="htable-table w-full htable-fixed">
                  <thead>
                    <tr>
                      <th className="htable-col">{appliedLabel}</th>
                      <th className="htable-col">Status</th>
                      <th className="htable-col htable-col--end">Agendamentos</th>
                      <th className="htable-col htable-col--end">Acompanhantes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: SLOTS }, (_, i) => (
                      <tr key={i} className="htable-row--empty" aria-hidden="true">
                        <td className="htable-cell" />
                        <td className="htable-cell" />
                        <td className="htable-cell" />
                        <td className="htable-cell" />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="htable-empty" role="status" aria-live="polite">
                <div className="hempty hempty--inline hui-reveal">
                  <UsersIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">Nenhum cliente no período</h3>
                  <p className="hempty-desc inter-regular">
                    Não há agendamentos de clientes para os filtros aplicados. Ajuste o período, a agenda ou a situação e clique em Aplicar filtros.
                  </p>
                </div>
              </div>
              <div className="htable-footer" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
