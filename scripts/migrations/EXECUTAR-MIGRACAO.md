# 🚀 Executar Migração WordPress → Supabase

**Versão**: 1.0.0 | **Data**: 29/12/2025 | **Status**: ✅ Pronto

---

## 📋 Preparação (VOCÊ FAZ - Manual)

### 1. Criar projeto Supabase
- Acesse https://supabase.com/dashboard → New Project
- Region: São Paulo
- **Anote a Service Role Key** (Settings → API)

### 2. Executar SQLs de preparação (00-04)

No Supabase SQL Editor, execute **NA ORDEM**:

```
sql/00-verificacao-inicial.sql
sql/01-criar-tabelas-legadas.sql
sql/02-criar-tabelas-dominio.sql
sql/03-criar-triggers-funcoes.sql
sql/04-configurar-rls.sql
```

**Nota:** O SQL 05 (desabilitar triggers) agora é executado **automaticamente** pelo script de migração!

### 3. Importar backup WordPress

Você já fez isso! ✅
- wp_posts_raw
- wp_postmeta_raw
- wp_users_raw

### 3.1. ~~Popular wp_users_legacy~~ (Agora automático!)

✅ **Não precisa mais fazer isso manualmente!**

O script `run-full-migration.js` agora popula automaticamente a tabela `wp_users_legacy` no **PASSO 15** (último passo da migração).

### 4. Configurar .env.local

Na **raiz do projeto**, crie `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
DATABASE_URL=postgresql://postgres:[SUA_SENHA]@db.xxxxx.supabase.co:5432/postgres
```

⚠️ Use a **SERVICE_ROLE_KEY**, não a anon key!
⚠️ A **DATABASE_URL** é necessária para execução automática de SQL (evita pausas manuais)

📍 Encontre a DATABASE_URL em: Supabase Dashboard → Settings → Database → Connection String → URI

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

O script executa **16 passos 100% automaticamente**:

0. ✅ **AUTOMÁTICO** → Desabilita trigger de histórico (SQL 05)
1. ✅ Migra abrigos (297)
2. ✅ Migra dinâmicas populacionais
3. ✅ Migra voluntários (232)
4. ✅ **AUTOMÁTICO** → Adiciona coluna `slug` em `volunteers`
5. ✅ Gera slugs para voluntários
6. ✅ Verifica duplicatas de slugs
7. ✅ **AUTOMÁTICO** → Cria índice único em `volunteers.slug`
8. ✅ **AUTOMÁTICO** → Adiciona coluna `slug` em `vacancies`
9. ✅ Migra vagas (53)
10. ✅ Verifica duplicatas de slugs
11. ✅ **AUTOMÁTICO** → Cria índice único em `vacancies.slug`
12. ✅ Valida tudo
13. ✅ **AUTOMÁTICO** → Reabilita triggers (SQL 06)
14. ✅ **AUTOMÁTICO** → Validação final completa (SQL 07)
15. ✅ **AUTOMÁTICO** → Popula `wp_users_legacy` para autenticação

🎉 **Zero pausas! 100% automático!** (requer `DATABASE_URL` no `.env.local`)

**Tempo estimado**: 10-15 minutos

---

## 🏁 Finalização (VOCÊ FAZ - Manual)

### 1. Testar localmente

```bash
npm run build
npm run start
```

Acesse http://localhost:3000 e teste:
- /abrigos
- /programa-de-voluntarios

### 2. Deploy

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
ANTES DO SCRIPT:              SCRIPT:                         DEPOIS DO SCRIPT:
─────────────────              ───────                         ──────────────────
✅ Criar Supabase         →    node run-full-migration    →    Testar
✅ SQL 00-04              →    (100% automático)          →    Deploy
✅ Importar WP            →    (10-15 min)                →
✅ .env.local             →    + SQL 05-06-07 automático  →
```

**Tempo total**: ~45 minutos (30 prep + 15 migração)

---

## 🎯 Checklist

Antes de executar `run-full-migration.js`:

- [ ] Supabase criado
- [ ] SQLs 00-04 executados (SQL 05 é automático!)
- [ ] Backup WP importado (wp_*_raw)
- [ ] .env.local criado na raiz **com DATABASE_URL**
- [ ] npm install executado
- [ ] Estou em `scripts/migrations/`
- [ ] (Opcional) Testei a conexão: `cd utils && node test-execute-sql.js`

**Tudo OK? Execute**: `node run-full-migration.js`

💡 **Dica**: Execute o teste de conexão primeiro para garantir que a automação SQL funciona!

---

**Dúvidas?** Mostre este arquivo para o Claude e peça ajuda!
