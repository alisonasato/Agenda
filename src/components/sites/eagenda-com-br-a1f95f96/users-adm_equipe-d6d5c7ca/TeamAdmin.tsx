"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AutocompleteMulti } from "../shared/AutocompleteMulti";
import { ChipMultiSelect } from "../shared/ChipMultiSelect";
import { Combobox } from "../shared/Combobox";
import { DatePicker } from "../shared/DatePicker";
import { InlineFilter } from "../shared/InlineFilter";
import { Modal, ModalSubmit } from "../shared/Modal";
import { PhoneInput } from "../shared/PhoneInput";
import { ScrollRail } from "../shared/ScrollRail";
import { COUNTRY_OPTIONS, lookupCep, useGeoCascade } from "../shared/useGeoCascade";
import { useDismiss } from "../shared/useDismiss";
import {
  BoxIcon,
  BuildingsDuoIcon,
  CalendarIcon,
  CaretDownIcon,
  CheckReadIcon,
  CheckboxMark,
  CloseCircleIcon,
  EyeClosedIcon,
  EyeIcon,
  FunnelIcon,
  HistoryIcon,
  InboxIcon,
  LockIcon,
  MapPointIcon,
  PenIcon,
  RefreshIcon,
  SearchSolidIcon,
  ShieldIcon,
  TagIcon,
  UserAddIcon,
  UserCircleIcon,
  UsersIcon,
} from "../shared/icons";

// Mock account: the live page lists the real owner here.
const OWNER = { name: "Maria Souza", email: "contato@exemplo.com.br", account: "Minha Empresa", lastLogin: "19/09/2026 15:10" };
const ACCOUNTS = [{ value: "1", label: "minhaempresa" }];

const ACCESS_FILTER = [
  { value: "manager", label: "Administradores" },
  { value: "oper", label: "Colaboradores" },
  { value: "read", label: "Visualização" },
];
const PROFILES = [
  { value: "manager", label: "Administrador" },
  { value: "oper", label: "Colaborador" },
  { value: "read", label: "Visualização" },
];
const GENDERS = [
  { value: "M", label: "masculino" },
  { value: "F", label: "feminino" },
  { value: "O", label: "outro" },
  { value: "N", label: "não informar" },
];
// The original's /autocomplete/member_permissions list (as it returns it, duplicates included).
const PERMISSIONS = [
  "Cadastro de Clientes - Leitura",
  "Cadastro de Clientes - Escrita",
  "Cadastro de Clientes - Excluir Dados",
  "Relatórios - Acesso ao Módulo",
  "Agendamentos - Criar/Editar/Cancelar",
  "Agendas - Criar/Editar/Excluir",
  "Financeiro - Acesso a Faturamento e Pagamentos",
  "Relatórios - Acesso ao Módulo",
  "Cadastro de Clientes - Leitura",
  "Agendas - Criar/Editar/Excluir",
  "Agendamentos - Criar/Editar/Cancelar",
  "Agendas - Editar Dados Básicos (Nome, Texto, Cor)",
  "Agendas - Editar Tabela de Horários e Regras de Funcionamento",
  "Agendas - Acesso Total (Horários, Serviços, Configurações)",
  "Integrações - Configuração/Ativação",
  "Notificações - Regras e Templates",
].map((label, i) => ({ id: String(i + 1), label }));

const COLUMNS = ["Sub-Conta", "Membro", "Contato", "Perfil", "Vínculos", "Status"];
const SLOTS = 10;
const STATUS_TAGS = [
  ["all", "Todos"],
  ["active", "Ativo"],
  ["inactive", "Inativo"],
] as const;

function Check({ name, label, checked, onChange }: { name: string; label: string; checked?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <label className="hcheckbox">
      <input type="checkbox" name={name} id={`id_${name}`} className="hcheckbox-input" checked={checked} onChange={onChange && ((e) => onChange(e.target.checked))} />
      <span className="hcheckbox-box" aria-hidden="true">
        <CheckboxMark />
        <span className="hcheckbox-dash" aria-hidden="true" />
      </span>
      <span className="hcheckbox-label">{label}</span>
    </label>
  );
}

function Field({ name, id = `id_${name}`, label, required, type = "text", defaultValue, placeholder, desc }: {
  name: string;
  id?: string;
  label: string;
  required?: boolean;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  desc?: string;
}) {
  return (
    <div className="hinput-field hinput-field--block">
      <label className="hinput-label" htmlFor={id}>
        {label} {required && <span className="hinput-req">*</span>}
      </label>
      <div className="hinput-wrap">
        <input id={id} className="hinput" type={type} name={name} defaultValue={defaultValue} placeholder={placeholder ?? ""} required={required} />
      </div>
      {desc && <p className="hinput-desc">{desc}</p>}
    </div>
  );
}

/** Section heading of the user modals: primary icon + title. */
function Heading({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h4 className="text-sm font-semibold text-gray-900 inter-semibold flex items-center gap-2 mb-4">
      {icon}
      {children}
    </h4>
  );
}

const Divider = () => <div className="border-t border-gray-100" />;

/** "Permissões Adicionais" (the original searches /autocomplete/member_permissions). */
function PermissionsField() {
  const [perms, setPerms] = useState<string[]>([]);
  return (
    <AutocompleteMulti
      id="id_member_permissions"
      name="member_permissions"
      label="Permissões Adicionais - Colaboradores e Visualizador"
      placeholder="Digite para buscar permissões..."
      options={PERMISSIONS}
      values={perms}
      onChange={setPerms}
    />
  );
}

/** "Permitir acesso à todas as agendas" hides the agenda picker. */
function AgendaAccess({ withHelp }: { withHelp?: boolean }) {
  const [all, setAll] = useState(false);
  const [agendas, setAgendas] = useState<string[]>([]);
  return (
    <>
      <Check name="all_agendas" label="Permitir acesso à todas as agendas" checked={all} onChange={setAll} />
      <div style={all ? { display: "none" } : undefined}>
        <ChipMultiSelect id="id_agendas" label="Agendas" placeholder="Selecione as agendas..." options={[]} values={agendas} onChange={setAgendas} />
        {withHelp && <p className="hinput-desc">Selecione as agendas que o usuário pode acessar. Ou selecione a opção abaixo para permitir acesso à qualquer agenda.</p>}
      </div>
    </>
  );
}

const PROFILES_EDIT = [{ value: "owner", label: "Proprietário da Conta" }, ...PROFILES];

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [reveal, setReveal] = useState(false);
  const [profile, setProfile] = useState("");
  const [accounts, setAccounts] = useState(["1"]);
  return (
    <Modal
      id="team-create-modal"
      title="Novo Usuário"
      size="xl"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <ModalSubmit id="team-create-modal" form="team-create-form" icon={<CheckReadIcon />} label="Criar Usuário" />
        </>
      }
    >
      <form id="team-create-form" method="post" noValidate onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-6">
          <div>
            <Heading icon={<UserCircleIcon className="w-4 h-4 text-primary" />}>Dados Básicos</Heading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field name="full_name" label="Nome Completo" required />
              <Field name="email" type="email" label="E-mail" required />
              <div className="sm:col-span-2">
                <div className="hinput-field hinput-field--block">
                  <label className="hinput-label" htmlFor="id_password1">
                    Senha
                  </label>
                  <div className="hinput-wrap">
                    <span className="hinput-icon">
                      <LockIcon className="w-4 h-4" />
                    </span>
                    <input
                      id="id_password1"
                      autoComplete="new-password"
                      className="hinput hinput--with-toggle hinput--with-icon"
                      type={reveal ? "text" : "password"}
                      name="password1"
                      placeholder="Deixe em branco para enviar link de ativação"
                    />
                    <button type="button" tabIndex={-1} className="hpwd-toggle" aria-label={reveal ? "Ocultar senha" : "Mostrar senha"} onClick={() => setReveal((r) => !r)}>
                      {reveal ? <EyeClosedIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="hinput-desc">Deixe em branco para enviar link de ativação por e-mail</p>
                </div>
              </div>
            </div>
          </div>
          <Divider />
          <div>
            <Heading icon={<ShieldIcon className="w-4 h-4 text-primary" />}>Perfil de Acesso</Heading>
            <div className="space-y-5">
              <Combobox id="type_member" label="Perfil" options={PROFILES} value={profile} onChange={setProfile} placeholder="Selecione o perfil de acesso" clearable={false} required />
              <PermissionsField />
            </div>
          </div>
          <Divider />
          <div>
            <Heading icon={<TagIcon className="w-4 h-4 text-primary" />}>Tags e Serviços</Heading>
            <div className="space-y-5">
              <TagsAndServices />
            </div>
          </div>
          <Divider />
          <div>
            <Heading icon={<CalendarIcon className="w-4 h-4 text-primary" />}>Agendas</Heading>
            <div className="space-y-5">
              <AgendaAccess withHelp />
            </div>
          </div>
          <Divider />
          <div>
            <Heading icon={<BuildingsDuoIcon className="w-4 h-4 text-primary" />}>Contas</Heading>
            <ChipMultiSelect
              id="id_subaccounts"
              label="Contas"
              placeholder="Selecione as contas..."
              options={ACCOUNTS.map((a) => ({ id: a.value, label: a.label }))}
              values={accounts}
              onChange={setAccounts}
              required
            />
            <p className="hinput-desc">Selecione as subcontas às quais esse usuário terá acesso.</p>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// No tags or services exist on the account.
function TagsAndServices() {
  const [tags, setTags] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  return (
    <>
      <AutocompleteMulti id="id_tags" name="tags" label="Tags" placeholder="Digite para buscar tags..." options={[]} values={tags} onChange={setTags} />
      <AutocompleteMulti
        id="id_services"
        name="services"
        label="Serviços vinculados ao usuário"
        placeholder="Digite para buscar serviços..."
        options={[]}
        values={services}
        onChange={setServices}
      />
    </>
  );
}

function EditUserModal({ onClose }: { onClose: () => void }) {
  const [account, setAccount] = useState("1");
  const [profile, setProfile] = useState("owner");
  const [gender, setGender] = useState("");
  const [today] = useState(() => new Date());
  const [birthday, setBirthday] = useState<Date | null>(null);
  const geo = useGeoCascade();
  const [cepState, setCepState] = useState<{ loading: boolean; error: string; success: boolean }>({ loading: false, error: "", success: false });
  const addressRef = useRef<HTMLDivElement>(null);

  const searchCep = async () => {
    const cep = addressRef.current?.querySelector<HTMLInputElement>("#id_cep")?.value ?? "";
    setCepState({ loading: true, error: "", success: false });
    try {
      const data = await lookupCep(cep);
      const fill = (id: string, v?: string) => {
        const el = addressRef.current?.querySelector<HTMLInputElement>(`#${id}`);
        if (el && v) el.value = v;
      };
      fill("id_street", data.logradouro);
      fill("id_neighbourhood", data.bairro);
      await geo.setByNames(data.estado, data.localidade);
      setCepState({ loading: false, error: "", success: true });
    } catch (e) {
      setCepState({ loading: false, error: e instanceof Error ? e.message : "Erro ao consultar CEP", success: false });
    }
  };

  return (
    <Modal
      id="team-edit-modal"
      title="Editar Usuário"
      size="xl"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <ModalSubmit id="team-edit-modal" form="team-edit-form" icon={<CheckReadIcon />} label="Salvar" />
        </>
      }
    >
      <form id="team-edit-form" method="post" encType="multipart/form-data" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-6">
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            <span className="havatar">
              <span className="havatar-fallback">{OWNER.name[0]}</span>
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900 inter-semibold">{OWNER.name}</p>
              <p className="text-xs text-gray-500 inter-regular">{OWNER.email}</p>
            </div>
          </div>
          <div>
            <Heading icon={<LockIcon className="w-4 h-4 text-primary" />}>Dados de Acesso</Heading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field name="email" label="Email" type="email" required defaultValue={OWNER.email} />
              <Combobox id="selected_organization" label="Conta Ativa" options={ACCOUNTS} value={account} onChange={setAccount} placeholder="Selecione a conta ativa" />
              <div className="sm:col-span-2">
                <Check name="is_mfa_required" label="Autenticação de dois fatores." />
                <p className="hinput-desc ml-0">Usar autenticação de dois fatores.</p>
              </div>
            </div>
          </div>
          <Divider />
          <div>
            <Heading icon={<UserCircleIcon className="w-4 h-4 text-primary" />}>Dados de Membro</Heading>
            <div className="space-y-5">
              <Combobox id="type_member" label="Perfil" options={PROFILES_EDIT} value={profile} onChange={setProfile} placeholder="Selecione o perfil de acesso" clearable={false} />
              <PermissionsField />
              <TagsAndServices />
              <AgendaAccess />
            </div>
          </div>
          <Divider />
          <div>
            <Heading icon={<UserCircleIcon className="w-4 h-4 text-primary" />}>Dados Pessoais</Heading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field name="name" label="Nome" required defaultValue={OWNER.name} />
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label">Telefone</label>
                <PhoneInput name="phone" id="id_phone" label="Telefone" />
              </div>
              <Combobox id="gender" label="Gênero" options={GENDERS} value={gender} onChange={setGender} placeholder="Selecione o gênero" />
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_birthday">
                  Data de nascimento
                </label>
                <div className="mt-1.5">
                  <DatePicker id="id_birthday" name="birthday" ariaLabel="Data de nascimento" value={birthday} onChange={setBirthday} today={today} />
                </div>
              </div>
            </div>
          </div>
          <Divider />
          <div ref={addressRef}>
            <Heading icon={<MapPointIcon className="w-4 h-4 text-primary" />}>Endereço</Heading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div id="addr_country_wrapper">
                <Combobox id="country" label="País" options={COUNTRY_OPTIONS} value={geo.country} onChange={geo.setCountry} placeholder="Buscar país..." required clearable={false} />
              </div>
              <div id="addr_state_wrapper">
                <Combobox id="state" label="Estado" options={geo.stateOptions} value={geo.state} onChange={geo.setState} placeholder="Buscar estado..." />
              </div>
              <div>
                <label htmlFor="id_cep" className="hinput-label">
                  CEP
                </label>
                <div className="flex gap-2">
                  <div className="hinput-field hinput-field--block">
                    <div className="hinput-wrap">
                      <input id="id_cep" maxLength={9} className="hinput" type="text" name="cep" placeholder="00000-000" />
                    </div>
                  </div>
                  <button type="button" disabled={cepState.loading} className="btn-base btn-primary inter-regular shrink-0" style={{ padding: "0 .75rem" }} onClick={searchCep} aria-label="Buscar CEP">
                    {cepState.loading ? <RefreshIcon className="w-4 h-4 animate-spin" /> : <SearchSolidIcon className="w-4 h-4" />}
                  </button>
                </div>
                {cepState.error && <p className="hinput-error">{cepState.error}</p>}
                {cepState.success && (
                  <p className="hinput-desc" style={{ color: "var(--color-success, #17c964)" }}>
                    Endereço preenchido automaticamente!
                  </p>
                )}
              </div>
              <div id="addr_city_wrapper">
                <Combobox id="city" label="Município" options={geo.cityOptions} value={geo.city} onChange={geo.setCity} placeholder="Buscar município..." />
              </div>
              <div className="sm:col-span-2">
                <Field name="street_f" id="id_street" label="Logradouro" />
              </div>
              <Field name="number" label="Número" />
              <Field name="neighbourhood_f" id="id_neighbourhood" label="Bairro" />
              <div className="sm:col-span-2">
                <Field name="complement" label="Complemento" placeholder="Complemento (opcional)" />
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

type More = { access: string; agendas: string[]; account: string };

/** "Filtros": access profile, agendas and account, counted on the trigger. */
function MoreFilters({ value, onChange }: { value: More; onChange: (v: More) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // Clicks inside the nested field popovers (on <body>) keep the menu open, like the original.
  useDismiss(ref, open, () => setOpen(false), undefined, ".hselect-popover");
  const count = (value.access ? 1 : 0) + (value.agendas.length ? 1 : 0) + (value.account ? 1 : 0);
  return (
    <div ref={ref} className="hinline">
      <button type="button" className={`hinline-trigger hinline-trigger--bare${open ? " is-open" : ""}${count ? " is-active" : ""}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <FunnelIcon className="hinline-icon w-4 h-4" />
        <span className="hinline-label hactionbar-label">Filtros</span>
        {count > 0 && <span className="hinline-count">{count}</span>}
        <span className="hinline-chevron" aria-hidden="true">
          <CaretDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>
      {open && (
        <div id="team-more-panel" className="hselect-popover hmenu-popover hmenu-filters" role="dialog">
          <div className="hmenu-filter-row">
            <Combobox id="acesso" label="Perfil de Acesso" options={ACCESS_FILTER} value={value.access} onChange={(access) => onChange({ ...value, access })} placeholder="Todos" />
          </div>
          <div className="hmenu-filter-row">
            <ChipMultiSelect id="filter-agendas" label="Agendas" placeholder="Selecione as agendas..." options={[]} values={value.agendas} onChange={(agendas) => onChange({ ...value, agendas })} />
          </div>
          <div className="hmenu-filter-row">
            <Combobox id="account" label="Conta" options={ACCOUNTS} value={value.account} onChange={(account) => onChange({ ...value, account })} placeholder="Todas" />
          </div>
        </div>
      )}
    </div>
  );
}

const Chip = ({ icon, strong, text }: { icon: ReactNode; strong: string; text: string }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-50 border border-slate-200 text-xs text-gray-700 inter-regular">
    {icon}
    <span className="font-semibold inter-semibold">{strong}</span>
    <span>{text}</span>
  </span>
);

export function TeamAdmin() {
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [more, setMore] = useState<More>({ access: "", agendas: [], account: "" });
  const [status, setStatus] = useState<(typeof STATUS_TAGS)[number][0]>("active");
  const [resetKey, setResetKey] = useState(0);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);

  const q = query.trim().toLowerCase();
  // The owner is active, an owner (not a filterable profile) with access to every agenda.
  const showOwner =
    status !== "inactive" &&
    (!q || OWNER.name.toLowerCase().includes(q) || OWNER.email.includes(q)) &&
    !tags.length &&
    !services.length &&
    !groups.length &&
    !more.access &&
    (!more.account || more.account === ACCOUNTS[0].value);

  const reset = () => {
    setQuery("");
    setTags([]);
    setServices([]);
    setGroups([]);
    setMore({ access: "", agendas: [], account: "" });
    setStatus("active");
    setResetKey((k) => k + 1);
  };

  return (
    <>
      <form id="formFilter" className="hui-reveal" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${query ? " has-query" : ""}`} id="team-search">
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Buscar por nome ou e-mail"
              aria-label="Buscar por nome ou e-mail"
              name="q"
              id="team-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => setQuery("")}>
              <CloseCircleIcon className="w-4 h-4" />
            </button>
          </label>
          <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
            <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => setModal("create")}>
              <UserAddIcon />
              Novo Usuário
            </button>
            <ScrollRail key={resetKey} className="hactionbar" trackClassName="hrail-track hactionbar-track">
              {/* Server-searched lists: always show the search box; nothing exists on the account. */}
              <InlineFilter label="Tags" icon={<TagIcon className="hinline-icon w-4 h-4" />} options={[]} values={tags} onChange={setTags} searchable />
              <InlineFilter label="Serviços" icon={<BoxIcon className="hinline-icon w-4 h-4" />} options={[]} values={services} onChange={setServices} searchable />
              <InlineFilter label="Grupos" icon={<UsersIcon className="hinline-icon w-4 h-4" />} options={[]} values={groups} onChange={setGroups} searchable />
              <MoreFilters value={more} onChange={setMore} />
              <span className="hactionbar-sep" aria-hidden="true" />
              {/* The user groups page isn't cloned yet. */}
              <a href="#" className="hbtn hbtn--ghost hbtn--sm">
                <UsersIcon />
                <span className="hactionbar-label">Grupos de Usuários</span>
              </a>
            </ScrollRail>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 min-w-0">
          <div id="team-status-filter" className="min-w-0">
            <div className="htaggroup">
              {STATUS_TAGS.map(([v, label]) => (
                <button key={v} type="button" className={`htag${status === v ? " htag--active" : ""}`} onClick={() => setStatus(v)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:ml-auto flex items-center gap-2 flex-shrink-0">
            <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={reset}>
              Limpar filtros
            </button>
          </div>
        </div>
      </form>

      <div className="mt-4 min-w-0 hui-reveal" style={{ animationDelay: ".04s" }}>
        <div id="team-table-container">
          <div className={`htable${showOwner ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "4rem" } as CSSProperties}>
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
                  {showOwner && (
                    <tr className="group">
                      <td className="htable-cell whitespace-nowrap">
                        <span className="hchip hchip--default hchip--soft">{OWNER.account}</span>
                      </td>
                      <td className="htable-cell">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="havatar havatar--sm">
                            <span className="havatar-fallback">{OWNER.name[0]}</span>
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 inter-semibold truncate">{OWNER.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="htable-cell whitespace-nowrap">
                        <p className="text-sm text-gray-900 inter-regular">{OWNER.email}</p>
                        <p className="text-xs text-gray-500 inter-regular">Último login: {OWNER.lastLogin}</p>
                      </td>
                      <td className="htable-cell whitespace-nowrap">
                        <span className="hchip hchip--accent hchip--primary hchip--sm">Proprietário da Conta</span>
                      </td>
                      <td className="htable-cell">
                        <div className="flex flex-wrap gap-2">
                          <Chip icon={<CalendarIcon className="w-3.5 h-3.5 text-gray-500" />} strong="Todas" text="agendas" />
                          <Chip icon={<BoxIcon className="w-3.5 h-3.5 text-gray-500" />} strong="0" text="serviços" />
                          <Chip icon={<TagIcon className="w-3.5 h-3.5 text-gray-500" />} strong="0" text="tags" />
                        </div>
                      </td>
                      <td className="htable-cell whitespace-nowrap">
                        <span className="hchip hchip--success hchip--primary hchip--sm">Ativo</span>
                      </td>
                      <td className="htable-cell htable-cell--end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" title="Editar usuário" aria-label="Editar usuário" className="btn-icon btn-icon-sm btn-icon-flat" onClick={() => setModal("edit")}>
                            <PenIcon className="w-4 h-4" />
                          </button>
                          {/* The activity log isn't cloned yet. */}
                          <a href="#" className="btn-icon btn-icon-sm btn-icon-flat" title="Histórico de Atividades" aria-label="Histórico de Atividades">
                            <HistoryIcon className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  )}
                  {Array.from({ length: SLOTS - (showOwner ? 1 : 0) }, (_, i) => (
                    <tr key={i} className="htable-row--empty" aria-hidden="true">
                      {Array.from({ length: COLUMNS.length + 1 }, (_, j) => (
                        <td key={j} className="htable-cell" />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* With the list emptied by a filter the live page still shows the default variant. */}
            <div className="htable-empty" hidden={showOwner} role="status" aria-live="polite">
              <div className="hempty hempty--inline hui-reveal">
                <InboxIcon className="hempty-icon" />
                <h3 className="hempty-title nunito-bold">Nada por aqui ainda</h3>
                <p className="hempty-desc inter-regular">Assim que houver registros, eles aparecerão nesta tabela.</p>
              </div>
            </div>
            <div className="htable-footer" />
          </div>
        </div>
      </div>

      {modal === "create" && <CreateUserModal onClose={() => setModal(null)} />}
      {modal === "edit" && <EditUserModal onClose={() => setModal(null)} />}
    </>
  );
}
