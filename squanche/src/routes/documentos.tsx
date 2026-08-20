import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Upload, Download, Trash2, Eye, Search, Check, X } from "lucide-react";
import { AppShell, Card, StatusPill, btnPrimary, btnGhost, inputCls } from "@/components/AppShell";
import {
  useEscola,
  uid,
  formatarData,
  TIPOS_DOCUMENTO,
  type Documento,
  type DocStatus,
} from "@/lib/school-store";

export const Route = createFileRoute("/documentos")({
  head: () => ({
    meta: [
      { title: "Gerenciamento de documentos — Portal Escolar" },
      {
        name: "description",
        content:
          "Receba, envie, visualize, baixe e aprove autorizações digitais e documentos escolares por aluno.",
      },
      { property: "og:title", content: "Gerenciamento de documentos — Portal Escolar" },
      {
        property: "og:description",
        content: "Controle de autorizações digitais, termos e declarações da escola.",
      },
    ],
  }),
  component: Documentos,
});

function Documentos() {
  const { estado, atualizar } = useEscola();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | DocStatus>("todos");
  const [alunoId, setAlunoId] = useState("");
  const [tipo, setTipo] = useState(TIPOS_DOCUMENTO[0]!);
  const fileRef = useRef<HTMLInputElement>(null);

  const nomeAluno = (id: string) => estado.alunos.find((a) => a.id === id)?.nome ?? "—";

  const lista = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return estado.documentos
      .filter((d) => (filtro === "todos" ? true : d.status === filtro))
      .filter((d) =>
        t ? [nomeAluno(d.alunoId), d.tipo, d.nomeArquivo].join(" ").toLowerCase().includes(t) : true,
      )
      .sort((a, b) => b.enviadoEm.localeCompare(a.enviadoEm));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.documentos, estado.alunos, busca, filtro]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!alunoId || !file) return;

    let conteudo: string | undefined;
    if (file.size < 1_500_000) {
      conteudo = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(file);
      });
    }

    const novo: Documento = {
      id: uid(),
      alunoId,
      tipo,
      nomeArquivo: file.name,
      enviadoEm: new Date().toISOString(),
      anoLetivo: String(new Date().getFullYear()),
      status: "pendente",
      ...(conteudo ? { conteudo } : {}),
    };
    atualizar(
      (s) => ({ ...s, documentos: [novo, ...s.documentos] }),
      `Documento enviado: ${file.name} (${nomeAluno(alunoId)})`,
    );
    if (fileRef.current) fileRef.current.value = "";
  }

  function mudarStatus(d: Documento, status: DocStatus) {
    atualizar(
      (s) => ({
        ...s,
        documentos: s.documentos.map((x) => (x.id === d.id ? { ...x, status } : x)),
      }),
      `Documento ${status}: ${d.nomeArquivo}`,
    );
  }

  function excluir(d: Documento) {
    if (!window.confirm(`Excluir o documento ${d.nomeArquivo}?`)) return;
    atualizar(
      (s) => ({ ...s, documentos: s.documentos.filter((x) => x.id !== d.id) }),
      `Documento excluído: ${d.nomeArquivo}`,
    );
  }

  function abrir(d: Documento) {
    if (!d.conteudo) {
      window.alert("Pré-visualização indisponível para este arquivo de exemplo.");
      return;
    }
    window.open(d.conteudo, "_blank");
  }

  function baixar(d: Documento) {
    if (!d.conteudo) {
      window.alert("Download indisponível para este arquivo de exemplo.");
      return;
    }
    const a = document.createElement("a");
    a.href = d.conteudo;
    a.download = d.nomeArquivo;
    a.click();
  }

  return (
    <AppShell
      title="Gerenciamento de documentos"
      subtitle="Autorizações digitais, termos, declarações e documentos escolares"
    >
      <Card className="mb-4">
        <h2 className="mb-4 font-semibold text-foreground">Upload de documento</h2>
        <form onSubmit={enviar} className="grid gap-4 md:grid-cols-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Aluno</span>
            <select
              required
              className={inputCls}
              value={alunoId}
              onChange={(e) => setAlunoId(e.target.value)}
            >
              <option value="">Selecione…</option>
              {estado.alunos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} — {a.turma}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Tipo</span>
            <select className={inputCls} value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {TIPOS_DOCUMENTO.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Arquivo</span>
            <input required ref={fileRef} type="file" className={inputCls} />
          </label>
          <div className="flex items-end">
            <button className={btnPrimary} type="submit">
              <Upload className="size-4" /> Enviar
            </button>
          </div>
        </form>
      </Card>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className={`${inputCls} pl-9`}
              placeholder="Pesquisar por aluno, tipo ou arquivo"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {(["todos", "pendente", "aprovado", "recusado"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={
                  filtro === f
                    ? "rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                    : btnGhost
                }
              >
                {f === "todos" ? "Todos" : f[0]!.toUpperCase() + f.slice(1) + "s"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">Aluno</th>
                <th className="pb-2 pr-3 font-medium">Documento</th>
                <th className="pb-2 pr-3 font-medium">Tipo</th>
                <th className="pb-2 pr-3 font-medium">Envio</th>
                <th className="pb-2 pr-3 font-medium">Status</th>
                <th className="pb-2 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((d) => (
                <tr key={d.id} className="border-t border-border">
                  <td className="py-3 pr-3 font-medium text-foreground">{nomeAluno(d.alunoId)}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{d.nomeArquivo}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{d.tipo}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{formatarData(d.enviadoEm)}</td>
                  <td className="py-3 pr-3">
                    <StatusPill status={d.status} />
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <button className={btnGhost} onClick={() => abrir(d)} aria-label="Visualizar">
                        <Eye className="size-4" />
                      </button>
                      <button className={btnGhost} onClick={() => baixar(d)} aria-label="Baixar">
                        <Download className="size-4" />
                      </button>
                      <button
                        className={`${btnGhost} text-success`}
                        onClick={() => mudarStatus(d, "aprovado")}
                        aria-label="Aprovar"
                      >
                        <Check className="size-4" />
                      </button>
                      <button
                        className={`${btnGhost} text-destructive`}
                        onClick={() => mudarStatus(d, "recusado")}
                        aria-label="Recusar"
                      >
                        <X className="size-4" />
                      </button>
                      <button
                        className={`${btnGhost} text-destructive`}
                        onClick={() => excluir(d)}
                        aria-label="Excluir"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">
                    Nenhum documento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}