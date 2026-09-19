"use client";

import dynamic from "next/dynamic";
import { useRef, useState, type ReactNode } from "react";
import { CepField, fillFromCep, type CepAddress } from "../shared/CepField";
import { ChipMultiSelect } from "../shared/ChipMultiSelect";
import { Combobox } from "../shared/Combobox";
import { FilePicker } from "../shared/FilePicker";
import { SaveBar } from "../shared/SaveBar";
import { ROUTES } from "../shared/Sidebar";
import { COUNTRY_OPTIONS, useGeoCascade } from "../shared/useGeoCascade";
import { PenIcon, SaveIcon } from "../shared/icons";

// CKEditor touches `window` on import, so it only loads in the browser.
const RichTextEditor = dynamic(() => import("../shared/RichTextEditor").then((m) => m.RichTextEditor), { ssr: false });

const ORG = "minhaempresa";

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
  placeholder,
  type = "text",
  desc,
  onInput,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  desc?: string;
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="hinput-field hinput-field--block">
      <label className="hinput-label" htmlFor={id}>
        {label}
      </label>
      <div className="hinput-wrap">
        <input id={id} className="hinput" type={type} name={name} placeholder={placeholder} onInput={onInput} />
      </div>
      {desc && <p className="hinput-desc">{desc}</p>}
    </div>
  );
}

/** "Nova Unidade" (?action=create). Nothing is saved; the account has no agendas to link here. */
export function UnitForm() {
  const [dirty, setDirty] = useState(false);
  const markDirty = () => setDirty(true);
  const [agendas, setAgendas] = useState<string[]>([]);
  const geo = useGeoCascade();
  const formRef = useRef<HTMLFormElement>(null);
  const fillAddress = async (data: CepAddress) => {
    fillFromCep(formRef.current, data);
    await geo.setByNames(data.estado, data.localidade);
    markDirty();
  };

  return (
    <form ref={formRef} id="unidade-form" className="cfg-form" noValidate onSubmit={(e) => e.preventDefault()} onInput={markDirty} onChange={markDirty}>
      <div className="cfg-content">
        <Group title="Dados Básicos">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField id="id_label" name="label" label="Nome da Unidade" placeholder="Nome da Unidade" />
            <TextField
              id="id_slug"
              name="slug"
              label="Nome para o Link"
              placeholder="nome-para-link"
              desc={`Link direto para a página da unidade. Exemplo: seiri.com.br/${ORG}/unidade/centro`}
              onInput={(e) => {
                const el = e.currentTarget;
                el.value = el.value
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9\-_]/g, "")
                  .replace(/-{2,}/g, "-");
              }}
            />
            <TextField id="id_email" name="email" type="email" label="E-mail" placeholder="email@exemplo.com" />
            <TextField id="id_phone" name="phone" label="Telefone" placeholder="(00) 0000-0000" />
            <TextField id="id_whatsapp" name="whatsapp" label="WhatsApp" placeholder="(00) 00000-0000" />
          </div>
        </Group>

        <Group title="Imagem">
          <div className="max-w-md">
            <div>
              <FilePicker name="imagem" label="Imagem da Tela da Unidade" />
            </div>
          </div>
        </Group>

        <Group title="Texto da Tela da Unidade">
          <div className="cfg-editor">
            <RichTextEditor name="description" id="id_description" className="django_ckeditor_5" wordCount />
          </div>
        </Group>

        <Group title="Agendas Vinculadas">
          <ChipMultiSelect
            id="id_agendas"
            placeholder="Selecione as agendas..."
            options={[]}
            values={agendas}
            onChange={(v) => {
              setAgendas(v);
              markDirty();
            }}
          />
          <p className="hinput-desc mt-2">Selecione as Agendas Vinculadas</p>
        </Group>

        <Group title="Endereço">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <CepField onFound={fillAddress} />
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
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="sm:col-span-2">
              <TextField id="id_street" name="street_f" label="Logradouro" placeholder="Rua, Avenida, etc." />
            </div>
            <TextField id="id_number" name="number" label="Número" placeholder="Número" />
            <TextField id="id_neighbourhood" name="neighbourhood_f" label="Bairro" placeholder="Bairro" />
            <TextField id="id_complement" name="complement" label="Complemento" placeholder="Apt, Bloco, etc." />
            <TextField id="id_district" name="district" label="Distrito" placeholder="Distrito" />
          </div>
        </Group>
      </div>
      <SaveBar
        backHref={ROUTES.adminUnidades}
        saveLabel="Criar Unidade"
        saveIcon={<SaveIcon />}
        dirty={dirty}
        toastIcon={<PenIcon className="w-4 h-4" />}
        toastTitle="Alterações não salvas"
        toastSub="Salve para aplicar as mudanças."
      />
    </form>
  );
}
