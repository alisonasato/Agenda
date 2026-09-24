"use client";

import { useState, type CSSProperties } from "react";
import { ROUTES } from "../shared/Sidebar";
import { Modal, ModalSubmit } from "../shared/Modal";
import { AutocompleteMulti } from "../shared/AutocompleteMulti";
import { CalendarIcon, CloseCircleIcon, GridPlusIcon, SaveIcon, SearchEmptyIcon, SearchSolidIcon, TagIcon } from "../shared/icons";

const COLUMNS = ["Nome", "Aplicar em Agendas", "Aplicar em Serviços"];
const SLOTS = 10;
const AGENDA_OPTIONS = [{ id: "1", label: "Agenda Principal" }];

/** "Nova Tag": the form the original loads into the modal over htmx. */
function TagModal({ onClose }: { onClose: () => void }) {
  const [agendas, setAgendas] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  return (
    <Modal
      id="tag-form-modal"
      title="Nova Tag"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <ModalSubmit id="tag-form-modal" form="tag-form" icon={<SaveIcon />} label="Salvar" />
        </>
      }
    >
      <form id="tag-form" className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="hinput-field hinput-field--block">
          <label className="hinput-label" htmlFor="id_label">
            Nome da Tag <span className="hinput-req">*</span>
          </label>
          <div className="hinput-wrap">
            <input id="id_label" className="hinput" type="text" name="label" placeholder="Ex.: VIP, Retorno, Convênio..." required />
          </div>
        </div>
        <div>
          <AutocompleteMulti
            id="related_calendars"
            name="related_calendars"
            label="Agendas Relacionadas"
            placeholder="Selecione as agendas"
            options={AGENDA_OPTIONS}
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
            options={[]}
            values={services}
            onChange={setServices}
          />
          <p className="mt-1.5 text-xs text-gray-500 inter-regular">Deixe em branco caso a tag se aplique a todos os serviços</p>
        </div>
      </form>
    </Modal>
  );
}

/** Minha Agenda › Tags: the tag list (empty in this account) and its form. */
export function TagsPage() {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

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
            <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => setCreating(true)}>
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
        <div className="htable htable-is-empty" style={{ "--htable-row-h": "3.25rem", "--htable-head-h": "38px" } as CSSProperties}>
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
                {Array.from({ length: SLOTS }, (_, i) => (
                  <tr key={i} className="htable-row--empty" aria-hidden="true">
                    {Array.from({ length: COLUMNS.length + 1 }, (_, j) => (
                      <td key={j} className="htable-cell" />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <div className="htable-footer" />
        </div>
      </div>

      {creating && <TagModal onClose={() => setCreating(false)} />}
    </div>
  );
}
