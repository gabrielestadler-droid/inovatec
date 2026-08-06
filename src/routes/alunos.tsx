import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, UserPlus } from "lucide-react";
import { AppShell, Card, btnPrimary, btnGhost, inputCls } from "@/components/AppShell";
import { useEscola, uid, TURNOS, type Aluno } from "@/lib/school-store";

export const Route = createFileRoute("/alunos")({
  head: () => ({
    meta: [
      { title: "Cadastro de alunos — Portal Escolar" },
      {
        name: "description",
        content: "Cadastre, pesquise, edite e exclua alunos com turma, série, turno e responsáveis.",
      },
      { property: "og:title", content: "Cadastro de alunos — Portal Escolar" },
      {
        property: "og:description",
        content: "Gestão completa dos dados dos alunos da escola.",
      },
    ],
  }),
  component: Alunos,
});

const vazio: Aluno = {
  id: "",
  nome: "",
  nascimento: "",
  documento: "",
  turma: "",
  serie: "",
  turno: TURNOS[0]!,
  responsavel: "",
  telefone: "",
  email: "",
};

function Alunos() {
  const { estado, atualizar } = useEscola();
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState<Aluno | null>(null);

  const lista = useMemo(() => {
    const t = busca.trim().toLowerCase();
    if (!t) return estado.alunos;
    return estado.alunos.filter((a) =>
      [a.nome, a.turma, a.serie, a.responsavel, a.documento].join(" ").toLowerCase().includes(t),
    );
  }, [estado.alunos, busca]);

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (form.id) {
      atualizar(
        (s) => ({ ...s, alunos: s.alunos.map((a) => (a.id === form.id ? form : a)) }),
        `Aluno atualizado: ${form.nome}`,
      );
    } else {
      const novo = { ...form, id: uid() };
      atualizar((s) => ({ ...s, alunos: [novo, ...s.alunos] }), `Aluno cadastrado: ${novo.nome}`);
    }
    setForm(null);
  }

  function excluir(a: Aluno) {
    if (!window.confirm(`Excluir o cadastro de ${a.nome}?`)) return;
    atualizar(
      (s) => ({
        ...s,
        alunos: s.alunos.filter((x) => x.id !== a.id),
        documentos: s.documentos.filter((d) => d.alunoId !== a.id),
      }),
      `Aluno excluído: ${a.nome}`,
    );
  }

  return (
    <AppShell
      title="Cadastro de alunos"
      subtitle={`${estado.alunos.length} aluno(s) cadastrado(s)`}
      actions={
        <button className={btnPrimary} onClick={() => setForm({ ...vazio })}>
          <Plus className="size-4" /> Novo aluno
        </button>
      }
    >
      <Card className="mb-4">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className={`${inputCls} pl-9`}
            placeholder="Pesquisar por nome, turma, série ou responsável"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>
      </Card>

      {form && (
        <Card className="mb-4">
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="size-4 text-primary" />
            <h2 className="font-semibold text-foreground">
              {form.id ? "Editar aluno" : "Novo aluno"}
            </h2>
          </div>
          <form onSubmit={salvar} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(
              [
                ["nome", "Nome completo", "text"],
                ["nascimento", "Data de nascimento", "date"],
                ["documento", "CPF ou documento", "text"],
                ["turma", "Turma", "text"],
                ["serie", "Série", "text"],
                ["responsavel", "Responsáveis", "text"],
                ["telefone", "Telefone", "tel"],
                ["email", "E-mail", "email"],
              ] as const
            ).map(([campo, label, tipo]) => (
              <label key={campo} className="block text-sm">
                <span className="mb-1.5 block font-medium text-foreground">{label}</span>
                <input
                  required={campo === "nome"}
                  type={tipo}
                  className={inputCls}
                  value={form[campo]}
                  onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
                />
              </label>
            ))}
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Turno</span>
              <select
                className={inputCls}
                value={form.turno}
                onChange={(e) => setForm({ ...form, turno: e.target.value })}
              >
                {TURNOS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
              <button type="submit" className={btnPrimary}>
                Salvar
              </button>
              <button type="button" className={btnGhost} onClick={() => setForm(null)}>
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">Aluno</th>
                <th className="pb-2 pr-3 font-medium">Turma</th>
                <th className="pb-2 pr-3 font-medium">Turno</th>
                <th className="pb-2 pr-3 font-medium">Responsável</th>
                <th className="pb-2 pr-3 font-medium">Contato</th>
                <th className="pb-2 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((a) => (
                <tr key={a.id} className="border-t border-border align-top">
                  <td className="py-3 pr-3">
                    <p className="font-medium text-foreground">{a.nome}</p>
                    <p className="text-xs text-muted-foreground">{a.documento}</p>
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    {a.turma}
                    <span className="block text-xs">{a.serie}</span>
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">{a.turno}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{a.responsavel}</td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    {a.telefone}
                    <span className="block text-xs">{a.email}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        className={btnGhost}
                        onClick={() => setForm(a)}
                        aria-label={`Editar ${a.nome}`}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        className={`${btnGhost} text-destructive`}
                        onClick={() => excluir(a)}
                        aria-label={`Excluir ${a.nome}`}
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
                    Nenhum aluno encontrado.
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