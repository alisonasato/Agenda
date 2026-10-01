"use client";

import dynamic from "next/dynamic";
import { Fragment, useRef, useState, type CSSProperties } from "react";
import type { ClassicEditor } from "ckeditor5";
import {
  AddAppointmentIcon,
  BellIcon,
  ChatIcon,
  CheckReadIcon,
  CloseCircleIcon,
  InboxIcon,
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
import type { EmailTemplate } from "@/lib/seiri/types";
import { ScrollRail } from "../shared/ScrollRail";
import { ROUTES } from "../shared/Sidebar";

// CKEditor touches `window` on import, so it only loads in the browser.
const RichTextEditor = dynamic(() => import("../shared/RichTextEditor").then((m) => m.RichTextEditor), { ssr: false });

const LINKS = [
  { label: "Regras de Notificação", href: ROUTES.notificacoesRegras, Icon: BellIcon },
  { label: "Modelos de WhatsApp", href: ROUTES.modelosWhatsapp, Icon: ChatIcon },
  { label: "Atualizações de Status", href: ROUTES.notificacoesStatus, Icon: RefreshIcon },
];

const COLUMNS = ["Nome", "Assunto", "Usado em"];
const SLOTS = 10;

const EXAMPLES = [
  { value: "pre_meeting_online", label: "Pré-reunião Online" },
  { value: "pre_meeting_in_person", label: "Pré-reunião Presencial" },
  { value: "satisfaction_survey", label: "Pesquisa de Satisfação" },
];

// What the original's /users/get-example-text/ returns for each example.
const EXAMPLE_TEXT: Record<string, string> = {
  pre_meeting_online:
    "Olá, {{nome}}! Gostaria de lembrar que seu atendimento está agendado para o dia {{dia_agendado}}, às {{hora_agendada}}. O atendimento será realizado de forma online. Agradecemos e aguardamos no horário marcado!",
  pre_meeting_in_person:
    "Olá, {{nome}}, Gostaria de lembrar que seu atendimento está agendado para o dia {{dia_agendado}}, às {{hora_agendada}}. O atendimento será realizado no seguinte endereço: {{endereco}}. Agradecemos e aguardamos no horário marcado! Atenciosamente, {{nome_empresa}}.",
  satisfaction_survey:
    "Olá, {{nome}}! Foi um prazer lhe atender! Agora que o atendimento foi concluído, poderia responder a nossa pesquisa? Ficariamos gratos por isso! Aqui está o link {{link_pesquisa}}. Até uma próxima! :)",
};

const VARIABLES: { title: string; items: [string, string][] }[] = [
  {
    title: "Dados da Agenda",
    items: [
      ["agenda", "Nome da Agenda"],
      ["conta_nome", "Nome de Exibição da Conta"],
      ["conta_telefone", "Telefone de Suporte ao Cliente"],
      ["endereco_atendimento", "Endereço do Atendimento"],
    ],
  },
  {
    title: "Dados do Agendamento",
    items: [
      ["status", "Status do Agendamento"],
      ["identificador", "Identificador do Agendamento"],
      ["servicos", "Serviços Agendados"],
      ["data", "Dia do Agendamento"],
      ["hora", "Hora do Agendamento"],
      ["link_recibo", "Link do Recibo do Agendamento"],
      ["link_video", "Link da Videoconferência"],
      ["zoom_start_url", "Link do Anfitrião - Zoom"],
      ["respostas_formulario", "Respostas do Formulário"],
      ["comentario", "Observação/Comentário do Agendamento"],
    ],
  },
  {
    title: "Dados da Pessoa/Destinatário",
    items: [
      ["nome", "Nome do Cliente"],
      ["telefone", "Telefone do Cliente"],
      ["email", "Email do Cliente"],
      ["endereco_cliente", "Endereço do Cliente"],
    ],
  },
  {
    title: "Dados de Pagamento",
    items: [
      ["valor", "Valor do Agendamento"],
      ["link_pagamento", "Link de Pagamento"],
      ["link_fatura", "Link da Fatura"],
    ],
  },
  { title: "Pesquisa de Satisfação", items: [["link_pesquisa", "Link da Pesquisa de Satisfação"]] },
];

/** "Novo Modelo de Email" modal. The original loads this body over htmx; the fields are the same. */
function EmailTemplateModal({ template, onClose }: { template?: EmailTemplate; onClose: () => void }) {
  const [name, setName] = useState(template?.name ?? "");
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [example, setExample] = useState("");
  const editorRef = useRef<ClassicEditor | null>(null);

  const save = () => {
    const body = editorRef.current?.getData() ?? template?.body ?? "";
    if (!name.trim() || !subject.trim()) return;
    update((d) => {
      const row: EmailTemplate = { id: template?.id ?? nextId("et", d.emailTemplates), name: name.trim(), subject: subject.trim(), body };
      return { ...d, emailTemplates: template ? d.emailTemplates.map((t) => (t.id === template.id ? row : t)) : [...d.emailTemplates, row] };
    });
    onClose();
  };

  const pickExample = (value: string) => {
    setExample(value);
    editorRef.current?.setData(`<p>${EXAMPLE_TEXT[value]}</p>`);
  };

  // Like the original: the variable goes in at the caret and the editor takes the focus.
  const insertVariable = (code: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.model.change((w) => editor.model.insertContent(w.createText(code)));
    editor.editing.view.focus();
  };

  return (
    <Modal
      id="email-template-modal"
      title={template ? "Editar Modelo de Email" : "Novo Modelo de Email"}
      size="4xl"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <ModalSubmit id="email-template-modal" form="email-template-form" icon={<CheckReadIcon />} label="Salvar" />
        </>
      }
    >
      <form
        id="email-template-form"
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_name">
              Nome de Identificação <span className="hinput-req">*</span>
            </label>
            <div className="hinput-wrap">
              <input
                id="id_name"
                className="hinput"
                type="text"
                name="name"
                placeholder="Ex.: Confirmação de Agendamento"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_email_subject">
              Assunto do Email <span className="hinput-req">*</span>
            </label>
            <div className="hinput-wrap">
              <input
                id="id_email_subject"
                className="hinput"
                type="text"
                name="email_subject"
                placeholder="Ex.: Seu agendamento foi confirmado!"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="md:max-w-md">
          <Combobox
            id="text_example"
            label="Escolher Exemplo de Texto"
            options={EXAMPLES}
            value={example}
            onChange={pickExample}
            placeholder="Selecione um exemplo"
            searchInPopover
          />
          <p className="hinput-desc">Carrega um corpo pronto que você pode personalizar.</p>
        </div>

        <div className="het-grid">
          <div className="min-w-0">
            <label htmlFor="id_email_body_html" className="hinput-label">
              Corpo do Email <span className="hinput-req">*</span>
            </label>
            <div className="het-editor mt-1.5">
              <RichTextEditor
                editorRef={editorRef}
                name="email_body_html"
                id="id_email_body_html"
                className="w-full"
                language="pt-br"
                initialData={template?.body}
              />
            </div>
          </div>
          <div className="min-w-0">
            <span className="hinput-label">Variáveis do Email</span>
            <div className="hetvars mt-1.5">
              {VARIABLES.map((g) => (
                <div key={g.title} className="hetvars-group">
                  <p className="hetvars-group-title">{g.title}</p>
                  {g.items.map(([code, desc]) => (
                    <button key={code} type="button" className="hetvar" title="Clique para inserir no texto" onClick={() => insertVariable(`{{${code}}}`)}>
                      <span className="hetvar-code">{`{{${code}}}`}</span>
                      <span className="hetvar-desc">{desc}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export function EmailTemplates() {
  const data = useData();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [removing, setRemoving] = useState<EmailTemplate | null>(null);

  const term = fold(query.trim());
  const rows = data.emailTemplates
    .filter((template) => (term ? fold(`${template.name} ${template.subject}`).includes(term) : true))
    // "Usado em" counts the notification rules pointing at this model.
    .map((template) => ({ template, usedIn: data.notificationRules.filter((r) => r.emailTemplate === template.id).length }));

  const remove = (id: string) => update((d) => ({ ...d, emailTemplates: d.emailTemplates.filter((t) => t.id !== id) }));

  return (
    <>
      <form id="formFilter" className="hui-reveal" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${query ? " has-query" : ""}`} id="email-search">
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Buscar modelo por nome ou assunto"
              aria-label="Buscar modelo por nome ou assunto"
              name="search"
              id="email-search-input"
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

      <div className="mt-4 hui-reveal" style={{ animationDelay: ".04s" }}>
        <div id="email-template-table">
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
                        <span className="text-sm text-gray-600 inter-regular">{row.template.subject}</span>
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
            {/* With no templates at all the live page keeps the default variant even while searching. */}
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

      {creating && <EmailTemplateModal onClose={() => setCreating(false)} />}
      {editing && <EmailTemplateModal template={editing} onClose={() => setEditing(null)} />}
      {removing && (
        <AlertDialog
          id="email-template-delete-dialog"
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
