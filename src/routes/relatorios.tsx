import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, Printer, History } from "lucide-react";
import { Card, StatusPill, btnPrimary, btnGhost } from "@/components/AppShell";
import { AppShell } from "@/components/AppShell";
import { useEscola, formatarData, TIPOS_DOCUMENTO } from "@/lib/school-store";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Portal Escolar" },
      {
        name: "description",
        content:
          "Relatórios de alunos cadastrados, documentos enviados, documentos faltantes e histórico de alterações.",
      },
      { property: "og:title", content: "Relatórios — Portal Escolar" },
      {
        property: "og:description",
        content: "Exporte relatórios em PDF ou Excel a partir dos dados da escola.",
      },
    ],
  }),
  component: Relatorios,
});

function baixarCsv(nome: string, linhas: string[][]) {
  const csv = linhas.map((l) => l.map((c) => `"${c}"`).join(";")).join("\n");
  const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

function Relatorios() {
  const { estado } = useEscola();
  const { alunos, documentos, logs } = estado;

  const faltantes = alunos.flatMap((a) =>
    TIPOS_DOCUMENTO.filter(
      (t) => !documentos.some((d) => d.alunoId === a.id && d.tipo === t && d.status !== "recusado"),
    ).map((t) => ({ aluno: a.nome, turma: a.turma, tipo: t })),
  );

  return (
    <AppShell
      title="Relatórios"
      subtitle="Exporte informações em PDF ou Excel"
      actions={
        <button className={btnGhost} onClick={() => window.print()}>
          <Printer className="size-4" /> Imprimir / PDF
        </button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-foreground">Alunos cadastrados ({alunos.length})</h2>
            <button
              className={btnPrimary}
              onClick={() =>
                baixarCsv("relatorio-alunos.csv", [
                  ["Nome", "Turma", "Série", "Turno", "Responsável", "Telefone", "E-mail"],
                  ...alunos.map((a) => [
                    a.nome,
                    a.turma,
                    a.serie,
                    a.turno,
                    a.responsavel,
                    a.telefone,
                    a.email,
                  ]),
                ])
              }
            >
              <FileSpreadsheet className="size-4" /> Excel
            </button>
          </div>
          <ul className="space-y-2 text-sm">
            {alunos.map((a) => (
              <li key={a.id} className="flex justify-between border-b border-border pb-2">
                <span className="text-foreground">{a.nome}</span>
                <span className="text-muted-foreground">{a.turma}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-foreground">
              Documentos enviados ({documentos.length})
            </h2>
            <button
              className={btnPrimary}
              onClick={() =>
                baixarCsv("relatorio-documentos.csv", [
                  ["Aluno", "Tipo", "Arquivo", "Envio", "Status"],
                  ...documentos.map((d) => [
                    alunos.find((a) => a.id === d.alunoId)?.nome ?? "—",
                    d.tipo,
                    d.nomeArquivo,
                    formatarData(d.enviadoEm),
                    d.status,
                  ]),
                ])
              }
            >
              <FileSpreadsheet className="size-4" /> Excel
            </button>
          </div>
          <ul className="space-y-2 text-sm">
            {documentos.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2"
              >
                <span className="text-foreground">
                  {alunos.find((a) => a.id === d.alunoId)?.nome ?? "—"} · {d.tipo}
                </span>
                <StatusPill status={d.status} />
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-foreground">
              Documentos faltantes ({faltantes.length})
            </h2>
            <button
              className={btnPrimary}
              onClick={() =>
                baixarCsv("relatorio-faltantes.csv", [
                  ["Aluno", "Turma", "Documento faltante"],
                  ...faltantes.map((f) => [f.aluno, f.turma, f.tipo]),
                ])
              }
            >
              <FileSpreadsheet className="size-4" /> Excel
            </button>
          </div>
          <ul className="max-h-72 space-y-2 overflow-auto text-sm">
            {faltantes.map((f, i) => (
              <li key={i} className="flex justify-between border-b border-border pb-2">
                <span className="text-foreground">{f.aluno}</span>
                <span className="text-muted-foreground">{f.tipo}</span>
              </li>
            ))}
            {faltantes.length === 0 && (
              <li className="text-muted-foreground">Nenhum documento faltante.</li>
            )}
          </ul>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <History className="size-4 text-primary" />
            <h2 className="font-semibold text-foreground">Histórico de alterações</h2>
          </div>
          <ul className="max-h-72 space-y-2 overflow-auto text-sm">
            {logs.map((l) => (
              <li key={l.id} className="border-b border-border pb-2">
                <p className="text-foreground">{l.acao}</p>
                <p className="text-xs text-muted-foreground">{formatarData(l.data)}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}