"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChipMultiSelect } from "../shared/ChipMultiSelect";
import { Combobox } from "../shared/Combobox";
import { SaveBar } from "../shared/SaveBar";
import { CopyIcon, InfoIcon, SaveIcon, WarningTriangleIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { nextId, update, useData } from "@/lib/seiri/store";
import { formatDuration, formatMoney } from "@/lib/seiri/select";

/** The six sections the original's stepper lists; only the first is cloned so far. */
const STEPS = ["Básicas", "Horários", "Formulários", "Notificações", "Avançadas", "Acessos"];

/** Where the agenda takes place, the original's radio group. */
const PLACES = [
  { value: "default", label: "Endereço padrão da conta" },
  { value: "custom", label: "Outro endereço" },
];

const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Clone of "Configurações Gerais da Agenda" — the page "Nova Agenda" and "Configurar" open. */
export function AgendaForm() {
  const data = useData();
  const id = useSearchParams().get("id");
  const agenda = data.agendas.find((a) => a.id === id);

  const [name, setName] = useState(agenda?.name ?? "");
  const [slug, setSlug] = useState(agenda ? slugify(agenda.name) : "");
  const [slugTouched, setSlugTouched] = useState(Boolean(agenda));
  const [serviceIds, setServiceIds] = useState(data.services.filter((s) => (id ? s.agendaIds.includes(id) : false)).map((s) => s.id));
  const [maxSubtypes, setMaxSubtypes] = useState("1");
  const [options, setOptions] = useState({ video: false, hybrid: false, home: false, confirm: false });
  const [owner, setOwner] = useState("");
  const [unit, setUnit] = useState("Padrão");
  const [place, setPlace] = useState("default");
  const [description, setDescription] = useState("");
  const [copyFrom, setCopyFrom] = useState("");
  const [saved, setSaved] = useState(false);

  const services = data.services.filter((s) => serviceIds.includes(s.id));
  const members = [...new Set(data.services.flatMap((s) => s.members))].sort();
  const snapshot = JSON.stringify({ name, slug, serviceIds, maxSubtypes, options, owner, unit, place, description });
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot);
  const dirty = snapshot !== savedSnapshot;

  const typeName = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  /** "Copiar": starts this agenda from another one's services and options. */
  const copy = () => {
    const from = data.agendas.find((a) => a.id === copyFrom);
    if (!from) return;
    setServiceIds(data.services.filter((s) => s.agendaIds.includes(from.id)).map((s) => s.id));
  };

  const save = () => {
    if (!name.trim()) return;
    update((d) => {
      const agendaId = agenda?.id ?? nextId("a", d.agendas);
      const row = { id: agendaId, name: name.trim(), color: agenda?.color ?? "#0A70D6", active: agenda?.active ?? true };
      return {
        ...d,
        agendas: agenda ? d.agendas.map((a) => (a.id === agendaId ? row : a)) : [...d.agendas, row],
        // A service belongs to the agendas that list it, so the picks rewrite that side.
        services: d.services.map((s) => ({
          ...s,
          agendaIds: serviceIds.includes(s.id) ? [...new Set([...s.agendaIds, agendaId])] : s.agendaIds.filter((x) => x !== agendaId),
        })),
        hours: { ...d.hours, [agendaId]: d.hours[agendaId] ?? Array.from({ length: 7 }, () => []) },
      };
    });
    setSavedSnapshot(snapshot);
    setSaved(true);
  };

  return (
    <div className="relative mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <div className="cfg-grid min-w-0 lg:grid lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-8">
        <div className="cfg-nav-col hui-reveal">
          <nav className="cfg-nav--stepper">
            <ol className="hstepper hstepper--lg hstepper--responsive hstepper--nav" role="list" aria-label="Seções da configuração da agenda">
              {STEPS.map((step, i) => (
                <li key={step} className="hstepper__step" data-status={i === 0 ? "active" : "inactive"} data-clickable={i === 0 ? "true" : undefined}>
                  <button type="button" className="hstepper__step-button" aria-current={i === 0 ? "step" : undefined} disabled={i > 0} aria-disabled={i > 0}>
                    <span className="hstepper__indicator">
                      <span className="hstepper__icon" aria-hidden="true">
                        <span className="hstepper__num">{i + 1}</span>
                      </span>
                    </span>
                    <span className="hstepper__content">
                      <span className="hstepper__title">{step}</span>
                    </span>
                  </button>
                  <span className="hstepper__separator" aria-hidden="true" />
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="min-w-0">
          <form
            className="cfg-form"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div className="cfg-content">
              <section className="cfg-group">
                <div className="cfg-group-head">
                  <h3 className="cfg-group-title">Copiar de outra agenda</h3>
                  <p className="cfg-group-desc">Comece a partir das configurações de uma agenda existente.</p>
                </div>
                <div className="cfg-group-body">
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                    <div className="flex-1 min-w-0">
                      <Combobox
                        id="id_calendar_copy"
                        label="Agenda de origem"
                        options={data.agendas.filter((a) => a.id !== agenda?.id).map((a) => ({ value: a.id, label: a.name }))}
                        value={copyFrom}
                        onChange={setCopyFrom}
                        placeholder="Selecione uma agenda"
                      />
                    </div>
                    <button type="button" className="hbtn hbtn--secondary" disabled={!copyFrom} onClick={copy}>
                      <CopyIcon className="w-4 h-4" />
                      Copiar
                    </button>
                  </div>
                </div>
              </section>

              <section className="cfg-group">
                <div className="cfg-group-head">
                  <h3 className="cfg-group-title">Identificação da agenda</h3>
                </div>
                <div className="cfg-group-body">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="hinput-field hinput-field--block">
                        <label className="hinput-label" htmlFor="id_label">
                          Nome <span className="hinput-req">*</span>
                        </label>
                        <div className="hinput-wrap">
                          <input
                            id="id_label"
                            className="hinput"
                            type="text"
                            name="label"
                            placeholder="Agenda"
                            value={name}
                            onChange={(e) => typeName(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="hslug-field">
                        <label className="hinput-label" htmlFor="id_slug">
                          Slug
                        </label>
                        <div className="hslug-group">
                          <span className="hslug-prefix" title="seiri.com.br/agenda/minha-empresa/">
                            seiri.com.br/agenda/minha-empresa/
                          </span>
                          <input
                            id="id_slug"
                            className="hslug-input"
                            type="text"
                            name="slug"
                            placeholder="agenda-exemplo"
                            maxLength={250}
                            value={slug}
                            onChange={(e) => {
                              setSlugTouched(true);
                              setSlug(slugify(e.target.value));
                            }}
                          />
                        </div>
                        <p className="hinput-desc">Use apenas letras minúsculas, números, hífens (-) e underlines (_). Espaços viram hífens.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="cfg-group">
                <div className="cfg-group-head">
                  <h3 className="cfg-group-title">Serviços</h3>
                </div>
                <div className="cfg-group-body space-y-4">
                  <div>
                    <ChipMultiSelect
                      id="subtypes"
                      placeholder="Selecione os serviços..."
                      options={data.services.map((s) => ({ id: s.id, label: s.name }))}
                      values={serviceIds}
                      onChange={setServiceIds}
                    />
                  </div>
                  {services.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="cfg-dep-field">
                        <div className="hinput-field hinput-field--block">
                          <label className="hinput-label" htmlFor="id_max_subtypes">
                            Seleção Máxima
                          </label>
                          <div className="hinput-wrap">
                            <input
                              id="id_max_subtypes"
                              className="hinput"
                              type="number"
                              min={1}
                              value={maxSubtypes}
                              onChange={(e) => setMaxSubtypes(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="cfg-dep-field">
                        <div className="hinput-field hinput-field--block">
                          <label className="hinput-label">Duração Total</label>
                          <div className="hinput-wrap">
                            <input className="hinput" type="text" readOnly value={formatDuration(services.reduce((total, s) => total + s.duration, 0))} />
                          </div>
                        </div>
                      </div>
                      <div className="cfg-dep-field">
                        <div className="hinput-field hinput-field--block">
                          <label className="hinput-label">Valor Total</label>
                          <div className="hinput-wrap">
                            <input className="hinput" type="text" readOnly value={formatMoney(services.reduce((total, s) => total + (s.price ?? 0), 0))} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="cfg-group">
                <div className="cfg-group-head">
                  <h3 className="cfg-group-title">Opções da agenda</h3>
                </div>
                <div className="cfg-group-body">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                    {(
                      [
                        ["video", "Videoconferência"],
                        ["hybrid", "Flexível"],
                        ["home", "Atendimento em domicílio"],
                        ["confirm", "Confirmar Agendamento"],
                      ] as const
                    ).map(([key, label]) => (
                      <div key={key} className="cfg-opt">
                        <label className="hcheckbox">
                          <input
                            type="checkbox"
                            className="hcheckbox-input"
                            checked={options[key]}
                            onChange={(e) => setOptions((o) => ({ ...o, [key]: e.target.checked }))}
                          />
                          <span className="hcheckbox-box" aria-hidden="true">
                            <svg className="hcheckbox-check" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <polyline
                                className="hcheckbox-check-line"
                                points="1 9 7 14 15 4"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className="hcheckbox-dash" aria-hidden="true" />
                          </span>
                          <span className="hcheckbox-label">{label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="cfg-group">
                <div className="cfg-group-head">
                  <h3 className="cfg-group-title">Responsáveis</h3>
                </div>
                <div className="cfg-group-body">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Combobox
                        id="owner_user"
                        label="Proprietário da agenda"
                        options={members.map((m) => ({ value: m, label: m }))}
                        value={owner}
                        onChange={setOwner}
                        placeholder="Selecione o proprietário..."
                      />
                    </div>
                    <div>
                      <Combobox
                        id="unidade"
                        label="Unidade"
                        options={[{ value: "Padrão", label: "Padrão" }]}
                        value={unit}
                        onChange={setUnit}
                        placeholder="Padrão"
                        clearable={false}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="cfg-group">
                <div className="cfg-group-head">
                  <h3 className="cfg-group-title">Endereço de Atendimento</h3>
                </div>
                <div className="cfg-group-body space-y-4">
                  <div>
                    <div className="hradiogroup hradiogroup--grid" role="radiogroup" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                      {PLACES.map((option) => (
                        <label key={option.value} className="hradio-pill">
                          <input
                            type="radio"
                            className="hradio-input"
                            name="place"
                            value={option.value}
                            checked={place === option.value}
                            onChange={() => setPlace(option.value)}
                          />
                          <span className="hradio-pill-label">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <InfoIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="min-w-0">
                      <span>
                        <span className="text-gray-500 inter-regular">Endereço padrão da conta:</span>{" "}
                        <span className="text-gray-500 inter-regular">não cadastrado</span>
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="cfg-group">
                <div className="cfg-group-head">
                  <h3 className="cfg-group-title">Descrição</h3>
                  <p className="cfg-group-desc">Texto exibido aos clientes na página de agendamento.</p>
                </div>
                <div className="cfg-group-body">
                  <div className="hinput-wrap">
                    <textarea className="htextarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                </div>
              </section>
            </div>

            <SaveBar
              backHref={ROUTES.configurarAgendas}
              saveLabel="Salvar"
              saveIcon={<SaveIcon className="w-4 h-4" />}
              dirty={dirty && Boolean(name.trim())}
              toastIcon={<WarningTriangleIcon className="w-4 h-4" />}
              toastTitle={saved && !dirty ? "Agenda salva" : "Alterações não salvas"}
              toastSub={saved && !dirty ? "A agenda está na lista de configuração." : "Salve para aplicar as mudanças."}
              forceToast={saved && !dirty}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
