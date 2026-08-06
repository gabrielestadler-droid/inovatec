import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Cloud, HardDriveDownload, School, CheckCircle2, Link2 } from "lucide-react";
import { AppShell, Card, btnPrimary, btnGhost, inputCls } from "@/components/AppShell";
import { useEscola } from "@/lib/school-store";

export const Route = createFileRoute("/integracoes")({
  head: () => ({
    meta: [
      { title: "Integrações e backup — Portal Escolar" },
      {
        name: "description",
        content:
          "Área preparada para Google Drive, backup automático de documentos e exportação para o Escola Paraná.",
      },
      { property: "og:title", content: "Integrações e backup — Portal Escolar" },
      {
        property: "og:description",
        content: "Google Drive, backup dos arquivos e envio para sistemas escolares.",
      },
    ],
  }),
  component: Integracoes,
});

function Integracoes() {
  const { estado } = useEscola();
  const [pasta, setPasta] = useState("Escola / Documentos / 2026");
  const [conectado, setConectado] = useState(false);

  function baixarBackup() {
    const blob = new Blob([JSON.stringify(estado, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-documentos-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell
      title="Integrações"
      subtitle="Armazenamento em nuvem, backup e sistemas escolares"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Cloud className="size-5 text-primary" />
            <h2 className="font-semibold text-foreground">Google Drive</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Envie automaticamente os documentos aprovados para uma pasta do Drive, com criação
            automática das subpastas por ano letivo, turma e aluno.
          </p>
          <label className="mt-4 block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Pasta de destino</span>
            <input className={inputCls} value={pasta} onChange={(e) => setPasta(e.target.value)} />
          </label>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button className={btnPrimary} onClick={() => setConectado(true)}>
              <Link2 className="size-4" /> Conectar Google Drive
            </button>
            {conectado && (
              <span className="inline-flex items-center gap-1.5 text-sm text-success">
                <CheckCircle2 className="size-4" /> Pronto para configuração final
              </span>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            A conexão real com a conta Google da escola pode ser ativada nesta tela quando você
            quiser habilitar o envio automático.
          </p>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <HardDriveDownload className="size-5 text-primary" />
            <h2 className="font-semibold text-foreground">Backup dos arquivos</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Gere uma cópia de segurança completa dos alunos, documentos e histórico de ações.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• {estado.alunos.length} aluno(s)</li>
            <li>• {estado.documentos.length} documento(s)</li>
            <li>• {estado.logs.length} registro(s) de histórico</li>
          </ul>
          <button className={`${btnPrimary} mt-4`} onClick={baixarBackup}>
            Baixar backup agora
          </button>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <School className="size-5 text-primary" />
            <h2 className="font-semibold text-foreground">Sistemas escolares (Escola Paraná)</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Exporte os dados dos alunos no formato de planilha aceito pelas plataformas escolares e
            envie os documentos necessários.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className={btnPrimary}
              onClick={() => {
                const linhas = [
                  ["Nome", "Nascimento", "Documento", "Turma", "Serie", "Turno", "Responsavel", "Telefone", "Email"],
                  ...estado.alunos.map((a) => [
                    a.nome,
                    a.nascimento,
                    a.documento,
                    a.turma,
                    a.serie,
                    a.turno,
                    a.responsavel,
                    a.telefone,
                    a.email,
                  ]),
                ];
                const csv = linhas.map((l) => l.map((c) => `"${c}"`).join(";")).join("\n");
                const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" }));
                const a = document.createElement("a");
                a.href = url;
                a.download = "alunos-escola-parana.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Exportar alunos (CSV)
            </button>
            <button className={btnGhost} onClick={() => window.print()}>
              Gerar relatório para envio
            </button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}