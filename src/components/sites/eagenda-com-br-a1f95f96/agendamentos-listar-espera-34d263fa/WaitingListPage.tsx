"use client";

import { useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ROUTES } from "../shared/Sidebar";
import { InlineFilter } from "../shared/InlineFilter";
import { Modal } from "../shared/Modal";
import { Combobox } from "../shared/Combobox";
import { DateRangePopover, type Preset } from "../shared/DateRangePopover";
import { useAnchoredPopover } from "../shared/useAnchoredPopover";
import { useDismiss } from "../shared/useDismiss";
import { useData, update, nextId } from "@/lib/seiri/store";
import { fold, formatDate, formatWhen, inPreset } from "@/lib/seiri/select";
import {
  ActivityIcon,
  CalendarIcon,
  CaretDownIcon,
  ChevronRightIcon,
  ClockDuoIcon,
  CloseCircleIcon,
  EyeIcon,
  SaveIcon,
  SearchEmptyIcon,
  SearchSolidIcon,
  TrashIcon,
  UserAddIcon,
} from "../shared/icons";

const COLUMNS: [string, string][] = [
  ["Cliente", "htable-col"],
  ["Agenda / Serviço", "htable-col"],
  ["Data / Hora", "htable-col"],
  ["Situação", "htable-col"],
  ["Posição", "htable-col htable-col--num"],
  ["Ocupação", "htable-col htable-col--num"],
  ["Inscrito em", "htable-col"],
];
const SLOTS = 10;
const STATUSES: [string, string][] = [
  ["", "Todos"],
  ["waiting", "Em espera"],
  ["scheduled", "Agendado"],
  ["cancelled", "Cancelado"],
];
const AGENDAS = ["Agenda Principal", "Unidade Centro"];
const WAITING_LABELS: Record<string, string> = { waiting: "Em espera", scheduled: "Agendado", cancelled: "Cancelado" };
const WAITING_TONES: Record<string, string> = { waiting: "hchip--warning", scheduled: "hchip--success", cancelled: "hchip--default" };
const GENDERS = [
  { value: "F", label: "Feminino" },
  { value: "M", label: "Masculino" },
];
const MARITAL = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)"].map((v) => ({ value: v, label: v }));

/** The action bar's "Visualizar" menu, teleported like the original. */
function ViewMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const style = useAnchoredPopover(open, ref, panelRef);
  useDismiss(ref, open, () => setOpen(false), panelRef);

  return (
    <div ref={ref} className="hinline hmenu">
      <button
        type="button"
        className={`hinline-trigger hinline-trigger--bare${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      >
        <EyeIcon className="hinline-icon w-4 h-4" />
        <span className="hinline-label">Visualizar</span>
        <span className={`hinline-chevron${open ? " is-open" : ""}`} aria-hidden="true">
          <CaretDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>
      {open &&
        createPortal(
          <div ref={panelRef} className="hselect-popover hmenu-popover" role="menu" style={style}>
            <a href={ROUTES.agendamentos} className="hmenu-item" role="menuitem" onClick={() => setOpen(false)}>
              <ActivityIcon className="hmenu-item-icon w-4 h-4" />
              <span className="hmenu-item-label">Lista de Agendamentos</span>
            </a>
            <a href={ROUTES.calendario} className="hmenu-item" role="menuitem" onClick={() => setOpen(false)}>
              <CalendarIcon className="hmenu-item-icon w-4 h-4" />
              <span className="hmenu-item-label">Ver Agenda</span>
            </a>
          </div>,
          document.body,
        )}
    </div>
  );
}

/** "Incluir na Lista de Espera": the agenda comes first, and picking it loads the rest of the form. */
function WaitingModal({ onClose }: { onClose: () => void }) {
  const data = useData();
  const [agenda, setAgenda] = useState("");
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [marital, setMarital] = useState("");
  const agendaName = data.agendas.find((a) => a.id === agenda)?.name ?? "";
  const slots = data.appointments
    .filter((a) => a.agendaId === agenda && a.status !== "CANCELED")
    .map((a) => ({ value: a.start, label: formatWhen(a.start, a.duration) }))
    .filter((o, i, list) => list.findIndex((x) => x.value === o.value) === i)
    .sort((a, b) => a.value.localeCompare(b.value));

  /** Writes the entry into the browser's data, like the original posts it to the server. */
  const save = () => {
    if (!agenda || !slot || !name.trim()) return;
    update((d) => {
      const known = d.clients.find((c) => fold(c.name) === fold(name));
      const clientId = known?.id ?? nextId("c", d.clients);
      const clients = known ? d.clients : [...d.clients, { id: clientId, name: name.trim(), email, phone }];
      const serviceId = d.appointments.find((a) => a.start === slot && a.agendaId === agenda)?.serviceId ?? d.services[0]?.id ?? "";
      const position = d.waiting.filter((w) => w.agendaId === agenda && w.start === slot && w.status === "waiting").length + 1;
      const entry = {
        id: nextId("w", d.waiting),
        clientId,
        agendaId: agenda,
        serviceId,
        start: slot,
        status: "waiting" as const,
        position,
        createdAt: new Date().toISOString().slice(0, 16),
      };
      return { ...d, clients, waiting: [...d.waiting, entry] };
    });
    onClose();
  };

  return (
    <Modal
      id="waiting-form-modal"
      title="Incluir na Lista de Espera"
      size="2xl"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="hbtn hbtn--primary" disabled={!agenda || !slot || !name.trim()} onClick={save}>
            <SaveIcon />
            Salvar
          </button>
        </>
      }
    >
      <form id="waiting-form" className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div id="waiting-agenda-picker">
          <Combobox
            id="waiting_agenda"
            label="Agenda"
            required
            searchInPopover
            placeholder="Selecione a agenda"
            options={data.agendas.map((a) => ({ value: a.id, label: a.name }))}
            value={agenda}
            onChange={setAgenda}
          />
        </div>

        {agenda && (
          <>
            <section>
              <h3 className="text-sm text-gray-900 nunito-bold mb-3">Atendimento</h3>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex items-center flex-shrink-0" style={{ color: "#48CFAE" }}>
                  <CalendarIcon className="w-4 h-4" />
                </span>
                <span className="text-sm text-gray-900 inter-semibold">{agendaName}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Combobox
                    id="start_dt"
                    label="Dia/Hora"
                    required
                    searchInPopover
                    placeholder="Selecione o horário"
                    options={slots}
                    value={slot}
                    onChange={setSlot}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="id_client_text" className="hinput-label">
                  Observações
                </label>
                <textarea name="client_text" id="id_client_text" rows={3} className="htextarea mt-1.5" />
              </div>
            </section>

            <section>
              <h3 className="text-sm text-gray-900 nunito-bold mb-3">Cliente</h3>
              <div className="mb-4">
                <div className="hinput-field hinput-field--block">
                  <label className="hinput-label" htmlFor="id_name">
                    Nome Completo <span className="hinput-req">*</span>
                  </label>
                  <div className="hinput-wrap">
                    <input
                      id="id_name"
                      autoComplete="name"
                      className="hinput"
                      type="text"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="hinput-field hinput-field--block">
                  <label className="hinput-label" htmlFor="id_email">
                    E-mail
                  </label>
                  <div className="hinput-wrap">
                    <input
                      id="id_email"
                      autoComplete="email"
                      className="hinput"
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="hinput-field hinput-field--block">
                  <label className="hinput-label" htmlFor="id_old_phone">
                    Telefone
                  </label>
                  <div className="hinput-wrap">
                    <input
                      id="id_old_phone"
                      autoComplete="tel"
                      className="hinput"
                      type="tel"
                      name="old_phone"
                      placeholder="+55"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Combobox id="gender" label="Gênero" searchInPopover placeholder="Selecione" options={GENDERS} value={gender} onChange={setGender} />
                </div>
                <div>
                  <Combobox
                    id="select_marital_status"
                    label="Estado civil"
                    searchInPopover
                    placeholder="Selecione"
                    options={MARITAL}
                    value={marital}
                    onChange={setMarital}
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </form>
    </Modal>
  );
}

/** Minha Agenda › Lista de Espera: who is waiting for a free slot (empty in this account). */
export function WaitingListPage() {
  const [query, setQuery] = useState("");
  const [preset, setPreset] = useState<Preset>("Todos os períodos");
  const [agendas, setAgendas] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [creating, setCreating] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);
  const [dateOpen, setDateOpen] = useState(false);
  useDismiss(dateRef, dateOpen, () => setDateOpen(false));
  const data = useData();
  const filtered = !!query || agendas.length > 0 || status !== "" || preset !== "Todos os períodos";
  const term = fold(query.trim());
  const today = new Date();
  const rows = data.waiting
    .filter((w) => (status ? w.status === status : true))
    .filter((w) => inPreset(w.start, preset, today))
    .filter((w) => {
      const client = data.clients.find((c) => c.id === w.clientId);
      const agenda = data.agendas.find((a) => a.id === w.agendaId);
      if (agendas.length && !(agenda && agendas.includes(agenda.name))) return false;
      if (!term) return true;
      return [client?.name ?? "", client?.email ?? ""].some((v) => fold(v).includes(term));
    })
    .sort((a, b) => a.start.localeCompare(b.start));
  /** How many people already hold that slot in the agenda: the original's "Ocupação". */
  const taken = (agendaId: string, start: string) =>
    data.appointments.filter((a) => a.agendaId === agendaId && a.start === start && a.status !== "CANCELED").length;
  const remove = (id: string) => update((d) => ({ ...d, waiting: d.waiting.filter((w) => w.id !== id) }));

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <form id="formFilter" className="min-w-0" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${query ? " has-query" : ""}`} id="waiting-search">
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Buscar por nome ou e-mail"
              aria-label="Buscar por nome ou e-mail"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => setQuery("")}>
              <CloseCircleIcon className="w-4 h-4" />
            </button>
          </label>

          <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
            <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => setCreating(true)}>
              <UserAddIcon />
              Incluir na Lista de Espera
            </button>
            <div className="hactionbar" role="group">
              <div className="hrail-track hactionbar-track">
                <div ref={dateRef} className="hdaterange">
                  <button
                    type="button"
                    className="hinline-trigger hdaterange-trigger hinline-trigger--bare"
                    aria-expanded={dateOpen}
                    onClick={() => setDateOpen((o) => !o)}
                  >
                    <CalendarIcon className="hinline-icon w-4 h-4" />
                    <span className="hinline-label">{preset}</span>
                    <span className="hinline-chevron" aria-hidden="true">
                      <CaretDownIcon className="w-3.5 h-3.5" />
                    </span>
                  </button>
                  {dateOpen && (
                    <DateRangePopover
                      preset={preset}
                      today={new Date()}
                      onPreset={(p) => {
                        setPreset(p);
                        setDateOpen(false);
                      }}
                    />
                  )}
                </div>
                <InlineFilter
                  label="Agenda"
                  icon={<CalendarIcon className="hinline-icon w-4 h-4" />}
                  options={AGENDAS}
                  values={agendas}
                  onChange={setAgendas}
                />
                <span className="hactionbar-sep" aria-hidden="true" />
                <ViewMenu />
              </div>
              <button type="button" className="hrail-arrow hrail-arrow--next" tabIndex={-1} aria-label="Rolar para o fim">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-3 min-w-0">
        <div id="waiting-status-filters" className="hrail min-w-0">
          <div className="hrail-track">
            <div className="htaggroup--nowrap htaggroup">
              {STATUSES.map(([value, label]) => (
                <button key={label} type="button" className={`htag${status === value ? " htag--active" : ""}`} onClick={() => setStatus(value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="ml-auto flex-shrink-0">
          <button
            type="button"
            className="hbtn hbtn--secondary hbtn--sm"
            onClick={() => {
              setQuery("");
              setAgendas([]);
              setStatus("");
              setPreset("Todos os períodos");
            }}
          >
            <CloseCircleIcon />
            Limpar filtros
          </button>
        </div>
      </div>

      <div id="waiting-table-container" className="mt-4">
        <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as CSSProperties}>
          <div className="htable-scroll">
            <table className="htable-table w-full htable-fixed">
              <thead>
                <tr>
                  {COLUMNS.map(([label, cls]) => (
                    <th key={label} className={cls}>
                      {label}
                    </th>
                  ))}
                  <th className="htable-col htable-col--end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((w) => {
                  const client = data.clients.find((c) => c.id === w.clientId);
                  const agenda = data.agendas.find((a) => a.id === w.agendaId);
                  const service = data.services.find((x) => x.id === w.serviceId);
                  return (
                    <tr key={w.id} className="htable-row">
                      <td className="htable-cell">
                        <span className="block">{client?.name ?? "—"}</span>
                        <span className="block text-xs text-gray-500">{client?.email}</span>
                      </td>
                      <td className="htable-cell">
                        <span className="block">{agenda?.name ?? "—"}</span>
                        <span className="block text-xs text-gray-500">{service?.name}</span>
                      </td>
                      <td className="htable-cell">{formatWhen(w.start, service?.duration ?? 30)}</td>
                      <td className="htable-cell">
                        <span className={`hchip hchip--soft hchip--sm ${WAITING_TONES[w.status]}`}>{WAITING_LABELS[w.status]}</span>
                      </td>
                      <td className="htable-cell htable-cell--num">{w.position}</td>
                      <td className="htable-cell htable-cell--num">{taken(w.agendaId, w.start)}</td>
                      <td className="htable-cell">{formatDate(w.createdAt)}</td>
                      <td className="htable-cell htable-cell--end">
                        <button type="button" className="hbtn hbtn--ghost hbtn--sm hbtn--icon" aria-label="Remover da lista" onClick={() => remove(w.id)}>
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {Array.from({ length: Math.max(0, SLOTS - rows.length) }, (_, i) => (
                  <tr key={`empty-${i}`} className="htable-row--empty" aria-hidden="true">
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
              {filtered ? (
                <div className="hempty hempty--inline hui-reveal">
                  <SearchEmptyIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">Nenhuma inscrição encontrada</h3>
                  <p className="hempty-desc inter-regular">
                    Nenhuma inscrição corresponde aos filtros aplicados. Ajuste ou limpe os filtros para ver mais resultados.
                  </p>
                </div>
              ) : (
                <div className="hempty hempty--inline hui-reveal">
                  <ClockDuoIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">Ninguém na lista de espera</h3>
                  <p className="hempty-desc inter-regular">Clientes que se inscreverem para ser avisados de vagas aparecerão nesta lista.</p>
                </div>
              )}
            </div>
          )}
          <div className="htable-footer" />
        </div>
      </div>

      {creating && <WaitingModal onClose={() => setCreating(false)} />}
    </div>
  );
}
