"use client";

import { download } from "@/lib/seiri/csv";
import { INVITE_TEMPLATE_SHEET, inviteTemplateFile } from "@/lib/seiri/inviteTemplate";
import { XLSX_TYPE, toXlsx } from "@/lib/seiri/xlsx";
import { useState, type CSSProperties } from "react";
import { AlertDialog } from "../shared/AlertDialog";
import { FilePicker } from "../shared/FilePicker";
import { Modal, ModalSubmit } from "../shared/Modal";
import { ScrollRail } from "../shared/ScrollRail";
import { Select } from "../shared/Select";
import {
  CheckboxMark,
  CloseCircleIcon,
  DangerCircleIcon,
  GridPlusIcon,
  LetterIcon,
  PenIcon,
  SearchSolidIcon,
  SheetIcon,
  TrashIcon,
  UserAddIcon,
} from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { fold } from "@/lib/seiri/select";
import { nextId, update, useData } from "@/lib/seiri/store";
import { INVITE_FIELDS, INVITE_STATUSES, INVITE_STATUS_TONES, type RegistrationInvite } from "@/lib/seiri/types";

const COLUMNS = ["Convite", "Destinatários", "Cadastros", "Aprovação", "Status", "Criado em"];
const SLOTS = 10;

/** "Convites de Cadastro": one row per batch of registration invites. */
export function RegistrationInvites() {
  const data = useData();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<RegistrationInvite | null>(null);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<RegistrationInvite | null>(null);

  const rows = data.invites.filter((i) => {
    if (status && i.status !== status) return false;
    return !search.trim() || fold(i.name).includes(fold(search.trim()));
  });
  const filtered = Boolean(search.trim() || status);

  const reset = () => {
    setSearch("");
    setStatus("");
  };
  const remove = (id: string) =>
    update((d) => ({ ...d, invites: d.invites.filter((i) => i.id !== id), submissions: d.submissions.filter((s) => s.inviteId !== id) }));

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0 hui-reveal">
        <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${search ? " has-query" : ""}`}>
          <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
          <input
            type="text"
            autoComplete="off"
            spellCheck={false}
            className="hui-search-input"
            placeholder="Buscar convite pelo nome"
            aria-label="Buscar convite pelo nome"
            name="search"
            id="invite-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
          <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => setCreating(true)}>
            <GridPlusIcon />
            Convidar clientes
          </button>
          <ScrollRail className="hactionbar" trackClassName="hrail-track hactionbar-track">
            <a href={ROUTES.cadastrosRecebidos} className="hbtn hbtn--ghost hbtn--sm">
              <UserAddIcon />
              <span className="hactionbar-label">Cadastros recebidos</span>
            </a>
            <span className="hactionbar-sep" aria-hidden="true" />
            <a href={ROUTES.textosConvite} className="hbtn hbtn--ghost hbtn--sm">
              <LetterIcon />
              <span className="hactionbar-label">Texto do e-mail</span>
            </a>
            {/* The original serves an .xlsx its server builds; this builds the same sheet in the browser. */}
            <button
              type="button"
              className="hbtn hbtn--ghost hbtn--sm"
              onClick={() => download(inviteTemplateFile(), toXlsx(INVITE_TEMPLATE_SHEET), XLSX_TYPE)}
            >
              <SheetIcon />
              <span className="hactionbar-label">Modelo da planilha</span>
            </button>
          </ScrollRail>
        </div>
      </div>

      <div className="mt-6 md:mt-8 hui-reveal" style={{ animationDelay: ".04s" }}>
        <div className="flex flex-wrap items-center gap-3 mb-3 min-w-0">
          <div id="status-quick-filters" className="hrail min-w-0">
            <div className="hrail-track">
              <div className="htaggroup--nowrap htaggroup">
                {INVITE_STATUSES.map((s) => (
                  <button key={s.value} type="button" className={`htag${s.value === status ? " htag--active" : ""}`} onClick={() => setStatus(s.value)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={reset}>
              <CloseCircleIcon className="w-4 h-4" />
              Limpar filtros
            </button>
          </div>
        </div>

        <div id="invite-table-container">
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
                  {rows.map((invite) => {
                    const submissions = data.submissions.filter((s) => s.inviteId === invite.id);
                    return (
                      <tr key={invite.id}>
                        <td className="htable-cell">
                          <p className="text-sm font-semibold text-gray-900 inter-semibold truncate">{invite.name}</p>
                        </td>
                        <td className="htable-cell">
                          <span className="text-sm text-gray-700 inter-regular">{invite.emails.length}</span>
                        </td>
                        <td className="htable-cell">
                          <span className="text-sm text-gray-700 inter-regular">{submissions.length}</span>
                        </td>
                        <td className="htable-cell">
                          <span className="hchip hchip--default hchip--soft hchip--sm">{invite.autoApprove ? "Automática" : "Manual"}</span>
                        </td>
                        <td className="htable-cell">
                          <span className={`hchip ${INVITE_STATUS_TONES[invite.status]} hchip--primary hchip--sm`}>
                            {INVITE_STATUSES.find((s) => s.value === invite.status)?.label}
                          </span>
                        </td>
                        <td className="htable-cell whitespace-nowrap">
                          <span className="text-sm text-gray-700 inter-regular">{invite.createdAt}</span>
                        </td>
                        <td className="htable-cell htable-cell--end">
                          <div className="inline-flex items-center justify-end gap-1">
                            <button type="button" className="btn-icon btn-icon-sm btn-icon-flat" title="Editar" onClick={() => setEditing(invite)}>
                              <PenIcon className="w-4 h-4" />
                            </button>
                            <button type="button" className="btn-icon btn-icon-sm btn-icon-danger" title="Excluir" onClick={() => setRemoving(invite)}>
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                  <LetterIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">{filtered ? "Nenhum convite encontrado" : "Nenhum convite criado ainda"}</h3>
                  <p className="hempty-desc inter-regular">
                    {filtered
                      ? "Ajuste a busca ou o status para ver outros convites."
                      : 'Use "Convidar clientes" para subir uma lista de e-mails e disparar os convites de cadastro.'}
                  </p>
                </div>
              </div>
            )}
            <div className="htable-footer" />
          </div>
        </div>
      </div>

      {(creating || editing) && <InviteModal invite={editing ?? undefined} onClose={() => (editing ? setEditing(null) : setCreating(false))} />}
      {removing && (
        <AlertDialog
          id="invite-delete-dialog"
          heading="Excluir convite?"
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
                <TrashIcon />
                Excluir
              </button>
            </>
          }
        >
          <DeleteMessage invite={removing} count={data.submissions.filter((s) => s.inviteId === removing.id).length} />
        </AlertDialog>
      )}
    </div>
  );
}

/** The original words the warning differently once somebody has registered through the invite. */
function DeleteMessage({ invite, count }: { invite: RegistrationInvite; count: number }) {
  if (!count) return <p>O convite &quot;{invite.name}&quot; e os links enviados serão apagados. Ninguém se cadastrou por ele ainda.</p>;
  return (
    <p>
      O convite &quot;{invite.name}&quot; some do sistema junto com os links e os {count} cadastro(s) recebido(s) por ele. Os clientes já aprovados continuam
      cadastrados na conta.
    </p>
  );
}

function InviteModal({ invite, onClose }: { invite?: RegistrationInvite; onClose: () => void }) {
  const data = useData();
  const [name, setName] = useState(invite?.name ?? "");
  const [emails, setEmails] = useState((invite?.emails ?? []).join("\n"));
  const [templateId, setTemplateId] = useState(invite?.templateId ?? "");
  const [fields, setFields] = useState<string[]>(invite?.fields ?? ["telefone"]);
  const [required, setRequired] = useState<string[]>(invite?.requiredFields ?? []);
  const [autoApprove, setAutoApprove] = useState(invite?.autoApprove ?? false);
  const [askPassword, setAskPassword] = useState(invite?.askPassword ?? true);
  const [expires, setExpires] = useState(String(invite?.expiresInDays ?? 7));

  const toggle = (list: string[], set: (next: string[]) => void, id: string) => set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const save = () => {
    if (!name.trim()) return;
    update((d) => {
      const row: RegistrationInvite = {
        id: invite?.id ?? nextId("iv", d.invites),
        name: name.trim(),
        emails: emails
          .split(/[\n,;]/)
          .map((e) => e.trim())
          .filter(Boolean),
        templateId,
        fields,
        // A field only carries "Obrigatório" while it is still asked for.
        requiredFields: required.filter((id) => fields.includes(id)),
        autoApprove,
        askPassword,
        expiresInDays: Number(expires) || 0,
        status: invite?.status ?? "DRAFT",
        createdAt: invite?.createdAt ?? new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }).replace(",", ""),
      };
      return { ...d, invites: invite ? d.invites.map((i) => (i.id === invite.id ? row : i)) : [...d.invites, row] };
    });
    onClose();
  };

  return (
    <Modal
      id="invite-modal"
      title={invite ? "Editar convite" : "Convidar clientes"}
      size="xl"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <ModalSubmit id="invite-modal" form="invite-modal-form" icon={<LetterIcon />} label={invite ? "Salvar alterações" : "Criar e enviar"} />
        </>
      }
    >
      <form
        id="invite-modal-form"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <section className="hformsection">
          <div className="hformsection-head">
            <h3 className="hformsection-title">Identificação</h3>
          </div>
          <div className="hformsection-body">
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label" htmlFor="id_invite_name">
                Nome do convite <span className="hinput-req">*</span>
              </label>
              <div className="hinput-wrap">
                <input
                  id="id_invite_name"
                  className="hinput"
                  type="text"
                  name="name"
                  placeholder="Ex.: Base antiga — Agosto/2026"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="hformsection">
          <div className="hformsection-head">
            <h3 className="hformsection-title">Quem vai ser convidado</h3>
          </div>
          <div className="hformsection-body">
            <div className="space-y-4">
              <div>
                <label className="hinput-label" htmlFor="id_emails">
                  Lista de emails
                </label>
                <textarea
                  className="htextarea"
                  rows={6}
                  name="emails"
                  id="id_emails"
                  placeholder={"cliente1@empresa.com\ncliente2@empresa.com"}
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                />
                <p className="hinput-help">Cole uma lista de emails, um por linha.</p>
              </div>
              <FilePicker name="spreadsheet" label="Planilha (.csv, .xlsx)" kind="sheet" accept=".csv,.xlsx,.xls" maxMb={5} />
            </div>
          </div>
        </section>

        <section className="hformsection">
          <div className="hformsection-head">
            <h3 className="hformsection-title">Texto do e-mail</h3>
          </div>
          <div className="hformsection-body">
            <div className="space-y-3">
              <Select
                id="id_email_template"
                name="email_template"
                value={templateId}
                onChange={setTemplateId}
                options={[
                  { value: "", label: "Texto padrão do sistema" },
                  ...data.inviteEmails.filter((t) => t.kind === "INVITE").map((t) => ({ value: t.id, label: t.name })),
                ]}
              />
              <div>
                <a href={ROUTES.textosConvite} target="_blank" className="hbtn hbtn--secondary hbtn--sm">
                  <LetterIcon />
                  Gerenciar textos
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="hformsection">
          <div className="hformsection-head">
            <h3 className="hformsection-title">Campos pedidos no cadastro</h3>
            <p className="hformsection-desc">Nome e e-mail são sempre pedidos — o e-mail já vai travado com o endereço do convite.</p>
          </div>
          <div className="hformsection-body">
            <div className="grid gap-1 lg:grid-cols-2">
              {INVITE_FIELDS.map((f) => (
                <div key={f.id} className="flex items-center gap-3 py-1.5 pr-1 transition-opacity">
                  <label className="hcheckbox">
                    <input
                      type="checkbox"
                      className="hcheckbox-input"
                      name={`campo_${f.id}`}
                      checked={fields.includes(f.id)}
                      onChange={() => toggle(fields, setFields, f.id)}
                    />
                    <span className="hcheckbox-box" aria-hidden="true">
                      <CheckboxMark />
                      <span className="hcheckbox-dash" aria-hidden="true" />
                    </span>
                    <span className="hcheckbox-label">{f.label}</span>
                  </label>
                  <span className="ml-auto flex-shrink-0">
                    <label className="hcheckbox hcheckbox--sm">
                      <input
                        type="checkbox"
                        className="hcheckbox-input"
                        name={`campo_${f.id}_required`}
                        disabled={!fields.includes(f.id)}
                        checked={required.includes(f.id) && fields.includes(f.id)}
                        onChange={() => toggle(required, setRequired, f.id)}
                      />
                      <span className="hcheckbox-box" aria-hidden="true">
                        <CheckboxMark />
                        <span className="hcheckbox-dash" aria-hidden="true" />
                      </span>
                      <span className="hcheckbox-label">Obrigatório</span>
                    </label>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="hformsection">
          <div className="hformsection-head">
            <h3 className="hformsection-title">Aprovação e validade</h3>
          </div>
          <div className="hformsection-body">
            <div className="space-y-4">
              <div className="hcheckbox-stack">
                <label className="hcheckbox">
                  <input
                    type="checkbox"
                    className="hcheckbox-input"
                    name="auto_approve"
                    checked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                  />
                  <span className="hcheckbox-box" aria-hidden="true">
                    <CheckboxMark />
                    <span className="hcheckbox-dash" aria-hidden="true" />
                  </span>
                  <span className="hcheckbox-label">Aprovar cadastros automaticamente</span>
                </label>
                <label className="hcheckbox">
                  <input
                    type="checkbox"
                    className="hcheckbox-input"
                    name="ask_password"
                    checked={askPassword}
                    onChange={(e) => setAskPassword(e.target.checked)}
                  />
                  <span className="hcheckbox-box" aria-hidden="true">
                    <CheckboxMark />
                    <span className="hcheckbox-dash" aria-hidden="true" />
                  </span>
                  <span className="hcheckbox-label">O cliente cria uma senha de acesso</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 inter-regular -mt-2">
                O link para criar a senha só é enviado DEPOIS que o cadastro for aprovado. Desmarque para o cliente não ter login (o acesso vem da lista de
                acesso).
              </p>
              <div className="sm:max-w-[14rem]">
                <div className="hinput-field hinput-field--block">
                  <label className="hinput-label" htmlFor="id_expires_in_days">
                    Validade do link (dias)
                  </label>
                  <div className="hinput-wrap">
                    <input
                      id="id_expires_in_days"
                      type="number"
                      min={0}
                      max={365}
                      className="hinput"
                      name="expires_in_days"
                      value={expires}
                      onChange={(e) => setExpires(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
    </Modal>
  );
}
