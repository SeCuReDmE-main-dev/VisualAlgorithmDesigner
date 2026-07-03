#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error('Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY before running this import script.');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const BASE = process.env.ALGORITHM_DATA_DIR || path.resolve(__dirname, '..', 'data', 'algorithms');

async function importH2OParams() {
  const dir = path.join(BASE, 'h2o-params');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'manifest.json');
  console.log(`\n📥 H2O Parameters (${files.length} files)...`);
  
  let ok = 0, fail = 0;
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      const row = {
        param_name: data.name || data.param_name || file.replace('.json', ''),
        description: data.description || '',
        param_type: data.type || data.param_type || 'parameter',
        supported_algos: data.supported_algos || data.algorithms || [],
        r_example: (data.examples && data.examples.r) || data.r_example || '',
        python_example: (data.examples && data.examples.python) || data.python_example || '',
        default_value: data.default_value ? String(data.default_value) : null,
        typical_range: data.typical_range || null,
        related_params: data.related_params || data.related || [],
        source_url: data.source_url || ''
      };
      
      const { error } = await supabase.from('h2o_params').upsert(row, { onConflict: 'param_name' });
      if (error) { console.error(`  ❌ ${file}: ${error.message}`); fail++; }
      else ok++;
    } catch (e) { console.error(`  ❌ ${file}: ${e.message}`); fail++; }
  }
  console.log(`  ✅ ${ok}, ❌ ${fail}`);
  return { ok, fail };
}

async function importAlgorithms(dir, label) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.includes('manifest') && f !== 'index.json');
  console.log(`\n📥 ${label} (${files.length} files)...`);
  
  let ok = 0, fail = 0;
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
      const data = JSON.parse(raw);
      const row = {
        name: data.name || file.replace('.json', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        slug: data.slug || file.replace('.json', ''),
        category: data.category || label,
        subcategory: data.subcategory || null,
        description: data.description || data.concept?.explanation || '',
        how_it_works: data.how_it_works || data.howItWorks || '',
        complexity_time: (data.complexity && data.complexity.time) || '',
        complexity_space: (data.complexity && data.complexity.space) || '',
        real_world_examples: data.real_world_examples || data.useCases || data.realWorldExamples || [],
        key_parameters: data.key_parameters || data.keyParameters || [],
        pros_cons: data.pros_cons || data.prosCons || {},
        related_algorithms: data.related_algorithms || data.relatedAlgorithms || [],
        source_url: data.source_url || (data.resources && data.resources[0]) || ''
      };
      
      const { error } = await supabase.from('algorithms').upsert(row, { onConflict: 'slug' });
      if (error) { console.error(`  ❌ ${file}: ${error.message}`); fail++; }
      else ok++;
    } catch (e) { console.error(`  ❌ ${file}: ${e.message}`); fail++; }
  }
  console.log(`  ✅ ${ok}, ❌ ${fail}`);
  return { ok, fail };
}

(async () => {
  console.log('🚀 Importing JSON into Supabase local...\n');
  const r1 = await importH2OParams();
  const r2 = await importAlgorithms(path.join(BASE, 'top-10'), 'Top 10');
  const r3 = await importAlgorithms(path.join(BASE, 'theory'), 'Theory');
  const total = r1.ok + r2.ok + r3.ok;
  const totalFail = r1.fail + r2.fail + r3.fail;
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 IMPORT: ✅ ${total} | ❌ ${totalFail}`);
  console.log(`    H2O Params: ${r1.ok}/${r1.ok + r1.fail}`);
  console.log(`    Top 10:     ${r2.ok}/${r2.ok + r2.fail}`);
  console.log(`    Theory:     ${r3.ok}/${r3.ok + r3.fail}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
})();
