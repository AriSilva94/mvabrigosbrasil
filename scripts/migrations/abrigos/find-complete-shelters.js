const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '../../../.env.local');
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('Buscando abrigos com TODOS os dados preenchidos no wp_postmeta_raw...\n');

  // Buscar todos posts de abrigos
  const { data: posts } = await supabase
    .from('wp_posts_raw')
    .select('id, post_title')
    .eq('post_type', 'abrigo')
    .limit(100);

  const comCNPJ = [];
  const comCPF = [];

  for (const post of posts) {
    const { data: metas } = await supabase
      .from('wp_postmeta_raw')
      .select('meta_key, meta_value')
      .eq('post_id', post.id);

    const metaObj = {};
    metas?.forEach(m => {
      if (m.meta_value && m.meta_value.trim() !== '' && m.meta_value.toLowerCase() !== 'null') {
        metaObj[m.meta_key] = m.meta_value;
      }
    });

    // Contar quantos campos essenciais tem
    const temBairro = !!metaObj.bairro;
    const temCep = !!metaObj.cep;
    const temNumero = !!metaObj.numero;
    const temTelefone = !!metaObj.telefone;
    const temEmail = !!(metaObj.email || metaObj['e-mail']);
    const temNome = !!metaObj.nome;
    const temFuncao = !!metaObj.funcao;
    const temEspecie = !!metaObj.especie;
    const temCNPJ = !!metaObj.cnpj;
    const temCPF = !!metaObj.cpf;

    const camposPreenchidos = [
      temBairro, temCep, temNumero, temTelefone,
      temEmail, temNome, temFuncao, temEspecie
    ].filter(Boolean).length;

    // Se tem pelo menos 6 campos + documento
    if (camposPreenchidos >= 6) {
      const dados = {
        wp_post_id: post.id,
        name: post.post_title,
        camposPreenchidos,
        ...metaObj
      };

      if (temCNPJ) comCNPJ.push(dados);
      if (temCPF) comCPF.push(dados);
    }
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Abrigos completos com CNPJ: ${comCNPJ.length}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (comCNPJ.length > 0) {
    const exemplo = comCNPJ[0];
    console.log(`📍 EXEMPLO 1 - CNPJ: ${exemplo.name} (wp_post_id: ${exemplo.wp_post_id})`);
    console.log(`   Campos preenchidos: ${exemplo.camposPreenchidos}/8`);
    console.log(`   bairro: ${exemplo.bairro || '(vazio)'}`);
    console.log(`   cep: ${exemplo.cep || '(vazio)'}`);
    console.log(`   numero: ${exemplo.numero || '(vazio)'}`);
    console.log(`   telefone: ${exemplo.telefone || '(vazio)'}`);
    console.log(`   email: ${exemplo.email || exemplo['e-mail'] || '(vazio)'}`);
    console.log(`   nome: ${exemplo.nome || '(vazio)'}`);
    console.log(`   funcao: ${exemplo.funcao || '(vazio)'}`);
    console.log(`   especie: ${exemplo.especie || '(vazio)'}`);
    console.log(`   cnpj: ${exemplo.cnpj || '(vazio)'}`);
    console.log(`   website: ${exemplo.website || '(vazio)'}`);
    console.log('');
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`Abrigos completos com CPF: ${comCPF.length}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (comCPF.length > 0) {
    const exemplo = comCPF[0];
    console.log(`📍 EXEMPLO 2 - CPF: ${exemplo.name} (wp_post_id: ${exemplo.wp_post_id})`);
    console.log(`   Campos preenchidos: ${exemplo.camposPreenchidos}/8`);
    console.log(`   bairro: ${exemplo.bairro || '(vazio)'}`);
    console.log(`   cep: ${exemplo.cep || '(vazio)'}`);
    console.log(`   numero: ${exemplo.numero || '(vazio)'}`);
    console.log(`   telefone: ${exemplo.telefone || '(vazio)'}`);
    console.log(`   email: ${exemplo.email || exemplo['e-mail'] || '(vazio)'}`);
    console.log(`   nome: ${exemplo.nome || '(vazio)'}`);
    console.log(`   funcao: ${exemplo.funcao || '(vazio)'}`);
    console.log(`   especie: ${exemplo.especie || '(vazio)'}`);
    console.log(`   cpf: ${exemplo.cpf || '(vazio)'}`);
    console.log(`   website: ${exemplo.website || '(vazio)'}`);
  }

  // Agora verificar se foram migrados corretamente
  if (comCNPJ.length > 0) {
    const wpId = comCNPJ[0].wp_post_id;
    const { data: migrado } = await supabase
      .from('shelters')
      .select('*')
      .eq('wp_post_id', wpId)
      .single();

    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log('VERIFICAÇÃO DE MIGRAÇÃO - EXEMPLO CNPJ:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`district (bairro): WP="${comCNPJ[0].bairro}" | Migrado="${migrado?.district}"`);
    console.log(`cep: WP="${comCNPJ[0].cep}" | Migrado="${migrado?.cep}"`);
    console.log(`number (numero): WP="${comCNPJ[0].numero}" | Migrado="${migrado?.number}"`);
    console.log(`authorized_phone: WP="${comCNPJ[0].telefone}" | Migrado="${migrado?.authorized_phone}"`);
    console.log(`authorized_email: WP="${comCNPJ[0].email || comCNPJ[0]['e-mail']}" | Migrado="${migrado?.authorized_email}"`);
    console.log(`authorized_name: WP="${comCNPJ[0].nome}" | Migrado="${migrado?.authorized_name}"`);
    console.log(`authorized_role: WP="${comCNPJ[0].funcao}" | Migrado="${migrado?.authorized_role}"`);
    console.log(`species: WP="${comCNPJ[0].especie}" | Migrado="${migrado?.species}"`);
    console.log(`cnpj: WP="${comCNPJ[0].cnpj}" | Migrado="${migrado?.cnpj}"`);
    console.log(`website: WP="${comCNPJ[0].website}" | Migrado="${migrado?.website}"`);
  }

  if (comCPF.length > 0) {
    const wpId = comCPF[0].wp_post_id;
    const { data: migrado } = await supabase
      .from('shelters')
      .select('*')
      .eq('wp_post_id', wpId)
      .single();

    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log('VERIFICAÇÃO DE MIGRAÇÃO - EXEMPLO CPF:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`district (bairro): WP="${comCPF[0].bairro}" | Migrado="${migrado?.district}"`);
    console.log(`cep: WP="${comCPF[0].cep}" | Migrado="${migrado?.cep}"`);
    console.log(`number (numero): WP="${comCPF[0].numero}" | Migrado="${migrado?.number}"`);
    console.log(`authorized_phone: WP="${comCPF[0].telefone}" | Migrado="${migrado?.authorized_phone}"`);
    console.log(`authorized_email: WP="${comCPF[0].email || comCPF[0]['e-mail']}" | Migrado="${migrado?.authorized_email}"`);
    console.log(`authorized_name: WP="${comCPF[0].nome}" | Migrado="${migrado?.authorized_name}"`);
    console.log(`authorized_role: WP="${comCPF[0].funcao}" | Migrado="${migrado?.authorized_role}"`);
    console.log(`species: WP="${comCPF[0].especie}" | Migrado="${migrado?.species}"`);
    console.log(`cpf: WP="${comCPF[0].cpf}" | Migrado="${migrado?.cpf}"`);
    console.log(`website: WP="${comCPF[0].website}" | Migrado="${migrado?.website}"`);
  }

  console.log('\n');
})();
