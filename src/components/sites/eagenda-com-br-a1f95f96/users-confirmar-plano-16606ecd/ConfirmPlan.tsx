"use client";

import { useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { CepField, fillFromCep, type CepAddress } from "../shared/CepField";
import { Combobox } from "../shared/Combobox";
import { PhoneInput } from "../shared/PhoneInput";
import { cnpjMask, cpfMask } from "../shared/masks";
import { CheckboxMark, CheckCircleIcon, ChevronLeftIcon, CrownIcon, InfoIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { COUNTRY_OPTIONS, useGeoCascade } from "../shared/useGeoCascade";
import { BILLING_PERSON_TYPES, PLAN_EXTRAS, PLAN_FEATURES, PLAN_OFFERS, PLAN_PRICINGS } from "@/lib/seiri/types";

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

/** "Confirmar Plano": the checkout the catalogue's "Selecionar Plano" opens. */
export function ConfirmPlan() {
  const params = useSearchParams();
  // A static export has no per-plan route, so the plan arrives as ?id=.
  const plan = PLAN_OFFERS.find((p) => p.id === params.get("id")) ?? PLAN_OFFERS[0];
  const pricings = PLAN_PRICINGS[plan.id];
  // The annual toggle on the catalogue lands here with the annual row already picked.
  const [pricing, setPricing] = useState(params.get("frequencia") === "anual" ? pricings[pricings.length - 1].value : "");
  const [personType, setPersonType] = useState("");
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [terms, setTerms] = useState(false);
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const geo = useGeoCascade();

  const fillAddress = async (data: CepAddress) => {
    fillFromCep(formRef.current, data);
    await geo.setByNames(data.estado, data.localidade);
  };

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <div className="hui-reveal">
        <a href={ROUTES.alterarPlano} className="hbtn hbtn--secondary">
          <ChevronLeftIcon className="w-4 h-4" />
          Voltar
        </a>
      </div>

      {/* The original's form carries novalidate and checks the fields on the server. */}
      <form
        ref={formRef}
        id="confirm-plan-form"
        className="mt-6 space-y-6"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setDone(true);
        }}
      >
        <div className="cfg-content hui-reveal" style={{ animationDelay: ".03s" }}>
          <Group title="Plano Selecionado">
            <div className="flex items-center gap-4">
              <span className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                <CrownIcon className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <h4 className="text-base font-bold text-gray-900 nunito-bold truncate">{plan.name}</h4>
                <p className="text-sm text-gray-500 inter-regular">{plan.name}</p>
              </div>
            </div>
          </Group>

          <Group title="Pagamento">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Combobox
                  id="plan_pricing"
                  label="Frequência de Pagamento"
                  options={pricings}
                  value={pricing}
                  onChange={setPricing}
                  placeholder="Selecione uma opção"
                  required
                />
              </div>
              <div>
                <p className="hinput-label">Forma de Pagamento</p>
                <p className="text-sm text-gray-500 inter-regular mt-1.5">Boleto, Pix ou cartão de crédito — você escolhe na hora de pagar.</p>
              </div>
            </div>
          </Group>

          <Group title="Personalize seu Plano">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PLAN_EXTRAS.map((extra) => (
                <div key={extra.name} className="hinput-field hinput-field--block">
                  <label className="hinput-label" htmlFor={`id_${extra.name}`}>
                    {extra.label} <span className="hinput-req">*</span>
                  </label>
                  <div className="hinput-wrap hinput-wrap--number">
                    <input id={`id_${extra.name}`} className="hinput" type="number" min={0} name={extra.name} defaultValue={0} required />
                  </div>
                  <p className="hinput-desc">{extra.price}</p>
                </div>
              ))}
            </div>
          </Group>

          <Group title="Funcionalidades Extras">
            <div className="hcheckbox-stack">
              {PLAN_FEATURES.map((f) => (
                <label key={f.value} className="hcheckbox">
                  <input
                    type="checkbox"
                    className="hcheckbox-input"
                    name="features"
                    value={f.value}
                    checked={features.includes(f.value)}
                    onChange={() => setFeatures((list) => (list.includes(f.value) ? list.filter((v) => v !== f.value) : [...list, f.value]))}
                  />
                  <span className="hcheckbox-box" aria-hidden="true">
                    <CheckboxMark />
                    <span className="hcheckbox-dash" aria-hidden="true" />
                  </span>
                  <span className="text-sm text-gray-700 inter-regular">{f.label}</span>
                </label>
              ))}
            </div>
          </Group>

          <Group title="Dados do Contratante">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Combobox
                  id="type_person_or_company"
                  label="Tipo de Pessoa para o Faturamento"
                  options={BILLING_PERSON_TYPES}
                  value={personType}
                  onChange={setPersonType}
                  placeholder="Selecione o tipo"
                  required
                />
              </div>
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_nome">
                  Nome ou Razão Social <span className="hinput-req">*</span>
                </label>
                <div className="hinput-wrap">
                  <input id="id_nome" className="hinput" type="text" name="nome" required />
                </div>
              </div>
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_email">
                  E-mail <span className="hinput-req">*</span>
                </label>
                <div className="hinput-wrap">
                  <input id="id_email" className="hinput" type="email" name="email" required />
                </div>
              </div>
              <PhoneInput id="id_phone_local" name="phone_local" label="Telefone de Contato" value={phone} onChange={setPhone} />
              {/* The original asks for the CPF only on Pessoa Física and for the CNPJ only on Pessoa Jurídica. */}
              {personType === "1" && (
                <div className="hinput-field hinput-field--block">
                  <label className="hinput-label" htmlFor="id_personal_identification">
                    Cadastro de Pessoa Física (CPF)
                  </label>
                  <div className="hinput-wrap">
                    <input
                      id="id_personal_identification"
                      className="hinput"
                      type="text"
                      name="personal_identification"
                      value={cpf}
                      onChange={(e) => setCpf(cpfMask(e.target.value))}
                    />
                  </div>
                </div>
              )}
              {personType === "2" && (
                <div className="hinput-field hinput-field--block">
                  <label className="hinput-label" htmlFor="id_company_identification">
                    Cadastro Nacional da Pessoa Jurídica (CNPJ)
                  </label>
                  <div className="hinput-wrap">
                    <input
                      id="id_company_identification"
                      className="hinput"
                      type="text"
                      name="company_identification"
                      value={cnpj}
                      onChange={(e) => setCnpj(cnpjMask(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          </Group>

          <Group title="Endereço de Cobrança">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CepField onFound={fillAddress} />
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_district">
                  Distrito
                </label>
                <div className="hinput-wrap">
                  <input id="id_district" className="hinput" type="text" name="district" />
                </div>
              </div>
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_street">
                  Endereço <span className="hinput-req">*</span>
                </label>
                <div className="hinput-wrap">
                  <input id="id_street" className="hinput" type="text" name="street_f" required />
                </div>
              </div>
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_number">
                  Número <span className="hinput-req">*</span>
                </label>
                <div className="hinput-wrap">
                  <input id="id_number" className="hinput" type="text" name="number" required />
                </div>
              </div>
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_complement">
                  Complemento (ex: Apt 201, Bl B)
                </label>
                <div className="hinput-wrap">
                  <input id="id_complement" className="hinput" type="text" name="complement" />
                </div>
              </div>
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_neighbourhood">
                  Bairro <span className="hinput-req">*</span>
                </label>
                <div className="hinput-wrap">
                  <input id="id_neighbourhood" className="hinput" type="text" name="neighbourhood_f" required />
                </div>
              </div>
              <Combobox
                id="country"
                label="País"
                options={COUNTRY_OPTIONS}
                value={geo.country}
                onChange={geo.setCountry}
                placeholder="Buscar país..."
                required
                clearable={false}
              />
              <Combobox id="state" label="Estado" options={geo.stateOptions} value={geo.state} onChange={geo.setState} placeholder="Buscar estado..." />
              <Combobox id="city" label="Município" options={geo.cityOptions} value={geo.city} onChange={geo.setCity} placeholder="Buscar município..." />
            </div>
          </Group>
        </div>

        <div className="hsection hui-reveal" style={{ animationDelay: ".05s" }}>
          <div className="hsection-head">
            <h2 className="hsection-title">Confirmação de contratação</h2>
          </div>
          <div className="hsection-body space-y-4">
            <div className="flex items-start gap-3">
              <InfoIcon className="w-5 h-5 flex-shrink-0 text-gray-400" />
              <p className="text-sm text-gray-500 inter-regular">Revise os dados e confirme os termos para continuar com a ativação do plano.</p>
            </div>
            <label className="hcheckbox">
              <input type="checkbox" className="hcheckbox-input" name="terms" required checked={terms} onChange={(e) => setTerms(e.target.checked)} />
              <span className="hcheckbox-box" aria-hidden="true">
                <CheckboxMark />
                <span className="hcheckbox-dash" aria-hidden="true" />
              </span>
              <span className="text-sm text-gray-700 inter-regular">
                Aceito os <span className="text-primary">Termos de Uso</span> e a <span className="text-primary">Política de Privacidade</span> para contratação
                do plano selecionado
              </span>
            </label>
            <button type="submit" className="hbtn hbtn--primary" disabled={!terms || !pricing || !personType}>
              <CheckCircleIcon />
              Prosseguir para Pagamento
            </button>
            {done && (
              <p className="text-sm text-gray-500 inter-regular">
                O clone para aqui: o original segue para a tela de pagamento do provedor, que não existe neste protótipo.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
