"use client";

import { useRef, useState, type CSSProperties } from "react";
import {
  CalendarIcon,
  CaretDownIcon,
  CheckboxMark,
  CheckReadIcon,
  ClipboardIcon,
  CloseCircleIcon,
  DownloadIcon,
  FunnelIcon,
  GridIcon,
  SearchSolidIcon,
  TagIcon,
} from "../shared/icons";
import { DateRangePopover, type Preset } from "../shared/DateRangePopover";
import { InlineFilter } from "../shared/InlineFilter";
import { InlineSelect, type SelectOption } from "../shared/InlineSelect";
import { ROUTES } from "../shared/Sidebar";
import { ScrollRail } from "../shared/ScrollRail";
import { useDismiss } from "../shared/useDismiss";

const STATUSES: SelectOption[] = [
  { value: "all", label: "Todos" },
  { value: "cancel", label: "Cancelados" },
  { value: "done", label: "Atendidos" },
  { value: "noshow", label: "Faltantes" },
];

const GROUPS: SelectOption[] = [
  { value: "tag", label: "Tag" },
  { value: "service", label: "Serviço" },
  { value: "calendar", label: "Agenda" },
];

import { useData } from "@/lib/seiri/store";
import { dayKey, formatDate, formatMoney } from "@/lib/seiri/select";

const SLOTS = 10;
const pad = (n: number) => String(n).padStart(2, "0");
const short = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
const long = (d: Date) => `${short(d)}/${d.getFullYear()}`;

/** Default window: the last 30 days, ending today. */
function defaultRange(today: Date) {
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
  return { from, to: today };
}

/** The "Filtros" menu: three full-width multi-selects stacked in a popover. */
function MoreFilters({
  agendas,
  onAgendas,
  services,
  onServices,
  tags,
  onTags,
}: {
  agendas: string[];
  onAgendas: (v: string[]) => void;
  services: string[];
  onServices: (v: string[]) => void;
  tags: string[];
  onTags: (v: string[]) => void;
}) {
  const data = useData();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  const count = [agendas, services, tags].filter((v) => v.length > 0).length;

  return (
    <div ref={ref} className="hinline">
      <button
        type="button"
        className={`hinline-trigger hinline-trigger--bare${count > 0 ? " is-active" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <FunnelIcon className="hinline-icon w-4 h-4" />
        <span className="hinline-label hactionbar-label">Filtros</span>
        {count > 0 && <span className="hinline-count">{count}</span>}
        <span className="hinline-chevron" aria-hidden="true">
          <CaretDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>
      {open && (
        <div id="consolidado-more-panel" className="hselect-popover hmenu-popover hmenu-filters hfilterpop-popover" role="dialog">
          <div className="hmenu-filter-row">
            <InlineFilter
              label="Agendas"
              icon={<CalendarIcon className="hinline-icon w-4 h-4" />}
              options={data.agendas.map((a) => a.name)}
              values={agendas}
              onChange={onAgendas}
            />
          </div>
          <div className="hmenu-filter-row">
            <InlineFilter
              label="Serviços"
              icon={<ClipboardIcon className="hinline-icon w-4 h-4" />}
              options={data.services.map((svc) => svc.name)}
              values={services}
              onChange={onServices}
            />
          </div>
          <div className="hmenu-filter-row">
            <InlineFilter
              label="Tags"
              icon={<TagIcon className="hinline-icon w-4 h-4" />}
              options={data.tags.map((t) => t.name)}
              values={tags}
              onChange={onTags}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/** LGPD acknowledgement the export button opens before downloading the sheet. */
function ExportDialog({ onClose }: { onClose: () => void }) {
  const [ack, setAck] = useState(false);
  return (
    <div className="halertdialog">
      <div className="halertdialog-backdrop halertdialog-backdrop--opaque">
        <div className="halertdialog-container">
          <div
            className="halertdialog-dialog halertdialog-dialog--sm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="report-export-dialog-heading"
            tabIndex={-1}
          >
            <button type="button" className="halertdialog-close" aria-label="Fechar" onClick={onClose}>
              <CloseCircleIcon className="w-5 h-5" />
            </button>
            <div className="halertdialog-header">
              <span className="halertdialog-icon halertdialog-icon--warning" aria-hidden="true">
                <DownloadIcon className="w-6 h-6" />
              </span>
              <h2 className="halertdialog-heading" id="report-export-dialog-heading">
                Exportar relatório com dados pessoais?
              </h2>
            </div>
            <div className="halertdialog-body" id="report-export-dialog-body">
              <p>
                Ao exportar, você declara estar ciente da LGPD e das medidas de proteção, armazenamento e descarte dos dados.{" "}
                <a
                  href="https://youtu.be/9JwEyv8j4F0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline focus:outline-none focus-visible:underline"
                >
                  Saiba mais
                </a>
              </p>
              <div className="mt-3">
                <label className="hcheckbox hcheckbox--sm">
                  <input type="checkbox" id="report-export-lgpd-ack" className="hcheckbox-input" checked={ack} onChange={(e) => setAck(e.target.checked)} />
                  <span className="hcheckbox-box" aria-hidden="true">
                    <CheckboxMark />
                    <span className="hcheckbox-dash" aria-hidden="true" />
                  </span>
                  <span className="hcheckbox-label">Li e estou ciente das responsabilidades acima.</span>
                </label>
              </div>
            </div>
            <div className="halertdialog-footer">
              <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
                Cancelar
              </button>
              <button type="button" id="report-export-confirm-btn" className="hbtn hbtn--primary" disabled={!ack}>
                <DownloadIcon className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConsolidatedReport() {
  const data = useData();
  const [today] = useState(() => new Date());
  const [range] = useState(() => defaultRange(new Date()));
  const [status, setStatus] = useState("all");
  const [group, setGroup] = useState("service");
  const [agendas, setAgendas] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  // Results only change once "Aplicar filtros" is pressed, like the server-rendered original.
  const [applied, setApplied] = useState({ group: "service" });
  const dirty = group !== applied.group;

  /** One line per day and grouping key, with how many appointments and how much they add up to. */
  const rows = (() => {
    const fromKey = dayKey(range.from.toISOString());
    const toKey = dayKey(range.to.toISOString());
    const wanted: Record<string, string | null> = { all: null, cancel: "CANCELED", done: "ATTENDED", noshow: "NO_SHOW" };
    const keep = wanted[status] ?? null;
    const out = new Map<string, { day: string; label: string; count: number; total: number }>();
    data.appointments.forEach((a) => {
      const key = dayKey(a.start);
      if (key < fromKey || key > toKey) return;
      if (keep && a.status !== keep) return;
      const agenda = data.agendas.find((g) => g.id === a.agendaId);
      const service = data.services.find((svc) => svc.id === a.serviceId);
      if (agendas.length && !agendas.includes(agenda?.name ?? "")) return;
      if (services.length && !services.includes(service?.name ?? "")) return;
      const names = a.tagIds.map((id) => data.tags.find((t) => t.id === id)?.name ?? "");
      if (tags.length && !names.some((n) => tags.includes(n))) return;
      const label = applied.group === "calendar" ? (agenda?.name ?? "—") : applied.group === "tag" ? (names[0] ?? "Sem tag") : (service?.name ?? "—");
      const id = `${key}|${label}`;
      const row = out.get(id) ?? { day: key, label, count: 0, total: 0 };
      row.count += 1;
      row.total += service?.price ?? 0;
      out.set(id, row);
    });
    return [...out.values()].sort((x, y) => x.day.localeCompare(y.day) || x.label.localeCompare(y.label));
  })();

  const [dateOpen, setDateOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);
  useDismiss(dateRef, dateOpen, () => setDateOpen(false));
  const [exporting, setExporting] = useState(false);

  const appliedLabel = GROUPS.find((g) => g.value === applied.group)?.label ?? "";
  const rangeLabel = `${long(range.from)} – ${long(range.to)}`;

  return (
    <>
      <form id="formFilter" className="hui-reveal" onSubmit={(e) => e.preventDefault()}>
        <div className="flex min-w-0">
          <div className="w-full md:w-auto flex items-center gap-2 min-w-0">
            <ScrollRail className="hactionbar" trackClassName="hrail-track hactionbar-track">
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

              <InlineSelect label="Status" icon={<CheckReadIcon className="hinline-icon w-4 h-4" />} options={STATUSES} value={status} onChange={setStatus} />
              <InlineSelect
                label="Agrupamento"
                icon={<GridIcon className="hinline-icon w-4 h-4" />}
                options={GROUPS}
                value={group}
                onChange={setGroup}
                clearTo="service"
              />

              <MoreFilters agendas={agendas} onAgendas={setAgendas} services={services} onServices={setServices} tags={tags} onTags={setTags} />

              <span className="hactionbar-sep" aria-hidden="true" />

              <span id="report-apply-wrap" className="report-apply" style={{ display: dirty ? undefined : "none" }}>
                <button type="button" id="report-apply-btn" className="hbtn hbtn--ghost hbtn--sm" onClick={() => setApplied({ group })}>
                  <span className="hactionbar-label">Aplicar filtros</span>
                </button>
              </span>

              <a href={`${ROUTES.relatorioConsolidado}?reset=1`} className="hbtn hbtn--ghost hbtn--sm">
                <CloseCircleIcon className="w-4 h-4" />
                <span className="hactionbar-label">Limpar filtros</span>
              </a>

              <span className="hactionbar-sep" aria-hidden="true" />

              <button type="button" className="hbtn hbtn--ghost hbtn--sm" onClick={() => setExporting(true)}>
                <DownloadIcon className="w-4 h-4" />
                <span className="hactionbar-label">Exportar</span>
              </button>
            </ScrollRail>
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

          <div id="consolidado-table" className="mt-4">
            <div
              className={`htable${rows.length ? "" : " htable-is-empty"}`}
              style={{ "--htable-row-h": "3.25rem", "--htable-head-h": "38px" } as CSSProperties}
            >
              <div className="htable-scroll">
                <table className="htable-table w-full htable-fixed">
                  <thead>
                    <tr>
                      <th className="htable-col">Dia</th>
                      <th className="htable-col">Serviço/Agenda/Tag</th>
                      <th className="htable-col htable-col--num htable-col--end">Quantidade</th>
                      <th className="htable-col htable-col--num htable-col--end">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={`${row.day}-${row.label}`} className="htable-row">
                        <td className="htable-cell">{formatDate(`${row.day}T00:00`)}</td>
                        <td className="htable-cell">{row.label}</td>
                        <td className="htable-cell htable-cell--num htable-cell--end">{row.count}</td>
                        <td className="htable-cell htable-cell--num htable-cell--end">{formatMoney(row.total)}</td>
                      </tr>
                    ))}
                    {Array.from({ length: Math.max(0, SLOTS - rows.length) }, (_, k) => (
                      <tr key={`empty-${k}`} className="htable-row--empty" aria-hidden="true">
                        <td className="htable-cell" />
                        <td className="htable-cell" />
                        <td className="htable-cell" />
                        <td className="htable-cell" />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!rows.length && (
                <div className="htable-empty" role="status" aria-live="polite">
                  <div className="hempty hempty--inline hui-reveal">
                    <SearchSolidIcon className="hempty-icon" />
                    <h3 className="hempty-title nunito-bold">Nenhum agendamento no período</h3>
                    <p className="hempty-desc inter-regular">
                      Não há agendamentos para os filtros aplicados. Ajuste o período, a agenda ou o status e clique em Aplicar filtros.
                    </p>
                  </div>
                </div>
              )}
              <div className="htable-footer" />
            </div>
          </div>
        </div>
      </div>

      {exporting && <ExportDialog onClose={() => setExporting(false)} />}
    </>
  );
}
