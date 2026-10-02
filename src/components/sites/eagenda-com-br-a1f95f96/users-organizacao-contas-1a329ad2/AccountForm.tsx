"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Combobox } from "../shared/Combobox";
import { fillFromCep } from "../shared/CepField";
import { SaveBar } from "../shared/SaveBar";
import { ROUTES } from "../shared/Sidebar";
import { COUNTRY_OPTIONS, lookupCep, useGeoCascade } from "../shared/useGeoCascade";
import { PenIcon, SaveIcon, SearchSolidIcon } from "../shared/icons";
import { nextId, update, useData } from "@/lib/seiri/store";
import { withBase } from "@/lib/basePath";
import type { Member, SubAccount } from "@/lib/seiri/types";

// Mock of the only existing user the live page offers (the account owner).
const ADMIN_TABS = [
  ["existing", "Selecionar Existente"],
  ["new", "Criar Novo"],
] as const;
type AdminMode = (typeof ADMIN_TABS)[number][0];

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="cfg-group">
      <div className="cfg-group-head">
        <h3 className="cfg-group-title">{title}</h3>
      </div>
      <div className="cfg-group-body">{children}</div>
    </section>
  );
}

function TextField({
  id,
  name,
  label,
  placeholder = "",
  type = "text",
  required,
  desc,
  value,
}: {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  desc?: ReactNode;
  value?: string;
}) {
  return (
    <div className="hinput-field hinput-field--block">
      <label className="hinput-label" htmlFor={id}>
        {label} {required && <span className="hinput-req">*</span>}
      </label>
      <div className="hinput-wrap">
        <input id={id} className="hinput" type={type} name={name} placeholder={placeholder} required={required} defaultValue={value} />
      </div>
      {desc}
    </div>
  );
}

/** "Nova Conta" (/users/organizacao/contas/nova), and the same form with `?id=` for an existing one. */
export function AccountForm() {
  const data = useData();
  const id = typeof window === "undefined" ? "" : (new URLSearchParams(window.location.search).get("id") ?? "");
  const account = data.accounts.find((a) => a.id === id);
  const [loaded, setLoaded] = useState("");
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const markDirty = () => setDirty(true);
  const [adminMode, setAdminMode] = useState<AdminMode>("existing");
  const [user, setUser] = useState("");
  const geo = useGeoCascade();
  const formRef = useRef<HTMLFormElement>(null);

  // The browser's data arrives after the first render, so fill the form once it does.
  if (account && loaded !== account.id) {
    setLoaded(account.id);
    setUser(data.members.find((m) => m.accountId === account.id)?.id ?? "");
    void geo.setByNames(account.address.state, account.address.city);
  }

  // No server here: saving writes the sub-account into the browser's own data.
  const save = () => {
    const form = formRef.current;
    if (!form) return;
    const field = new FormData(form);
    const text = (name: string) => String(field.get(name) ?? "").trim();
    if (!text("name")) return;
    update((d) => {
      const accountId = account?.id ?? nextId("ac", d.accounts);
      const row: SubAccount = {
        id: accountId,
        name: text("name"),
        slug: text("label"),
        email: text("email_branch"),
        phone: text("phone_branch"),
        address: {
          cep: text("cep"),
          street: text("street_f"),
          number: text("number"),
          complement: text("complement"),
          neighborhood: text("neighbourhood_f"),
          district: text("district"),
          country: geo.country,
          state: geo.state,
          city: geo.city,
        },
        plan: account?.plan ?? "active",
      };
      // The admin tab either points at a member the account already has, or adds a new one.
      let members = d.members.map((m) => (m.accountId === accountId ? { ...m, accountId: undefined } : m));
      if (adminMode === "existing" && user) {
        members = members.map((m) => (m.id === user ? { ...m, accountId } : m));
      } else if (adminMode !== "existing" && text("email")) {
        const admin: Member = {
          id: nextId("mb", members),
          name: text("full_name") || text("email"),
          email: text("email"),
          phone: "",
          profile: "manager",
          active: true,
          agendaIds: [],
          serviceIds: [],
          tagIds: [],
          permissions: [],
          lastLogin: "",
          accountId,
        };
        members = [...members, admin];
      }
      return { ...d, accounts: account ? d.accounts.map((a) => (a.id === accountId ? row : a)) : [...d.accounts, row], members };
    });
    setSaved(true);
    window.setTimeout(() => {
      window.location.href = withBase("/users/organizacao/contas");
    }, 900);
  };

  // This form's CEP field has a search button (the original's lookupCep; ViaCEP here).
  const [cep, setCep] = useState("");
  const [cepState, setCepState] = useState({ loading: false, error: "", success: false });
  const searchCep = async () => {
    if (cep.replace(/\D/g, "").length < 8) return setCepState({ loading: false, error: "CEP deve ter 8 dígitos", success: false });
    setCepState({ loading: true, error: "", success: false });
    try {
      const data = await lookupCep(cep);
      // The original fills street and neighbourhood only (no complement).
      fillFromCep(formRef.current, { ...data, complemento: undefined });
      await geo.setByNames(data.estado, data.localidade);
      markDirty();
      setCepState({ loading: false, error: "", success: true });
    } catch (e) {
      setCepState({ loading: false, error: e instanceof Error ? e.message : "Erro ao consultar CEP", success: false });
    }
  };

  return (
    <form
      ref={formRef}
      id="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      onInput={markDirty}
      onChange={markDirty}
    >
      <div className="cfg-content">
        <Group title="Dados Gerais">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField id="id_name" name="name" label="Nome da empresa ou negócio" placeholder="Nome da conta" required value={account?.name} />
            <TextField
              id="id_label"
              name="label"
              label="Sigla para link de agendamento"
              placeholder="Sigla para link de agendamento"
              required
              desc={<p className="hinput-desc">Sem espaços ou caracteres especiais</p>}
              value={account?.slug}
            />
            <TextField id="id_email_branch" name="email_branch" type="email" label="E-mail" placeholder="E-mail da conta" value={account?.email} />
            <TextField id="id_phone_branch" name="phone_branch" label="Telefone" placeholder="Telefone da conta" value={account?.phone} />
          </div>
        </Group>

        <Group title="Endereço">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div id="addr_country_wrapper">
              <Combobox
                id="country"
                label="País"
                options={COUNTRY_OPTIONS}
                value={geo.country}
                onChange={(v) => {
                  geo.setCountry(v);
                  markDirty();
                }}
                placeholder="Buscar país..."
                required
                clearable={false}
              />
            </div>
            <div id="addr_state_wrapper">
              <Combobox
                id="state"
                label="Estado"
                options={geo.stateOptions}
                value={geo.state}
                onChange={(v) => {
                  geo.setState(v);
                  markDirty();
                }}
                placeholder="Buscar estado..."
              />
            </div>
            <div>
              <label htmlFor="id_cep" className="hinput-label">
                CEP
              </label>
              <div className="flex gap-2 mt-1.5">
                <input
                  type="text"
                  name="cep"
                  id="id_cep"
                  maxLength={9}
                  className="hinput flex-1"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                    setCep(v.length > 5 ? v.replace(/^(\d{5})(\d{0,3})/, "$1-$2") : v);
                    setCepState((s) => ({ ...s, error: "", success: false }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    searchCep();
                  }}
                />
                <button type="button" aria-label="Buscar CEP" onClick={searchCep} disabled={cepState.loading} className="hbtn hbtn--primary hbtn--icon">
                  <SearchSolidIcon />
                </button>
              </div>
              <p className="cfg-field-error" style={cepState.error ? undefined : { display: "none" }}>
                {cepState.error}
              </p>
              <p className="mt-1 text-xs text-primary inter-regular" style={cepState.success ? undefined : { display: "none" }}>
                Endereço preenchido automaticamente!
              </p>
            </div>
            <div id="addr_city_wrapper">
              <Combobox
                id="city"
                label="Município"
                options={geo.cityOptions}
                value={geo.city}
                onChange={(v) => {
                  geo.setCity(v);
                  markDirty();
                }}
                placeholder="Buscar município..."
              />
            </div>
            <div className="sm:col-span-2">
              <TextField id="id_street" name="street_f" label="Logradouro" value={account?.address.street} />
            </div>
            <TextField id="id_number" name="number" label="Número" value={account?.address.number} />
            <TextField id="id_neighbourhood" name="neighbourhood_f" label="Bairro" value={account?.address.neighborhood} />
            <TextField id="id_complement" name="complement" label="Complemento" value={account?.address.complement} />
            <TextField id="id_district" name="district" label="Distrito" value={account?.address.district} />
          </div>
        </Group>

        <Group title="Administrador da Conta">
          <div className="max-w-sm mb-4">
            <div className="htabs" role="tablist" aria-label="Modo de seleção do administrador" style={{ "--htabs-count": 2 } as CSSProperties}>
              <span
                className="htabs-indicator"
                aria-hidden="true"
                style={{ transform: `translateX(calc(${ADMIN_TABS.findIndex(([m]) => m === adminMode)} * 100%))` }}
              />
              {ADMIN_TABS.map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  className={`htabs-tab${adminMode === mode ? " is-active" : ""}`}
                  role="tab"
                  aria-selected={adminMode === mode}
                  onClick={() => setAdminMode(mode)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div style={adminMode === "existing" ? undefined : { display: "none" }}>
            <Combobox
              id="existing_user"
              label="Usuário existente"
              options={data.members.map((m) => ({ value: m.id, label: `${m.name} (${m.email})` }))}
              value={user}
              onChange={(v) => {
                setUser(v);
                markDirty();
              }}
              placeholder="Selecione um usuário..."
            />
          </div>
          <div className="space-y-4" style={adminMode === "new" ? undefined : { display: "none" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField id="id_email" name="email" type="email" label="Email" placeholder="Email" required />
              <TextField id="id_full_name" name="full_name" label="Nome Completo" placeholder="Nome Completo" required />
              <TextField
                id="id_password1"
                name="password1"
                type="password"
                label="Senha"
                placeholder="Senha"
                required
                desc={
                  // The original's help text is a <ul> rendered after an empty hinput-desc paragraph.
                  <>
                    <p className="hinput-desc" />
                    <ul>
                      <li>Sua senha não pode ser muito parecida com o resto das suas informações pessoais.</li>
                      <li>Sua senha precisa conter pelo menos 8 caracteres.</li>
                      <li>Sua senha não pode ser uma senha comumente utilizada.</li>
                      <li>Sua senha não pode ser inteiramente numérica.</li>
                    </ul>
                    <p />
                  </>
                }
              />
            </div>
          </div>
        </Group>
      </div>
      <SaveBar
        backHref={ROUTES.adminContas}
        saveLabel={account ? "Salvar Conta" : "Criar Conta"}
        saveIcon={<SaveIcon />}
        dirty={dirty}
        toastIcon={<PenIcon className="w-4 h-4" />}
        toastTitle={saved ? "Conta salva" : "Alterações não salvas"}
        toastSub={saved ? "Voltando para as contas…" : "Salve para aplicar as mudanças."}
        forceToast={saved}
      />
    </form>
  );
}
