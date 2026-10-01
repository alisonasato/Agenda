"use client";

import { Fragment, useState, type CSSProperties } from "react";
import {
  AddAppointmentIcon,
  BellIcon,
  ChatBubbleIcon,
  CheckReadIcon,
  CloseCircleIcon,
  LetterIcon,
  RefreshIcon,
  SearchSolidIcon,
  DangerCircleIcon,
  PenIcon,
  TrashIcon,
} from "../shared/icons";
import { Combobox } from "../shared/Combobox";
import { Modal, ModalSubmit } from "../shared/Modal";
import { AlertDialog } from "../shared/AlertDialog";
import { nextId, update, useData } from "@/lib/seiri/store";
import { fold } from "@/lib/seiri/select";
import { WHATSAPP_TEMPLATE_TYPES, type WhatsappTemplate } from "@/lib/seiri/types";
import { ScrollRail } from "../shared/ScrollRail";
import { ROUTES } from "../shared/Sidebar";

const LINKS = [
  { label: "Regras de Notificação", href: ROUTES.notificacoesRegras, Icon: BellIcon },
  { label: "Modelos de Email", href: ROUTES.modelosEmail, Icon: LetterIcon },
  { label: "Atualizações de Status", href: ROUTES.notificacoesStatus, Icon: RefreshIcon },
];

const COLUMNS = ["Nome", "Tipo", "Conteúdo", "Usado em"];
const SLOTS = 10;

const TEMPLATE_TYPES = WHATSAPP_TEMPLATE_TYPES;

/** "Novo Modelo de WhatsApp" modal. The original loads this body over htmx; the fields are the same. */
function WhatsappTemplateModal({ template, onClose }: { template?: WhatsappTemplate; onClose: () => void }) {
  const [name, setName] = useState(template?.name ?? "");
  const [type, setType] = useState(template?.type ?? "");
  const [text, setText] = useState(template?.text ?? "");

  const save = () => {
    if (!name.trim() || !type || !text.trim()) return;
    update((d) => {
      const row: WhatsappTemplate = { id: template?.id ?? nextId("wt", d.whatsappTemplates), name: name.trim(), type, text: text.trim() };
      return { ...d, whatsappTemplates: template ? d.whatsappTemplates.map((t) => (t.id === template.id ? row : t)) : [...d.whatsappTemplates, row] };
    });
    onClose();
  };

  return (
    <Modal
      id="whatsapp-template-modal"
      title={template ? "Editar Modelo de WhatsApp" : "Novo Modelo de WhatsApp"}
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
      <form
        id="whatsapp-template-form"
        className="space-y-5"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="hinput-field hinput-field--block">
          <label className="hinput-label" htmlFor="id_name">
            Nome do Modelo <span className="hinput-req">*</span>
          </label>
          <div className="hinput-wrap">
            <input
              id="id_name"
              className="hinput"
              type="text"
              name="name"
              placeholder="Ex.: Follow-up de informações"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
          <textarea
            name="text"
            id="id_text"
            rows={6}
            required
            className="htextarea mt-1.5"
            placeholder="Digite o conteúdo da mensagem..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}

export function WhatsappTemplates() {
  const data = useData();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<WhatsappTemplate | null>(null);
  const [removing, setRemoving] = useState<WhatsappTemplate | null>(null);

  const term = fold(query.trim());
  const rows = data.whatsappTemplates
    .filter((template) => (term ? fold(`${template.name} ${template.text}`).includes(term) : true))
    .map((template) => ({
      template,
      typeLabel: TEMPLATE_TYPES.find((t) => t.value === template.type)?.label ?? template.type,
      // "Usado em" counts the notification rules pointing at this model.
      usedIn: data.notificationRules.filter((r) => r.whatsappTemplate === template.id).length,
    }));

  const remove = (id: string) => update((d) => ({ ...d, whatsappTemplates: d.whatsappTemplates.filter((t) => t.id !== id) }));

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
        <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as CSSProperties}>
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
                {rows.map((row) => (
                  <tr key={row.template.id}>
                    <td className="htable-cell">
                      <span className="text-sm text-gray-900 font-semibold inter-semibold">{row.template.name}</span>
                    </td>
                    <td className="htable-cell">
                      <span className="hchip hchip--default hchip--soft hchip--sm">{row.typeLabel}</span>
                    </td>
                    <td className="htable-cell">
                      <span className="text-sm text-gray-600 inter-regular line-clamp-2">{row.template.text}</span>
                    </td>
                    <td className="htable-cell whitespace-nowrap">
                      <span className="text-sm text-gray-600 inter-regular">{row.usedIn} regra(s)</span>
                    </td>
                    <td className="htable-cell htable-cell--end whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" className="btn-icon btn-icon-sm btn-icon-flat" title="Editar" onClick={() => setEditing(row.template)}>
                          <PenIcon className="w-4 h-4" />
                        </button>
                        <button type="button" className="btn-icon btn-icon-sm btn-icon-danger" title="Excluir" onClick={() => setRemoving(row.template)}>
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
                <ChatBubbleIcon className="hempty-icon" />
                <h3 className="hempty-title nunito-bold">Nenhum modelo de WhatsApp por aqui</h3>
                <p className="hempty-desc inter-regular">Crie modelos personalizados para usar nas regras automáticas de WhatsApp.</p>
              </div>
            </div>
          )}
          <div className="htable-footer" />
        </div>
      </div>

      {creating && <WhatsappTemplateModal onClose={() => setCreating(false)} />}
      {editing && <WhatsappTemplateModal template={editing} onClose={() => setEditing(null)} />}
      {removing && (
        <AlertDialog
          id="wa-template-delete-dialog"
          heading="Excluir modelo"
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
          As regras que usam este modelo ficam sem modelo.
        </AlertDialog>
      )}
    </>
  );
}
