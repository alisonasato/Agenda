"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Combobox } from "../shared/Combobox";
import { MultiSelect } from "../shared/MultiSelect";
import { ROUTES } from "../shared/Sidebar";
import { CheckReadIcon, ChevronLeftIcon, UsersIcon } from "../shared/icons";
import { ACTIONS, AGENDAS, CLIENTS, OWNERS, STATUSES, TAGS, TEAM, dayOptions, timeOptions } from "./formOptions";

function Checkbox({ id, label, defaultChecked, disabled }: { id: string; label: string; defaultChecked?: boolean; disabled?: boolean }) {
  return (
    <div className="hformsection-opt">
      <label className={`hcheckbox${disabled ? " is-disabled" : ""}`}>
        <input type="checkbox" name={id} id={id} defaultChecked={defaultChecked} disabled={disabled} className="hcheckbox-input" />
        <span className="hcheckbox-box" aria-hidden="true">
          <CheckReadIcon className="hcheckbox-check" />
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
  const [owner, setOwner] = useState("");
  const [team, setTeam] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const dirty =
    Boolean(agenda || day || time || owner) ||
    tags.length > 0 ||
    clients.length > 0 ||
    companions.length > 0 ||
    team.length > 0 ||
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
              <div>
                <Combobox id="owner_user" label="Responsável pelo Atendimento" options={OWNERS} value={owner} onChange={setOwner} placeholder="Selecione" />
              </div>
              <div>
                <MultiSelect id="team" label="Membros da Equipe" options={TEAM} values={team} onChange={setTeam} placeholder="Buscar membros da equipe..." />
              </div>
            </div>
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

      <div className="hsavebar">
        <div className="hsavebar-progress" aria-hidden="true" />
        <div className="hsavebar-dock">
          <span className="hsavebar-dock-spacer" aria-hidden="true" />
          <div className="hsavebar-dock-actions">
            <a href={ROUTES.agendamentos} className="hbtn hbtn--secondary">
              <ChevronLeftIcon className="w-4 h-4" />
              Voltar
            </a>
            <button type="submit" className="hbtn hbtn--primary">
              <CheckReadIcon className="w-4 h-4" />
              <span className="hsavebar-btn-label">Salvar Agendamento</span>
            </button>
          </div>
        </div>
        <div className="hsavebar-toast" role="status" aria-live="polite" style={{ display: dirty || saved ? undefined : "none" }}>
          <span className="hsavebar-toast-icon">
            <CheckReadIcon className="w-4 h-4" />
          </span>
          <div className="hsavebar-toast-text">
            <p className="hsavebar-toast-title">{saved ? "Protótipo sem gravação" : "Agendamento ainda não registrado"}</p>
            <p className="hsavebar-toast-sub">
              {saved ? "O clone não salva agendamentos." : "Conclua para criar o agendamento."}
            </p>
          </div>
          <div className="hsavebar-toast-actions">
            <a href={ROUTES.agendamentos} className="hbtn hbtn--secondary">
              <ChevronLeftIcon className="w-4 h-4" />
              Voltar
            </a>
            <button type="submit" className="hbtn hbtn--primary">
              <CheckReadIcon className="w-4 h-4" />
              <span className="hsavebar-btn-label">Salvar Agendamento</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
