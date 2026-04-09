import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function migrateData() {
  console.log('--- Starting Data Migration ---');
  console.log('Nota: Este script requer um banco SQLite local para migrar.');
  console.log('Se você não tem dados locais para migrar, ignore este erro.');
  
  console.log('--- Migration Skipped ---');
}

migrateData();
