"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Combobox } from "../shared/Combobox";
import { DatePicker } from "../shared/DatePicker";
import { PhoneInput } from "../shared/PhoneInput";
import { SaveBar } from "../shared/SaveBar";
import { SaveIcon, SearchSolidIcon, WarningTriangleIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { BRAZIL, COUNTRY_OPTIONS, lookupCep, useGeoCascade } from "../shared/useGeoCascade";
import { update, useData } from "@/lib/seiri/store";
import { IDENTIFICATION_TYPES, MARITAL_STATUS, type Address, type Gender } from "@/lib/seiri/types";

const GENDERS: { value: Gender; label: string }[] = [
  { value: "Masculino", label: "Masculino" },
  { value: "Feminino", label: "Feminino" },
  { value: "Outro", label: "Outro" },
  { value: "Prefiro não informar", label: "Prefiro não informar" },
];

const cpfMask = (value: string) => {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const cnpjMask = (value: string) => {
  const d = value.replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

const parseBR = (text?: string) => {
  const [day, month, year] = (text ?? "").split("/").map(Number);
  return day && month && year ? new Date(year, month - 1, day) : null;
};
const formatBR = (date: Date | null) =>
  date ? `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}` : "";

const EMPTY_ADDRESS: Address = {
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  district: "",
  country: BRAZIL,
  state: "",
  city: "",
};

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="hinput-field hinput-field--block">
      <label className="hinput-label" htmlFor={id}>
        {label}
        {required && <span className="hinput-req"> *</span>}
      </label>
      <div className="hinput-wrap">
        <input id={id} className="hinput" type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="hformsection">
      <div className="hformsection-head">
        <h3 className="hformsection-title">{title}</h3>
      </div>
      <div className="hformsection-body">{children}</div>
    </section>
  );
}

/** Clone of /clientes/<id>/editar/: the full client record, in three panels over a save bar. */
export function ClientEditForm() {
  const data = useData();
  const id = useSearchParams().get("id");
  const client = data.clients.find((c) => c.id === id);
  const backHref = `${ROUTES.clienteDetalhes}/?id=${id ?? ""}`;

  const [name, setName] = useState(client?.name ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [cpf, setCpf] = useState(client?.cpf ?? "");
  const [birthday, setBirthday] = useState<Date | null>(parseBR(client?.birthday));
  const [gender, setGender] = useState<string>(client?.gender ?? "");
  const [idType, setIdType] = useState(client?.identificationType ?? "");
  const [idNumber, setIdNumber] = useState(client?.identificationNumber ?? "");
  const [maritalStatus, setMaritalStatus] = useState(client?.maritalStatus ?? "");
  const [nationality, setNationality] = useState(client?.nationality ?? "");
  const [placeOfBirth, setPlaceOfBirth] = useState(client?.placeOfBirth ?? "");
  const [profession, setProfession] = useState(client?.profession ?? "");
  const [address, setAddress] = useState<Address>({ ...EMPTY_ADDRESS, ...client?.address });
  const [companyName, setCompanyName] = useState(client?.companyName ?? "");
  const [companyCnpj, setCompanyCnpj] = useState(client?.companyCnpj ?? "");
  const [cepStatus, setCepStatus] = useState<{ error: string; ok: boolean; loading: boolean }>({ error: "", ok: false, loading: false });
  const [saved, setSaved] = useState(false);
  const geo = useGeoCascade(client?.address?.country ?? BRAZIL);
  const addressField = (key: keyof Address) => (value: string) => setAddress((a) => ({ ...a, [key]: value }));

  const record = {
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    cpf: cpf.trim() || undefined,
    birthday: formatBR(birthday) || undefined,
    gender: (gender as Gender) || undefined,
    identificationType: idType || undefined,
    identificationNumber: idNumber.trim() || undefined,
    maritalStatus: maritalStatus || undefined,
    nationality: nationality.trim() || undefined,
    placeOfBirth: placeOfBirth.trim() || undefined,
    profession: profession.trim() || undefined,
    address: { ...address, country: geo.country, state: geo.state, city: geo.city },
    companyName: companyName.trim() || undefined,
    companyCnpj: companyCnpj.trim() || undefined,
  };
  const snapshot = JSON.stringify(record);
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot);
  const dirty = snapshot !== savedSnapshot;

  /** The button beside the CEP: fills Logradouro, Bairro, Estado and Município. */
  const searchCep = async () => {
    if (address.cep.replace(/\D/g, "").length !== 8 || cepStatus.loading) return;
    setCepStatus({ error: "", ok: false, loading: true });
    try {
      const found = await lookupCep(address.cep);
      setAddress((a) => ({ ...a, street: found.logradouro ?? a.street, neighborhood: found.bairro ?? a.neighborhood }));
      await geo.setByNames(found.estado, found.localidade);
      setCepStatus({ error: "", ok: true, loading: false });
    } catch (e) {
      setCepStatus({ error: e instanceof Error ? e.message : "Erro ao consultar CEP", ok: false, loading: false });
    }
  };

  const save = () => {
    if (!client || !record.name) return;
    update((d) => ({ ...d, clients: d.clients.map((c) => (c.id === client.id ? { ...c, ...record } : c)) }));
    setSavedSnapshot(snapshot);
    setSaved(true);
  };

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10">
      <form
        id="client-edit-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="hformpanel">
          <Section title="Dados do cliente">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Field id="id_name" label="Nome" required value={name} onChange={setName} />
              </div>
              <Field id="id_email" label="E-mail" value={email} onChange={setEmail} />
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_phone">
                  Phone
                </label>
                <PhoneInput name="phone" id="id_phone" label="Phone" value={phone} onChange={setPhone} />
              </div>
              <Field id="id_cpf" label="Cadastro de Pessoa Física (CPF)" value={cpf} onChange={(v) => setCpf(cpfMask(v))} />
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_birthday">
                  Data de Nascimento
                </label>
                <div className="mt-1.5">
                  <DatePicker id="id_birthday" name="birthday" ariaLabel="Data de Nascimento" value={birthday} onChange={setBirthday} today={new Date()} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="hinput-label">Gênero</label>
                <div className="mt-1.5">
                  <div className="hradiogroup" role="radiogroup">
                    {GENDERS.map((option) => (
                      <label key={option.value} className="hradio-pill">
                        <input
                          type="radio"
                          className="hradio-input"
                          name="gender"
                          value={option.value}
                          checked={gender === option.value}
                          onChange={() => setGender(option.value)}
                        />
                        <span className="hradio-pill-label">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <Combobox
                  id="id_identification"
                  label="Tipo de identidade"
                  options={IDENTIFICATION_TYPES}
                  value={idType}
                  onChange={setIdType}
                  placeholder="Selecione o tipo de identidade"
                />
              </div>
              <Field id="id_identification_number" label="Número de identidade" value={idNumber} onChange={setIdNumber} />
              <div>
                <Combobox
                  id="id_marital_status"
                  label="Estado civil"
                  options={MARITAL_STATUS}
                  value={maritalStatus}
                  onChange={setMaritalStatus}
                  placeholder="Selecione o estado civil"
                />
              </div>
              <Field id="id_nationality" label="Nacionalidade" value={nationality} onChange={setNationality} />
              <Field id="id_place_of_birth" label="Naturalidade" value={placeOfBirth} onChange={setPlaceOfBirth} />
              <Field id="id_profession" label="Profissão" value={profession} onChange={setProfession} />
            </div>
          </Section>

          <Section title="Endereço">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Combobox
                  id="id_country"
                  label="País"
                  required
                  options={COUNTRY_OPTIONS}
                  value={geo.country}
                  onChange={(v) => geo.setCountry(v)}
                  placeholder="Selecione o país"
                />
              </div>
              <div>
                <Combobox
                  id="id_state"
                  label="Estado"
                  options={geo.stateOptions}
                  value={geo.state}
                  onChange={(v) => geo.setState(v)}
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
                    id="id_cep"
                    name="cep"
                    maxLength={9}
                    className="hinput flex-1"
                    placeholder="00000-000"
                    value={address.cep}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                      addressField("cep")(v.length > 5 ? v.replace(/^(\d{5})(\d{0,3})/, "$1-$2") : v);
                      setCepStatus({ error: "", ok: false, loading: false });
                    }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), void searchCep())}
                  />
                  <button
                    type="button"
                    aria-label="Buscar CEP"
                    className="hbtn hbtn--primary hbtn--icon"
                    disabled={cepStatus.loading}
                    onClick={() => void searchCep()}
                  >
                    <SearchSolidIcon className="w-4 h-4" />
                  </button>
                </div>
                {cepStatus.error && <p className="hinput-error">{cepStatus.error}</p>}
                {cepStatus.ok && <p className="mt-1 text-xs text-[color:var(--color-primary)] inter-regular">Endereço preenchido automaticamente!</p>}
              </div>
              <div>
                <Combobox
                  id="id_city"
                  label="Município"
                  options={geo.cityOptions}
                  value={geo.city}
                  onChange={(v) => geo.setCity(v)}
                  placeholder="Buscar município..."
                />
              </div>
              <div className="md:col-span-2">
                <Field id="id_street" label="Logradouro" value={address.street} onChange={addressField("street")} placeholder="Rua, Avenida, etc." />
              </div>
              <Field id="id_number" label="Número" value={address.number} onChange={addressField("number")} />
              <Field id="id_neighbourhood" label="Bairro" value={address.neighborhood} onChange={addressField("neighborhood")} />
              <Field id="id_complement" label="Complemento" value={address.complement} onChange={addressField("complement")} placeholder="Apto, Bloco, etc." />
              <Field id="id_district" label="Distrito" value={address.district} onChange={addressField("district")} />
            </div>
          </Section>

          <Section title="Empresa">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field id="id_corporate_name" label="Denominação social/firma" value={companyName} onChange={setCompanyName} />
              <Field
                id="id_company_identification_number"
                label="Cadastro Nacional da Pessoa Jurídica (CNPJ)"
                value={companyCnpj}
                onChange={(v) => setCompanyCnpj(cnpjMask(v))}
                placeholder="00.000.000/0001-00"
              />
            </div>
          </Section>
        </div>

        <SaveBar
          backHref={backHref}
          saveLabel="Salvar"
          saveIcon={<SaveIcon className="w-4 h-4" />}
          dirty={dirty}
          toastIcon={<WarningTriangleIcon className="w-4 h-4" />}
          toastTitle={saved && !dirty ? "Alterações salvas" : "Alterações não salvas"}
          toastSub={saved && !dirty ? "O cadastro foi atualizado." : "Salve para aplicar as mudanças."}
          forceToast={saved && !dirty}
        />
      </form>
    </div>
  );
}
