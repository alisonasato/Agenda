"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Combobox } from "../shared/Combobox";
import { MultiSelect } from "../shared/MultiSelect";
import { ROUTES } from "../shared/Sidebar";
import { CheckboxMark, PenIcon, SaveIcon, UsersIcon } from "../shared/icons";
import { SaveBar } from "../shared/SaveBar";
import { ACTIONS, STATUSES, dayOptions, timeOptions } from "./formOptions";
import { useData, update, nextId } from "@/lib/seiri/store";
import { withBase } from "@/lib/basePath";
import type { Status } from "@/lib/seiri/types";

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
  const data = useData();
  const [agenda, setAgenda] = useState("");
  const [service, setService] = useState("");
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
  const agendaOptions = data.agendas.map((a) => ({ value: a.id, label: a.name }));
  const clientOptions = data.clients.map((c) => ({ value: c.id, label: c.name }));
  const tagOptions = data.tags.map((t) => ({ value: t.id, label: t.name }));
  const serviceOptions = data.services.filter((s) => s.agendaIds.includes(agenda)).map((s) => ({ value: s.id, label: s.name }));
  const picked = data.services.find((s) => s.id === service);

  // No server here: saving writes the appointment into the browser's own data (src/lib/seiri).
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!agenda || !day || !time || !clients.length) return;
    update((d) => {
      const rows = [...d.appointments];
      clients.forEach((clientId) => {
        const id = nextId("ap", rows);
        rows.push({
          id,
          code: String(48000 + rows.length * 7),
          clientId,
          agendaId: agenda,
          serviceId: service || d.services.find((s) => s.agendaIds.includes(agenda))?.id || "",
          start: `${day}T${time}`,
          duration: picked?.duration ?? 30,
          status: (status === "AWAITING_PAYMENT" ? "PENDING" : status) as Status,
          owner: "Maria Souza",
          tagIds: tags,
          comment: "",
        });
      });
      return { ...d, appointments: rows };
    });
    setSaved(true);
    window.setTimeout(() => {
      window.location.href = withBase("/agendamentos/listar");
    }, 900);
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
                <Combobox
                  id="agenda"
                  label="Agenda"
                  required
                  options={agendaOptions}
                  value={agenda}
                  onChange={(v) => {
                    setAgenda(v);
                    setService("");
                  }}
                  placeholder="Escolha a agenda"
                />
              </div>
              <div className="md:col-span-2" id="service-password-container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* The original only shows this once the chosen agenda has services. */}
                  {serviceOptions.length > 0 && (
                    <Combobox id="service" label="Serviço" options={serviceOptions} value={service} onChange={setService} placeholder="Escolha o serviço" />
                  )}
                </div>
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
                <MultiSelect id="tags" label="Tags" options={tagOptions} values={tags} onChange={setTags} placeholder="Buscar tags..." />
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
                  options={clientOptions}
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
                  options={clientOptions}
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
        toastTitle={saved ? "Agendamento criado" : "Agendamento ainda não registrado"}
        toastSub={saved ? "Abrindo a lista de agendamentos…" : "Conclua para criar o agendamento."}
        forceToast={saved}
      />
    </form>
  );
}
