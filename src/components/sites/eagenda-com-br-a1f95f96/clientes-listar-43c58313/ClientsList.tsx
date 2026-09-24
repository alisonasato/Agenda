"use client";

import { useRef, useState } from "react";
import { ActivityIcon, CaretDownIcon, CloseCircleIcon, PenIcon, SearchSolidIcon, TrashIcon, UsersIcon, WidgetIcon } from "../shared/icons";
import { useData, update, nextId } from "@/lib/seiri/store";
import { fold } from "@/lib/seiri/select";
import { download, parseCsv, stamp, toCsv } from "@/lib/seiri/csv";
import { Modal } from "../shared/Modal";
import { SaveIcon } from "../shared/icons";
import type { Client } from "@/lib/seiri/types";

/** "Adicionar Cliente" / "Editar cliente": the fields the clone keeps for a client. */
function ClientModal({ editing, onClose }: { editing: Client | null; onClose: () => void }) {
  const [name, setName] = useState(editing?.name ?? "");
  const [email, setEmail] = useState(editing?.email ?? "");
  const [phone, setPhone] = useState(editing?.phone ?? "");
  const [cpf, setCpf] = useState(editing?.cpf ?? "");
  const [gender, setGender] = useState<string>(editing?.gender ?? "");

  const save = () => {
    if (!name.trim()) return;
    update((d) => {
      const row: Client = {
        id: editing?.id ?? nextId("c", d.clients),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        cpf: cpf.trim() || undefined,
        gender: (gender as Client["gender"]) || undefined,
      };
      return { ...d, clients: editing ? d.clients.map((c) => (c.id === row.id ? row : c)) : [...d.clients, row] };
    });
    onClose();
  };

  const field = (id: string, label: string, value: string, onChange: (v: string) => void, type = "text") => (
    <div className="hinput-field hinput-field--block">
      <label className="hinput-label" htmlFor={id}>
        {label}
      </label>
      <div className="hinput-wrap">
        <input id={id} className="hinput" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );

  return (
    <Modal
      id="client-form-modal"
      title={editing ? "Editar Cliente" : "Adicionar Cliente"}
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
      <form id="client-form" className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {field("id_client_name", "Nome Completo *", name, setName)}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field("id_client_email", "E-mail", email, setEmail, "email")}
          {field("id_client_phone", "Telefone", phone, setPhone, "tel")}
          {field("id_client_cpf", "CPF", cpf, setCpf)}
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_client_gender">
              Gênero
            </label>
            <div className="hinput-wrap">
              <select
                id="id_client_gender"
                className="hinput hselect-native"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">—</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
import { useDismiss } from "../shared/useDismiss";

const FILTERS = [
  { id: "filter-name", label: "Nome", placeholder: "Ex.: Maria Silva" },
  { id: "filter-document", label: "CPF/CNPJ", placeholder: "Somente números ou formatado" },
  { id: "filter-email", label: "Email", placeholder: "Ex.: cliente@email.com" },
  { id: "filter-phone", label: "Telefone", placeholder: "Com ou sem máscara" },
  { id: "filter-company", label: "Empresa", placeholder: "Ex.: ACME LTDA" },
  { id: "filter-company-document", label: "Documento da Empresa", placeholder: "CNPJ da empresa" },
];

const SLOTS = 10;

function FilterPopover({ values, onChange }: { values: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(values);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  const count = Object.values(values).filter(Boolean).length;

  return (
    <div ref={ref} className="hinline hfilterpop">
      <button
        type="button"
        className="hinline-trigger hinline-trigger--bare"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setDraft(values);
          setOpen((o) => !o);
        }}
      >
        <ActivityIcon className="hinline-icon w-4 h-4" />
        <span className="hinline-label">Filtros</span>
        {count > 0 && <span className="hinline-count">{count}</span>}
        <span className="hinline-chevron" aria-hidden="true">
          <CaretDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>
      {open && (
        <div className="hselect-popover hfilterpop-popover" role="dialog" style={{ width: 402 }}>
          <p className="hfilterpop-title">Filtrar clientes</p>
          <div className="hfilterpop-grid">
            {FILTERS.map((f) => (
              <div key={f.id} className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor={f.id}>
                  {f.label}
                </label>
                <div className="hinput-wrap">
                  <input
                    id={f.id}
                    autoComplete="off"
                    className="hinput hinput--sm"
                    type="text"
                    placeholder={f.placeholder}
                    value={draft[f.id] ?? ""}
                    onChange={(e) => setDraft({ ...draft, [f.id]: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="hfilterpop-footer">
            <button type="button" className="hinline-footer-clear" onClick={() => setDraft({})}>
              Limpar
            </button>
            <button
              type="button"
              className="hinline-footer-done"
              onClick={() => {
                onChange(draft);
                setOpen(false);
              }}
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// The live account has no clients, so the table always shows its empty state.
export function ClientsList() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const filtered = Boolean(query.trim()) || Object.values(filters).some(Boolean);
  const data = useData();
  const term = fold(query.trim());
  const rows = data.clients
    .filter((c) => (term ? [c.name, c.email, c.phone, c.cpf ?? ""].some((v) => fold(v).includes(term)) : true))
    .filter((c) => {
      const name = filters["filter-name"] ?? "";
      const doc = filters["filter-document"] ?? "";
      const email = filters["filter-email"] ?? "";
      const phone = filters["filter-phone"] ?? "";
      return (
        (!name || fold(c.name).includes(fold(name))) &&
        (!doc || fold(c.cpf ?? "").includes(fold(doc))) &&
        (!email || fold(c.email).includes(fold(email))) &&
        (!phone || fold(c.phone).includes(fold(phone)))
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  const remove = (id: string) => update((d) => ({ ...d, clients: d.clients.filter((c) => c.id !== id) }));
  const [form, setForm] = useState<{ open: boolean; editing: Client | null }>({ open: false, editing: null });
  const importRef = useRef<HTMLInputElement>(null);

  /** Exports what the table is showing, the way the original's button offers the sheet. */
  const exportCsv = () =>
    download(
      `clientes-${stamp()}.csv`,
      toCsv(
        ["Nome", "E-mail", "Telefone", "CPF", "Gênero"],
        rows.map((c) => [c.name, c.email, c.phone, c.cpf ?? "", c.gender ?? ""]),
      ),
    );

  /** Reads a "nome;email;telefone;cpf" sheet and adds whoever is not in the list yet. */
  const importCsv = async (file: File) => {
    const lines = parseCsv(await file.text());
    const body = lines[0] && fold(lines[0][0]).startsWith("nome") ? lines.slice(1) : lines;
    update((d) => {
      const clients = [...d.clients];
      body.forEach(([name, email = "", phone = "", cpf = ""]) => {
        if (!name || clients.some((c) => fold(c.name) === fold(name))) return;
        clients.push({ id: nextId("c", clients), name, email, phone, cpf: cpf || undefined });
      });
      return { ...d, clients };
    });
  };

  return (
    <>
      <form id="formFilter" className="hui-reveal" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${query ? " has-query" : ""}`} id="client-search">
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Buscar por nome, CPF, email, telefone ou empresa"
              aria-label="Buscar por nome, CPF, email, telefone ou empresa"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => setQuery("")}>
              <CloseCircleIcon className="w-4 h-4" />
            </button>
          </label>

          <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
            <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => setForm({ open: true, editing: null })}>
              <UsersIcon className="w-4 h-4" />
              Adicionar Cliente
            </button>
            <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={() => importRef.current?.click()}>
              <WidgetIcon className="w-4 h-4" />
              Importar
            </button>
            <input
              ref={importRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importCsv(file);
                e.target.value = "";
              }}
            />
            <div className="hactionbar" role="group">
              <div className="hrail-track hactionbar-track">
                <FilterPopover values={filters} onChange={setFilters} />
                <span className="hactionbar-sep" aria-hidden="true" />
                <button type="button" className="hbtn hbtn--ghost hbtn--sm">
                  <UsersIcon className="w-4 h-4" />
                  Consolidar
                </button>
                <span className="hactionbar-sep" aria-hidden="true" />
                <button type="button" aria-label="Exportar" className="hbtn hbtn--ghost hbtn--sm" onClick={exportCsv}>
                  <WidgetIcon className="w-4 h-4" />
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="mt-4 hui-reveal">
        <div id="clients-table">
          <div
            className={`htable${rows.length ? "" : " htable-is-empty"}`}
            style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as React.CSSProperties}
          >
            <div className="htable-scroll">
              <table className="htable-table w-full htable-fixed">
                <thead>
                  <tr>
                    <th className="htable-col">Nome</th>
                    <th className="htable-col">Email</th>
                    <th className="htable-col">Telefone</th>
                    <th className="htable-col">Gênero</th>
                    <th className="htable-col htable-col--end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((client) => (
                    <tr key={client.id} className="htable-row">
                      <td className="htable-cell">{client.name}</td>
                      <td className="htable-cell">{client.email || "—"}</td>
                      <td className="htable-cell">{client.phone || "—"}</td>
                      <td className="htable-cell">{client.gender ?? "—"}</td>
                      <td className="htable-cell htable-cell--end">
                        <span className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            className="hbtn hbtn--ghost hbtn--sm hbtn--icon"
                            aria-label="Editar cliente"
                            onClick={() => setForm({ open: true, editing: client })}
                          >
                            <PenIcon className="w-4 h-4" />
                          </button>
                          <button type="button" className="hbtn hbtn--ghost hbtn--sm hbtn--icon" aria-label="Excluir cliente" onClick={() => remove(client.id)}>
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </span>
                      </td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, SLOTS - rows.length) }, (_, k) => (
                    <tr key={`empty-${k}`} className="htable-row--empty" aria-hidden="true">
                      <td className="htable-cell" />
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
                  <UsersIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">{filtered ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}</h3>
                  <p className="hempty-desc inter-regular">
                    {filtered
                      ? "Nenhum cliente corresponde à busca ou aos filtros aplicados. Ajuste ou limpe os filtros."
                      : "Os clientes cadastrados ou importados aparecerão nesta lista."}
                  </p>
                </div>
              </div>
            )}
            <div className="htable-footer" />
          </div>
        </div>
      </div>
      {form.open && <ClientModal editing={form.editing} onClose={() => setForm({ open: false, editing: null })} />}
    </>
  );
}
