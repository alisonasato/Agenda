"use client";

import { useState } from "react";
import { Modal } from "../shared/Modal";
import { Combobox } from "../shared/Combobox";
import { DatePicker } from "../shared/DatePicker";
import { PhoneInput } from "../shared/PhoneInput";
import { CheckCircleIcon, DangerCircleIcon, InfoIcon, MapPinIcon } from "../shared/icons";
import { BRAZIL, COUNTRY_OPTIONS, useGeoCascade } from "../shared/useGeoCascade";
import { nextId, update, useData } from "@/lib/seiri/store";
import { fold } from "@/lib/seiri/select";
import { MARITAL_STATUS, type Address, type Client } from "@/lib/seiri/types";

const cpfMask = (value: string) => {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const cepMask = (value: string) => {
  const d = value.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

const parseBR = (text?: string) => {
  const [day, month, year] = (text ?? "").split("/").map(Number);
  return day && month && year ? new Date(year, month - 1, day) : null;
};
const formatBR = (date: Date | null) =>
  date ? `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}` : "";

const EMPTY_ADDRESS: Address = { cep: "", street: "", number: "", complement: "", neighborhood: "", district: "", country: BRAZIL, state: "", city: "" };

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  desc,
  type = "text",
  required,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  desc?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div className="hinput-field hinput-field--block">
      <label className="hinput-label" htmlFor={id}>
        {label}
        {required && <span className="hinput-req"> *</span>}
      </label>
      <div className="hinput-wrap">
        <input
          id={id}
          className="hinput"
          type={type}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {desc && <p className="hinput-desc">{desc}</p>}
    </div>
  );
}

/**
 * The original's create_person_form modal (3xl panel): identification, the optional address block,
 * and the two alerts it shows on top — "Não foi possível salvar" and "Cliente já cadastrado".
 */
export function ClientForm({ editing, onClose }: { editing: Client | null; onClose: () => void }) {
  const data = useData();
  const [name, setName] = useState(editing?.name ?? "");
  const [email, setEmail] = useState(editing?.email ?? "");
  const [phone, setPhone] = useState(editing?.phone ?? "");
  const [cpf, setCpf] = useState(editing?.cpf ?? "");
  const [birthday, setBirthday] = useState<Date | null>(parseBR(editing?.birthday));
  const [gender, setGender] = useState(editing?.gender ?? "");
  const [nationality, setNationality] = useState(editing?.nationality ?? "");
  const [profession, setProfession] = useState(editing?.profession ?? "");
  const [maritalStatus, setMaritalStatus] = useState(editing?.maritalStatus ?? "");
  const [address, setAddress] = useState<Address>(editing?.address ?? EMPTY_ADDRESS);
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState("");
  const geo = useGeoCascade(editing?.address?.country ?? BRAZIL);
  const field = (key: keyof Address) => (value: string) => setAddress((a) => ({ ...a, [key]: value }));

  const save = () => {
    if (name.trim().length < 6) return setError("Digite o nome completo, com no mínimo 6 caracteres.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setError("Digite um e-mail válido.");
    const others = data.clients.filter((c) => c.id !== editing?.id);
    const clash = others.find((c) => fold(c.email) === fold(email.trim()) || (cpf.trim() && c.cpf === cpf.trim()));
    if (clash) {
      setError("");
      return setDuplicate(`${clash.name} já usa este e-mail ou documento.`);
    }
    update((d) => {
      const row: Client = {
        id: editing?.id ?? nextId("c", d.clients),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        cpf: cpf.trim() || undefined,
        gender: (gender as Client["gender"]) || undefined,
        birthday: formatBR(birthday) || undefined,
        nationality: nationality.trim() || undefined,
        profession: profession.trim() || undefined,
        maritalStatus: maritalStatus || undefined,
        address: address.cep || address.street || geo.city ? { ...address, country: geo.country, state: geo.state, city: geo.city } : undefined,
      };
      return { ...d, clients: editing ? d.clients.map((c) => (c.id === row.id ? row : c)) : [...d.clients, row] };
    });
    onClose();
  };

  return (
    <Modal
      id="client-person-modal"
      title={editing ? "Editar Cliente" : "Adicionar Cliente"}
      size="3xl"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="create-person-form" className="hbtn hbtn--primary">
            <CheckCircleIcon className="w-4 h-4" />
            Salvar Cliente
          </button>
        </>
      }
    >
      <form
        id="create-person-form"
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        {error && (
          <div className="halert halert--danger" role="alert">
            <span className="halert-indicator" aria-hidden="true">
              <DangerCircleIcon className="w-5 h-5" />
            </span>
            <div className="halert-content">
              <p className="halert-title">Não foi possível salvar</p>
              <p className="halert-description">{error}</p>
            </div>
            <div className="halert-actions" />
          </div>
        )}
        {duplicate && (
          <div className="halert halert--accent" role="alert">
            <span className="halert-indicator" aria-hidden="true">
              <InfoIcon className="w-5 h-5" />
            </span>
            <div className="halert-content">
              <p className="halert-title">Cliente já cadastrado</p>
              <p className="halert-description">{duplicate}</p>
            </div>
            <div className="halert-actions" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <Field
            id="id_person_name"
            label="Nome Completo"
            required
            value={name}
            onChange={setName}
            placeholder="Digite o nome completo"
            desc="Digite o nome completo (mínimo 6 caracteres)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field id="id_person_email" label="E-mail" required type="email" value={email} onChange={setEmail} placeholder="exemplo@email.com" />
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_person_phone">
              Telefone
            </label>
            <PhoneInput name="phone" id="id_person_phone" label="Telefone" value={phone} onChange={setPhone} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            id="id_person_cpf"
            label="CPF/Documento"
            value={cpf}
            onChange={(v) => setCpf(cpfMask(v))}
            placeholder="000.000.000-00"
            desc="CPF, RG ou outro documento"
          />
          <div>
            <label className="hinput-label" htmlFor="id_person_birthday">
              Data de Nascimento
            </label>
            <div className="mt-1.5">
              <DatePicker id="id_person_birthday" name="birthday" ariaLabel="Data de Nascimento" value={birthday} onChange={setBirthday} today={new Date()} />
            </div>
          </div>
        </div>

        <div>
          <label className="hinput-label">Gênero</label>
          <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(["Masculino", "Feminino"] as const).map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 rounded-[0.875rem] border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 inter-regular cursor-pointer hover:border-gray-300 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors"
              >
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={gender === option}
                  onChange={() => setGender(option)}
                  className="h-4 w-4 shrink-0"
                  style={{ accentColor: "var(--color-primary)" }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field id="id_person_nationality" label="Nacionalidade" value={nationality} onChange={setNationality} placeholder="Brasileiro" />
          <Field id="id_person_profession" label="Profissão" value={profession} onChange={setProfession} placeholder="Digite a profissão" />
        </div>

        <div>
          <Combobox
            id="id_person_marital_status"
            label="Estado Civil"
            options={MARITAL_STATUS}
            value={maritalStatus}
            onChange={setMaritalStatus}
            placeholder="Selecione..."
          />
        </div>

        <div className="pt-5 border-t border-gray-100 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 inter-semibold flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-gray-500" />
            Endereço
            <span className="text-xs font-normal text-gray-400 inter-regular">(Opcional)</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Field id="id_person_cep" label="CEP" value={address.cep} onChange={(v) => field("cep")(cepMask(v))} placeholder="00000-000" maxLength={10} />
            </div>
            <div className="md:col-span-2">
              <Field id="id_person_street" label="Logradouro" value={address.street} onChange={field("street")} placeholder="Rua, Avenida, etc." />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field id="id_person_number" label="Número" value={address.number} onChange={field("number")} placeholder="123" />
            <Field id="id_person_complement" label="Complemento" value={address.complement} onChange={field("complement")} placeholder="Apto, Bloco, etc." />
            <Field id="id_person_neighborhood" label="Bairro" value={address.neighborhood} onChange={field("neighborhood")} placeholder="Bairro" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Combobox
                id="id_person_country"
                label="País"
                options={COUNTRY_OPTIONS}
                value={geo.country}
                onChange={geo.setCountry}
                placeholder="Buscar país..."
                searchInPopover
              />
            </div>
            <div>
              <Combobox
                id="id_person_state"
                label="Estado"
                options={geo.stateOptions}
                value={geo.state}
                onChange={geo.setState}
                placeholder="Buscar estado..."
                searchInPopover
              />
            </div>
            <div>
              <Combobox
                id="id_person_city"
                label="Cidade"
                options={geo.cityOptions}
                value={geo.city}
                onChange={geo.setCity}
                placeholder="Buscar cidade..."
                searchInPopover
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
