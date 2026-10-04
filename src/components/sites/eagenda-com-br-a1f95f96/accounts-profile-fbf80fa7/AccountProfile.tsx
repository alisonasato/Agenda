"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import {
  CheckCircleIcon,
  CheckboxMark,
  ConnectIcon,
  DangerCircleIcon,
  EyeClosedIcon,
  EyeIcon,
  InboxIcon,
  LetterIcon,
  LockDuoIcon,
  MailSealedIcon,
  SaveIcon,
  ShieldIcon,
  ShieldSplitIcon,
  TrashIcon,
  UserCircleIcon,
  WarningTriangleIcon,
} from "../shared/icons";
import { Modal, ModalSubmit } from "../shared/Modal";
import { PhoneInput } from "../shared/PhoneInput";
import { update, useData } from "@/lib/seiri/store";
import { SOCIAL_PROVIDERS } from "@/lib/seiri/types";

type Dialog = "perfil" | "senha" | "email" | "social" | "novidades" | "encerrar" | null;

const ORG_COLUMNS = ["Conta", "Função", "Status", "Contexto"];
const SLOTS = 10;

const PASSWORD_RULES = [
  "Sua senha não pode ser muito parecida com o resto das suas informações pessoais.",
  "Sua senha precisa conter pelo menos 8 caracteres.",
  "Sua senha não pode ser uma senha comumente utilizada.",
  "Sua senha não pode ser inteiramente numérica.",
];

function Row({ icon, title, chips, desc, action }: { icon: ReactNode; title: string; chips?: ReactNode; desc: string; action: ReactNode }) {
  return (
    <div className="px-4 md:px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <span className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5">{icon}</span>
        <div className="min-w-0">
          {chips ? (
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              {chips}
            </div>
          ) : (
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
          )}
          <p className="text-sm text-gray-600">{desc}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

const pending = (
  <span className="hchip hchip--warning hchip--soft hchip--sm">
    <WarningTriangleIcon className="w-3.5 h-3.5" />
    Pendente
  </span>
);
const verified = (
  <span className="hchip hchip--success hchip--soft hchip--sm">
    <CheckCircleIcon className="w-3.5 h-3.5" />
    Verificado
  </span>
);

/** "Sua Conta": the signed-in user's own settings, each one behind its own modal. */
export function AccountProfile() {
  const data = useData();
  const owner = data.members.find((m) => m.profile === "owner") ?? data.members[0];
  const { profile } = data;
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = () => setDialog(null);

  const orgRows = [
    { account: profile.orgSlug, role: "Proprietário da Conta", status: "Ativo", context: "Conta ativa" },
    ...data.accounts.map((a) => ({ account: a.slug || a.name, role: "Filial", status: a.plan || "Sem plano", context: "" })),
  ];

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <span className="havatar havatar--lg">
            <span className="havatar-fallback">{owner?.name.slice(0, 1)}</span>
          </span>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{owner?.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
              <span className="truncate">{owner?.email}</span>
              {profile.emailVerified ? verified : pending}
            </div>
            <p className="mt-1 text-sm text-gray-500 truncate">Conta ativa: {profile.orgSlug}</p>
          </div>
        </div>
      </div>

      <div className="hui-card hui-card--flush">
        <div className="px-4 md:px-6 py-4 border-b border-gray-100">
          <h2 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2.5">
            <ShieldIcon className="w-5 h-5 text-gray-400" />
            Configurações da Conta
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          <Row
            icon={<UserCircleIcon className="w-5 h-5" />}
            title="Perfil"
            desc="Atualize seus dados pessoais e mantenha suas informações de contato sempre corretas."
            action={
              <button type="button" className="w-full lg:w-auto justify-center flex-shrink-0 hbtn hbtn--secondary hbtn--sm" onClick={() => setDialog("perfil")}>
                Editar Perfil
              </button>
            }
          />
          <Row
            icon={<LockDuoIcon className="w-5 h-5" />}
            title="Senha"
            desc="Troque sua senha regularmente e evite reutilizar credenciais em outros serviços."
            action={
              <button type="button" className="w-full lg:w-auto justify-center flex-shrink-0 hbtn hbtn--secondary hbtn--sm" onClick={() => setDialog("senha")}>
                Alterar Senha
              </button>
            }
          />
          <Row
            icon={<LetterIcon className="w-5 h-5" />}
            title="Verificação de Email"
            chips={profile.emailVerified ? verified : pending}
            desc="Gerencie seus endereços de email e defina qual será o principal para autenticação e notificações."
            action={
              <button type="button" className="w-full lg:w-auto justify-center flex-shrink-0 hbtn hbtn--secondary hbtn--sm" onClick={() => setDialog("email")}>
                Gerenciar Email
              </button>
            }
          />
          <Row
            icon={<ConnectIcon className="w-5 h-5" />}
            title="Contas Vinculadas"
            desc="Conecte ou remova provedores externos para simplificar o login com Google, Microsoft e outros serviços."
            action={
              <button type="button" className="w-full lg:w-auto justify-center flex-shrink-0 hbtn hbtn--secondary hbtn--sm" onClick={() => setDialog("social")}>
                Gerenciar Contas
              </button>
            }
          />
          <Row
            icon={<MailSealedIcon className="w-5 h-5" />}
            title="Novidades"
            desc="Receba avisos por email quando publicamos atualizações e novos recursos da plataforma."
            action={
              <button
                type="button"
                className="w-full lg:w-auto justify-center flex-shrink-0 hbtn hbtn--secondary hbtn--sm"
                onClick={() => setDialog("novidades")}
              >
                Novidades
              </button>
            }
          />
          <Row
            icon={<ShieldSplitIcon className="w-5 h-5" />}
            title="Duplo Fator de Autenticação"
            chips={
              <>
                <span className="hchip hchip--default hchip--soft hchip--sm">Inativo</span>
                {!profile.emailVerified && (
                  <span className="hchip hchip--warning hchip--soft hchip--sm">
                    <WarningTriangleIcon className="w-3.5 h-3.5" />
                    Requer email verificado
                  </span>
                )}
              </>
            }
            desc="Adicione uma camada extra de segurança ao login por meio de códigos temporários ou aplicativos autenticadores."
            action={
              <button type="button" className="w-full lg:w-auto justify-center flex-shrink-0 hbtn hbtn--secondary hbtn--sm" onClick={() => setDialog("email")}>
                {profile.emailVerified ? "Gerenciar" : "Validar Email"}
              </button>
            }
          />
        </div>
      </div>

      <div>
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Organizações</h2>
            <p className="hwidget-desc">As contas às quais seu usuário está vinculado.</p>
          </div>
          <div className="hwidget-actions" />
        </div>
        <div className={`htable${orgRows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.5rem" } as CSSProperties}>
          <div className="htable-scroll">
            <table className="htable-table w-full htable-fixed">
              <thead>
                <tr>
                  {ORG_COLUMNS.map((c) => (
                    <th key={c} className="htable-col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orgRows.map((row) => (
                  <tr key={row.account}>
                    <td className="htable-cell">
                      <span className="text-sm font-semibold text-gray-900">{row.account}</span>
                    </td>
                    <td className="htable-cell">
                      <span className="hchip hchip--default hchip--soft hchip--sm">{row.role}</span>
                    </td>
                    <td className="htable-cell">
                      <span className={`hchip ${row.status === "Ativo" ? "hchip--success" : "hchip--default"} hchip--primary hchip--sm`}>{row.status}</span>
                    </td>
                    <td className="htable-cell">{row.context && <span className="hchip hchip--accent hchip--primary hchip--sm">{row.context}</span>}</td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, SLOTS - orgRows.length) }, (_, i) => (
                  <tr key={i} className="htable-row--empty" aria-hidden="true">
                    {ORG_COLUMNS.map((c) => (
                      <td key={c} className="htable-cell" />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!orgRows.length && (
            <div className="htable-empty" role="status" aria-live="polite">
              <div className="hempty hempty--inline hui-reveal">
                <InboxIcon className="hempty-icon" />
                <h3 className="hempty-title nunito-bold">Nada por aqui ainda</h3>
                <p className="hempty-desc inter-regular">Assim que houver registros, eles aparecerão nesta tabela.</p>
              </div>
            </div>
          )}
          <div className="htable-footer" />
        </div>
      </div>

      <div className="hui-card hui-card--flush">
        <div className="px-4 md:px-6 py-4 border-b border-danger/20">
          <h2 className="text-base md:text-lg font-bold text-danger flex items-center gap-2.5">
            <DangerCircleIcon className="w-5 h-5" />
            Zona de perigo
          </h2>
        </div>
        <Row
          icon={<TrashIcon className="w-5 h-5" />}
          title="Encerrar Conta"
          desc={`Encerra seu usuário e desativa a conta ${profile.orgSlug} e suas filiais, junto com o acesso dos outros membros. Não é possível desfazer.`}
          action={
            <button
              type="button"
              className="w-full lg:w-auto justify-center flex-shrink-0 hbtn hbtn--danger-soft hbtn--sm"
              onClick={() => setDialog("encerrar")}
            >
              Encerrar Conta
            </button>
          }
        />
      </div>

      {dialog === "perfil" && <PersonalModal onClose={close} />}
      {dialog === "senha" && <PasswordModal onClose={close} />}
      {dialog === "email" && <EmailModal onClose={close} />}
      {dialog === "social" && <SocialModal onClose={close} />}
      {dialog === "novidades" && <NewsletterModal onClose={close} />}
      {dialog === "encerrar" && <DeleteModal onClose={close} />}
    </div>
  );
}

function PersonalModal({ onClose }: { onClose: () => void }) {
  const data = useData();
  const owner = data.members.find((m) => m.profile === "owner") ?? data.members[0];
  const [name, setName] = useState(owner?.name ?? "");
  const [phone, setPhone] = useState(owner?.phone ?? "");

  const save = () => {
    if (!name.trim() || !owner) return;
    update((d) => ({ ...d, members: d.members.map((m) => (m.id === owner.id ? { ...m, name: name.trim(), phone } : m)) }));
    onClose();
  };

  return (
    <Modal
      id="personal-modal"
      title="Editar Perfil"
      size="md"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <ModalSubmit id="personal-modal" form="personal-form" icon={<SaveIcon />} label="Salvar" />
        </>
      }
    >
      <form
        id="personal-form"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label" htmlFor="id_name">
                Nome <span className="hinput-req">*</span>
              </label>
              <div className="hinput-wrap">
                <input id="id_name" className="hinput" type="text" name="name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>
          </div>
          <div>
            <PhoneInput id="id_old_phone" name="old_phone" label="Telefone" value={phone} onChange={setPhone} />
          </div>
        </div>
      </form>
    </Modal>
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // The clone has no sign-in, so the only thing it can check is what the original checks in the browser.
  const submit = (form: HTMLFormElement) => {
    const values = new FormData(form);
    const next = String(values.get("password1") ?? "");
    const again = String(values.get("password2") ?? "");
    if (next.length < 8) return setError("Sua senha precisa conter pelo menos 8 caracteres.");
    if (/^\d+$/.test(next)) return setError("Sua senha não pode ser inteiramente numérica.");
    if (next !== again) return setError("As duas senhas não conferem.");
    setError("");
    setDone(true);
  };

  return (
    <Modal
      id="password-change-modal"
      title="Alterar Senha"
      size="md"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <ModalSubmit id="password-change-modal" form="password-change-form" icon={<LockDuoIcon />} label="Alterar Senha" />
        </>
      }
    >
      <form
        id="password-change-form"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          submit(e.currentTarget);
        }}
      >
        <div className="space-y-4">
          <PasswordField id="id_oldpassword" name="oldpassword" label="Senha Atual" autoComplete="current-password" />
          <PasswordField id="id_password1" name="password1" label="Nova Senha" autoComplete="new-password" />
          <div className="-mt-2 text-xs text-gray-500 inter-regular">
            <ul className="list-disc pl-5 space-y-0.5">
              {PASSWORD_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
          <PasswordField id="id_password2" name="password2" label="Nova Senha (novamente)" autoComplete="off" />
          {error && <p className="hinput-error">{error}</p>}
          {done && <p className="text-sm text-gray-600 inter-regular">Senha alterada.</p>}
        </div>
      </form>
    </Modal>
  );
}

function PasswordField({ id, name, label, autoComplete }: { id: string; name: string; label: string; autoComplete: string }) {
  const [reveal, setReveal] = useState(false);
  return (
    <div className="hinput-field hinput-field--block">
      <label className="hinput-label" htmlFor={id}>
        {label} <span className="hinput-req">*</span>
      </label>
      <div className="hinput-wrap">
        <span className="hinput-icon">
          <LockDuoIcon />
        </span>
        <input
          id={id}
          name={name}
          autoComplete={autoComplete}
          className="hinput hinput--with-toggle hinput--with-icon"
          type={reveal ? "text" : "password"}
          required
        />
        <button type="button" tabIndex={-1} className="hpwd-toggle" aria-label={reveal ? "Ocultar senha" : "Mostrar senha"} onClick={() => setReveal(!reveal)}>
          {reveal ? <EyeClosedIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

function EmailModal({ onClose }: { onClose: () => void }) {
  const data = useData();
  const owner = data.members.find((m) => m.profile === "owner") ?? data.members[0];
  const { profile } = data;
  const addresses = [owner?.email ?? "", ...profile.extraEmails].filter(Boolean);
  const [picked, setPicked] = useState(addresses[0] ?? "");
  const [added, setAdded] = useState("");
  const [notice, setNotice] = useState("");

  const isMain = picked === owner?.email;
  const act = (what: "primary" | "send" | "remove") => {
    if (what === "send") return setNotice(`Verificação reenviada para ${picked}.`);
    if (what === "primary") {
      if (isMain || !owner) return;
      update((d) => ({
        ...d,
        members: d.members.map((m) => (m.id === owner.id ? { ...m, email: picked } : m)),
        profile: { ...d.profile, emailVerified: false, extraEmails: [...d.profile.extraEmails.filter((e) => e !== picked), owner.email] },
      }));
      return setNotice(`${picked} agora é o endereço principal.`);
    }
    if (isMain) return setNotice("O endereço principal não pode ser removido.");
    update((d) => ({ ...d, profile: { ...d.profile, extraEmails: d.profile.extraEmails.filter((e) => e !== picked) } }));
    setPicked(owner?.email ?? "");
    setNotice("");
  };

  const add = () => {
    const value = added.trim();
    if (!value || addresses.includes(value)) return;
    update((d) => ({ ...d, profile: { ...d.profile, extraEmails: [...d.profile.extraEmails, value] } }));
    setAdded("");
    setNotice(`Verificação enviada para ${value}.`);
  };

  return (
    <Modal
      id="email-manage-modal"
      title="Gerenciar Email"
      onClose={onClose}
      footer={
        <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
          Fechar
        </button>
      }
    >
      <h3 className="text-sm text-gray-900 nunito-bold mb-3">Endereços de Email</h3>
      <div className="hradiorow-stack">
        {addresses.map((address) => (
          <label key={address} className="hradiorow">
            <input type="radio" name="email" value={address} className="hradiorow-input" checked={picked === address} onChange={() => setPicked(address)} />
            <span className="hradiorow-mark" aria-hidden="true" />
            <span className="hradiorow-content">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-900 nunito-bold break-all">{address}</span>
                {address === owner?.email && profile.emailVerified ? (
                  <span className="hchip hchip--success hchip--primary hchip--sm">Verificado</span>
                ) : (
                  <span className="hchip hchip--warning hchip--primary hchip--sm">Não verificado</span>
                )}
              </span>
            </span>
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={() => act("primary")}>
          <CheckCircleIcon />
          Tornar Principal
        </button>
        <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={() => act("send")}>
          <MailSealedIcon />
          Reenviar Verificação
        </button>
        <button type="button" className="hbtn hbtn--danger-soft hbtn--sm" onClick={() => act("remove")}>
          <TrashIcon />
          Remover
        </button>
      </div>
      {notice && <p className="mt-3 text-sm text-gray-600 inter-regular">{notice}</p>}

      <div className="my-6 border-t border-gray-100" />
      <h3 className="text-sm text-gray-900 nunito-bold mb-3">Adicionar Novo Email</h3>
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-80">
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_email">
              Email <span className="hinput-req">*</span>
            </label>
            <div className="hinput-wrap">
              <input
                id="id_email"
                className="hinput"
                type="email"
                name="email"
                placeholder="Endereço de e-mail"
                required
                value={added}
                onChange={(e) => setAdded(e.target.value)}
              />
            </div>
          </div>
        </div>
        <button type="button" className="hbtn hbtn--primary" onClick={add}>
          <LetterIcon />
          Adicionar
        </button>
      </div>
    </Modal>
  );
}

function SocialModal({ onClose }: { onClose: () => void }) {
  const { profile } = useData();
  const toggle = (provider: string) =>
    update((d) => ({
      ...d,
      profile: {
        ...d.profile,
        socialAccounts: d.profile.socialAccounts.includes(provider)
          ? d.profile.socialAccounts.filter((p) => p !== provider)
          : [...d.profile.socialAccounts, provider],
      },
    }));

  return (
    <Modal
      id="social-connections-modal"
      title="Contas Vinculadas"
      onClose={onClose}
      footer={
        <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
          Fechar
        </button>
      }
    >
      {profile.socialAccounts.length ? (
        <div className="flex flex-col gap-1">
          {profile.socialAccounts.map((provider) => (
            <div key={provider} className="flex items-center gap-3 rounded-2xl px-4 py-3">
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-gray-900 nunito-bold truncate">{provider}</span>
                <span className="block text-xs text-gray-500 inter-regular truncate">Conectada</span>
              </span>
              <button type="button" className="hbtn hbtn--danger-soft hbtn--sm" onClick={() => toggle(provider)}>
                Remover
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 inter-regular">Você ainda não possui contas de redes ou serviços externos conectadas a este usuário.</p>
      )}

      <div className="my-6 border-t border-gray-100" />
      <h3 className="text-sm text-gray-900 nunito-bold mb-3">Adicionar Conta de Terceiros</h3>
      <div className="flex flex-col gap-1">
        {SOCIAL_PROVIDERS.filter((p) => !profile.socialAccounts.includes(p)).map((provider) => (
          <button
            key={provider}
            type="button"
            title={provider}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-[color:var(--field-hover)] text-left"
            onClick={() => toggle(provider)}
          >
            <ConnectIcon className="w-5 h-5 text-gray-400" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-gray-900 nunito-bold truncate">{provider}</span>
              <span className="block text-xs text-gray-500 inter-regular truncate">Conectar sua conta</span>
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

function NewsletterModal({ onClose }: { onClose: () => void }) {
  const { profile } = useData();
  const toggle = () => update((d) => ({ ...d, profile: { ...d.profile, newsletter: !d.profile.newsletter } }));

  return (
    <Modal
      id="newsletter-modal"
      title="Novidades"
      size="md"
      onClose={onClose}
      footer={
        <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
          Fechar
        </button>
      }
    >
      <div className="flex flex-col items-start gap-4">
        <span className="hchip hchip--default hchip--primary hchip--sm">{profile.newsletter ? "Você está inscrito" : "Você não está inscrito"}</span>
        <button type="button" className={`hbtn ${profile.newsletter ? "hbtn--secondary" : "hbtn--primary"}`} onClick={toggle}>
          <MailSealedIcon />
          {profile.newsletter ? "Cancelar inscrição" : "Inscrever-se"}
        </button>
      </div>
    </Modal>
  );
}

function DeleteModal({ onClose }: { onClose: () => void }) {
  const data = useData();
  const owner = data.members.find((m) => m.profile === "owner") ?? data.members[0];
  const [acknowledged, setAcknowledged] = useState(false);
  const [typed, setTyped] = useState("");
  const ready = acknowledged && typed.trim() === owner?.email;

  return (
    <Modal
      id="account-delete-modal"
      title="Encerrar Conta"
      size="md"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="account-delete-form" className="hbtn hbtn--danger" disabled={!ready}>
            <TrashIcon />
            Encerrar Conta
          </button>
        </>
      }
    >
      <form
        id="account-delete-form"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <p className="text-sm text-gray-900 nunito-bold">Ao encerrar, isto acontece:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600">
          <li>Seu usuário perde o acesso à plataforma e a sessão é encerrada na hora.</li>
          <li>A conta {data.profile.orgSlug} e suas filiais são desativadas, e os outros membros perdem o acesso junto.</li>
          <li>Agendamentos, clientes e configurações deixam de ficar disponíveis.</li>
          <li>Não é possível desfazer.</li>
        </ul>
        <div className="mt-4 space-y-4">
          <label className="hcheckbox hcheckbox--sm">
            <input
              type="checkbox"
              name="confirmar"
              id="account-delete-ack"
              className="hcheckbox-input"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
            />
            <span className="hcheckbox-box" aria-hidden="true">
              <CheckboxMark />
              <span className="hcheckbox-dash" aria-hidden="true" />
            </span>
            <span className="hcheckbox-label">Entendo que esta ação não pode ser desfeita.</span>
          </label>
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="account-delete-gate">
              Digite seu e-mail para confirmar
            </label>
            <div className="hinput-wrap">
              <input
                id="account-delete-gate"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className="hinput"
                type="text"
                name="confirm_email"
                placeholder={owner?.email}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
