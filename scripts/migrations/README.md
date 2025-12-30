# 🔄 Scripts de Migração - MVAbrigos Brasil

Este diretório contém todos os scripts e documentação para migração completa do WordPress para Supabase.

---

## 📖 Documentação Principal

### ⭐ [GUIA-MIGRACAO-COMPLETO.md](GUIA-MIGRACAO-COMPLETO.md) ⭐

**COMECE AQUI!** Este é o único documento que você precisa ler.

Contém:
- ✅ Passo a passo completo (7 fases)
- ✅ Divisão clara: o que você faz vs o que Claude faz
- ✅ Todos os scripts SQL prontos
- ✅ Troubleshooting completo
- ✅ Checklist de execução
- ✅ Análise técnica e riscos

---

## 📁 Estrutura do Projeto

```plaintext
scripts/migrations/
├── GUIA-MIGRACAO-COMPLETO.md    ← 📖 LEIA ESTE PRIMEIRO
├── README.md                     ← Você está aqui
├── sql/                          ← 8 scripts SQL (ordem 00-07)
│   ├── 00-verificacao-inicial.sql
│   ├── 01-criar-tabelas-legadas.sql
│   ├── 02-criar-tabelas-dominio.sql
│   ├── 03-criar-triggers-funcoes.sql
│   ├── 04-configurar-rls.sql
│   ├── 05-pre-migracao-desabilitar-triggers.sql
│   ├── 06-pos-migracao-reabilitar-triggers.sql
│   └── 07-validacao-final.sql
├── abrigos/
│   ├── migrate-shelters-wp-to-supabase.js
│   ├── verify-migration.js
│   └── output/
├── voluntarios/
│   ├── migrate-volunteers-wp-to-supabase.js
│   ├── link-existing-volunteers.js
│   └── output/
├── vagas-voluntariado/
│   ├── migrate-vacancies-wp-to-supabase.js
│   └── output/
└── programa-de-voluntarios/
    ├── backfill-slug.js
    ├── check-slug-duplicates.js
    └── output/
```

---

## 🎯 Status da Migração

### Testes Realizados
✅ **Abrigos**: 297 registros migrados com sucesso (0 erros)
✅ **Voluntários**: 232 registros migrados com sucesso (0 erros)
✅ **Vagas**: 53 registros migrados com sucesso (0 erros)

### Pronto para Produção
✅ Todos os scripts testados
✅ Documentação completa
✅ Riscos mapeados e mitigados
✅ Processo idempotente (pode re-rodar)

---

## ⚡ Quick Start

### 1. Leia o Guia
👉 Abra [GUIA-MIGRACAO-COMPLETO.md](GUIA-MIGRACAO-COMPLETO.md)

### 2. Prepare o Ambiente
- Crie projeto Supabase
- Execute scripts SQL 00-04
- Importe backup do WordPress
- Configure .env.local

### 3. Execute a Migração
- Execute SQL 05 (desabilitar triggers)
- Peça ao Claude: **"Claude, executei até o SQL 05, pode iniciar a migração!"**
- Claude executará todos os scripts JS automaticamente
- Execute SQL 06-07 (finalização)

---

## 📊 O Que é Migrado

| Entidade | Origem WordPress | Destino Supabase | Quantidade |
|----------|------------------|------------------|------------|
| Abrigos | `wp_posts` (post_type=abrigo) | `shelters` | ~297 |
| Voluntários | `wp_posts` (post_type=voluntario) | `volunteers` | ~232 |
| Vagas | `wp_posts` (post_type=vaga) | `vacancies` | ~53 |
| Usuários (backup) | `wp_users` | `wp_users_raw` | todos |
| Posts (backup) | `wp_posts` | `wp_posts_raw` | todos |
| Metas (backup) | `wp_postmeta` | `wp_postmeta_raw` | todos |

---

## 🔒 Segurança

- ✅ RLS (Row Level Security) configurado
- ✅ Tabelas legadas bloqueadas (apenas service role)
- ✅ Dados públicos apenas para leitura
- ✅ Service Role Key requerida para migração

---

## 🆘 Precisa de Ajuda?

**Durante a migração, peça ao Claude:**
- "Claude, analise este erro" + mensagem
- "Claude, o relatório está OK?" + JSON
- "Claude, continue de onde parou"
- "Claude, valide os dados migrados"

---

## 📚 Referências Técnicas

- [SUPABASE.md](../../SUPABASE.md) - Schema completo do banco
- [GUIA-MIGRACAO-COMPLETO.md](GUIA-MIGRACAO-COMPLETO.md) - Guia detalhado
- Scripts SQL em `sql/` - Executar na ordem 00-07
- Scripts JS em subpastas - Claude executa automaticamente

---

## 🎉 Pronto para Começar?

1. Abra [GUIA-MIGRACAO-COMPLETO.md](GUIA-MIGRACAO-COMPLETO.md)
2. Siga o passo a passo
3. Quando chegar na Fase 5, avise o Claude!

**Tempo total estimado**: 2-3 horas

---

**Última atualização**: 29/12/2025
**Versão**: 1.0.0
**Status**: ✅ Pronto para produção
