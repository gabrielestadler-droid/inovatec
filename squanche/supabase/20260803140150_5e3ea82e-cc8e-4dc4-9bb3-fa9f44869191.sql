-- Habilita a extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.alunos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL DEFAULT '',
  nascimento text NOT NULL DEFAULT '',
  documento text NOT NULL DEFAULT '',
  turma text NOT NULL DEFAULT '',
  serie text NOT NULL DEFAULT '',
  turno text NOT NULL DEFAULT '',
  responsavel text NOT NULL DEFAULT '',
  telefone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.alunos TO anon, authenticated;
GRANT ALL ON public.alunos TO service_role;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso publico alunos" ON public.alunos;
CREATE POLICY "Acesso publico alunos" ON public.alunos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES public.alunos(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT '',
  nome_arquivo text NOT NULL DEFAULT '',
  ano_letivo text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pendente',
  conteudo text,
  enviado_em timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos TO anon, authenticated;
GRANT ALL ON public.documentos TO service_role;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso publico documentos" ON public.documentos;
CREATE POLICY "Acesso publico documentos" ON public.documentos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.avisos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL DEFAULT '',
  texto text NOT NULL DEFAULT '',
  data timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.avisos TO anon, authenticated;
GRANT ALL ON public.avisos TO service_role;
ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso publico avisos" ON public.avisos;
CREATE POLICY "Acesso publico avisos" ON public.avisos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acao text NOT NULL,
  data timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.logs TO anon, authenticated;
GRANT ALL ON public.logs TO service_role;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso publico logs" ON public.logs;
CREATE POLICY "Acesso publico logs" ON public.logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Inserir Alunos (caso não existam com o mesmo documento)
INSERT INTO public.alunos (nome, nascimento, documento, turma, serie, turno, responsavel, telefone, email)
SELECT 'João Silva', '2011-04-12', '123.456.789-00', '9º Ano A', '9º Ano', 'Matutino', 'Maria Silva', '(41) 99876-5432', 'maria.silva@email.com'
WHERE NOT EXISTS (SELECT 1 FROM public.alunos WHERE documento = '123.456.789-00');

INSERT INTO public.alunos (nome, nascimento, documento, turma, serie, turno, responsavel, telefone, email)
SELECT 'Ana Beatriz Souza', '2012-09-30', '987.654.321-00', '8º Ano B', '8º Ano', 'Vespertino', 'Carlos Souza', '(41) 99123-4567', 'carlos.souza@email.com'
WHERE NOT EXISTS (SELECT 1 FROM public.alunos WHERE documento = '987.654.321-00');

INSERT INTO public.alunos (nome, nascimento, documento, turma, serie, turno, responsavel, telefone, email)
SELECT 'Pedro Henrique Lima', '2013-01-22', '456.123.789-00', '7º Ano A', '7º Ano', 'Matutino', 'Fernanda Lima', '(41) 98888-1122', 'fernanda.lima@email.com'
WHERE NOT EXISTS (SELECT 1 FROM public.alunos WHERE documento = '456.123.789-00');


-- Inserir Documentos (somente se ainda não existirem para o respectivo aluno)
INSERT INTO public.documentos (aluno_id, tipo, nome_arquivo, ano_letivo, status)
SELECT id, 'Autorização para passeio', 'Autorizacao-Passeio.pdf', '2026', 'pendente' 
FROM public.alunos 
WHERE nome = 'João Silva' 
  AND NOT EXISTS (SELECT 1 FROM public.documentos WHERE nome_arquivo = 'Autorizacao-Passeio.pdf');

INSERT INTO public.documentos (aluno_id, tipo, nome_arquivo, ano_letivo, status)
SELECT id, 'Termo de responsabilidade', 'Termo-Responsabilidade.pdf', '2026', 'aprovado' 
FROM public.alunos 
WHERE nome = 'Ana Beatriz Souza' 
  AND NOT EXISTS (SELECT 1 FROM public.documentos WHERE nome_arquivo = 'Termo-Responsabilidade.pdf');

INSERT INTO public.documentos (aluno_id, tipo, nome_arquivo, ano_letivo, status)
SELECT id, 'Declaração', 'Declaracao-Matricula.pdf', '2026', 'recusado' 
FROM public.alunos 
WHERE nome = 'Pedro Henrique Lima' 
  AND NOT EXISTS (SELECT 1 FROM public.documentos WHERE nome_arquivo = 'Declaracao-Matricula.pdf');


-- Inserir Avisos
INSERT INTO public.avisos (titulo, texto) 
SELECT 'Entrega de autorizações', 'Prazo final para o passeio ao Museu: 30/08.'
WHERE NOT EXISTS (SELECT 1 FROM public.avisos WHERE titulo = 'Entrega de autorizações');

INSERT INTO public.avisos (titulo, texto) 
SELECT 'Backup semanal', 'Envie os documentos aprovados para a pasta do Google Drive.'
WHERE NOT EXISTS (SELECT 1 FROM public.avisos WHERE titulo = 'Backup semanal');


-- Inserir Logs
INSERT INTO public.logs (acao) VALUES ('Sistema iniciado com dados de exemplo');