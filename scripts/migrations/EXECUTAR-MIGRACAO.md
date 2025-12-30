# 🚀 Executar Migração WordPress → Supabase

**Versão**: 1.0.0 | **Data**: 29/12/2025 | **Status**: ✅ Pronto

---

## 📋 Preparação (VOCÊ FAZ - Manual)

### 1. Criar projeto Supabase
- Acesse https://supabase.com/dashboard → New Project
- Region: São Paulo
- **Anote a Service Role Key** (Settings → API)

### 2. Executar SQLs de preparação (00-05)

No Supabase SQL Editor, execute **NA ORDEM**:

```
sql/00-verificacao-inicial.sql
sql/01-criar-tabelas-legadas.sql
sql/02-criar-tabelas-dominio.sql
sql/03-criar-triggers-funcoes.sql
sql/04-configurar-rls.sql
sql/05-pre-migracao-desabilitar-triggers.sql
```

### 3. Importar backup WordPress

Você já fez isso! ✅
- wp_posts_raw
- wp_postmeta_raw
- wp_users_raw

### 3.1. Popular wp_users_legacy

⚠️ **IMPORTANTE**: Após importar `wp_users_raw`, execute este SQL:

```sql
-- Popular wp_users_legacy a partir de wp_users_raw
INSERT INTO wp_users_legacy (id, user_login, user_email, user_pass, display_name)
SELECT
  id,
  user_login,
  user_email,
  user_pass,
  display_name
FROM wp_users_raw
ON CONFLICT (id) DO NOTHING;
```

Esta tabela é necessária para os scripts de teste de login funcionarem.

### 4. Configurar .env.local

Na **raiz do projeto**, crie `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

⚠️ Use a **SERVICE_ROLE_KEY**, não a anon key!

### 5. Instalar dependências

```bash
npm install
```

---

## ⚡ Migração Automática (SCRIPT FAZ)

### Executar

```bash
cd scripts/migrations
node run-full-migration.js
```

### O que acontece

O script executa **12 passos automaticamente**:

1. ✅ Migra abrigos (297)
2. ✅ Migra dinâmicas populacionais
3. ✅ Migra voluntários (232)
4. ⏸️  **PAUSA** → Você executa SQL: `ALTER TABLE volunteers ADD COLUMN slug TEXT;`
5. ✅ Gera slugs para voluntários
6. ✅ Verifica duplicatas de slugs
7. ⏸️  **PAUSA** → Você executa SQL: `CREATE UNIQUE INDEX idx_volunteers_slug ON volunteers(slug);`
8. ⏸️  **PAUSA** → Você executa SQL: `ALTER TABLE vacancies ADD COLUMN slug TEXT;`
9. ✅ Migra vagas (53)
10. ✅ Verifica duplicatas de slugs
11. ⏸️  **PAUSA** → Você executa SQL: `CREATE UNIQUE INDEX idx_vacancies_slug ON vacancies(slug);`
12. ✅ Valida tudo

**Tempo estimado**: 10-15 minutos

---

## 🏁 Finalização (VOCÊ FAZ - Manual)

### 1. Executar SQLs finais (06-07)

No Supabase SQL Editor:

```
sql/06-pos-migracao-reabilitar-triggers.sql
sql/07-validacao-final.sql
```

O SQL 07 valida:
- ✅ Contagens corretas
- ✅ Sem duplicatas
- ✅ Slugs únicos
- ✅ Índices criados
- ✅ Triggers ativos

### 2. Testar localmente

```bash
npm run build
npm run start
```

Acesse http://localhost:3000 e teste:
- /abrigos
- /programa-de-voluntarios

### 3. Deploy

```bash
vercel --prod
# ou
git push origin main
```

---

## 🆘 Erros Comuns

| Erro | Solução |
|------|---------|
| "Script não encontrado" | `cd scripts/migrations` |
| ".env.local não encontrado" | Criar na raiz do projeto |
| "permission denied" | Usar SERVICE_ROLE_KEY no .env.local |

---

## 📊 Resumo

```
ANTES DO SCRIPT:              SCRIPT:                    DEPOIS DO SCRIPT:
─────────────────              ───────                    ──────────────────
✅ Criar Supabase         →    node run-full-migration    →    SQL 06-07
✅ SQL 00-05              →    (automático)               →    Testar
✅ Importar WP            →    (10-15 min)                →    Deploy
✅ .env.local             →                               →
```

**Tempo total**: ~50 minutos (30 prep + 15 migração + 5 final)

---

## 🎯 Checklist

Antes de executar `run-full-migration.js`:

- [ ] Supabase criado
- [ ] SQLs 00-05 executados
- [ ] Backup WP importado (wp_*_raw)
- [ ] .env.local criado na raiz
- [ ] npm install executado
- [ ] Estou em `scripts/migrations/`

**Tudo OK? Execute**: `node run-full-migration.js`

---

**Dúvidas?** Mostre este arquivo para o Claude e peça ajuda!
