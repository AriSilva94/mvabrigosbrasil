const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '../../.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();
    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  });
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Variáveis de ambiente não configuradas');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findVacancyCreator(vacancyTitle) {
  console.log(`\nBuscando vaga: "${vacancyTitle}"\n`);

  // 1. Buscar a vaga pelo título
  const { data: vacancies, error: vacancyError } = await supabase
    .from('vacancies')
    .select('id, title, shelter_id, created_at')
    .ilike('title', `%${vacancyTitle}%`);

  if (vacancyError) {
    console.error('Erro ao buscar vaga:', vacancyError);
    return;
  }

  if (!vacancies || vacancies.length === 0) {
    console.log('Nenhuma vaga encontrada com esse título.');
    return;
  }

  console.log(`Encontrada(s) ${vacancies.length} vaga(s):\n`);

  for (const vacancy of vacancies) {
    console.log(`--- Vaga: "${vacancy.title}" ---`);
    console.log(`ID: ${vacancy.id}`);
    console.log(`Criada em: ${vacancy.created_at}`);

    if (!vacancy.shelter_id) {
      console.log('Shelter ID: (não vinculado a nenhum abrigo)\n');
      continue;
    }

    // 2. Buscar o abrigo
    const { data: shelter, error: shelterError } = await supabase
      .from('shelters')
      .select('id, name, profile_id')
      .eq('id', vacancy.shelter_id)
      .single();

    if (shelterError || !shelter) {
      console.log(`Abrigo não encontrado (ID: ${vacancy.shelter_id})\n`);
      continue;
    }

    console.log(`Abrigo: ${shelter.name} (ID: ${shelter.id})`);

    if (!shelter.profile_id) {
      console.log('Profile ID: (abrigo sem profile vinculado)\n');
      continue;
    }

    // 3. Buscar o perfil do criador
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', shelter.profile_id)
      .single();

    if (profileError || !profile) {
      console.log(`Profile não encontrado (ID: ${shelter.profile_id})\n`);
      continue;
    }

    console.log(`\n*** CRIADOR DA VAGA ***`);
    console.log(`Nome: ${profile.full_name || '(não informado)'}`);
    console.log(`Email: ${profile.email}`);
    console.log(`Profile ID: ${profile.id}`);
    console.log('');
  }
}

// Executar
const vacancyTitle = process.argv[2];

if (!vacancyTitle) {
  console.log('Uso: node find-vacancy-creator.js "Nome da vaga"');
  console.log('Exemplo: node find-vacancy-creator.js "Artista de grafite"');
  process.exit(1);
}

findVacancyCreator(vacancyTitle);
