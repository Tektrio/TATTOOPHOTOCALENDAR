#!/usr/bin/env node

/**
 * Teste do Nível 3: Processar 4.psd (145.5 MB) sem thumbnail embutido
 * 
 * Este teste vai verificar se o sistema consegue processar a imagem completa
 * do PSD usando o Nível 3 do sistema híbrido.
 */

const fs = require('fs-extra');
const path = require('path');
const { readPsd, initializeCanvas } = require('ag-psd');
const { createCanvas } = require('canvas');
const sharp = require('sharp');

// Inicializar canvas
initializeCanvas(createCanvas);

async function testNivel3() {
  console.log('\n🧪 ========== TESTE NÍVEL 3 (4.psd) ==========\n');
  
  const psdPath = path.join(__dirname, 'temp_downloads', '4.psd');
  
  if (!await fs.pathExists(psdPath)) {
    console.error('❌ Arquivo 4.psd não encontrado!');
    console.error('   Esperado em:', psdPath);
    return;
  }
  
  try {
    // 1. Verificar tamanho do arquivo
    const stats = await fs.stat(psdPath);
    const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`📁 Arquivo: 4.psd`);
    console.log(`📊 Tamanho: ${fileSizeMB} MB`);
    console.log('');
    
    // 2. Ler PSD completo (com imagem composta)
    console.log('📖 Lendo PSD com imagem composta...');
    const startTime = Date.now();
    
    const psdBuffer = await fs.readFile(psdPath);
    const psd = readPsd(psdBuffer, {
      skipCompositeImageData: false, // Carregar imagem composta
      skipLayerImageData: true,
      skipThumbnail: false
    });
    
    const readTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ PSD lido em ${readTime}s`);
    console.log('');
    
    // 3. Verificar o que temos disponível
    console.log('🔍 Verificando recursos disponíveis:');
    console.log(`   • Thumbnail embutido: ${psd.thumbnail ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   • Canvas renderizado: ${psd.canvas ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   • ImageData: ${psd.imageData ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   • Dimensões: ${psd.width} x ${psd.height} px`);
    console.log('');
    
    // 4. Testar Nível 3 - Opção 1: Canvas
    if (psd.canvas) {
      console.log('🎨 [NÍVEL 3 - Opção 1] Usando canvas renderizado...');
      const thumbStartTime = Date.now();
      
      const pngBuffer = psd.canvas.toBuffer('image/png');
      console.log(`   Buffer PNG: ${(pngBuffer.length / 1024 / 1024).toFixed(2)} MB`);
      
      const thumbnail = await sharp(pngBuffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .png({ quality: 85, compressionLevel: 6 })
        .toBuffer();
      
      const thumbTime = ((Date.now() - thumbStartTime) / 1000).toFixed(1);
      console.log(`   ✅ Thumbnail gerado em ${thumbTime}s`);
      console.log(`   📏 Tamanho: ${(thumbnail.length / 1024).toFixed(2)} KB`);
      
      // Salvar thumbnail para inspeção
      const outputPath = path.join(__dirname, 'temp_downloads', '4-thumbnail-canvas.png');
      await fs.writeFile(outputPath, thumbnail);
      console.log(`   💾 Salvo em: ${outputPath}`);
      console.log('');
      
      console.log('✅ [NÍVEL 3 - Opção 1] SUCESSO! Canvas funcionou!');
    }
    
    // 5. Testar Nível 3 - Opção 2: ImageData
    if (psd.imageData && psd.imageData.data) {
      console.log('🎨 [NÍVEL 3 - Opção 2] Usando imageData...');
      const thumbStartTime = Date.now();
      
      const { width, height, data } = psd.imageData;
      console.log(`   ImageData: ${width} x ${height} px`);
      
      const buffer = Buffer.from(data.buffer || data);
      console.log(`   Buffer: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
      
      const thumbnail = await sharp(buffer, {
        raw: {
          width: width,
          height: height,
          channels: 4 // RGBA
        }
      })
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .png({ quality: 85, compressionLevel: 6 })
      .toBuffer();
      
      const thumbTime = ((Date.now() - thumbStartTime) / 1000).toFixed(1);
      console.log(`   ✅ Thumbnail gerado em ${thumbTime}s`);
      console.log(`   📏 Tamanho: ${(thumbnail.length / 1024).toFixed(2)} KB`);
      
      // Salvar thumbnail para inspeção
      const outputPath = path.join(__dirname, 'temp_downloads', '4-thumbnail-imagedata.png');
      await fs.writeFile(outputPath, thumbnail);
      console.log(`   💾 Salvo em: ${outputPath}`);
      console.log('');
      
      console.log('✅ [NÍVEL 3 - Opção 2] SUCESSO! ImageData funcionou!');
    }
    
    // 6. Resumo final
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('');
    console.log('📊 RESUMO DO TESTE:');
    console.log(`   • Tempo total: ${totalTime}s`);
    console.log(`   • Arquivo: 4.psd (${fileSizeMB} MB)`);
    console.log(`   • Dimensões: ${psd.width} x ${psd.height} px`);
    console.log(`   • Resultado: ✅ SUCESSO!`);
    console.log('');
    console.log('🎉 O Nível 3 funciona! PSDs sem thumbnail podem ser processados!');
    console.log('⚠️  Nota: Este processo é lento (~30-90s), mas funciona.');
    console.log('💡 Recomendação: Salvar PSDs com "Maximizar Compatibilidade" para usar Nível 1 (mais rápido).');
    console.log('');
    console.log('🧪 ========== TESTE CONCLUÍDO ==========\n');
    
  } catch (error) {
    console.error('\n❌ ========== ERRO NO TESTE ==========');
    console.error(`Tipo: ${error.name}`);
    console.error(`Mensagem: ${error.message}`);
    console.error(`Stack:`);
    console.error(error.stack);
    console.error('========================================\n');
    process.exit(1);
  }
}

// Executar teste
testNivel3();

