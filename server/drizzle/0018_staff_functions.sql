CREATE TABLE IF NOT EXISTS "staff_professional_functions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "staff_professional_functions_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "staff_profile_functions" (
	"staff_user_id" uuid NOT NULL,
	"professional_function_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "staff_profile_functions_pk" PRIMARY KEY("staff_user_id","professional_function_id")
);

CREATE INDEX IF NOT EXISTS "idx_staff_profile_func_prof_id" ON "staff_profile_functions" ("professional_function_id");

DO $$ BEGIN
 ALTER TABLE "staff_profile_functions" ADD CONSTRAINT "staff_profile_functions_staff_user_id_staff_profiles_user_id_fk" FOREIGN KEY ("staff_user_id") REFERENCES "staff_profiles"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "staff_profile_functions" ADD CONSTRAINT "staff_profile_functions_professional_function_id_staff_professional_functions_id_fk" FOREIGN KEY ("professional_function_id") REFERENCES "staff_professional_functions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Seed inicial (Catálogo V1)
INSERT INTO "staff_professional_functions" ("name", "slug", "category") VALUES
('Recepção', 'recepcao', 'ATENDIMENTO'),
('Credenciamento', 'credenciamento', 'ATENDIMENTO'),
('Bilheteria', 'bilheteria', 'ATENDIMENTO'),
('Caixa', 'caixa', 'ATENDIMENTO'),
('Atendimento ao Público', 'atendimento_ao_publico', 'ATENDIMENTO'),
('Segurança', 'seguranca', 'SEGURANÇA'),
('Controlador de Acesso', 'controlador_de_acesso', 'SEGURANÇA'),
('Brigadista', 'brigadista', 'SEGURANÇA'),
('Garçom / Garçonete', 'garcom_garconete', 'ALIMENTAÇÃO E BEBIDAS'),
('Bartender', 'bartender', 'ALIMENTAÇÃO E BEBIDAS'),
('Apoio de Bar', 'apoio_de_bar', 'ALIMENTAÇÃO E BEBIDAS'),
('Cozinha', 'cozinha', 'ALIMENTAÇÃO E BEBIDAS'),
('Produção', 'producao', 'PRODUÇÃO'),
('Apoio de Produção', 'apoio_de_producao', 'PRODUÇÃO'),
('Runner', 'runner', 'PRODUÇÃO'),
('Montagem', 'montagem', 'PRODUÇÃO'),
('Desmontagem', 'desmontagem', 'PRODUÇÃO'),
('Técnico de Som', 'tecnico_de_som', 'TÉCNICA'),
('Técnico de Luz', 'tecnico_de_luz', 'TÉCNICA'),
('Operador de LED', 'operador_de_led', 'TÉCNICA'),
('Fotografia', 'fotografia', 'TÉCNICA'),
('Vídeo', 'video', 'TÉCNICA'),
('Limpeza', 'limpeza', 'LIMPEZA E APOIO'),
('Serviços Gerais', 'servicos_gerais', 'LIMPEZA E APOIO'),
('Outro', 'outro', 'OUTROS')
ON CONFLICT ("slug") DO NOTHING;
