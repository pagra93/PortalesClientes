#!/usr/bin/env node

/**
 * Script para testear la conexión con Notion
 */

const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_TOKEN || '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',
});

async function testConnection() {
  console.log('🔍 Testeando conexión con Notion...\n');

  try {
    // 1. Test básico de autenticación
    console.log('1️⃣ Verificando token...');
    const me = await notion.users.me();
    console.log('   ✅ Token válido!');
    console.log('   Bot ID:', me.id);
    console.log('   Tipo:', me.type);
    console.log();

    // 2. Buscar bases de datos
    console.log('2️⃣ Buscando bases de datos compartidas...');
    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'database',
      },
    });

    if (response.results.length === 0) {
      console.log('   ⚠️  NO hay bases de datos compartidas todavía');
      console.log();
      console.log('📝 Para compartir una base de datos:');
      console.log('   1. Ve a Notion');
      console.log('   2. Abre una página con una tabla');
      console.log('   3. Click en ••• (arriba a la derecha)');
      console.log('   4. "Connections" → Selecciona "Portal web clientes"');
      console.log('   5. Confirma');
      console.log();
    } else {
      console.log(`   ✅ Encontradas ${response.results.length} base(s) de datos:\n`);
      
      response.results.forEach((db, i) => {
        const title = db.title?.[0]?.plain_text || 'Sin título';
        console.log(`   ${i + 1}. ${title}`);
        console.log(`      ID: ${db.id}`);
        console.log();
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'unauthorized') {
      console.log('\n🔑 El token no es válido o ha expirado');
      console.log('   Genera un nuevo token en: https://www.notion.so/my-integrations');
    }
  }
}

testConnection();

