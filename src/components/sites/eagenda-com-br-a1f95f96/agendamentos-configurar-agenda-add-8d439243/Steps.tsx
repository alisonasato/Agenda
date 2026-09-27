"use client";

import { ChipMultiSelect } from "../shared/ChipMultiSelect";
import { Combobox } from "../shared/Combobox";
import { ClipboardIcon, InfoIcon, SettingsIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import type { AgendaOptions } from "@/lib/seiri/types";

type StepProps = { options: AgendaOptions; onOptions: (options: AgendaOptions) => void; members: string[] };

/** A checkbox in the `cfg-opt` cell the original uses across these steps. */
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="cfg-opt">
      <label className="hcheckbox">
        <input type="checkbox" className="hcheckbox-input" checked={checked} onChange={(e) => onChange(e.target.checked)} />
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
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  help,
}: {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  help?: string;
}) {
  return (
    <div className="hinput-field hinput-field--block">
      <label className="hinput-label" htmlFor={id}>
        {label}
      </label>
      <div className="hinput-wrap">
        <input id={id} className="hinput" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
      {help && <p className="hinput-desc">{help}</p>}
    </div>
  );
}

function Group({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="cfg-group">
      <div className="cfg-group-head">
        <h3 className="cfg-group-title">{title}</h3>
        {desc && <p className="cfg-group-desc">{desc}</p>}
      </div>
      <div className="cfg-group-body">{children}</div>
    </section>
  );
}

/** The table the original shows for a register this agenda has nothing in yet. */
function EmptyTable({ cols, manageHref }: { cols: string[]; manageHref: string }) {
  return (
    <div className="space-y-3">
      <a href={manageHref} className="hbtn hbtn--secondary hbtn--sm">
        <SettingsIcon className="w-4 h-4" />
        Gerenciar
      </a>
      <div className="htable htable-is-empty">
        <div className="htable-scroll">
          <table className="htable-table w-full htable-fixed">
            <thead>
              <tr>
                {cols.map((c) => (
                  <th key={c} className="htable-col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="htable-row--empty" aria-hidden="true">
                {cols.map((c) => (
                  <td key={c} className="htable-cell" />
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="htable-empty" role="status">
          <div className="hempty hempty--inline hui-reveal">
            <h3 className="hempty-title nunito-bold">Nada por aqui ainda</h3>
            <p className="hempty-desc inter-regular">Assim que houver registros, eles aparecerão nesta tabela.</p>
          </div>
        </div>
        <div className="htable-footer" />
      </div>
    </div>
  );
}

const REQUESTED = [
  ["requestEmail", "Solicitar e-mail"],
  ["emailRequired", "E-mail obrigatório"],
  ["requestPhone", "Solicitar telefone"],
  ["phoneRequired", "Telefone obrigatório"],
  ["requestCpf", "Solicitar CPF"],
  ["requestDocument", "Solicitar documento"],
  ["requestBirthday", "Solicitar data de nascimento"],
  ["requestGender", "Solicitar gênero"],
  ["requestNationality", "Solicitar nacionalidade"],
  ["requestPlaceOfBirth", "Solicitar naturalidade"],
  ["requestProfession", "Solicitar profissão"],
  ["requestAddress", "Solicitar endereço"],
  ["extraTextField", "Campo texto adicional"],
] as const;

const FORMS = [
  ["appointmentForm", "Formulário de Agendamento"],
  ["preSurvey", "Pré-atendimento"],
  ["internalSurvey", "Atendimento interno"],
  ["postSurvey", "Pesquisa de satisfação"],
] as const;

/** Step 3 — Formulários. */
export function FormsStep({ options, onOptions }: StepProps) {
  const set = <K extends keyof AgendaOptions>(key: K, value: AgendaOptions[K]) => onOptions({ ...options, [key]: value });

  return (
    <>
      <Group title="Dados solicitados no agendamento" desc="Escolha quais informações o cliente deve preencher ao agendar.">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-1">
          {REQUESTED.map(([key, label]) => (
            <Check key={key} label={label} checked={options[key]} onChange={(v) => set(key, v)} />
          ))}
        </div>
      </Group>

      <Group title="Formulários" desc="Vincule formulários e pesquisas às etapas do atendimento.">
        <a href={ROUTES.formularios} className="hbtn hbtn--secondary hbtn--sm">
          <ClipboardIcon className="w-4 h-4" />
          Gerenciar formulários
        </a>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
          {FORMS.map(([key, label]) => (
            <Combobox key={key} id={key} label={label} options={[]} value={options[key]} onChange={(v) => set(key, v)} placeholder="Nenhum" />
          ))}
        </div>
        <div className="mt-4 halert halert--default" role="status">
          <span className="halert-indicator" aria-hidden="true">
            <InfoIcon className="w-5 h-5" />
          </span>
          <div className="halert-content">
            <p className="halert-description">Nenhum formulário cadastrado ainda — crie o primeiro em Gerenciar formulários.</p>
          </div>
          <div className="halert-actions" />
        </div>
      </Group>
    </>
  );
}

/** Step 4 — Notificações. */
export function NotificationsStep({ options, onOptions }: StepProps) {
  const set = <K extends keyof AgendaOptions>(key: K, value: AgendaOptions[K]) => onOptions({ ...options, [key]: value });

  return (
    <>
      <Group title="Notificações internas" desc="Avisos enviados à equipe quando há movimentação na agenda.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
          <Check label="Notificar internamente" checked={options.notifyInternally} onChange={(v) => set("notifyInternally", v)} />
          <Check label="Notificar por e-mail" checked={options.notifyByEmail} onChange={(v) => set("notifyByEmail", v)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Field id="email_cc" label="E-mail CC" value={options.emailCc} onChange={(v) => set("emailCc", v)} />
          <Field id="sms_cc" label="SMS CC" value={options.smsCc} onChange={(v) => set("smsCc", v)} />
        </div>
      </Group>

      <Group title="Notificações para clientes" desc="E-mails padrão do sistema. Status cobertos por Regra de Status são enviados por ela.">
        <Check label="E-mail para o cliente" checked={options.emailClient} onChange={(v) => set("emailClient", v)} />
      </Group>

      <Group title="Regras de lembrete" desc="Lembretes automáticos que se aplicam a esta agenda.">
        <EmptyTable cols={["Nome", "Tipo", "Regra de envio"]} manageHref={ROUTES.notificacoesRegras} />
      </Group>

      <Group title="Regras de status" desc="Enviadas quando o status muda. Hierarquia: Agenda → Organização → Conta principal.">
        <EmptyTable cols={["Status", "Canais", "Template de e-mail", "Origem"]} manageHref={ROUTES.notificacoesStatus} />
      </Group>
    </>
  );
}

/** Step 5 — Avançadas. */
export function AdvancedStep({ options, onOptions, members }: StepProps) {
  const set = <K extends keyof AgendaOptions>(key: K, value: AgendaOptions[K]) => onOptions({ ...options, [key]: value });

  return (
    <>
      <Group title="Privacidade e Acesso" desc="Controle quem pode ver e agendar nesta agenda.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
          <Check label="Bloquear Agendamento Externo" checked={options.blockExternalBooking} onChange={(v) => set("blockExternalBooking", v)} />
          <Check label="Somente Agendamento Autorizado" checked={options.authorizedOnly} onChange={(v) => set("authorizedOnly", v)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Field id="pass_agenda" label="Senha de Acesso" value={options.password} onChange={(v) => set("password", v)} />
        </div>
      </Group>

      <Group title="Distribuição de Agendamentos" desc="Distribua agendamentos automaticamente entre usuários ou um grupo.">
        <Check label="Distribuir Agendamentos Automaticamente" checked={options.distributeAutomatically} onChange={(v) => set("distributeAutomatically", v)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Combobox
            id="users_group"
            label="Grupo de Usuários para Distribuição"
            options={members.map((m) => ({ value: m, label: m }))}
            value={options.usersGroup}
            onChange={(v) => set("usersGroup", v)}
            placeholder="Selecione o grupo"
          />
        </div>
      </Group>

      <Group title="Acompanhantes" desc="Permita que clientes incluam acompanhantes no agendamento.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
          <Check label="Permitir Acompanhantes" checked={options.allowCompanions} onChange={(v) => set("allowCompanions", v)} />
          <Check label="Contar Acompanhantes na Capacidade" checked={options.countCompanions} onChange={(v) => set("countCompanions", v)} />
          <Check label="Solicitar Dados dos Acompanhantes" checked={options.requestCompanionData} onChange={(v) => set("requestCompanionData", v)} />
          <Check label="Enviar E-mail para Acompanhantes" checked={options.emailCompanions} onChange={(v) => set("emailCompanions", v)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Field
            id="max_companions"
            label="Máximo de Acompanhantes"
            type="number"
            value={options.maxCompanions}
            onChange={(v) => set("maxCompanions", Number(v))}
          />
        </div>
      </Group>

      <Group title="Capacidade e Modalidades" desc="Defina como os horários podem ser utilizados.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1">
          <Check label="Atendimento para Grupos" checked={options.groupService} onChange={(v) => set("groupService", v)} />
          <Check label="Permitir Agendamentos Recorrentes" checked={options.allowRecurring} onChange={(v) => set("allowRecurring", v)} />
          <Check label="Habilitar Lista de Espera" checked={options.waitingList} onChange={(v) => set("waitingList", v)} />
        </div>
      </Group>

      <Group title="Agendas Vinculadas" desc="Vincule outras agendas para evitar conflitos de horário.">
        <p className="hinput-desc">Nenhuma agenda vinculada.</p>
      </Group>

      <Group title="Pagamento" desc="Defina o valor padrão e a regra de cálculo.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="default_value" label="Valor Padrão" type="number" value={options.defaultValue} onChange={(v) => set("defaultValue", Number(v))} />
        </div>
      </Group>
    </>
  );
}

/** Step 6 — Acessos. */
export function AccessStep({ options, onOptions, members }: StepProps) {
  return (
    <Group title="Responsável e acesso">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Combobox
            id="owner_user_access"
            label="Usuário Responsável"
            options={members.map((m) => ({ value: m, label: m }))}
            value={options.ownerUser}
            onChange={(v) => onOptions({ ...options, ownerUser: v })}
            placeholder="Selecione o responsável"
          />
          <p className="hinput-desc">Quem responde por esta agenda no dia a dia.</p>
        </div>
        <div>
          <ChipMultiSelect
            id="access_users"
            label="Usuários com Acesso"
            placeholder="Selecione os usuários"
            options={members.map((m) => ({ id: m, label: m }))}
            values={options.accessUsers}
            onChange={(v) => onOptions({ ...options, accessUsers: v })}
          />
          <p className="hinput-desc">Além do responsável, quem mais enxerga e gerencia esta agenda.</p>
        </div>
      </div>
    </Group>
  );
}
