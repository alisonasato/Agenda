"use client";

import { useState, type CSSProperties } from "react";
import { emptyFilters, FilterPopover, type FilterField } from "../shared/FilterPopover";
import { ScrollRail } from "../shared/ScrollRail";
import { ROUTES } from "../shared/Sidebar";
import { AddAppointmentIcon, CloseCircleIcon, DangerCircleIcon, InboxIcon, PenIcon, RefreshIcon, SearchSolidIcon, TrashIcon } from "../shared/icons";
import { AlertDialog } from "../shared/AlertDialog";
import { update, useData } from "@/lib/seiri/store";
import { fold } from "@/lib/seiri/select";
import type { SubAccount } from "@/lib/seiri/types";

const KPIS = ["Sub-contas", "Usuários ativos", "Total agendas", "Próximos 30 dias"];
/** [label, numeric column]. */
const COLUMNS: [string, boolean][] = [
  ["Conta", false],
  ["Usuários", true],
  ["Agendas", true],
  ["Próx. 30 dias", true],
  ["Assinatura", false],
  ["Contato", false],
];
const SLOTS = 10;

const FILTERS: FilterField[] = [
  ["accounts-filter-address", "Endereço", "Cidade, bairro ou rua"],
  ["accounts-filter-name", "Nome", "Ex.: Clínica Centro"],
  ["accounts-filter-label", "Sigla (link)", "Ex.: clinica-centro"],
  ["accounts-filter-service", "Serviço", "Ex.: Odontologia"],
  ["accounts-filter-email", "E-mail", "email@exemplo.com"],
  ["accounts-filter-phone", "Telefone", "Ex.: 11999998888"],
  ["accounts-filter-city", "Cidade", "Ex.: São Paulo"],
  ["accounts-filter-state", "Estado", "Ex.: SP"],
];

/** Quick filters: [value, tag label, active-filter chip label]. */
const STATUS = [
  ["", "Todos", ""],
  ["active", "Ativo", "Ativo"],
  ["expired", "Expirado", "Expirado"],
  ["inactive", "Sem plano", "Sem plano"],
] as const;
const ACTIVITY = [
  ["", "Todos", ""],
  ["recent", "Ativo 7d", "Ativo (últimos 7 dias)"],
  ["inactive", "Inativo 7d", "Inativo (últimos 7 dias)"],
] as const;
type Status = (typeof STATUS)[number][0];
type Activity = (typeof ACTIVITY)[number][0];

function TagGroup<T extends string>({ items, value, onChange }: { items: readonly (readonly [T, string, string])[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="htaggroup">
      {items.map(([v, label]) => (
        <button key={v} type="button" className={`htag${value === v ? " htag--active" : ""}`} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

/** Sub-accounts of the organization; active filters show as removable "Mostrando:" chips. */
export function AccountsList() {
  const data = useData();
  const [removing, setRemoving] = useState<SubAccount | null>(null);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(() => emptyFilters(FILTERS));
  const [status, setStatus] = useState<Status>("");
  const [activity, setActivity] = useState<Activity>("");

  const reset = () => {
    setQuery("");
    setFilters(emptyFilters(FILTERS));
    setStatus("");
    setActivity("");
  };

  const term = fold(query.trim());
  const hit = (value: string, wanted: string) => (wanted.trim() ? fold(value).includes(fold(wanted.trim())) : true);
  // An agenda or member with this account's id belongs to it; the rest belong to the main account.
  const [now] = useState(() => new Date());
  const today = now.toISOString().slice(0, 10);
  const soon = new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 10);
  const rows = data.accounts
    .map((account) => {
      const agendas = data.agendas.filter((a) => a.accountId === account.id);
      const ids = agendas.map((a) => a.id);
      return {
        account,
        users: data.members.filter((m) => m.accountId === account.id && m.active).length,
        agendas: agendas.length,
        upcoming: data.appointments.filter(
          (a) => ids.includes(a.agendaId) && a.status !== "CANCELED" && a.start.slice(0, 10) >= today && a.start.slice(0, 10) <= soon,
        ).length,
        place: [account.address.city, account.address.state].filter(Boolean).join(", "),
        contact: [account.email, account.phone].filter(Boolean).join(" · "),
      };
    })
    .filter((row) => (term ? fold(`${row.account.name} ${row.account.slug} ${row.contact}`).includes(term) : true))
    .filter(
      (row) =>
        hit(`${row.account.address.street} ${row.account.address.neighborhood} ${row.place}`, filters["accounts-filter-address"]) &&
        hit(row.account.name, filters["accounts-filter-name"]) &&
        hit(row.account.slug, filters["accounts-filter-label"]) &&
        hit(row.account.email, filters["accounts-filter-email"]) &&
        hit(row.account.phone, filters["accounts-filter-phone"]) &&
        hit(row.account.address.city, filters["accounts-filter-city"]) &&
        hit(row.account.address.state, filters["accounts-filter-state"]),
    )
    .filter((row) => (status ? row.account.plan === status : true));

  const counts = [rows.length, rows.reduce((n, r) => n + r.users, 0), rows.reduce((n, r) => n + r.agendas, 0), rows.reduce((n, r) => n + r.upcoming, 0)];

  // Removing a sub-account hands its agendas and members back to the main account.
  const remove = (id: string) =>
    update((d) => ({
      ...d,
      accounts: d.accounts.filter((a) => a.id !== id),
      agendas: d.agendas.map((a) => (a.accountId === id ? { ...a, accountId: undefined } : a)),
      members: d.members.map((m) => (m.accountId === id ? { ...m, accountId: undefined } : m)),
    }));

  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (query.trim()) chips.push({ key: "search", label: `Busca global: ${query.trim()}`, remove: () => setQuery("") });
  for (const [id, label] of FILTERS) {
    const v = filters[id].trim();
    if (v) chips.push({ key: id, label: `${label}: ${v}`, remove: () => setFilters({ ...filters, [id]: "" }) });
  }
  if (status) chips.push({ key: "status", label: `Assinatura: ${STATUS.find(([v]) => v === status)![2]}`, remove: () => setStatus("") });
  if (activity) chips.push({ key: "activity", label: `Atividade: ${ACTIVITY.find(([v]) => v === activity)![2]}`, remove: () => setActivity("") });

  return (
    <>
      <div className="hkpi-group">
        {KPIS.map((label, i) => (
          <div key={label} className="hui-card hui-card--flush hkpi">
            <div className="hkpi-body">
              <p className="hkpi-label">{label}</p>
              <div className="hkpi-value-row">
                <span className="hkpi-value">{counts[i]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form id="formFilter" className="mt-6 hui-reveal" style={{ animationDelay: ".04s" }} onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${query ? " has-query" : ""}`} id="accounts-search">
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Nome, sigla, serviço ou contato"
              aria-label="Nome, sigla, serviço ou contato"
              name="search"
              id="accounts-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => setQuery("")}>
              <CloseCircleIcon className="w-4 h-4" />
            </button>
          </label>
          <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
            <a href={ROUTES.novaConta} className="hbtn hbtn--primary hbtn--sm">
              <AddAppointmentIcon />
              Adicionar conta
            </a>
            <ScrollRail className="hactionbar" trackClassName="hrail-track hactionbar-track">
              <FilterPopover title="Filtrar contas" fields={FILTERS} value={filters} onChange={setFilters} />
            </ScrollRail>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 min-w-0">
          <div id="accounts-quick-filters" className="flex flex-wrap items-center gap-3 min-w-0">
            <TagGroup items={STATUS} value={status} onChange={setStatus} />
            <TagGroup items={ACTIVITY} value={activity} onChange={setActivity} />
          </div>
          <div className="w-full sm:w-auto sm:ml-auto">
            <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={reset}>
              <RefreshIcon />
              Limpar filtros
            </button>
          </div>
        </div>
      </form>

      <div id="accounts-active-filters" className="mt-4">
        <div>
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <div className="htaggroup">
                <span className="htaggroup-label">Mostrando:</span>
                {chips.map((c) => (
                  <span key={c.key} className="htag">
                    <span className="htag-label">{c.label}</span>
                    <a
                      href="#"
                      className="htag-remove"
                      aria-label="remover"
                      onClick={(e) => {
                        e.preventDefault();
                        c.remove();
                      }}
                    >
                      <CloseCircleIcon className="w-3 h-3" />
                    </a>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 hui-reveal" style={{ animationDelay: ".08s" }}>
        <div id="accounts-table-container">
          <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as CSSProperties}>
            <div className="htable-scroll">
              <table className="htable-table w-full htable-fixed">
                <thead>
                  <tr>
                    {COLUMNS.map(([c, num]) => (
                      <th key={c} className={`htable-col${num ? " htable-col--num htable-col--end" : ""}`}>
                        {c}
                      </th>
                    ))}
                    <th className="htable-col htable-col--end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.account.id}>
                      <td className="htable-cell">
                        <p className="text-sm text-gray-900 font-semibold inter-semibold">{row.account.name}</p>
                        {row.place && <p className="text-xs text-gray-500 inter-regular">{row.place}</p>}
                      </td>
                      <td className="htable-cell htable-cell--num htable-cell--end">{row.users}</td>
                      <td className="htable-cell htable-cell--num htable-cell--end">{row.agendas}</td>
                      <td className="htable-cell htable-cell--num htable-cell--end">{row.upcoming}</td>
                      <td className="htable-cell whitespace-nowrap">
                        <span
                          className={`hchip ${row.account.plan === "active" ? "hchip--success" : row.account.plan === "expired" ? "hchip--warning" : "hchip--default"} hchip--primary hchip--sm`}
                        >
                          {STATUS.find(([v]) => v === row.account.plan)?.[1] ?? "Sem plano"}
                        </span>
                      </td>
                      <td className="htable-cell">
                        {row.contact ? (
                          <span className="text-sm text-gray-600 inter-regular">{row.contact}</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="htable-cell htable-cell--end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <a href={`${ROUTES.novaConta}/?id=${row.account.id}`} className="btn-icon btn-icon-sm btn-icon-flat" title="Editar Conta">
                            <PenIcon className="w-4 h-4" />
                          </a>
                          <button type="button" className="btn-icon btn-icon-sm btn-icon-danger" title="Excluir Conta" onClick={() => setRemoving(row.account)}>
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, SLOTS - rows.length) }, (_, i) => (
                    <tr key={i} className="htable-row--empty" aria-hidden="true">
                      {Array.from({ length: COLUMNS.length + 1 }, (_, j) => (
                        <td key={j} className="htable-cell" />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!rows.length && (
              <div className="htable-empty" role="status" aria-live="polite">
                <div className="hempty hempty--inline hui-reveal">
                  <InboxIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">Nada por aqui ainda</h3>
                  <p className="hempty-desc inter-regular">Assim que houver registros, eles aparecerão nesta tabela.</p>
                </div>
              </div>
            )}
            <div className="htable-footer" />
          </div>
        </div>
      </div>
      {removing && (
        <AlertDialog
          id="account-delete-dialog"
          heading="Excluir conta"
          icon={<DangerCircleIcon className="w-6 h-6" />}
          onClose={() => setRemoving(null)}
          footer={
            <>
              <button type="button" className="hbtn hbtn--tertiary" onClick={() => setRemoving(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="hbtn hbtn--danger"
                onClick={() => {
                  remove(removing.id);
                  setRemoving(null);
                }}
              >
                Excluir
              </button>
            </>
          }
        >
          As agendas e os usuários dela voltam para a conta principal.
        </AlertDialog>
      )}
    </>
  );
}
