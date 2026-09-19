"use client";

import { Fragment, useState, type CSSProperties } from "react";
import { AddAppointmentIcon, BellIcon, ChatBubbleIcon, CheckReadIcon, CloseCircleIcon, LetterIcon, RefreshIcon, SearchSolidIcon } from "../shared/icons";
import { Combobox } from "../shared/Combobox";
import { Modal, ModalSubmit } from "../shared/Modal";
import { ScrollRail } from "../shared/ScrollRail";
import { ROUTES } from "../shared/Sidebar";

const LINKS = [
  { label: "Regras de Notificação", href: ROUTES.notificacoesRegras, Icon: BellIcon },
  { label: "Modelos de Email", href: ROUTES.modelosEmail, Icon: LetterIcon },
  { label: "Atualizações de Status", href: ROUTES.notificacoesStatus, Icon: RefreshIcon },
];

const COLUMNS = ["Nome", "Tipo", "Conteúdo", "Usado em"];
const SLOTS = 10;

const TEMPLATE_TYPES = [{ value: "follow_up_info", label: "Mensagem de Resposta Automática - Mais Informações" }];

/** "Novo Modelo de WhatsApp" modal. The original loads this body over htmx; the fields are the same. */
function WhatsappTemplateModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState("");

  return (
    <Modal
      id="whatsapp-template-modal"
      title="Novo Modelo de WhatsApp"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <ModalSubmit id="whatsapp-template-modal" form="whatsapp-template-form" icon={<CheckReadIcon />} label="Salvar" />
        </>
      }
    >
      <form id="whatsapp-template-form" className="space-y-5" noValidate onSubmit={(e) => e.preventDefault()}>
        <div className="hinput-field hinput-field--block">
          <label className="hinput-label" htmlFor="id_name">
            Nome do Modelo <span className="hinput-req">*</span>
          </label>
          <div className="hinput-wrap">
            <input id="id_name" className="hinput" type="text" name="name" placeholder="Ex.: Follow-up de informações" required />
          </div>
        </div>

        <div>
          <Combobox
            id="template_type"
            label="Tipo do modelo"
            options={TEMPLATE_TYPES}
            value={type}
            onChange={setType}
            placeholder="Selecione o tipo do modelo"
            required
            searchInPopover
          />
        </div>

        <div>
          <label className="hinput-label" htmlFor="id_text">
            Mensagem do Modelo <span className="text-red-500">*</span>
          </label>
          <textarea name="text" id="id_text" rows={6} required className="htextarea mt-1.5" placeholder="Digite o conteúdo da mensagem..." />
        </div>
      </form>
    </Modal>
  );
}

export function WhatsappTemplates() {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  return (
    <>
      <form id="formFilter" className="min-w-0" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${query ? " has-query" : ""}`} id="wtpl-search">
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Buscar modelo por nome ou conteúdo"
              aria-label="Buscar modelo por nome ou conteúdo"
              name="search"
              id="wtpl-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => setQuery("")}>
              <CloseCircleIcon className="w-4 h-4" />
            </button>
          </label>

          <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
            <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => setCreating(true)}>
              <AddAppointmentIcon />
              Novo Modelo
            </button>
            <ScrollRail className="hactionbar" trackClassName="hrail-track hactionbar-track">
              {LINKS.map(({ label, href, Icon }, i) => (
                <Fragment key={label}>
                  {i > 0 && <span className="hactionbar-sep" aria-hidden="true" />}
                  <a href={href} className="hbtn hbtn--ghost hbtn--sm">
                    <Icon />
                    <span className="hactionbar-label">{label}</span>
                  </a>
                </Fragment>
              ))}
            </ScrollRail>
          </div>
        </div>
      </form>

      <div id="whatsapp-template-table" className="mt-4">
        <div className="htable htable-is-empty" style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as CSSProperties}>
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
            <div className="hempty hempty--inline hui-reveal">
              <ChatBubbleIcon className="hempty-icon" />
              <h3 className="hempty-title nunito-bold">Nenhum modelo de WhatsApp por aqui</h3>
              <p className="hempty-desc inter-regular">Crie modelos personalizados para usar nas regras automáticas de WhatsApp.</p>
            </div>
          </div>
          <div className="htable-footer" />
        </div>
      </div>

      {creating && <WhatsappTemplateModal onClose={() => setCreating(false)} />}
    </>
  );
}
