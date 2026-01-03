/**
 * Script para gerar favicons a partir da logo principal
 * 
 * Requisitos:
 * npm install sharp
 * 
 * Uso:
 * node scripts/generate-favicons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const logoPath = path.join(publicDir, 'logo.png');

// Verificar se a logo existe
if (!fs.existsSync(logoPath)) {
  console.error('❌ Erro: logo.png não encontrada em /public/');
  console.log('📝 Por favor, adicione sua logo em /public/logo.png primeiro');
  process.exit(1);
}

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generateFavicons() {
  console.log('🎨 Gerando favicons a partir da logo...\n');

  try {
    // Gerar PNGs em diferentes tamanhos
    for (const { name, size } of sizes) {
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }, // Fundo transparente
        })
        .png()
        .toFile(path.join(publicDir, name));
      
      console.log(`✅ ${name} (${size}x${size}) criado`);
    }

    // Criar favicon.ico (usando a versão 32x32)
    const icoBuffer = await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
    console.log('✅ favicon.ico criado\n');

    console.log('🎉 Todos os favicons foram gerados com sucesso!');
    console.log('📁 Arquivos criados em /public/:');
    console.log('   - favicon.ico');
    sizes.forEach(({ name }) => console.log(`   - ${name}`));
  } catch (error) {
    console.error('❌ Erro ao gerar favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();

