import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderTree,
  Cloud,
  BarChart3,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

const nav = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/alunos", label: "Alunos", icon: Users },
  { to: "/documentos", label: "Documentos", icon: FileText },
  { to: "/organizacao", label: "Organização", icon: FolderTree },
  { to: "/integracoes", label: "Integrações", icon: Cloud },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0 ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">Portal Escolar</p>
            <p className="text-xs text-sidebar-foreground/70">Gestão de documentos</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setAberto(false)}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className: "bg-sidebar-accent text-sidebar-accent-foreground",
              }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mx-3 mt-4 rounded-lg bg-sidebar-accent/60 p-3 text-xs text-sidebar-foreground/80">
          Ano letivo <strong className="text-sidebar-foreground">2026</strong>
          <br />
          Dados salvos na nuvem.
        </div>
      </aside>

      {aberto && (
        <button
          aria-label="Fechar menu"
          onClick={() => setAberto(false)}
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-border bg-card/90 px-4 py-4 backdrop-blur md:px-8">
          <button
            className="rounded-lg border border-border p-2 text-foreground lg:hidden"
            onClick={() => setAberto((v) => !v)}
            aria-label="Abrir menu"
          >
            {aberto ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold text-foreground md:text-xl">{title}</h1>
            {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions}
        </header>
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-5 ${className}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {children}
    </div>
  );
}

export function StatusPill({ status }: { status: "pendente" | "aprovado" | "recusado" }) {
  const map = {
    pendente: "bg-warning/20 text-warning-foreground",
    aprovado: "bg-success/15 text-success",
    recusado: "bg-destructive/15 text-destructive",
  } as const;
  const label = { pendente: "Pendente", aprovado: "Aprovado", recusado: "Recusado" } as const;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${map[status]}`}>
      {label[status]}
    </span>
  );
}

export const btnPrimary =
  "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-deep disabled:opacity-50";
export const btnGhost =
  "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary";
export const inputCls =
  "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40";