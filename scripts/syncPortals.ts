#!/usr/bin/env tsx

/**
 * Script para sincronizar todos los portales publicados
 * Uso: npm run sync:once
 * O programar con cron
 */

import { syncAllPublishedPortals } from '../lib/publisher/sync';

async function main() {
  console.log('🔄 Iniciando sincronización de portales...\n');

  try {
    await syncAllPublishedPortals();
    console.log('\n✅ Sincronización completada');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error en sincronización:', error.message);
    process.exit(1);
  }
}

main();

