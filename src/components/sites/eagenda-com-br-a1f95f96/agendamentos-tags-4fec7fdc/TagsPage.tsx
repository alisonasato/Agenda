"use client";

import { useState, type CSSProperties } from "react";
import { ROUTES } from "../shared/Sidebar";
import { Modal } from "../shared/Modal";
import { AutocompleteMulti } from "../shared/AutocompleteMulti";
import { CalendarIcon, CloseCircleIcon, GridPlusIcon, PenIcon, SaveIcon, SearchEmptyIcon, SearchSolidIcon, TagIcon, TrashIcon } from "../shared/icons";
import { useData, update, nextId } from "@/lib/seiri/store";
import { fold } from "@/lib/seiri/select";
import type { Tag } from "@/lib/seiri/types";

const COLUMNS = ["Nome", "Aplicar em Agendas", "Aplicar em Serviços"];
const SLOTS = 10;

/** "Nova Tag": the form the original loads into the modal over htmx. */
function TagModal({ editing, onClose }: { editing: Tag | null; onClose: () => void }) {
  const data = useData();
  const [name, setName] = useState(editing?.name ?? "");
  const [agendas, setAgendas] = useState<string[]>(editing ? data.agendas.filter((a) => taggedAgendas(data, editing.id).includes(a.id)).map((a) => a.id) : []);
  const [services, setServices] = useState<string[]>(editing ? data.services.filter((s) => s.tagIds.includes(editing.id)).map((s) => s.id) : []);
  const agendaOptions = data.agendas.map((a) => ({ id: a.id, label: a.name }));
  const serviceOptions = data.services.map((s) => ({ id: s.id, label: s.name }));

  /** Saves the tag and re-points the services that carry it, like the original's form does. */
  const save = () => {
    if (!name.trim()) return;
    update((d) => {
      const id = editing?.id ?? nextId("t", d.tags);
      const tags = editing ? d.tags.map((t) => (t.id === id ? { ...t, name: name.trim() } : t)) : [...d.tags, { id, name: name.trim() }];
      const withTag = (s: { id: string; tagIds: string[] }) => (services.includes(s.id) ? [...new Set([...s.tagIds, id])] : s.tagIds.filter((t) => t !== id));
      return { ...d, tags, services: d.services.map((s) => ({ ...s, tagIds: withTag(s) })) };
    });
    onClose();
  };
  return (
    <Modal
      id="tag-form-modal"
      title={editing ? "Editar Tag" : "Nova Tag"}
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
      <form id="tag-form" className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="hinput-field hinput-field--block">
          <label className="hinput-label" htmlFor="id_label">
            Nome da Tag <span className="hinput-req">*</span>
          </label>
          <div className="hinput-wrap">
            <input
              id="id_label"
              className="hinput"
              type="text"
              name="label"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: VIP, Retorno, Convênio..."
              required
            />
          </div>
        </div>
        <div>
          <AutocompleteMulti
            id="related_calendars"
            name="related_calendars"
            label="Agendas Relacionadas"
            placeholder="Selecione as agendas"
            options={agendaOptions}
            values={agendas}
            onChange={setAgendas}
          />
          <p className="mt-1.5 text-xs text-gray-500 inter-regular">Deixe em branco caso a tag se aplique a todas as agendas</p>
        </div>
        <div>
          <AutocompleteMulti
            id="related_services"
            name="related_services"
            label="Serviços Relacionados"
            placeholder="Selecione os serviços"
            options={serviceOptions}
            values={services}
            onChange={setServices}
          />
          <p className="mt-1.5 text-xs text-gray-500 inter-regular">Deixe em branco caso a tag se aplique a todos os serviços</p>
        </div>
      </form>
    </Modal>
  );
}

/** The agendas a tag reaches: the ones its services belong to. */
function taggedAgendas(data: { services: { tagIds: string[]; agendaIds: string[] }[] }, tagId: string) {
  return [...new Set(data.services.filter((s) => s.tagIds.includes(tagId)).flatMap((s) => s.agendaIds))];
}

/** Minha Agenda › Tags: the tag list and its form. */
export function TagsPage() {
  const data = useData();
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<{ open: boolean; editing: Tag | null }>({ open: false, editing: null });
  const term = fold(query.trim());
  const rows = data.tags.filter((t) => (term ? fold(t.name).includes(term) : true));
  const remove = (id: string) =>
    update((d) => ({ ...d, tags: d.tags.filter((t) => t.id !== id), services: d.services.map((s) => ({ ...s, tagIds: s.tagIds.filter((t) => t !== id) })) }));

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <form id="formFilter" className="min-w-0" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${query ? " has-query" : ""}`} id="tag-search">
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Buscar tags..."
              aria-label="Buscar tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => setQuery("")}>
              <CloseCircleIcon className="w-4 h-4" />
            </button>
          </label>

          <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
            <a href={ROUTES.configurarAgendas} className="hbtn hbtn--secondary hbtn--sm">
              <CalendarIcon />
              Agendas
            </a>
            <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => setForm({ open: true, editing: null })}>
              <GridPlusIcon />
              Nova Tag
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-3 min-w-0">
        <h2 className="text-base md:text-lg text-gray-900 nunito-bold flex items-center gap-2">Tags</h2>
      </div>

      <div id="tags-table-container" className="mt-4">
        <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.25rem", "--htable-head-h": "38px" } as CSSProperties}>
          <div className="htable-scroll">
            <table className="htable-table w-full htable-fixed">
              <thead>
                <tr>
                  {COLUMNS.map((c) => (
                    <th key={c} className="htable-col">
                      {c}
                    </th>
                  ))}
                  <th className="htable-col htable-col--end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((tag) => {
                  const services = data.services.filter((svc) => svc.tagIds.includes(tag.id));
                  const agendas = taggedAgendas(data, tag.id)
                    .map((id) => data.agendas.find((a) => a.id === id)?.name)
                    .filter(Boolean);
                  return (
                    <tr key={tag.id} className="htable-row">
                      <td className="htable-cell">{tag.name}</td>
                      <td className="htable-cell">{agendas.join(", ") || "Todas as agendas"}</td>
                      <td className="htable-cell">{services.map((svc) => svc.name).join(", ") || "Todos os serviços"}</td>
                      <td className="htable-cell htable-cell--end">
                        <span className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            className="hbtn hbtn--ghost hbtn--sm hbtn--icon"
                            aria-label="Editar tag"
                            onClick={() => setForm({ open: true, editing: tag })}
                          >
                            <PenIcon className="w-4 h-4" />
                          </button>
                          <button type="button" className="hbtn hbtn--ghost hbtn--sm hbtn--icon" aria-label="Excluir tag" onClick={() => remove(tag.id)}>
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
              {query ? (
                <div className="hempty hempty--inline hui-reveal">
                  <SearchEmptyIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">Nenhuma tag encontrada</h3>
                  <p className="hempty-desc inter-regular">Nenhuma tag corresponde à busca. Ajuste ou limpe o texto para ver mais resultados.</p>
                </div>
              ) : (
                <div className="hempty hempty--inline hui-reveal">
                  <TagIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">Nenhuma tag por aqui</h3>
                  <p className="hempty-desc inter-regular">Crie tags para categorizar e filtrar seus agendamentos.</p>
                </div>
              )}
            </div>
          )}
          <div className="htable-footer" />
        </div>
      </div>

      {form.open && <TagModal editing={form.editing} onClose={() => setForm({ open: false, editing: null })} />}
    </div>
  );
}
