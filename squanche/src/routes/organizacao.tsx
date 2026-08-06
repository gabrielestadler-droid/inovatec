import { createFileRoute } from "@tanstack/react-router";
import { Folder, FolderOpen, FileText } from "lucide-react";
import { AppShell, Card, StatusPill } from "@/components/AppShell";
import { useEscola, formatarData } from "@/lib/school-store";

export const Route = createFileRoute("/organizacao")({
  head: () => ({
    meta: [
      { title: "Organização automática — Portal Escolar" },
      {
        name: "description",
        content:
          "Documentos organizados automaticamente por ano letivo, turma, aluno e tipo de arquivo.",
      },
      { property: "og:title", content: "Organização automática — Portal Escolar" },
      {
        property: "og:description",
        content: "Estrutura de pastas: ano letivo, turma, aluno e documento.",
      },
    ],
  }),
  component: Organizacao,
});

function Organizacao() {
  const { estado } = useEscola();

  const anos = Array.from(new Set(estado.documentos.map((d) => d.anoLetivo))).sort().reverse();

  return (
    <AppShell
      title="Organização automática"
      subtitle="Ano letivo → Turma → Aluno → Documento"
    >
      {anos.length === 0 && (
        <Card>
          <p className="text-sm text-muted-foreground">
            Nenhum documento para organizar ainda.
          </p>
        </Card>
      )}

      <div className="space-y-4">
        {anos.map((ano) => {
          const docsAno = estado.documentos.filter((d) => d.anoLetivo === ano);
          const turmas = Array.from(
            new Set(
              docsAno.map(
                (d) => estado.alunos.find((a) => a.id === d.alunoId)?.turma ?? "Sem turma",
              ),
            ),
          ).sort();

          return (
            <Card key={ano}>
              <div className="flex items-center gap-2 text-foreground">
                <FolderOpen className="size-5 text-primary" />
                <h2 className="font-semibold">{ano}</h2>
                <span className="text-sm text-muted-foreground">
                  ({docsAno.length} documento(s))
                </span>
              </div>

              <div className="mt-4 space-y-4 border-l border-border pl-5">
                {turmas.map((turma) => {
                  const alunosTurma = estado.alunos.filter((a) => a.turma === turma);
                  return (
                    <div key={turma}>
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Folder className="size-4 text-primary" /> {turma}
                      </div>
                      <div className="mt-2 space-y-3 border-l border-border pl-5">
                        {alunosTurma.map((aluno) => {
                          const docs = docsAno.filter((d) => d.alunoId === aluno.id);
                          if (docs.length === 0) return null;
                          return (
                            <div key={aluno.id}>
                              <div className="flex items-center gap-2 text-sm text-foreground">
                                <Folder className="size-4 text-muted-foreground" /> {aluno.nome}
                              </div>
                              <ul className="mt-1 space-y-1 border-l border-border pl-5">
                                {docs.map((d) => (
                                  <li
                                    key={d.id}
                                    className="flex flex-wrap items-center gap-2 py-1 text-sm text-muted-foreground"
                                  >
                                    <FileText className="size-4" />
                                    <span className="text-foreground">{d.nomeArquivo}</span>
                                    <span>· {formatarData(d.enviadoEm)}</span>
                                    <StatusPill status={d.status} />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}