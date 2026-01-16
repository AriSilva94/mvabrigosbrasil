# Guia de Reset de Senhas - MV Abrigos Brasil

> **Senha padrão para todos os usuários:** `TESTE_SENHA_2025`

---

## Acesso Rápido por Tipo de Usuário

| Tipo | Comando |
|------|---------|
| Abrigo | `node scripts/migrations/abrigos/setup-test-login-by-email.js EMAIL` |
| Voluntário | `node scripts/migrations/voluntarios/setup-test-login-by-email.js EMAIL` |
| Admin | `node scripts/migrations/abrigos/setup-test-login-by-email.js admin@mvabrigosbrasil.com.br` |

---

## 1. ABRIGOS

```bash
# Abrigo Público - SP
node scripts/migrations/abrigos/setup-test-login-by-email.js milenamw@yahoo.com.br
# Departamento de proteção e bem estar animal | Hortolândia/SP | 180 cães

# Abrigo Privado - MG
node scripts/migrations/abrigos/setup-test-login-by-email.js alfrisya1230@gmail.com
# Associação protetora dos animais | Cana Verde/MG | 3000 cães

# Abrigo Privado - PA
node scripts/migrations/abrigos/setup-test-login-by-email.js apattailandiapa@gmail.com
# APAT | Tailândia/PA | 32 cães
```

---

## 2. VOLUNTÁRIOS

```bash
# Voluntária SC
node scripts/migrations/voluntarios/setup-test-login-by-email.js rosanezim@gmail.com
# Rosane Zimemrmann | Florianópolis/SC | Estudante | 1h diária

# Voluntária PR
node scripts/migrations/voluntarios/setup-test-login-by-email.js Thaysgomes113@gmail.com
# Thays Karollyni | Umuarama/PR | Estudante | 4h diárias

# Voluntária ES
node scripts/migrations/voluntarios/setup-test-login-by-email.js mdani.amelo@gmail.com
# Mariza Danielle | Vila Velha/ES | Advogada | 2h diárias
```

---

## 3. ABRIGOS COM DINÂMICA POPULACIONAL

```bash
# Alto volume de dados (40+ registros)
node scripts/migrations/abrigos/setup-test-login-by-email.js maigueths@gmail.com
# 35 dinâmicas + 5 lar temporário = 40 registros

# Associação completa
node scripts/migrations/abrigos/setup-test-login-by-email.js tatiana@miadoselatidos.org.br
# Confraria dos Miados e Latidos | 41 registros

# 4 Patas Fortaleza
node scripts/migrations/abrigos/setup-test-login-by-email.js 4patasfortaleza@gmail.com
# 55 animais | 5 registros (Fev-Jun/2025)
```

---

## 4. EQUIPE / USUÁRIOS CONVIDADOS

**Fluxo:** Dono do abrigo convida membro para ajudar na gestão.

### Exemplo: Resgatitos
```bash
# 1. Reset senha do DONO do abrigo
node scripts/migrations/abrigos/setup-test-login-by-email.js resgatitosbh@gmail.com

# 2. Reset senha do MEMBRO convidado
node scripts/migrations/abrigos/setup-test-login-by-email.js ana.silva.arruda@gmail.com
# Ana Antônia | Membro de equipe do Resgatitos
```

### Outros exemplos
```bash
# 4patasfortaleza
node scripts/migrations/abrigos/setup-test-login-by-email.js 4patasfortaleza@gmail.com  # dono
node scripts/migrations/abrigos/setup-test-login-by-email.js viniciuscoelho.ti@gmail.com  # membro

# Lar Temporário Patinhas
node scripts/migrations/abrigos/setup-test-login-by-email.js zoralima66@hotmail.com  # dono
node scripts/migrations/abrigos/setup-test-login-by-email.js carlaruy@gmail.com  # membro
```

---

## 5. GERENTES (Múltiplos Abrigos)

**Característica:** Acesso completo a vários abrigos.

```bash
# Gerente MV Abrigos
node scripts/migrations/abrigos/setup-test-login-by-email.js gerente@mvabrigosbrasil.com.br

# Premier Pet (2 abrigos: Amicat's, Mossoró)
node scripts/migrations/abrigos/setup-test-login-by-email.js premierpet@mvabrigosbrasil.com.br

# Instituto Premier Pet (5 abrigos)
node scripts/migrations/abrigos/setup-test-login-by-email.js institutopremierpet@premierpet.com.br
# APATA, Adote um Bichinho RJ, Projeto Segunda Chance, Catland, Ong Dedicação Natural
```

### Verificar gerentes
```bash
node scripts/migrations/equipe/verify-manager-migration.js
```

---

## 6. ADMIN

```bash
node scripts/migrations/abrigos/setup-test-login-by-email.js admin@mvabrigosbrasil.com.br
```

**Acesso:** `/admin/gerentes` e `/admin/abrigos`

### Promover usuário a Admin (SQL)
```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{registerType}',
  '"admin"'
)
WHERE email = 'email@exemplo.com';
```

---

## 7. VAGAS E CANDIDATURAS

**Fluxo:** Abrigo publica vaga → Voluntário se candidata.

### Exemplo: Vaga de Redes Sociais
```bash
# 1. Reset senha do ABRIGO (dono da vaga)
node scripts/migrations/abrigos/setup-test-login-by-email.js ilanabnespoli@gmail.com
# Vaga: Redes Sociais e MKT | 2 candidatos

# 2. Reset senha dos VOLUNTÁRIOS candidatados
node scripts/migrations/voluntarios/setup-test-login-by-email.js mariainii2003@gmail.com
node scripts/migrations/voluntarios/setup-test-login-by-email.js mariaeduardavancato@gmail.com
```

### Outros abrigos com vagas
```bash
# ONG AZUL - Vaga Expositor (11 candidatos)
node scripts/migrations/abrigos/setup-test-login-by-email.js ongazul2020@gmail.com

# Medicina de Abrigos (7 candidatos)
node scripts/migrations/abrigos/setup-test-login-by-email.js lucasgaldioli@hotmail.com
node scripts/migrations/voluntarios/setup-test-login-by-email.js taynastoccorenisz@gmail.com  # voluntário

# Aconchego das Patas (7 candidatos)
node scripts/migrations/abrigos/setup-test-login-by-email.js aconchegodaspatas23@gmail.com
```

---

## Checklist da Apresentação

- [ ] **Abrigo simples** → `milenamw@yahoo.com.br`
- [ ] **Voluntário** → `rosanezim@gmail.com`
- [ ] **Dinâmica populacional** → `4patasfortaleza@gmail.com`
- [ ] **Equipe/Convite** → `resgatitosbh@gmail.com` + `ana.silva.arruda@gmail.com`
- [ ] **Gerente** → `institutopremierpet@premierpet.com.br`
- [ ] **Admin** → `admin@mvabrigosbrasil.com.br`
- [ ] **Vagas** → `ilanabnespoli@gmail.com` + voluntários

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| "Usuário não encontrado" | Verificar email correto |
| "Variáveis não configuradas" | Checar `.env.local` na raiz |
| Não consegue logar | Senha: `TESTE_SENHA_2025` |

---

*Atualizado: Janeiro/2026*
