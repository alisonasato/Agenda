"use client";

import { useState, type CSSProperties } from "react";
import { ROUTES } from "../shared/Sidebar";
import { InlineFilter } from "../shared/InlineFilter";
import { Modal } from "../shared/Modal";
import { Combobox } from "../shared/Combobox";
import { ColorPicker } from "../shared/ColorPicker";
import { AutocompleteMulti } from "../shared/AutocompleteMulti";
import {
  CalendarIcon,
  CheckboxMark,
  CloseCircleIcon,
  GridPlusIcon,
  LayersIcon,
  PenIcon,
  SaveIcon,
  SearchEmptyIcon,
  SearchSolidIcon,
  TrashIcon,
  UndoIcon,
} from "../shared/icons";
import { useData, update, nextId } from "@/lib/seiri/store";
import { fold, formatDuration, formatMoney } from "@/lib/seiri/select";
import type { Service } from "@/lib/seiri/types";

const COLUMNS: [string, string][] = [
  ["Serviço", "htable-col"],
  ["Valor", "htable-col"],
  ["Duração", "htable-col"],
  ["Pessoas", "htable-col htable-col--num hidden lg:table-cell"],
  ["Agendas", "htable-col hidden lg:table-cell"],
  ["Tags", "htable-col hidden xl:table-cell"],
  ["Colaboradores", "htable-col hidden xl:table-cell"],
  ["Ordem", "htable-col htable-col--num hidden lg:table-cell"],
];
const SLOTS = 10;
const MEMBER_OPTIONS = [
  { id: "Maria Souza", label: "Maria Souza" },
  { id: "João Pedro", label: "João Pedro" },
];
const DURATIONS = ["00:15", "00:30", "00:45", "01:00", "01:30", "02:00"].map((v) => ({ value: v, label: v }));

/** "Novo Serviço": the form the original loads into the modal over htmx. */
function ServiceModal({ editing, onClose }: { editing: Service | null; onClose: () => void }) {
  const data = useData();
  const toHHMM = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  const [name, setName] = useState(editing?.name ?? "");
  const [price, setPrice] = useState(editing?.price == null ? "" : String(editing.price));
  const [maxPeople, setMaxPeople] = useState(editing?.maxPeople == null ? "" : String(editing.maxPeople));
  const [order, setOrder] = useState(String(editing?.order ?? 1));
  const [duration, setDuration] = useState(toHHMM(editing?.duration ?? 30));
  const [color, setColor] = useState(editing?.color ?? "#6366F1");
  const [agendas, setAgendas] = useState<string[]>(editing?.agendaIds ?? []);
  const [tags, setTags] = useState<string[]>(editing?.tagIds ?? []);
  const [members, setMembers] = useState<string[]>(editing?.members ?? []);
  const agendaOptions = data.agendas.map((a) => ({ id: a.id, label: a.name }));
  const tagOptions = data.tags.map((t) => ({ id: t.id, label: t.name }));

  /** Writes the service into the browser's data, like the original posts the form. */
  const save = () => {
    if (!name.trim()) return;
    const [h, m] = duration.split(":").map(Number);
    update((d) => {
      const row: Service = {
        id: editing?.id ?? nextId("s", d.services),
        name: name.trim(),
        price: price === "" ? null : Number(price),
        duration: h * 60 + m,
        agendaIds: agendas,
        tagIds: tags,
        order: Number(order) || 1,
        color,
        maxPeople: maxPeople === "" ? null : Number(maxPeople),
        members,
      };
      return { ...d, services: editing ? d.services.map((x) => (x.id === row.id ? row : x)) : [...d.services, row] };
    });
    onClose();
  };

  return (
    <Modal
      id="service-form-modal"
      title={editing ? "Editar Serviço" : "Novo Serviço"}
      size="2xl"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="hbtn hbtn--primary" disabled={!name.trim()} onClick={save}>
            <SaveIcon />
            Salvar
          </button>
        </>
      }
    >
      <form
        id="service-form"
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
          <div className="md:col-span-2">
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label" htmlFor="id_label">
                Nome do serviço <span className="hinput-req">*</span>
              </label>
              <div className="hinput-wrap">
                <input
                  id="id_label"
                  className="hinput"
                  type="text"
                  name="label"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Consulta, Avaliação, Retorno..."
                  required
                />
              </div>
            </div>
          </div>
          <div>
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label" htmlFor="id_valor">
                Valor
              </label>
              <div className="hinput-wrap">
                <input
                  id="id_valor"
                  className="hinput"
                  type="number"
                  step="0.01"
                  min="0"
                  name="valor"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>
          <div>
            <Combobox
              id="att_interval"
              label="Duração"
              required
              searchInPopover
              placeholder="Selecione"
              options={DURATIONS}
              value={duration}
              onChange={setDuration}
            />
          </div>
          <div>
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label" htmlFor="id_max_people_subtype">
                Máximo de pessoas no mesmo horário
              </label>
              <div className="hinput-wrap">
                <input
                  id="id_max_people_subtype"
                  className="hinput"
                  type="number"
                  min="1"
                  name="max_people_subtype"
                  value={maxPeople}
                  onChange={(e) => setMaxPeople(e.target.value)}
                />
              </div>
              <p className="hinput-desc">Em branco: usa o limite da agenda</p>
            </div>
          </div>
          <div>
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label" htmlFor="id_order">
                Ordem no agendamento
              </label>
              <div className="hinput-wrap">
                <input id="id_order" className="hinput" type="number" min="0" name="order" value={order} onChange={(e) => setOrder(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label" htmlFor="id_link_pagamento">
                Link de pagamento
              </label>
              <div className="hinput-wrap">
                <input id="id_link_pagamento" className="hinput" type="text" name="link_pagamento" placeholder="https://..." />
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <ColorPicker name="color" label="Cor no calendário" value={color} onChange={setColor} />
          </div>
          <div className="md:col-span-2">
            <label className="hcheckbox">
              <input type="checkbox" name="b_valor" id="id_b_valor" className="hcheckbox-input" />
              <span className="hcheckbox-box" aria-hidden="true">
                <CheckboxMark />
                <span className="hcheckbox-dash" aria-hidden="true" />
              </span>
              <span className="hcheckbox-label">Mostrar o valor para os clientes</span>
            </label>
          </div>
        </div>

        <div className="pt-5 border-t border-gray-100 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 inter-semibold">Vínculos</h4>
          <label className="hcheckbox">
            <input type="checkbox" name="b_all_agendas" id="id_b_all_agendas" className="hcheckbox-input" />
            <span className="hcheckbox-box" aria-hidden="true">
              <CheckboxMark />
              <span className="hcheckbox-dash" aria-hidden="true" />
            </span>
            <span className="hcheckbox-label">Vincular em todas as agendas</span>
          </label>
          <AutocompleteMulti
            id="agendas"
            name="agendas"
            label="Agendas"
            placeholder="Selecione as agendas"
            options={agendaOptions}
            values={agendas}
            onChange={setAgendas}
          />
          <AutocompleteMulti id="tags" name="tags" label="Tags" placeholder="Selecione as tags" options={tagOptions} values={tags} onChange={setTags} />
          <AutocompleteMulti
            id="members"
            name="members"
            label="Colaboradores"
            placeholder="Selecione os colaboradores"
            options={MEMBER_OPTIONS}
            values={members}
            onChange={setMembers}
          />
        </div>

        <div className="pt-5 border-t border-gray-100 space-y-3">
          <div>
            <label htmlFor="id_texto_pos_agendamento" className="hinput-label">
              Instruções pós-agendamento
            </label>
            <textarea
              name="texto_pos_agendamento"
              id="id_texto_pos_agendamento"
              rows={3}
              maxLength={2000}
              className="htextarea mt-1.5"
              placeholder="Exibidas na tela de confirmação e no e-mail enviado ao cliente"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

/** Minha Agenda › Serviços: the service list (empty in this account) and its form. */
export function ServicesPage() {
  const data = useData();
  const [query, setQuery] = useState("");
  const [agendas, setAgendas] = useState<string[]>([]);
  const [form, setForm] = useState<{ open: boolean; editing: Service | null }>({ open: false, editing: null });
  const filtered = !!query || agendas.length > 0;
  const term = fold(query.trim());
  const agendaNames = data.agendas.map((a) => a.name);
  const rows = data.services
    .filter((svc) => (agendas.length ? svc.agendaIds.some((id) => agendas.includes(data.agendas.find((a) => a.id === id)?.name ?? "")) : true))
    .filter((svc) => (term ? fold(svc.name).includes(term) : true))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  const remove = (id: string) => update((d) => ({ ...d, services: d.services.filter((x) => x.id !== id) }));

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <form id="formFilter" className="min-w-0" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${query ? " has-query" : ""}`} id="service-search">
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Buscar serviços..."
              aria-label="Buscar serviços..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => setQuery("")}>
              <CloseCircleIcon className="w-4 h-4" />
            </button>
          </label>

          <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
            <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => setForm({ open: true, editing: null })}>
              <GridPlusIcon />
              Novo Serviço
            </button>
            <div className="hactionbar" role="group">
              <div className="hrail-track hactionbar-track">
                <InlineFilter
                  label="Agenda"
                  icon={<CalendarIcon className="hinline-icon w-4 h-4" />}
                  options={agendaNames}
                  values={agendas}
                  onChange={setAgendas}
                />
                <span className="hactionbar-sep" aria-hidden="true" />
                <button
                  type="button"
                  aria-label="Limpar filtros"
                  className="hbtn hbtn--ghost hbtn--sm"
                  onClick={() => {
                    setQuery("");
                    setAgendas([]);
                  }}
                >
                  <UndoIcon />
                  <span className="hactionbar-label">Limpar filtros</span>
                </button>
                <a href={ROUTES.configurarAgendas} aria-label="Agendas" className="hbtn hbtn--ghost hbtn--sm">
                  <CalendarIcon />
                  <span className="hactionbar-label">Agendas</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="mt-6 md:mt-8">
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Serviços</h2>
          </div>
          <div className="hwidget-actions" />
        </div>
      </div>

      <div id="services-table-container" className="mt-4">
        <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.25rem", "--htable-head-h": "38px" } as CSSProperties}>
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
                {rows.map((svc) => {
                  const agendaLabels = svc.agendaIds.map((id) => data.agendas.find((a) => a.id === id)?.name).filter(Boolean);
                  const tagLabels = svc.tagIds.map((id) => data.tags.find((t) => t.id === id)?.name).filter(Boolean);
                  return (
                    <tr key={svc.id} className="htable-row">
                      <td className="htable-cell">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: svc.color }} aria-hidden="true" />
                          {svc.name}
                        </span>
                      </td>
                      <td className="htable-cell">{formatMoney(svc.price)}</td>
                      <td className="htable-cell">{formatDuration(svc.duration)}</td>
                      <td className="htable-cell htable-cell--num hidden lg:table-cell">{svc.maxPeople ?? "—"}</td>
                      <td className="htable-cell hidden lg:table-cell">{agendaLabels.join(", ") || "—"}</td>
                      <td className="htable-cell hidden xl:table-cell">{tagLabels.join(", ") || "—"}</td>
                      <td className="htable-cell hidden xl:table-cell">{svc.members.join(", ") || "—"}</td>
                      <td className="htable-cell htable-cell--num hidden lg:table-cell">{svc.order}</td>
                      <td className="htable-cell htable-cell--end">
                        <span className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            className="hbtn hbtn--ghost hbtn--sm hbtn--icon"
                            aria-label="Editar serviço"
                            onClick={() => setForm({ open: true, editing: svc })}
                          >
                            <PenIcon className="w-4 h-4" />
                          </button>
                          <button type="button" className="hbtn hbtn--ghost hbtn--sm hbtn--icon" aria-label="Excluir serviço" onClick={() => remove(svc.id)}>
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {Array.from({ length: Math.max(0, SLOTS - rows.length) }, (_, k) => (
                  <tr key={`empty-${k}`} className="htable-row--empty" aria-hidden="true">
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
                  <h3 className="hempty-title nunito-bold">Nenhum serviço encontrado</h3>
                  <p className="hempty-desc inter-regular">
                    Nenhum serviço corresponde aos filtros. Ajuste a busca ou limpe os filtros para ver mais resultados.
                  </p>
                </div>
              ) : (
                <div className="hempty hempty--inline hui-reveal">
                  <LayersIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">Nenhum serviço por aqui</h3>
                  <p className="hempty-desc inter-regular">Cadastre os serviços que seus clientes podem agendar.</p>
                </div>
              )}
            </div>
          )}
          <div className="htable-footer" />
        </div>
      </div>

      {form.open && <ServiceModal editing={form.editing} onClose={() => setForm({ open: false, editing: null })} />}
    </div>
  );
}
