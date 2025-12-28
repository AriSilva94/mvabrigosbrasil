# 🧑‍🤝‍🧑 Migração de Voluntários - WordPress → Supabase

Scripts para migração de dados de voluntários do WordPress legado para o Supabase.

## 📝 Scripts Disponíveis

### 1. `migrate-volunteers-wp-to-supabase.js` - Migração Principal

Migra dados de voluntários das tabelas `wp_posts_raw` + `wp_postmeta_raw` para `volunteers`.

**Uso:**

```bash
# Dry-run (teste sem alterar dados)
node migrate-volunteers-wp-to-supabase.js --dry-run --limit=50

# Migração parcial (primeiros 500 registros)
node migrate-volunteers-wp-to-supabase.js --limit=500

# Migração completa
node migrate-volunteers-wp-to-supabase.js
```

**Características:**
- ✅ Idempotente (pode rodar múltiplas vezes)
- ✅ Processa em lotes
- ✅ Gera relatório em `output/migrate-volunteers-report.json`
- ✅ Deixa `owner_profile_id = NULL` (vinculado no primeiro login)

---

### 2. `setup-test-login.js` - Configurar Login de Teste (Aleatório)

Seleciona aleatoriamente um voluntário migrado e configura senha para teste.

**Uso:**

```bash
# Com senha padrão (TESTE_VOLUNTARIO_2025)
node setup-test-login.js

# Com senha customizada
node setup-test-login.js MINHA_SENHA_123
```

**O que faz:**

1. Busca 20 voluntários com dados completos
2. Seleciona um aleatoriamente
3. Configura senha MD5 temporária no `wp_users_legacy`
4. Exibe credenciais e dados esperados

**Saída:**

```
Email:    exemplo@email.com
Senha:    TESTE_VOLUNTARIO_2025

Dados esperados no perfil:
   Nome: João Silva
   Cidade: São Paulo
   Estado: SP
   ...
```

---

### 2.1. `setup-test-login-by-email.js` - Configurar Login de Teste (Email Específico)

Configura senha de teste para um email específico.

**Uso:**

```bash
node setup-test-login-by-email.js EMAIL
```

**Exemplo:**

```bash
node setup-test-login-by-email.js analays.souza@gmail.com
```

**O que faz:**

1. Valida se o email existe em `wp_users_legacy`
2. Busca dados do voluntário (se existir)
3. Configura senha MD5 temporária no `wp_users_legacy`
4. Exibe credenciais e dados esperados

**Vantagens:**

- ✅ Teste com email específico que você já conhece
- ✅ Útil para re-testar o mesmo usuário
- ✅ Validação clara se o email não existir

---

### 2.2. `setup-test-login-with-periodo.js` - Configurar Login de Teste (Com Periodo/Atuacao)

Seleciona aleatoriamente um voluntário que TEM os campos periodo e atuacao preenchidos.

**Uso:**

```bash
node setup-test-login-with-periodo.js
```

**Quando usar:**

- Para testar especificamente os campos periodo e atuacao
- Validar que esses campos foram migrados corretamente

---

### 3. `link-existing-volunteers.js` - Vincular Voluntários Existentes

Vincula voluntários migrados a profiles que já foram criados (usuários que fizeram login antes do auto-link ser implementado).

**Uso:**

```bash
node link-existing-volunteers.js
```

**O que faz:**

1. Busca todos os profiles com `origin = 'wordpress_migrated'`
2. Para cada profile, localiza o voluntário correspondente via `wp_user_id`
3. Atualiza `volunteers.owner_profile_id` se ainda estiver `NULL`

**Quando usar:**

- Após implementar o auto-link no `loginService.ts`
- Para corrigir dados de usuários que já fizeram login antes do fix

---

### 4. `verify-volunteer-link.js` - Verificar Vínculo

Verifica se um voluntário específico foi vinculado corretamente ao profile.

**Uso:**

```bash
node verify-volunteer-link.js
```

**O que mostra:**

```
✅ Volunteer encontrado:

   ID: uuid-aqui
   wp_post_id: 619
   owner_profile_id: uuid-do-profile
   Nome: Maria Santos
   Telefone: 11999999999
   ...

✅ owner_profile_id está definido! O volunteer está vinculado ao profile.
```

---

## 🔧 Scripts de Diagnóstico e Debug

### `check-specific-user.js`

Verifica todos os dados de um usuário específico, comparando WordPress vs Supabase.

```bash
node check-specific-user.js
```

Mostra:

- Metadados no WordPress (wp_postmeta_raw)
- Dados migrados na tabela volunteers
- Útil para debug de migração

### `verify-all-migrations.js`

Verifica a qualidade geral da migração com estatísticas.

```bash
node verify-all-migrations.js
```

Mostra:

- Total de voluntários migrados
- Porcentagem de campos preenchidos
- Amostra aleatória de 5 voluntários

### `check-periodo-atuacao-distribution.js`

Verifica quantos posts no WordPress têm os campos periodo e atuacao.

```bash
node check-periodo-atuacao-distribution.js
```

### `check-password-hash.js`

Verifica o formato do hash de senha de um usuário específico e testa validação MD5.

```bash
node check-password-hash.js
```

### `diagnose-volunteer-users.js`

Diagnostica problemas com usuários WordPress vinculados a voluntários.

```bash
node diagnose-volunteer-users.js
```

### `inspect-volunteer-meta.js`

Inspeciona os meta_keys de um voluntário específico no WordPress.

```bash
node inspect-volunteer-meta.js
```

### `populate-wp-users-legacy.js`

Popula a tabela `wp_users_legacy` com usuários que são autores de voluntários.

```bash
node populate-wp-users-legacy.js
```

### `delete-and-remigrate.js`

Deleta todos os voluntários migrados para permitir nova migração do zero.

```bash
node delete-and-remigrate.js
```

**⚠️ Use com cuidado!** Este script remove TODOS os voluntários que têm `wp_post_id` preenchido.

### Scripts Obsoletos (mantidos para referência)

- `find-volunteer-for-test.js` - Substituído por `setup-test-login.js`
- `get-volunteer-email.js` - Substituído por `setup-test-login.js`
- `create-test-user-native.js` - Abordagem antiga (criava usuário nativo Supabase)

---

## 🔄 Fluxo Completo de Migração

### Passo 1: Migrar Dados

```bash
# Teste primeiro com dry-run
node migrate-volunteers-wp-to-supabase.js --dry-run --limit=50

# Se ok, rodar migração completa
node migrate-volunteers-wp-to-supabase.js
```

### Passo 2: Verificar Migração

```sql
-- Conferir total migrado
SELECT COUNT(*) FROM volunteers WHERE wp_post_id IS NOT NULL;

-- Verificar amostras
SELECT wp_post_id, name, cidade, estado, telefone
FROM volunteers
WHERE wp_post_id IS NOT NULL
LIMIT 10;
```

### Passo 3: Testar Login

```bash
# Configurar usuário de teste
node setup-test-login.js

# Usar as credenciais exibidas para fazer login no site
# Verificar se os dados aparecem em /meu-cadastro
```

### Passo 4: Vincular Usuários Existentes (se necessário)

```bash
# Se alguns usuários já fizeram login antes do auto-link
node link-existing-volunteers.js
```

---

## 📊 Relatórios

Após cada migração, um relatório JSON é gerado em:

```
output/migrate-volunteers-report.json
```

**Exemplo:**

```json
{
  "timestamp": "2025-12-28T14:30:00.000Z",
  "mode": "production",
  "stats": {
    "totalLegacy": 232,
    "processed": 232,
    "updated": 232,
    "invalid": 0,
    "errors": []
  }
}
```

---

## 🔧 Configuração

Todos os scripts usam as variáveis de ambiente do `.env.local` na raiz do projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Importante:** Use a **Service Role Key**, não a chave anônima.

---

## 📚 Documentação Completa

Consulte o [README principal](../README.md) para mais detalhes sobre:

- Estrutura de pastas
- Troubleshooting
- Checklist pós-migração
- Referências

---

**Última atualização:** 2025-12-28
