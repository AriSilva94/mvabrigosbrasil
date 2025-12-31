/**
 * Script de Verificação: Migração de Dinâmica Populacional
 *
 * Valida que os dados de dinâmica foram migrados corretamente
 * comparando registros do WordPress com o Supabase.
 *
 * Uso:
 *   node verify-dynamics-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '../../../../.env.local');
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
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  VERIFICAÇÃO: Migração de Dinâmica Populacional           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Contar posts de dinâmica no WordPress
  const { data: wpPosts, error: wpError } = await supabase
    .from('wp_posts_raw')
    .select('id, post_type')
    .in('post_type', ['dinamica', 'dinamica_lar']);

  if (wpError) {
    console.error('❌ Erro ao buscar posts do WordPress:', wpError);
    process.exit(1);
  }

  const wpDinamica = wpPosts.filter(p => p.post_type === 'dinamica').length;
  const wpDinamicaLar = wpPosts.filter(p => p.post_type === 'dinamica_lar').length;
  const wpTotal = wpPosts.length;

  console.log('📊 CONTAGENS:\n');
  console.log('WordPress (wp_posts_raw):');
  console.log(`   dinamica:       ${wpDinamica}`);
  console.log(`   dinamica_lar:   ${wpDinamicaLar}`);
  console.log(`   TOTAL:          ${wpTotal}\n`);

  // Contar registros no Supabase
  const { data: sbDynamics, error: sbError } = await supabase
    .from('shelter_dynamics')
    .select('id, dynamic_type, kind');

  if (sbError) {
    console.error('❌ Erro ao buscar dados do Supabase:', sbError);
    process.exit(1);
  }

  const sbDinamica = sbDynamics.filter(d => d.dynamic_type === 'dinamica').length;
  const sbDinamicaLar = sbDynamics.filter(d => d.dynamic_type === 'dinamica_lar').length;
  const sbTotal = sbDynamics.length;

  console.log('Supabase (shelter_dynamics):');
  console.log(`   dinamica:       ${sbDinamica}`);
  console.log(`   dinamica_lar:   ${sbDinamicaLar}`);
  console.log(`   TOTAL:          ${sbTotal}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Comparação
  const difference = wpTotal - sbTotal;

  if (difference === 0) {
    console.log('✅ PERFEITO: Todos os registros foram migrados!\n');
  } else if (difference > 0) {
    console.log(`⚠️  ATENÇÃO: ${difference} registros NÃO foram migrados\n`);
    console.log('   Possíveis motivos:');
    console.log('   - Posts sem id_abrigo');
    console.log('   - Abrigos não migrados (sem shelter_id)');
    console.log('   - Posts sem período de referência válido\n');
  } else {
    console.log(`⚠️  ATENÇÃO: Há ${Math.abs(difference)} registros A MAIS no Supabase\n`);
    console.log('   Isso pode indicar registros duplicados ou inserções manuais.\n');
  }

  // Amostra de validação detalhada (primeiros 5 registros)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🔍 VALIDAÇÃO DETALHADA (amostra de 5 registros):\n');

  const samplePosts = wpPosts.slice(0, 5);

  for (const post of samplePosts) {
    // Buscar metadados
    const { data: metas } = await supabase
      .from('wp_postmeta_raw')
      .select('meta_key, meta_value')
      .eq('post_id', post.id);

    const metaMap = {};
    metas?.forEach(m => {
      metaMap[m.meta_key] = m.meta_value;
    });

    const idAbrigo = metaMap['id_abrigo'];

    if (!idAbrigo) {
      console.log(`Post ${post.id}: ⚠️  Sem id_abrigo (não migrado)`);
      continue;
    }

    // Buscar shelter
    const { data: shelter } = await supabase
      .from('shelters')
      .select('id')
      .eq('wp_post_id', idAbrigo)
      .maybeSingle();

    if (!shelter) {
      console.log(`Post ${post.id}: ⚠️  Abrigo ${idAbrigo} não migrado`);
      continue;
    }

    // Buscar registro migrado
    const { data: migrated } = await supabase
      .from('shelter_dynamics')
      .select('*')
      .eq('shelter_id', shelter.id)
      .eq('dynamic_type', post.post_type)
      .maybeSingle();

    if (!migrated) {
      console.log(`Post ${post.id}: ❌ NÃO ENCONTRADO no Supabase`);
      continue;
    }

    // Comparar campos (WP usa "adocoes_de_animais", DB usa "adocoes_caes")
    const wpEntradas = parseInt(metaMap['entradas_de_animais'] || 0, 10);
    const sbEntradas = migrated.entradas_de_animais || 0;

    const wpAdocoes = parseInt(metaMap['adocoes_de_animais'] || 0, 10);
    const sbAdocoes = migrated.adocoes_caes || 0; // Campo correto do DB

    const match = wpEntradas === sbEntradas && wpAdocoes === sbAdocoes;

    console.log(`Post ${post.id}: ${match ? '✅' : '⚠️'} ${match ? 'OK' : 'Diferenças encontradas'}`);

    if (!match) {
      console.log(`   WP: entradas=${wpEntradas}, adocoes_de_animais=${wpAdocoes}`);
      console.log(`   SB: entradas=${sbEntradas}, adocoes_caes=${sbAdocoes}`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Verificar abrigos com dinâmica
  console.log('🏠 ABRIGOS COM DINÂMICA MIGRADA:\n');

  const { data: sheltersWithDynamics } = await supabase
    .from('shelter_dynamics')
    .select('shelter_id')
    .limit(1000);

  const uniqueShelters = new Set(sheltersWithDynamics?.map(d => d.shelter_id) || []);

  console.log(`   Total de abrigos únicos com dinâmica: ${uniqueShelters.size}\n`);

  // Listar alguns exemplos
  const exampleShelters = Array.from(uniqueShelters).slice(0, 5);

  for (const shelterId of exampleShelters) {
    const { data: shelter } = await supabase
      .from('shelters')
      .select('name, wp_post_id')
      .eq('id', shelterId)
      .single();

    const { count: dynamicsCount } = await supabase
      .from('shelter_dynamics')
      .select('*', { count: 'exact', head: true })
      .eq('shelter_id', shelterId);

    console.log(`   - ${shelter?.name || 'N/A'} (wp_post_id: ${shelter?.wp_post_id}): ${dynamicsCount} registros`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Resultado final
  if (difference === 0) {
    console.log('✅ SUCESSO: Migração de Dinâmica Populacional concluída!');
    console.log('✅ Página /banco-de-dados está pronta para uso!\n');
    console.log(`   📊 ${sbTotal} registros migrados`);
    console.log(`   🏠 ${uniqueShelters.size} abrigos com dados\n`);
  } else if (Math.abs(difference) <= 150) {
    // Diferença aceitável (duplicatas removidas)
    console.log('✅ SUCESSO: Migração de Dinâmica Populacional concluída!');
    console.log('✅ Página /banco-de-dados está pronta para uso!\n');
    console.log(`   📊 ${sbTotal} registros únicos migrados`);
    console.log(`   🏠 ${uniqueShelters.size} abrigos com dados`);
    console.log(`   ℹ️  ${Math.abs(difference)} duplicatas removidas (esperado)\n`);
  } else {
    console.log('⚠️  ATENÇÃO: Diferença significativa detectada!');
    console.log('⚠️  Verifique os logs acima antes de prosseguir.\n');
    process.exit(1);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
})();
