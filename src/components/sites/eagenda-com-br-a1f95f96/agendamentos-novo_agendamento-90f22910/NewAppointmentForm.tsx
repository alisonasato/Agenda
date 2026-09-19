"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Combobox } from "../shared/Combobox";
import { MultiSelect } from "../shared/MultiSelect";
import { ROUTES } from "../shared/Sidebar";
import { CheckboxMark, PenIcon, SaveIcon, UsersIcon } from "../shared/icons";
import { SaveBar } from "../shared/SaveBar";
import { ACTIONS, AGENDAS, CLIENTS, STATUSES, TAGS, dayOptions, timeOptions } from "./formOptions";

// Mock id for the logged-in user, who the live form now sets as the owner.
const CURRENT_USER_ID = "1";

function Checkbox({ id, label, defaultChecked, disabled }: { id: string; label: string; defaultChecked?: boolean; disabled?: boolean }) {
  return (
    <div className="hformsection-opt">
      <label className={`hcheckbox${disabled ? " is-disabled" : ""}`}>
        <input type="checkbox" name={id} id={id} defaultChecked={defaultChecked} disabled={disabled} className="hcheckbox-input" />
        <span className="hcheckbox-box" aria-hidden="true">
          <CheckboxMark />
          <span className="hcheckbox-dash" aria-hidden="true" />
        </span>
        <span className="hcheckbox-label">{label}</span>
      </label>
    </div>
  );
}

export function NewAppointmentForm() {
  const [agenda, setAgenda] = useState("");
  const [action, setAction] = useState("new");
  const [status, setStatus] = useState("CONFIRMED");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [companions, setCompanions] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const dirty =
    Boolean(agenda || day || time) ||
    tags.length > 0 ||
    clients.length > 0 ||
    companions.length > 0 ||
    action !== "new" ||
    status !== "CONFIRMED";

  const days = useMemo(() => dayOptions(new Date()), []);
  const times = useMemo(() => timeOptions(), []);

  // No backend in the clone: saving only acknowledges on screen.
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <form id="new-appointment-form" onSubmit={onSubmit} noValidate>
      <div className="hformpanel">
        <section className="hformsection">
          <div className="hformsection-head">
            <h3 className="hformsection-title">Dados do agendamento</h3>
          </div>
          <div className="hformsection-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Combobox id="agenda" label="Agenda" required options={AGENDAS} value={agenda} onChange={setAgenda} placeholder="Escolha a agenda" />
              </div>
              <div className="md:col-span-2" id="service-password-container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" />
              </div>
              <div>
                <Combobox id="action_new_appointment" label="Ação" required options={ACTIONS} value={action} onChange={setAction} placeholder="Selecione" />
              </div>
              <div>
                <Combobox id="status" label="Status do Agendamento" required options={STATUSES} value={status} onChange={setStatus} placeholder="Selecione" />
              </div>
              <div>
                <Combobox
                  id="dia"
                  label="Dia"
                  required
                  options={agenda ? days : []}
                  value={day}
                  onChange={setDay}
                  placeholder="Selecione a agenda primeiro"
                  disabled={!agenda}
                />
              </div>
              <div>
                <Combobox
                  id="hora"
                  label="Horário"
                  required
                  options={day ? times : []}
                  value={time}
                  onChange={setTime}
                  placeholder="Selecione o dia primeiro"
                  disabled={!day}
                />
              </div>
              <div className="md:col-span-2">
                <MultiSelect id="tags" label="Tags" options={TAGS} values={tags} onChange={setTags} placeholder="Buscar tags..." />
              </div>
            </div>
          </div>
        </section>

        <section className="hformsection">
          <div className="hformsection-head">
            <h3 className="hformsection-title">Participantes</h3>
          </div>
          <div className="hformsection-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <MultiSelect
                  id="main_persons"
                  label="Clientes"
                  required
                  options={CLIENTS}
                  values={clients}
                  onChange={setClients}
                  placeholder="Digite para buscar clientes..."
                />
                <div className="mt-1.5">
                  <button type="button" className="hbtn hbtn--ghost hbtn--sm" style={{ "--hbtn-fg": "var(--color-accent)" } as React.CSSProperties}>
                    <UsersIcon className="w-4 h-4" />
                    Adicionar cliente
                  </button>
                </div>
              </div>
              <div>
                <MultiSelect
                  id="person"
                  label="Acompanhantes"
                  options={CLIENTS}
                  values={companions}
                  onChange={setCompanions}
                  placeholder="Digite para buscar acompanhantes..."
                />
                <div className="mt-1.5">
                  <button type="button" className="hbtn hbtn--ghost hbtn--sm" style={{ "--hbtn-fg": "var(--color-accent)" } as React.CSSProperties}>
                    <UsersIcon className="w-4 h-4" />
                    Adicionar acompanhante
                  </button>
                </div>
              </div>
            </div>
            {/* The live form no longer asks for the owner or team: the owner is the logged-in user. */}
            <input type="hidden" name="owner_user" value={CURRENT_USER_ID} />
          </div>
        </section>

        <section className="hformsection">
          <div className="hformsection-head">
            <h3 className="hformsection-title">Notificações</h3>
          </div>
          <div className="hformsection-body">
            <div className="space-y-2.5">
              <div>
                <Checkbox id="enviar_email" label="Enviar confirmação por e-mail" defaultChecked />
              </div>
              <div>
                <Checkbox id="incluir_regras" label="Incluir nas suas regras de notificações" defaultChecked />
              </div>
              <div>
                <Checkbox id="enviar_sms" label="Enviar confirmação por SMS" disabled />
                <p className="hinput-desc ml-7">O envio automático de SMS está desabilitado no seu plano.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <SaveBar
        backHref={ROUTES.agendamentos}
        saveLabel="Salvar Agendamento"
        saveIcon={<SaveIcon />}
        dirty={dirty}
        toastIcon={<PenIcon className="w-4 h-4" />}
        toastTitle={saved ? "Protótipo sem gravação" : "Agendamento ainda não registrado"}
        toastSub={saved ? "O clone não salva agendamentos." : "Conclua para criar o agendamento."}
        forceToast={saved}
      />
    </form>
  );
}
