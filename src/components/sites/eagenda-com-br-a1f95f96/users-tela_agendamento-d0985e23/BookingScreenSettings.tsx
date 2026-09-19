"use client";

import dynamic from "next/dynamic";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ColorPicker } from "../shared/ColorPicker";
import { Combobox } from "../shared/Combobox";
import { FilePicker } from "../shared/FilePicker";
import { PhoneInput } from "../shared/PhoneInput";
import { SaveBar } from "../shared/SaveBar";
import { CepField, fillFromCep, type CepAddress } from "../shared/CepField";
import { COUNTRY_OPTIONS, useGeoCascade } from "../shared/useGeoCascade";
import { ROUTES } from "../shared/Sidebar";
import { AddAppointmentIcon, CaretDownIcon, CheckboxMark, ExternalLinkIcon, FlowIcon, InfoIcon, PenIcon, RefreshIcon, SaveIcon } from "../shared/icons";

// CKEditor touches `window` on import, so it only loads in the browser.
const RichTextEditor = dynamic(() => import("../shared/RichTextEditor").then((m) => m.RichTextEditor), { ssr: false });


// Mock account (the live page shows the real business name and public slug here).
const ACCOUNT = { name: "Minha Empresa", slug: "minhaempresa" };

type Tab = "identity" | "contact" | "appearance" | "address" | "display" | "groups";
type Flow = "auto" | "legacy" | "modern" | "new";
// "Automático" resolves on the server by the account's creation date; this account gets the new screen.
const RESOLVED_FLOW = "new";

const STEPS: { id: Tab; title: string; legacyOnly?: boolean }[] = [
  { id: "identity", title: "Identidade" },
  { id: "contact", title: "Contato" },
  { id: "appearance", title: "Aparência" },
  { id: "address", title: "Endereço" },
  { id: "display", title: "Exibição", legacyOnly: true },
  { id: "groups", title: "Grupos", legacyOnly: true },
];

const FLOW_OPTIONS = [
  { value: "auto", label: "Automático (padrão do sistema)" },
  { value: "legacy", label: "Tela clássica" },
  { value: "modern", label: "Tela moderna" },
  { value: "new", label: "Tela nova" },
];
const THEME_PRESETS = [
  { value: "custom", label: "Customizado" },
  { value: "default", label: "Padrão" },
];

// The account's saved colours, which are also the "Padrão" preset.
const DEFAULT_COLORS: Record<string, string> = {
  css_save_button_background_color: "#584CB1",
  css_header_background_color: "#201E1F",
  css_social_bg_color: "#584CB1",
  css_delete_button_background_color: "#B14C4C",
  css_module_link_color: "#584CB1",
  css_button_nav_background_color: "#584CB1",
  css_card_background_color: "#FFFFFF",
  banner_overlay_bg_color: "#FFFFFF",
};
/** The "Ver todas as cores" blocks; `modern` ones only show on the modern screen. */
const ADVANCED_COLORS = [
  { modern: true, sub: "Redes Sociais", subDesc: "Botões de redes sociais exibidos no cabeçalho e rodapé", name: "css_social_bg_color", label: "Redes Sociais — Fundo", desc: "Cor de fundo dos botões de redes sociais" },
  { sub: "Cor Secundária", subDesc: "Botões de cancelamento e ações de retorno", name: "css_delete_button_background_color", label: "Cor Secundária — Fundo", desc: "Botões de cancelamento e ações de retorno" },
  { sub: "Corpo da Página", subDesc: "Links clicáveis no conteúdo da página. A cor do texto é ajustada automaticamente para contraste.", name: "css_module_link_color", label: "Corpo — Links", desc: "Cor dos links e textos clicáveis" },
  { modern: true, sub: "Atalhos de Navegação", subDesc: "Botões Painel, Login e Logout exibidos na barra superior", name: "css_button_nav_background_color", label: "Atalhos do Cabeçalho — Fundo", desc: "Botões Painel, Login e Logout na barra superior" },
  { modern: true, sub: "Cards de Serviço e Profissional", subDesc: "Cards que exibem os serviços e profissionais disponíveis", name: "css_card_background_color", label: "Cards — Fundo", desc: "Cor de fundo dos cards de serviço e profissional" },
  { modern: true, sub: "Card Sobreposto ao Banner", subDesc: "Card de título exibido sobre a imagem de capa", name: "banner_overlay_bg_color", label: "Card do Banner — Fundo", desc: "Cor de fundo do card sobre a imagem de capa" },
];

/** Radio tiles of "Bordas Arredondadas" (modern screen): [value, label, preview classes]. */
const RADIUS_GROUPS: { title: string; name: string; checked: string; tiles: [string, string, string][] }[] = [
  {
    title: "Botões e Ícones",
    name: "border_radius_preset",
    checked: "full",
    tiles: [
      ["full", "Alto (padrão)", "w-8 h-4 bg-primary/20 rounded-full"],
      ["medium", "Médio", "w-8 h-4 bg-primary/20 rounded-md"],
      ["low", "Baixo", "w-8 h-4 bg-primary/20 rounded-sm"],
      ["none", "Nenhum", "w-8 h-4 bg-primary/20 rounded-none"],
    ],
  },
  {
    title: "Cards",
    name: "border_radius_card_preset",
    checked: "low",
    tiles: [
      ["full", "Máximo", "w-9 h-6 bg-primary/20 border border-primary/30 rounded-3xl"],
      ["high", "Alto", "w-9 h-6 bg-primary/20 border border-primary/30 rounded-2xl"],
      ["medium", "Médio", "w-9 h-6 bg-primary/20 border border-primary/30 rounded-xl"],
      ["low", "Padrão", "w-9 h-6 bg-primary/20 border border-primary/30 rounded-lg"],
      ["none", "Nenhum", "w-9 h-6 bg-primary/20 border border-primary/30 rounded-none"],
    ],
  },
  {
    title: "Banner",
    name: "border_radius_banner_preset",
    checked: "expand",
    tiles: [
      ["full", "Máximo", "w-10 h-4 bg-primary/20 border border-primary/30 rounded-3xl"],
      ["high", "Alto", "w-10 h-4 bg-primary/20 border border-primary/30 rounded-2xl"],
      ["medium", "Médio", "w-10 h-4 bg-primary/20 border border-primary/30 rounded-xl"],
      ["low", "Padrão", "w-10 h-4 bg-primary/20 border border-primary/30 rounded-lg"],
      ["none", "Nenhum", "w-10 h-4 bg-primary/20 border border-primary/30 rounded-none"],
      ["expand", "Expandir (ponta a ponta)", "w-10 h-4 bg-primary/20 border border-primary/30 rounded-none border-x-0"],
    ],
  },
  {
    title: "Card do Banner",
    name: "banner_overlay_radius",
    checked: "low",
    tiles: [
      ["full", "Máximo", "w-10 h-7 bg-primary/20 border border-primary/30 rounded-t-3xl rounded-b-none"],
      ["high", "Alto", "w-10 h-7 bg-primary/20 border border-primary/30 rounded-t-2xl rounded-b-none"],
      ["medium", "Médio", "w-10 h-7 bg-primary/20 border border-primary/30 rounded-t-xl rounded-b-none"],
      ["low", "Padrão", "w-10 h-7 bg-primary/20 border border-primary/30 rounded-t-lg rounded-b-none"],
      ["none", "Nenhum", "w-10 h-7 bg-primary/20 border border-primary/30 rounded-none"],
    ],
  },
];

// Hidden blocks stay mounted with display:none, like the original's x-show.
const shown = (visible: boolean): CSSProperties | undefined => (visible ? undefined : { display: "none" });

function Group({ title, desc, style, children }: { title: ReactNode; desc?: ReactNode; style?: CSSProperties; children: ReactNode }) {
  return (
    <section className="cfg-group" style={style}>
      <div className="cfg-group-head">
        <h3 className="cfg-group-title">{title}</h3>
        {desc}
      </div>
      <div className="cfg-group-body">{children}</div>
    </section>
  );
}

function TextField({ id, name, label, required, type = "text", defaultValue, placeholder, onKeyDown }: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="hinput-field hinput-field--block">
      <label className="hinput-label" htmlFor={id}>
        {label} {required && <span className="hinput-req">*</span>}
      </label>
      <div className="hinput-wrap">
        <input id={id} className="hinput" type={type} name={name} defaultValue={defaultValue} placeholder={placeholder ?? ""} required={required} onKeyDown={onKeyDown} />
      </div>
    </div>
  );
}

function Option({ name, label, help, defaultChecked, className, style }: {
  name: string;
  label: string;
  help?: string;
  defaultChecked?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`cfg-opt${className ? ` ${className}` : ""}`} style={style}>
      <div>
        <label className="hcheckbox">
          <input type="checkbox" name={name} id={`id_${name}`} className="hcheckbox-input" defaultChecked={defaultChecked} />
          <span className="hcheckbox-box" aria-hidden="true">
            <CheckboxMark />
            <span className="hcheckbox-dash" aria-hidden="true" />
          </span>
          <span className="hcheckbox-label">{label}</span>
        </label>
        {help && <p className="cfg-opt-help">{help}</p>}
      </div>
    </div>
  );
}

export function BookingScreenSettings() {
  const [tab, setTab] = useState<Tab>("identity");
  const [flow, setFlow] = useState<Flow>("auto");
  const effective = flow === "auto" ? RESOLVED_FLOW : flow;
  const isNew = effective === "new";
  const isLegacy = effective === "legacy";
  const isModern = effective === "modern";
  // x-effect in the original: the new screen has no Exibição/Grupos steps.
  const current: Tab = isNew && (tab === "display" || tab === "groups") ? "identity" : tab;

  const [dirty, setDirty] = useState(false);
  const markDirty = () => setDirty(true);

  const [preset, setPreset] = useState("custom");
  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const setColor = (name: string, hex: string) => {
    setColors((c) => ({ ...c, [name]: hex }));
    markDirty();
  };

  const geo = useGeoCascade();
  const addressRef = useRef<HTMLDivElement>(null);
  const fillAddress = async (data: CepAddress) => {
    fillFromCep(addressRef.current, data);
    await geo.setByNames(data.estado, data.localidade);
    markDirty();
  };

  const flowText =
    flow === "auto" ? (
      <span>
        Automático — o sistema decide pela data de criação da conta. Atualmente: <strong className="text-gray-900">{RESOLVED_FLOW === "new" ? "Tela nova" : "Tela clássica"}</strong>
      </span>
    ) : flow === "new" ? (
      <span>Tela nova — personalização enxuta: banner, logotipo, descrição e cor de destaque.</span>
    ) : flow === "legacy" ? (
      <span>Tela clássica — controle completo de cores e o banner tradicional.</span>
    ) : (
      <span>Tela moderna — cores, cards, atalhos, bordas arredondadas e banner com card sobreposto.</span>
    );

  return (
    <div className="cfg-grid min-w-0 lg:grid lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-x-8">
      <div className="cfg-nav-col hui-reveal">
        <nav className="cfg-nav--stepper">
          <ol className="hstepper hstepper--lg hstepper--responsive hstepper--nav" role="list" aria-label="Seções da tela de agendamento">
            {STEPS.map((s, i) => (
              <li key={s.id} className="hstepper__step" data-status={current === s.id ? "active" : "inactive"} data-clickable="true" style={shown(!s.legacyOnly || !isNew)}>
                <button type="button" className="hstepper__step-button" aria-current={current === s.id ? "step" : undefined} onClick={() => setTab(s.id)}>
                  <span className="hstepper__indicator">
                    <span className="hstepper__icon">
                      <span className="hstepper__num">{i + 1}</span>
                    </span>
                  </span>
                  <span className="hstepper__content">
                    <span className="hstepper__title">{s.title}</span>
                  </span>
                </button>
                {/* The original drops the separator only on the very last step (Grupos). */}
                {i < STEPS.length - 1 && <span className="hstepper__separator" aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </nav>
        <div className="cfg-nav-action mt-4">
          <a href={`/${ACCOUNT.slug}/`} target="_blank" rel="noopener noreferrer" title={`/${ACCOUNT.slug}/`} className="hbtn hbtn--secondary hbtn--block">
            <ExternalLinkIcon />
            Abrir tela pública
          </a>
        </div>
      </div>

      <div className="min-w-0">
        <div style={shown(current === "groups")}>
          <div className="hwidget-head">
            <div className="hwidget-titles">
              <h2 className="hwidget-title">Grupos de Agenda</h2>
              <p className="hwidget-desc">
                Crie um fluxo sequencial de 1 a 3 etapas para ajudar o cliente a encontrar a agenda correta. As agendas devem ser vinculadas na última etapa.
              </p>
            </div>
            <div className="hwidget-actions" />
          </div>
          <div className="htable">
            <div className="htable-scroll">
              <table className="htable-table">
                <tbody>
                  <tr>
                    <td className="htable-cell">
                      <div className="flex flex-col items-center justify-center text-center py-10">
                        <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-100 text-slate-500 mb-3">
                          <FlowIcon className="w-5 h-5" />
                        </span>
                        <h3 className="text-base font-bold text-gray-900 nunito-bold">Nenhum grupo configurado</h3>
                        <p className="mt-1 text-sm text-gray-500 inter-regular">Adicione uma etapa inicial para organizar o fluxo da sua tela de agendamento.</p>
                        <div className="mt-4">
                          {/* The group editor isn't cloned yet. */}
                          <a href="#" className="hbtn hbtn--primary hbtn--sm">
                            <AddAppointmentIcon />
                            Adicionar Etapa 1
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="htable-footer" />
          </div>
        </div>

        <form id="booking-screen-form" method="POST" encType="multipart/form-data" className="cfg-form" onSubmit={(e) => e.preventDefault()} onChange={markDirty}>
          <input type="hidden" name="active_tab" value={current} />

          {/* Identidade */}
          <div style={shown(current === "identity")}>
            <div className="cfg-content">
              <Group title="Identidade do Negócio">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField id="id_name" name="name" label="Nome da empresa ou negócio" defaultValue={ACCOUNT.name} />
                  {/* The slug takes no spaces, as in the original. */}
                  <TextField
                    id="id_label"
                    name="label"
                    label="Informe uma sigla ou nome para identificar o seu negócio ou serviço"
                    required
                    defaultValue={ACCOUNT.slug}
                    onKeyDown={(e) => e.key === " " && e.preventDefault()}
                  />
                </div>
                <div className="mt-4" style={shown(!isNew)}>
                  <TextField id="id_short_name" name="short_name" label="Nome curto exibido no menu, ao lado do logotipo" />
                  <div className="cfg-opt mt-3">
                    <div>
                      <label className="hcheckbox">
                        <input type="checkbox" name="hide_short_name" id="id_hide_short_name" className="hcheckbox-input" />
                        <span className="hcheckbox-box" aria-hidden="true">
                          <CheckboxMark />
                          <span className="hcheckbox-dash" aria-hidden="true" />
                        </span>
                        <span className="hcheckbox-label">Ocultar nome curto no menu</span>
                      </label>
                      <p className="cfg-opt-help">Ocultar o nome curto exibido ao lado do logotipo no menu superior</p>
                    </div>
                  </div>
                </div>
              </Group>
              <Group title="Texto da Página Inicial">
                <div className="cfg-editor">
                  <div className="ck-editor-container">
                    <RichTextEditor name="mensagem" id="id_mensagem" className="django_ckeditor_5" maxLength={5000} />
                    <span className="word-count" id="id_mensagem_script-word-count" />
                  </div>
                </div>
              </Group>
            </div>
          </div>

          {/* Contato */}
          <div style={shown(current === "contact")}>
            <div className="cfg-content">
              <Group title="Informações de Contato">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField id="id_email" name="email" type="email" label="E-mail" />
                  <TextField id="id_website" name="website" label="Informe o seu site, se tiver. Inicie com http:// ou https://" />
                  <div className="hinput-field hinput-field--block">
                    <label className="hinput-label">Telefone</label>
                    <PhoneInput name="phone" id="id_phone" label="Telefone" />
                  </div>
                  <div className="hinput-field hinput-field--block">
                    <label className="hinput-label">WhatsApp</label>
                    <PhoneInput name="whatsapp" id="id_whatsapp" label="WhatsApp" />
                  </div>
                </div>
              </Group>
              <Group title="Redes Sociais" desc={<p className="cfg-group-desc">Os links são exibidos no rodapé da sua tela de agendamento.</p>}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <TextField id="id_linkedin_page" name="linkedin_page" label="Página no LinkedIn" />
                  <TextField id="id_instagram_page" name="instagram_page" label="Página no Instagram" />
                  <TextField id="id_facebook_page" name="facebook_page" label="Página no Facebook" />
                  <TextField id="id_twitter_page" name="twitter_page" label="Página no Twitter" />
                  <TextField id="id_youtube_page" name="youtube_page" label="Canal no YouTube" />
                </div>
              </Group>
            </div>
          </div>

          {/* Aparência */}
          <div style={shown(current === "appearance")}>
            <div className="cfg-content">
              <Group
                title="Modelo da Página de Agendamento"
                desc={<p className="cfg-group-desc">Define qual tela pública seus clientes verão. As opções de personalização abaixo se adaptam ao modelo escolhido.</p>}
              >
                <div className="w-full max-w-sm">
                  <Combobox
                    id="booking_flow"
                    label="Modelo"
                    options={FLOW_OPTIONS}
                    value={flow}
                    onChange={(v) => {
                      setFlow(v as Flow);
                      markDirty();
                    }}
                    placeholder="Selecione o modelo"
                    required
                    clearable={false}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600 inter-regular">{flowText}</div>
              </Group>

              <Group
                title={
                  <>
                    <span style={shown(isNew)}>Cor de Destaque</span>
                    <span style={shown(!isNew)}>Paleta de Cores</span>
                  </>
                }
                desc={
                  <p className="cfg-group-desc">
                    <span style={shown(isNew)}>A cor principal de botões, seleção e destaques. O texto sobre ela e os demais tons são calculados automaticamente.</span>
                    <span style={shown(isLegacy)}>Escolha um preset inicial ou personalize manualmente cada cor da sua tela de agendamento.</span>
                    <span style={shown(isModern)}>Personalize as cores da sua tela. Os tons de texto são calculados automaticamente para garantir contraste.</span>
                  </p>
                }
              >
                <div className="w-full max-w-sm mb-4" style={shown(isLegacy)}>
                  <Combobox
                    id="themePresetSelect"
                    label="Preset de cores"
                    options={THEME_PRESETS}
                    value={preset}
                    onChange={(v) => {
                      setPreset(v);
                      // "Padrão" puts every colour back to the default theme.
                      if (v === "default") setColors(DEFAULT_COLORS);
                      markDirty();
                    }}
                    placeholder="Selecione o modelo"
                    clearable={false}
                  />
                </div>
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
                    <ColorPicker
                      name="css_save_button_background_color"
                      label="Cor Principal — Fundo"
                      desc="Botão de agendamento, destaques e interações"
                      value={colors.css_save_button_background_color}
                      onChange={(hex) => setColor("css_save_button_background_color", hex)}
                    />
                    <div style={shown(!isNew)}>
                      <ColorPicker
                        name="css_header_background_color"
                        label="Cabeçalho e Rodapé — Fundo"
                        desc="Cor de fundo da barra superior e do rodapé da página"
                        value={colors.css_header_background_color}
                        onChange={(hex) => setColor("css_header_background_color", hex)}
                      />
                    </div>
                  </div>
                  <div className="mb-4" style={shown(isNew)}>
                    <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={() => setColor("css_save_button_background_color", "#111827")}>
                      <RefreshIcon />
                      Restaurar cor padrão
                    </button>
                  </div>
                  <Option
                    name="booking_footer_use_accent"
                    label="Usar cor de destaque no rodapé"
                    help="Aplica a cor de destaque como fundo do rodapé. A cor dos textos é ajustada automaticamente para manter o contraste."
                    className="mb-4"
                    style={shown(isNew)}
                  />
                  <button type="button" className="cfg-expander" style={shown(!isNew)} onClick={() => setShowAdvanced((a) => !a)}>
                    <span style={shown(!showAdvanced)}>Ver todas as cores</span>
                    <span style={shown(showAdvanced)}>Ocultar ajustes avançados</span>
                    <span className="cfg-expander-chevron" style={showAdvanced ? { transform: "rotate(180deg)" } : undefined}>
                      <CaretDownIcon className="w-4 h-4" />
                    </span>
                  </button>
                  <div className="mt-4 space-y-5" style={shown(showAdvanced && !isNew)}>
                    {ADVANCED_COLORS.map((c) => (
                      <div key={c.name} style={c.modern ? shown(isModern) : undefined}>
                        <p className="cfg-subhead">{c.sub}</p>
                        <p className="cfg-subhead-desc">{c.subDesc}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                          <ColorPicker name={c.name} label={c.label} desc={c.desc} value={colors[c.name]} onChange={(hex) => setColor(c.name, hex)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Group>

              <Group
                title="Bordas Arredondadas"
                desc={<p className="cfg-group-desc">Define o arredondamento dos cantos de botões, cards e imagens na tela de agendamento</p>}
                style={shown(isModern)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                  {RADIUS_GROUPS.map((g) => (
                    <div key={g.name}>
                      <p className="cfg-subhead">{g.title}</p>
                      <div className="flex flex-wrap gap-2">
                        {g.tiles.map(([value, label, preview]) => (
                          <label key={value} className="cursor-pointer">
                            <input type="radio" name={g.name} value={value} defaultChecked={value === g.checked} className="sr-only peer" />
                            <span className="cfg-radio-tile">
                              <span className={`block ${preview}`} />
                              {label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Group>

              <Group
                title="Imagens"
                desc={
                  <p className="cfg-group-desc" style={shown(isNew)}>
                    No modelo novo, a imagem de fundo vira o banner desfocado e o logotipo, quando presente, substitui o título da página.
                  </p>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FilePicker
                      name="imagem"
                      label="Imagem destacada na tela inicial de agendamento"
                      desc="Recomendamos imagem com tamanho 1920x560 px e até 500kb para melhor velocidade de carregamento da página"
                    />
                  </div>
                  <div>
                    <FilePicker name="background_img" label="Imagem de Fundo" desc="Recomendamos imagem com tamanho até 500kb para melhor velocidade de carregamento da página" />
                  </div>
                  <div style={shown(!isNew)}>
                    <div>
                      <FilePicker name="background_img_mobile" label="Imagem - Otimizada para Dispositivos Móveis" desc="Recomendamos imagem 1350x1080 pixels" />
                    </div>
                  </div>
                  <div>
                    <FilePicker name="logo" label="Logotipo" desc="Recomendamos imagem com tamanho 30x30" />
                  </div>
                  <div>
                    <FilePicker name="favicon" label="Favicon" desc="(.ico|.png|.gif - 16x16|32x32 px)" />
                  </div>
                </div>
              </Group>
            </div>
          </div>

          {/* Exibição (classic and modern screens only) */}
          <div style={shown(current === "display")}>
            <div className="cfg-content">
              <Group title="Opções de Exibição" desc={<p className="cfg-group-desc">Controle o que é exibido ou ocultado na sua tela pública de agendamento.</p>}>
                <div style={shown(isNew)}>
                  <div className="halert halert--accent" role="alert">
                    <span className="halert-indicator">
                      <InfoIcon className="w-[18px] h-[18px]" />
                    </span>
                    <div className="halert-content">
                      <p className="halert-description">O modelo novo deriva a exibição automaticamente — não há opções de exibição a configurar aqui.</p>
                    </div>
                    <div className="halert-actions" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3" style={shown(!isNew)}>
                  <Option name="pagina_completa" label="Mostrar na página inicial detalhes extras sobre agendamento para todas as agendas disponíveis" defaultChecked />
                  <Option name="services_show" label="Mostrar serviços nas agendas" />
                  <Option
                    name="img_autofit"
                    label="Ajustar imagem"
                    help="Ao selecionar essa opção, a imagem é ajustada para melhor exibição em cada dispositivo, podendo ocorrer cortes na imagem"
                    defaultChecked
                    style={shown(isModern)}
                  />
                  <Option name="show_footer_logo" label="Exibir logotipo no rodapé" style={shown(isModern)} />
                </div>
              </Group>
              <Group title="Card Sobreposto ao Banner" desc={<p className="cfg-group-desc">Controle o que é exibido no card sobre a imagem de capa.</p>} style={shown(isModern)}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
                  <Option name="banner_overlay_title" label="Exibir título no banner" help="Exibe o título da organização/fluxo/unidade em um card sobreposto ao banner." />
                  <Option name="banner_overlay_description" label="Exibir descrição no banner" help="Exibe a descrição da organização/fluxo/unidade no card sobreposto ao banner." />
                  <Option name="banner_overlay_use_blur" label="Usar efeito blur (vidro fosco)" help="Efeito glassmorphism — a cor de fundo é aplicada com baixa opacidade sobre o blur." />
                </div>
              </Group>
            </div>
          </div>

          {/* Endereço */}
          <div ref={addressRef} style={shown(current === "address")}>
            <div className="cfg-content">
              <Group
                title="Localização"
                desc={
                  <p className="cfg-group-desc">
                    Seu endereço principal é exibido na tela de agendamento e usado como padrão nas agendas, exceto quando uma unidade possuir endereço próprio.
                  </p>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CepField onFound={fillAddress} />
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
              </Group>
              <Group title="Endereço Completo">
                <div className="space-y-4">
                  <TextField id="id_street" name="street_f" label="Logradouro" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField id="id_number" name="number" label="Número" />
                    <TextField id="id_complement" name="complement" label="Complemento" />
                    <TextField id="id_neighbourhood" name="neighbourhood_f" label="Bairro" />
                    <TextField id="id_district" name="district" label="Distrito" />
                  </div>
                </div>
              </Group>
            </div>
          </div>

          <div style={shown(current !== "groups")}>
            <SaveBar
              backHref={ROUTES.painel}
              saveLabel="Salvar"
              saveIcon={<SaveIcon />}
              dirty={dirty}
              toastIcon={<PenIcon className="w-4 h-4" />}
              toastTitle="Alterações não salvas"
              toastSub="Salve para aplicar as mudanças."
            />
          </div>
        </form>
      </div>
    </div>
  );
}
