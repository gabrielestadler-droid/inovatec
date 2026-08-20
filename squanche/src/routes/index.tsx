import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, FileText, Clock, CheckCircle2, Megaphone } from "lucide-react";
import { AppShell, Card, StatusPill, btnPrimary } from "@/components/AppShell";
import { useEscola, formatarData } from "@/lib/school-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel — Portal Escolar de Documentos" },
      {
        name: "description",
        content:
          "Painel administrativo para diretores e equipe: acompanhe alunos, documentos recebidos, pendentes e aprovados.",
      },
      { property: "og:title", content: "Painel — Portal Escolar de Documentos" },
      {
        property: "og:description",
        content: "Gestão digital de autorizações e documentos escolares.",
      },
    ],
  }),
  component: Painel,
});

function Painel() {
  const { estado } = useEscola();
  const { alunos, documentos, avisos } = estado;

  const cards = [
    { label: "Alunos cadastrados", valor: alunos.length, icon: Users },
    { label: "Documentos recebidos", valor: documentos.length, icon: FileText },
    {
      label: "Pendentes",
      valor: documentos.filter((d) => d.status === "pendente").length,
      icon: Clock,
    },
    {
      label: "Aprovados",
      valor: documentos.filter((d) => d.status === "aprovado").length,
      icon: CheckCircle2,
    },
  ];

  const ultimos = [...documentos]
    .sort((a, b) => b.enviadoEm.localeCompare(a.enviadoEm))
    .slice(0, 6);

  return (
    <AppShell
      title="Painel principal"
      subtitle="Visão geral dos documentos digitais da escola"
      actions={
        <Link to="/documentos" className={btnPrimary}>
          <FileText className="size-4" /> Novo documento
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, valor, icon: Icon }) => (
          <Card key={label}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{valor}</p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Últimos documentos enviados</h2>
            <Link to="/documentos" className="text-sm font-medium text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          {ultimos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum documento recebido ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 pr-3 font-medium">Aluno</th>
                    <th className="pb-2 pr-3 font-medium">Tipo</th>
                    <th className="pb-2 pr-3 font-medium">Envio</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimos.map((d) => (
                    <tr key={d.id} className="border-t border-border">
                      <td className="py-3 pr-3 font-medium text-foreground">
                        {alunos.find((a) => a.id === d.alunoId)?.nome ?? "—"}
                      </td>
                      <td className="py-3 pr-3 text-muted-foreground">{d.tipo}</td>
                      <td className="py-3 pr-3 text-muted-foreground">
                        {formatarData(d.enviadoEm)}
                      </td>
                      <td className="py-3">
                        <StatusPill status={d.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Megaphone className="size-4 text-primary" />
            <h2 className="font-semibold text-foreground">Avisos importantes</h2>
          </div>
          <ul className="space-y-3">
            {avisos.map((a) => (
              <li key={a.id} className="rounded-lg bg-secondary p-3">
                <p className="text-sm font-medium text-foreground">{a.titulo}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a.texto}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
