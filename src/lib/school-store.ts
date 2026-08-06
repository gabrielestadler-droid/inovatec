import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type DocStatus = "pendente" | "aprovado" | "recusado";

export type Aluno = {
  id: string;
  nome: string;
  nascimento: string;
  documento: string;
  turma: string;
  serie: string;
  turno: string;
  responsavel: string;
  telefone: string;
  email: string;
};

export type Documento = {
  id: string;
  alunoId: string;
  tipo: string;
  nomeArquivo: string;
  enviadoEm: string;
  anoLetivo: string;
  status: DocStatus;
  conteudo?: string;
};

export type LogEntry = { id: string; data: string; acao: string };

export type Aviso = { id: string; titulo: string; texto: string; data: string };

export const TIPOS_DOCUMENTO = [
  "Autorização digital",
  "Termo de responsabilidade",
  "Autorização para passeio",
  "Declaração",
  "Documento escolar",
];

export const TURNOS = ["Matutino", "Vespertino", "Noturno", "Integral"];

export type Estado = {
  alunos: Aluno[];
  documentos: Documento[];
  logs: LogEntry[];
  avisos: Aviso[];
};

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const hoje = () => new Date().toISOString();

const vazio: Estado = { alunos: [], documentos: [], logs: [], avisos: [] };

let memoria: Estado = vazio;
let carregado = false;
const ouvintes = new Set<() => void>();

function notificar() {
  ouvintes.forEach((fn) => fn());
}

type LinhaAluno = {
  id: string;
  nome: string;
  nascimento: string;
  documento: string;
  turma: string;
  serie: string;
  turno: string;
  responsavel: string;
  telefone: string;
  email: string;
};

type LinhaDoc = {
  id: string;
  aluno_id: string | null;
  tipo: string;
  nome_arquivo: string;
  enviado_em: string;
  ano_letivo: string;
  status: string;
  conteudo: string | null;
};

function mapAluno(r: LinhaAluno): Aluno {
  return {
    id: r.id,
    nome: r.nome,
    nascimento: r.nascimento,
    documento: r.documento,
    turma: r.turma,
    serie: r.serie,
    turno: r.turno,
    responsavel: r.responsavel,
    telefone: r.telefone,
    email: r.email,
  };
}

function mapDoc(r: LinhaDoc): Documento {
  return {
    id: r.id,
    alunoId: r.aluno_id ?? "",
    tipo: r.tipo,
    nomeArquivo: r.nome_arquivo,
    enviadoEm: r.enviado_em,
    anoLetivo: r.ano_letivo,
    status: (r.status as DocStatus) ?? "pendente",
    ...(r.conteudo ? { conteudo: r.conteudo } : {}),
  };
}

function linhaAluno(a: Aluno) {
  return {
    id: a.id,
    nome: a.nome,
    nascimento: a.nascimento,
    documento: a.documento,
    turma: a.turma,
    serie: a.serie,
    turno: a.turno,
    responsavel: a.responsavel,
    telefone: a.telefone,
    email: a.email,
  };
}

function linhaDoc(d: Documento) {
  return {
    id: d.id,
    aluno_id: d.alunoId || null,
    tipo: d.tipo,
    nome_arquivo: d.nomeArquivo,
    enviado_em: d.enviadoEm,
    ano_letivo: d.anoLetivo,
    status: d.status,
    conteudo: d.conteudo ?? null,
  };
}

async function buscarTudo(): Promise<Estado> {
  const [alunos, documentos, avisos, logs] = await Promise.all([
    supabase.from("alunos").select("*").order("nome"),
    supabase.from("documentos").select("*").order("enviado_em", { ascending: false }),
    supabase.from("avisos").select("*").order("data", { ascending: false }),
    supabase.from("logs").select("*").order("data", { ascending: false }).limit(200),
  ]);

  return {
    alunos: ((alunos.data ?? []) as LinhaAluno[]).map(mapAluno),
    documentos: ((documentos.data ?? []) as LinhaDoc[]).map(mapDoc),
    avisos: ((avisos.data ?? []) as Aviso[]).map((r) => ({
      id: r.id,
      titulo: r.titulo,
      texto: r.texto,
      data: r.data,
    })),
    logs: ((logs.data ?? []) as LogEntry[]).map((r) => ({ id: r.id, data: r.data, acao: r.acao })),
  };
}

let carregando: Promise<void> | null = null;

function garantirCarregado() {
  if (carregado || carregando || typeof window === "undefined") return;
  carregando = buscarTudo()
    .then((estado) => {
      memoria = estado;
      carregado = true;
      notificar();
    })
    .catch((e) => console.error("Falha ao carregar dados", e))
    .finally(() => {
      carregando = null;
    });
}

function diff<T extends { id: string }>(antes: T[], depois: T[]) {
  const mapaAntes = new Map(antes.map((x) => [x.id, x]));
  const mapaDepois = new Map(depois.map((x) => [x.id, x]));
  const inseridos = depois.filter((x) => !mapaAntes.has(x.id));
  const removidos = antes.filter((x) => !mapaDepois.has(x.id)).map((x) => x.id);
  const alterados = depois.filter((x) => {
    const a = mapaAntes.get(x.id);
    return a && JSON.stringify(a) !== JSON.stringify(x);
  });
  return { inseridos, removidos, alterados };
}

async function sincronizar(antes: Estado, depois: Estado) {
  const dAlunos = diff(antes.alunos, depois.alunos);
  const dDocs = diff(antes.documentos, depois.documentos);
  const dAvisos = diff(antes.avisos, depois.avisos);
  const dLogs = diff(antes.logs, depois.logs);

  const tarefas: PromiseLike<unknown>[] = [];

  if (dAlunos.inseridos.length)
    tarefas.push(supabase.from("alunos").insert(dAlunos.inseridos.map(linhaAluno)));
  dAlunos.alterados.forEach((a) =>
    tarefas.push(supabase.from("alunos").update(linhaAluno(a)).eq("id", a.id)),
  );
  if (dAlunos.removidos.length)
    tarefas.push(supabase.from("alunos").delete().in("id", dAlunos.removidos));

  if (dDocs.inseridos.length)
    tarefas.push(supabase.from("documentos").insert(dDocs.inseridos.map(linhaDoc)));
  dDocs.alterados.forEach((d) =>
    tarefas.push(supabase.from("documentos").update(linhaDoc(d)).eq("id", d.id)),
  );
  if (dDocs.removidos.length)
    tarefas.push(supabase.from("documentos").delete().in("id", dDocs.removidos));

  if (dAvisos.inseridos.length) tarefas.push(supabase.from("avisos").insert(dAvisos.inseridos));
  dAvisos.alterados.forEach((a) =>
    tarefas.push(supabase.from("avisos").update(a).eq("id", a.id)),
  );
  if (dAvisos.removidos.length)
    tarefas.push(supabase.from("avisos").delete().in("id", dAvisos.removidos));

  if (dLogs.inseridos.length) tarefas.push(supabase.from("logs").insert(dLogs.inseridos));

  const resultados = await Promise.all(tarefas);
  const erro = resultados.find(
    (r) => r && typeof r === "object" && "error" in r && (r as { error: unknown }).error,
  );
  if (erro) console.error("Falha ao salvar na nuvem", erro);
}

export function useEscola() {
  const [estado, setEstado] = useState<Estado>(memoria);

  useEffect(() => {
    const fn = () => setEstado({ ...memoria });
    ouvintes.add(fn);
    garantirCarregado();
    if (carregado) fn();
    return () => {
      ouvintes.delete(fn);
    };
  }, []);

  const atualizar = useCallback((fn: (e: Estado) => Estado, acao?: string) => {
    const anterior = memoria;
    const proximo = fn({ ...anterior });
    if (acao) {
      proximo.logs = [{ id: uid(), data: hoje(), acao }, ...proximo.logs].slice(0, 200);
    }
    memoria = proximo;
    notificar();
    void sincronizar(anterior, proximo);
  }, []);

  return { estado, atualizar };
}

export const formatarData = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export const statusLabel: Record<DocStatus, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado",
};
