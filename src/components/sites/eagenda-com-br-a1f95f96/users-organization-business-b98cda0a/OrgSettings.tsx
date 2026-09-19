"use client";

import { useRef, useState, type ReactNode } from "react";
import { Combobox } from "../shared/Combobox";
import { DatePicker } from "../shared/DatePicker";
import { PhoneInput } from "../shared/PhoneInput";
import { SaveBar } from "../shared/SaveBar";
import { Select } from "../shared/Select";
import { ROUTES } from "../shared/Sidebar";
import {
  CaretDownIcon,
  CaretUpIcon,
  CheckboxMark,
  DangerCircleIcon,
  InfoIcon,
  PenIcon,
  PlaneIcon,
  SaveIcon,
  TrashIcon,
  UndoIcon,
} from "../shared/icons";

const toOptions = (rows: [string, string][]) => rows.map(([value, label]) => ({ value, label }));

// Lists as the original's comboboxes carry them.
const SEGMENTS = toOptions([
  ["estetica", "Estética e Beleza"],
  ["saude", "Saúde e Bem-estar"],
  ["barbearia", "Barbearia"],
  ["fitness", "Fitness e Esportes"],
  ["educacao", "Educação e Cursos"],
  ["eventos", "Eventos e Experiências"],
  ["consultoria", "Consultoria"],
  ["juridico", "Jurídico"],
  ["tecnologia", "Tecnologia"],
  ["pet", "Pet Shop e Veterinário"],
  ["rh", "RH e Recrutamento"],
  ["governo", "Governo e Serviço Público"],
  ["outro", "Outro"],
]);
const CLIENT_TERMS = toOptions([
  ["cliente", "Clientes"],
  ["paciente", "Pacientes"],
  ["aluno", "Alunos"],
  ["participante", "Participantes"],
  ["associado", "Associados"],
  ["membro", "Membros"],
  ["candidato", "Candidatos"],
  ["cidadao", "Cidadãos"],
  ["solicitante", "Solicitantes"],
  ["beneficiario", "Beneficiários"],
  ["tutor", "Tutores"],
]);
const USAGE_MODES = toOptions([
  ["auto", "Automático (hoje: Para mim)"],
  ["solo", "Para mim"],
  ["team", "Para equipes"],
]);
const LANGUAGES = toOptions([
  ["en", "Inglês"],
  ["de", "Alemão"],
  ["es", "Espanhol"],
  ["fr", "Francês"],
  ["pt-br", "Português"],
]);
const BOOKING_FLOWS = toOptions([
  ["auto", "Automático (padrão do sistema)"],
  ["legacy", "Tela clássica"],
  ["modern", "Tela moderna"],
  ["new", "Tela nova"],
]);
const SCREEN_TEMPLATES = toOptions([
  ["default", "Lista de Dias e Horários"],
  ["calendar", "Calendário"],
]);
const WEEKDAYS = toOptions([
  ["0", "Domingo"],
  ["1", "Segunda-Feira"],
  ["2", "Terça-Feira"],
  ["3", "Quarta-Feira"],
  ["4", "Quinta-Feira"],
  ["5", "Sexta-Feira"],
  ["6", "Sábado"],
]);
const FLOWS = toOptions([
  ["padrao", "Agenda, Dia, Horário"],
  ["dia", "Dia, Horário, Agenda"],
]);

// The original's country list (ISO codes, in its order). Names come from the browser's pt-BR
// region names, except where the original words them differently.
const COUNTRY_CODES =
  "AF,ZA,AL,DE,AD,AO,AI,AQ,AG,SA,DZ,AR,AM,AW,AU,AT,AZ,BS,BH,BD,BB,BE,BZ,BJ,BM,BY,BO,BQ,BA,BW,BR,BN,BG,BF,BI,BT,CV,CM,KH,CA,QA,KZ,TD,CL,CN,CY,SG,CO,KM,CG,KP,KR,CR,CI,HR,CU,CW,DK,DJ,DM,EG,SV,AE,EC,ER,SK,SI,ES,SZ,PS,US,UM,EE,SJ,ET,FJ,PH,FI,FR,GA,GM,GH,GE,GS,GI,GD,GR,GL,GP,GU,GT,GG,GY,GF,GN,GQ,GW,HT,NL,HN,HK,HU,YE,BV,HM,NF,IM,CX,AX,KY,CC,CK,FK,FO,MP,MH,PN,SB,TC,VG,VI,IN,ID,IR,IQ,IE,IS,IL,IT,JM,JP,JE,JO,KW,LA,LS,LV,LB,LR,LY,LI,LT,LU,MO,MK,MG,MY,MW,MV,ML,MT,MA,MQ,MU,MR,YT,MX,MM,FM,MZ,MD,MC,MN,ME,MS,NA,NR,NP,NI,NE,NG,NU,NO,NC,NZ,OM,PW,PA,PG,PK,PY,PE,PF,PL,PR,PT,KE,KG,KI,GB,CF,CD,DO,RE,RO,RW,RU,EH,WS,AS,SM,SH,LC,VA,BL,KN,SX,MF,PM,ST,VC,SN,SL,RS,SC,SY,SO,LK,SD,SS,SE,CH,SR,TH,TW,TJ,TZ,CZ,IO,TF,TL,TG,TK,TO,TT,TN,TM,TR,TV,UA,UG,UY,UZ,VU,VE,VN,WF,ZM,ZW".split(",");
const COUNTRY_NAMES: Record<string, string> = {
  AI: "Anguilla", AQ: "Antártica", BH: "Bahrain", BQ: "Bonaire, Saba e Santo Eustáquio", BF: "Burkina Faso", SG: "Cingapura",
  CG: "Congo, República do Congo", KP: "Coréia do Norte", KR: "Coréia do Sul", CW: "Curação", DM: "Dominicana", SI: "Eslovénia",
  PS: "Estado da Palestina", UM: "Estados Unidos Ilhas Menores Distantes", SJ: "Esvalbarda", GS: "Geórgia do Sul e Sanduíche do Sul",
  GU: "Guão", GG: "Guernesei", NL: "Holanda", YE: "Iémen", HM: "Ilha Heard e Ilhas McDonald", CX: "Ilha do Natal", AX: "Ilhas Alanda",
  FK: "Ilhas Falkland (Malvinas)", FO: "Ilhas Faroe", TC: "Ilhas Turks e Caicos", VI: "Ilhas Virgens dos Estados Unidos", JE: "Jérsia",
  KW: "Kuweit", LV: "Letónia", LI: "Listenstaina", MG: "Madagáscar", MW: "Malavi", MM: "Mianmar", MD: "Moldova", MC: "Monaco",
  NG: "Nigeria", OM: "Oman", PG: "Papua Nova Guiné", CD: "República Democrática do Congo", VA: "Santa Sé", KN: "São Cristóvão e Neves",
  SX: "São Martinho (Países Baixos)", MF: "São Martinho (Parte Francesa)", SC: "Seychelles", TJ: "Tajiquistão", TL: "Timor-leste",
};
function countryOptions() {
  const names = new Intl.DisplayNames(["pt-BR"], { type: "region" });
  return COUNTRY_CODES.map((code) => ({ value: code, label: COUNTRY_NAMES[code] ?? names.of(code) ?? code }));
}
// The original offers no time zone list (only the saved value shows); the clone lists the IANA zones.
function timeZoneOptions() {
  return Intl.supportedValuesOf("timeZone").map((z) => ({ value: z, label: z }));
}

const STEPS = [
  { id: "business", title: "Seu negócio" },
  { id: "config", title: "Local e horário" },
  { id: "privacy", title: "Privacidade" },
  { id: "policy", title: "Políticas" },
  { id: "emails", title: "Emails" },
  { id: "operation", title: "Agendamentos" },
  { id: "template", title: "Tela de agendamento" },
  { id: "data", title: "Dados fiscais" },
] as const;
type Step = (typeof STEPS)[number]["id"];

function Group({ title, desc, bodyClass, children }: { title: string; desc?: string; bodyClass?: string; children: ReactNode }) {
  return (
    <section className="cfg-group">
      <div className="cfg-group-head">
        <h3 className="cfg-group-title">{title}</h3>
        {desc && <p className="cfg-group-desc">{desc}</p>}
      </div>
      <div className={`cfg-group-body${bodyClass ? ` ${bodyClass}` : ""}`}>{children}</div>
    </section>
  );
}

function Check({ name, label, defaultChecked, disabled, className }: { name: string; label: string; defaultChecked?: boolean; disabled?: boolean; className?: string }) {
  return (
    <label className={`hcheckbox${disabled ? " is-disabled" : ""}`}>
      <input type="checkbox" name={name} id={`id_${name}`} className={`${className ? `${className} ` : ""}hcheckbox-input`} defaultChecked={defaultChecked} disabled={disabled} />
      <span className="hcheckbox-box" aria-hidden="true">
        <CheckboxMark />
        <span className="hcheckbox-dash" aria-hidden="true" />
      </span>
      <span className="hcheckbox-label">{label}</span>
    </label>
  );
}

function Opt(props: { name: string; label: string; help?: string; defaultChecked?: boolean; disabled?: boolean; className?: string }) {
  return (
    <div className="cfg-opt">
      <div>
        <Check {...props} />
        {props.help && <p className="cfg-opt-help">{props.help}</p>}
      </div>
    </div>
  );
}

function Field({ name, label, required, type = "text", desc, defaultValue, placeholder, className, mask }: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  desc?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  /** "000.000.000-00"-style mask, applied as the user types (the original uses jQuery Mask). */
  mask?: string;
}) {
  const applyMask = (v: string) => {
    if (!mask) return v;
    const d = v.replace(/\D/g, "");
    let out = "";
    let i = 0;
    for (const ch of mask) {
      if (i >= d.length) break;
      out += ch === "0" ? d[i++] : ch;
    }
    return out;
  };
  return (
    <div className="hinput-field hinput-field--block">
      <label className="hinput-label" htmlFor={`id_${name}`}>
        {label} {required && <span className="hinput-req">*</span>}
      </label>
      <div className="hinput-wrap">
        <input
          id={`id_${name}`}
          className={`${className ? `${className} ` : ""}hinput`}
          type={type}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder ?? ""}
          required={required}
          onInput={mask ? (e) => (e.currentTarget.value = applyMask(e.currentTarget.value)) : undefined}
        />
      </div>
      {desc && <p className="hinput-desc">{desc}</p>}
    </div>
  );
}

/** Number input with the original's up/down stepper (native stepUp/stepDown, so min/step apply). */
function NumberField({ name, label, desc, required, defaultValue, step, min, className }: {
  name: string;
  label: string;
  desc?: string;
  required?: boolean;
  defaultValue?: string;
  step?: string;
  min?: string;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const bump = (up: boolean) => {
    const el = ref.current;
    if (!el) return;
    if (up) el.stepUp();
    else el.stepDown();
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  return (
    <div className="hinput-field hinput-field--block">
      <label className="hinput-label" htmlFor={`id_${name}`}>
        {label} {required && <span className="hinput-req">*</span>}
      </label>
      <div className="hinput-wrap hinput-wrap--number">
        <input
          ref={ref}
          id={`id_${name}`}
          step={step}
          min={min}
          className={`${className ? `${className} ` : ""}hinput`}
          type="number"
          name={name}
          defaultValue={defaultValue}
          placeholder=""
          required={required}
        />
        <span className="hinput-stepper" aria-hidden="true">
          <button type="button" tabIndex={-1} className="hinput-step hinput-step--up" onClick={() => bump(true)}>
            <CaretUpIcon className="w-3 h-3" />
          </button>
          <button type="button" tabIndex={-1} className="hinput-step hinput-step--down" onClick={() => bump(false)}>
            <CaretDownIcon className="w-3 h-3" />
          </button>
        </span>
      </div>
      {desc && <p className="hinput-desc">{desc}</p>}
    </div>
  );
}

function Alert({ tone, children }: { tone: "accent" | "danger"; children: ReactNode }) {
  return (
    <div className={`halert halert--${tone}`} role="alert">
      <span className="halert-indicator">{tone === "danger" ? <DangerCircleIcon className="w-[18px] h-[18px]" /> : <InfoIcon className="w-[18px] h-[18px]" />}</span>
      <div className="halert-content">{children}</div>
      <div className="halert-actions" />
    </div>
  );
}

/** One step's form: alerts slot, the white cfg-content card and a save bar (the original's partial). */
function StepForm({ alerts, saveBar, children }: { alerts?: ReactNode; saveBar?: ReactNode; children: ReactNode }) {
  const [dirty, setDirty] = useState(false);
  return (
    <form method="POST" className="cfg-form" onSubmit={(e) => e.preventDefault()} onChange={() => setDirty(true)}>
      <div className="hform-alerts mb-4">{alerts}</div>
      <div className="cfg-content">{children}</div>
      {saveBar ?? (
        <SaveBar
          backHref={ROUTES.dadosConta}
          saveLabel="Salvar"
          saveIcon={<SaveIcon />}
          dirty={dirty}
          toastIcon={<PenIcon className="w-4 h-4" />}
          toastTitle="Alterações não salvas"
          toastSub="Salve para aplicar as mudanças."
        />
      )}
    </form>
  );
}

function BusinessStep() {
  const [segment, setSegment] = useState("");
  const [term, setTerm] = useState("cliente");
  const [mode, setMode] = useState("auto");
  return (
    <StepForm>
      <Group title="Segmento do Negócio" desc="Define as sugestões de serviços e o preset de cores/imagem da sua página.">
        <div className="w-full max-w-sm">
          <Combobox id="segment_key" label="Segmento do negócio" options={SEGMENTS} value={segment} onChange={setSegment} placeholder="Selecione o segmento" clearable={false} />
        </div>
        <div className="mt-3">
          <Check name="apply_preset" label="Aplicar as cores e a imagem sugeridas para este segmento" />
          <p className="cfg-opt-help">Substitui a paleta atual da página de agendamento pelas cores do segmento escolhido.</p>
        </div>
      </Group>
      <Group title="Painel">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <div>
            <Select id="id_client_term" name="client_term" label="Como você chama quem você atende?" options={CLIENT_TERMS} value={term} onChange={setTerm} />
          </div>
          <div>
            <Select id="id_usage_mode" name="usage_mode" label="Modo de uso" options={USAGE_MODES} value={mode} onChange={setMode} />
          </div>
        </div>
      </Group>
    </StepForm>
  );
}

function ConfigStep() {
  const [country, setCountry] = useState("BR");
  const [zone, setZone] = useState("America/Sao_Paulo");
  const [language, setLanguage] = useState("pt-br");
  const [countries] = useState(countryOptions);
  const [zones] = useState(timeZoneOptions);
  return (
    <StepForm>
      <Group title="Local e Idioma">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Combobox id="country" label="País" options={countries} value={country} onChange={setCountry} placeholder="Selecione o país" required clearable={false} />
          </div>
          <div>
            <Combobox id="fuso_horario" label="Fuso Horário da Agenda" options={zones} value={zone} onChange={setZone} placeholder="Selecione o fuso horário" required clearable={false} />
          </div>
          <div>
            <Combobox id="default_language" label="Idioma" options={LANGUAGES} value={language} onChange={setLanguage} placeholder="Selecione o idioma" />
          </div>
        </div>
      </Group>
    </StepForm>
  );
}

function PrivacyStep() {
  return (
    <StepForm
      alerts={
        <Alert tone="accent">
          <p className="halert-description">É necessário verificar o e-mail do seu usuário para habilitar o duplo fator de organização para todos os membros da organização.</p>
          {/* The profile page isn't cloned yet. */}
          <a className="text-primary underline" href="#">
            Clique aqui
          </a>
        </Alert>
      }
    >
      <Group title="Privacidade e Segurança">
        <div className="cfg-opt-list">
          <Opt name="is_public" label="Página pública (indexação)" help="Sua página será incluída no mapa do site para indexação por mecanismos de buscas, permitindo um maior alcance de sua página de agendamento. Disponível a partir do plano básico" />
          <Opt name="is_login_req" label="Exigir login para agendar" help="Obrigar os usuários a fazerem login na plataforma para conseguir fazer um agendamento. Disponível a partir do plano avançado" />
          <Opt name="is_restricted" label="Acesso restrito" help="Permite que você configure quais usuários podem fazer agendamentos na sua agenda. Disponível a partir do plano avançado" />
          <Opt name="is_use_captcha" label="Usar Captcha" help="Proteger sua tela de agendamento com um desafio captcha" />
          <Opt name="hide_nav_login_link" label="Ocultar link para login" help="Marque essa opção se, no seu caso, não há necessidade do cliente efetuar login ou criar uma conta para acompanhar os agendamentos" />
          <Opt name="max_distance" label="Distância máxima (km)" help="Distância máxima em km para agendamento" />
          <Opt name="hide_short_name" label="Ocultar nome curto no menu" />
          <Opt name="show_footer_logo" label="Exibir logotipo no rodapé" help="Exibir o logotipo da organização também no rodapé da página" />
          <Opt name="is_mfa_required" label="Exigir autenticação em 2 fatores" help="Tornar obrigatório o duplo fator de autenticação para todos os membros da sua equipe" disabled />
          <Opt
            name="coordinates"
            label="Coordenadas"
            help="Coordenadas no formato: latitude, longitude (ex: -16.726975, -43.862786). Consulte as coordenadas da sua empresa pelo Google Maps, Apple Maps ou GPS de smartphones."
          />
        </div>
      </Group>
    </StepForm>
  );
}

function PolicyStep() {
  return (
    <StepForm>
      <Group title="Termos e Políticas" desc="Configure os links para termos de uso, políticas e página de redirecionamento.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Field name="privacy_policy_link" type="url" label="Política de Privacidade" />
          </div>
          <div>
            <Field name="terms_link" type="url" label="Termos de Uso" />
          </div>
          <div>
            <Field name="faq_link" type="url" label="FAQ" />
          </div>
          <div>
            <Field name="redirect_link" type="url" label="Página de redirecionamento" desc="Página para redirecionamento após a conclusão do agendamento" />
          </div>
        </div>
      </Group>
    </StepForm>
  );
}

function EmailsStep({ onCancel }: { onCancel: () => void }) {
  // This step has its own dock: Cancelar reloads the step, and there's no floating toast.
  const dock = (
    <div className="hsavebar">
      <div className="hsavebar-dock">
        <span className="hsavebar-dock-spacer" aria-hidden="true" />
        <div className="hsavebar-dock-actions flex-wrap justify-end">
          <button type="button" className="hbtn hbtn--secondary" onClick={onCancel}>
            <UndoIcon />
            Cancelar
          </button>
          <button type="submit" className="hbtn hbtn--primary">
            <SaveIcon />
            Salvar
          </button>
          <button type="submit" name="btn_submit" value="send_email" className="hbtn hbtn--secondary">
            <PlaneIcon />
            Enviar Teste
          </button>
          <button type="submit" name="btn_submit" value="clean" className="hbtn hbtn--secondary">
            <TrashIcon />
            Limpar
          </button>
        </div>
      </div>
    </div>
  );
  return (
    <StepForm
      alerts={
        <Alert tone="danger">
          <p className="halert-description">O envio de e-mails via domínio comercial não está ativado em sua assinatura.</p>
        </Alert>
      }
      saveBar={dock}
    >
      <Group title="Configurações do SMTP para envio de emails" desc="Configure o envio de emails utilizando seu próprio endereço">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Field name="smtp_host" label="SMTP Host" required desc="Endereço do servidor SMTP" className="smtp-field" />
          </div>
          <div>
            <NumberField name="smtp_port" label="SMTP Port" required defaultValue="587" desc="Porta do servidor SMTP" className="smtp-field" />
          </div>
          <div>
            <Field name="username" label="Usuário" required desc="Usuário de autenticação SMTP" className="smtp-field" />
          </div>
          <div>
            <Field name="password" type="password" label="Senha" required desc="Senha de autenticação SMTP" className="smtp-field" />
          </div>
          <div>
            <Field name="from_email" type="email" label="Enviado por" required desc="Endereço de e-mail do remetente" className="smtp-field" />
          </div>
          <div>
            <Field name="reply_to" type="email" label="Responder para" desc="Endereço de e-mail para resposta" className="smtp-field" />
          </div>
        </div>
        <div className="cfg-opt-list mt-4">
          <Opt name="use_tls" label="Usar TLS" help="Usar TLS para conexão segura" defaultChecked className="smtp-field" />
          <Opt name="use_ssl" label="Usar SSL" help="Usar SSL para conexão segura" className="smtp-field" />
          <Opt
            name="b_apply_to_subaccounts"
            label="Aplicar a todas as subcontas"
            help="Quando marcado, aplica estas configurações de SMTP a todas as subcontas vinculadas à organização"
            className="smtp-field"
          />
        </div>
      </Group>
    </StepForm>
  );
}

function OperationStep() {
  return (
    <StepForm>
      <Group title="Parâmetros para Agendamentos" desc="Configurações para agendamentos realizados por clientes.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <NumberField
              name="edit_minimum_time_h"
              label="Prazo mínimo para edição (em horas)"
              desc="Esse é o número mínimo de horas antes do horário marcado para que um cliente possa editar os dados de agendamento, como nome, email e formulários de agendamento"
            />
          </div>
          <div>
            <NumberField
              name="edit_max_time_h"
              label="Prazo Máximo para Edição (em horas)"
              desc="Esse é o número máximo de horas após o agendamento para que um cliente possa editar os dados, como nome, email e formulários de agendamento"
            />
          </div>
          <div>
            <NumberField
              name="cancel_minimum_time_h"
              label="Prazo para cancelamento (em horas)"
              desc={'Esse é o número mínimo de horas antes do horário marcado para que um cliente possa cancelar um agendamento. Por exemplo, se aqui estiver "24", você só pode cancelar até 24 horas antes do horário do seu agendamento'}
            />
          </div>
          <div>
            <NumberField
              name="att_max_time_d"
              label="Prazo máximo de agendamento (em dias)"
              desc={'Esse campo define quantos dias antes um cliente pode marcar um agendamento. Por exemplo, se estiver definido como "30", significa o cliente pode agendar um horário com até 30 dias de antecedência.'}
            />
          </div>
          <div>
            <NumberField
              name="att_minimum_ante_h"
              label="Antecedência Mínima para Agendamento (em horas)"
              desc="Informe o número de horas antes do horário marcado que um cliente pode fazer um agendamento"
            />
          </div>
          <div>
            <NumberField
              name="att_start_h"
              label="Hora de Liberação de Novos Horários"
              desc="A partir do horário configurado, os horários do último dia disponível na agenda são disponibilizados para agendamentos de clientes"
            />
          </div>
        </div>
        <div className="cfg-opt-list mt-4">
          <Opt
            name="is_multi_days"
            label="Agendamentos Flexíveis - Funcionalidade em Testes"
            help="Permite que os usuários da conta criem agendamentos com duração customizada, como agendamentos para períodos de vários dias"
          />
          <Opt
            name="b_calendar_restrict"
            label="Restringir Agendamentos"
            help="Restringir a distribuição de agendamentos dentro da propria agenda, quando ativado somente serão considerados os agendamentos dentro da propria agenda para a distribuição automática"
            defaultChecked
          />
        </div>
      </Group>
    </StepForm>
  );
}

function TemplateStep() {
  const [bookingFlow, setBookingFlow] = useState("auto");
  const [template, setTemplate] = useState("default");
  const [weekday, setWeekday] = useState("0");
  // The live account's saved flow ("0") matches no option, so the field shows empty there.
  const [flow, setFlow] = useState("");
  return (
    <StepForm>
      <Group title="Exibição da Tela de Agendamento">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Combobox id="booking_flow" label="Modelo da página de agendamento" options={BOOKING_FLOWS} value={bookingFlow} onChange={setBookingFlow} placeholder="Selecione..." required clearable={false} />
            <p className="hinput-desc">Define qual tela pública de agendamento esta organização utiliza. Em &quot;Automático&quot;, o sistema decide pela data de criação da conta.</p>
          </div>
          <div>
            <Combobox id="template" label="Modelo da Tela da Agenda" options={SCREEN_TEMPLATES} value={template} onChange={setTemplate} placeholder="Selecione..." required clearable={false} />
          </div>
          <div>
            <Combobox id="initial_weekday" label="Primeiro dia da Semana" options={WEEKDAYS} value={weekday} onChange={setWeekday} placeholder="Selecione..." required clearable={false} />
          </div>
          <div>
            <Combobox id="flow" label="Fluxo de Agendamento" options={FLOWS} value={flow} onChange={setFlow} placeholder="Selecione..." required clearable={false} />
          </div>
          <div>
            <Field name="g_tag" label="Id da Métrica - Google Analytics" />
          </div>
        </div>
        <div className="cfg-opt-list mt-4">
          <Opt
            name="is_display_endtime"
            label="Exibir Horário Final"
            help="Selecione caso queira exibir o horário inicial e final na tela de agendamento. Deixe desmarcado para exibir apenas o horário inicial"
          />
          <Opt
            name="is_display_availability"
            label="Exibir Número de Vagas"
            help="Selecione caso queira exibir o horário inicial e final na tela de agendamento. Deixe desmarcado para exibir apenas o horário inicial"
          />
        </div>
      </Group>
    </StepForm>
  );
}

function DataStep() {
  const [today] = useState(() => new Date());
  const [birth, setBirth] = useState<Date | null>(null);
  const [address, setAddress] = useState("");
  return (
    <StepForm>
      <Group title="Responsável">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field name="full_name" label="Nome completo do Responsável" required />
          <Field name="personal_identification_number" label="Cadastro de Pessoa Física (CPF)" required placeholder="000.000.000-00" mask="000.000.000-00" />
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_date_of_birth">
              Data de nascimento
            </label>
            <DatePicker id="id_date_of_birth" name="date_of_birth" ariaLabel="Data de nascimento" value={birth} onChange={setBirth} today={today} />
          </div>
          <Field name="email" type="email" label="E-mail" required />
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label">
              Telefone <span className="hinput-req">*</span>
            </label>
            <PhoneInput name="phone_number" id="id_phone_number" label="Telefone" />
          </div>
        </div>
      </Group>
      <Group title="Negócio" bodyClass="space-y-4">
        <div className="hinput-field hinput-field--block">
          <label className="hinput-label" htmlFor="id_business_description">
            Descrição do negócio/atividade<span className="hinput-req">*</span>
          </label>
          <textarea className="htextarea" rows={3} name="business_description" id="id_business_description" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field name="business_website" type="url" label="Website ou Redes Sociais" placeholder="https://" />
          <div className="hinput-field hinput-field--block">
            {/* The account has no saved addresses to pick from. */}
            <Combobox id="address" label="Endereço Fiscal" options={[]} value={address} onChange={setAddress} placeholder="Escolha o endereço" />
          </div>
        </div>
      </Group>
      <Group title="Recebimentos">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberField name="monthly_transaction_volume" label="Expectativa do valor mensal recebido pela integração" step="0.01" min="0" />
          <NumberField name="payment_max_value" label="Valor Máximo de um pagamento individual" step="0.01" min="1" defaultValue="1.0" />
        </div>
      </Group>
      <Group title="Termos">
        <div className="cfg-opt-list">
          <Opt name="terms_accepted" label="Concordância com os Termos de Serviço" />
        </div>
      </Group>
    </StepForm>
  );
}

export function OrgSettings() {
  const [step, setStep] = useState<Step>("business");
  // Every step is (re)loaded fresh when opened, like the original's htmx swap.
  const [reload, setReload] = useState(0);
  const open = (id: Step) => {
    setStep(id);
    setReload((r) => r + 1);
  };

  const panel: Record<Step, ReactNode> = {
    business: <BusinessStep />,
    config: <ConfigStep />,
    privacy: <PrivacyStep />,
    policy: <PolicyStep />,
    emails: <EmailsStep onCancel={() => open("emails")} />,
    operation: <OperationStep />,
    template: <TemplateStep />,
    data: <DataStep />,
  };

  return (
    <div className="cfg-grid min-w-0 lg:grid lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-x-8">
      <div className="cfg-nav-col hui-reveal">
        <nav className="cfg-nav--stepper">
          <ol className="hstepper hstepper--lg hstepper--responsive hstepper--nav" role="list" aria-label="Seções das configurações da organização">
            {STEPS.map((s, i) => (
              <li key={s.id} className="hstepper__step" data-status={step === s.id ? "active" : "inactive"} data-clickable="true">
                <button type="button" className="hstepper__step-button" aria-current={step === s.id ? "step" : undefined} onClick={() => open(s.id)}>
                  <span className="hstepper__indicator">
                    <span className="hstepper__icon">
                      <span className="hstepper__num">{i + 1}</span>
                    </span>
                  </span>
                  <span className="hstepper__content">
                    <span className="hstepper__title">{s.title}</span>
                  </span>
                </button>
                {i < STEPS.length - 1 && <span className="hstepper__separator" aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </nav>
      </div>
      <div id="org-settings-panel" className="min-w-0" key={reload}>
        {panel[step]}
      </div>
    </div>
  );
}
