const { test, expect } = require('@playwright/test');

// Configurações
const BASE_URL = process.env.VITE_API_URL || 'http://localhost:5173';
const API_URL = 'http://localhost:3001';
const TEST_CLIENT_ID = 7; // Luiz Lopes - cliente de teste

test.describe('Sprints 4 & 5 - Funcionalidades Completas', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar para a página do cliente
    await page.goto(`${BASE_URL}/customers/${TEST_CLIENT_ID}`);
    
    // Aguardar carregamento completo
    await page.waitForLoadState('networkidle');
    
    // Clicar na aba "Arquivos"
    await page.click('text=Arquivos');
    await page.waitForTimeout(1000);
  });

  test('1. Upload de arquivo com barra de progresso', async ({ page }) => {
    test.setTimeout(60000); // 60 segundos
    
    // Verificar se há seção de upload
    const uploadSection = await page.locator('text=Upload de Arquivos').first();
    await expect(uploadSection).toBeVisible();
    
    // Criar arquivo de teste
    const testFile = {
      name: 'test-upload.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Teste de upload automatizado')
    };
    
    // Selecionar categoria
    await page.selectOption('select', 'referencias');
    
    // Upload do arquivo
    const fileInput = await page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: testFile.name,
      mimeType: testFile.mimeType,
      buffer: testFile.buffer
    });
    
    // Verificar se barra de progresso aparece
    await expect(page.locator('[role="progressbar"]')).toBeVisible({ timeout: 5000 });
    
    // Aguardar conclusão
    await expect(page.locator('text=enviado(s) com sucesso')).toBeVisible({ timeout: 10000 });
    
    // Screenshot do resultado
    await page.screenshot({ path: 'tests/screenshots/01-upload-progresso.png' });
  });

  test('2. Renomear arquivo', async ({ page }) => {
    // Aguardar carregar arquivos
    await page.waitForTimeout(2000);
    
    // Hover sobre o primeiro arquivo
    const firstFile = await page.locator('.group').first();
    await firstFile.hover();
    
    // Clicar no botão Renomear (ícone Edit)
    await page.click('button[title="Renomear"]');
    
    // Verificar se dialog abriu
    await expect(page.locator('text=Renomear Arquivo')).toBeVisible();
    
    // Digitar novo nome
    const newName = `arquivo-renomeado-${Date.now()}.txt`;
    await page.fill('input[placeholder="Novo nome do arquivo"]', newName);
    
    // Screenshot do dialog
    await page.screenshot({ path: 'tests/screenshots/02-renomear-dialog.png' });
    
    // Confirmar
    await page.click('text=Renomear');
    
    // Verificar mensagem de sucesso
    await expect(page.locator('text=renomeado com sucesso')).toBeVisible({ timeout: 5000 });
    
    // Screenshot do resultado
    await page.screenshot({ path: 'tests/screenshots/02-renomear-sucesso.png' });
  });

  test('3. Mover arquivo entre categorias', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Hover sobre o primeiro arquivo
    const firstFile = await page.locator('.group').first();
    await firstFile.hover();
    
    // Clicar no botão Mover (ícone FolderInput)
    await page.click('button[title="Mover"]');
    
    // Verificar se dialog abriu
    await expect(page.locator('text=Mover Arquivo')).toBeVisible();
    
    // Selecionar categoria destino
    await page.click('[role="combobox"]');
    await page.click('text=Inspirações'); // Selecionar categoria diferente
    
    // Screenshot do dialog
    await page.screenshot({ path: 'tests/screenshots/03-mover-dialog.png' });
    
    // Confirmar
    await page.click('text=Mover');
    
    // Verificar mensagem de sucesso
    await expect(page.locator('text=Arquivo movido')).toBeVisible({ timeout: 5000 });
    
    // Screenshot do resultado
    await page.screenshot({ path: 'tests/screenshots/03-mover-sucesso.png' });
  });

  test('4. Copiar arquivo', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Hover sobre o primeiro arquivo
    const firstFile = await page.locator('.group').first();
    await firstFile.hover();
    
    // Clicar no botão Copiar (ícone Copy)
    await page.click('button[title="Copiar"]');
    
    // Verificar se dialog abriu
    await expect(page.locator('text=Copiar Arquivo')).toBeVisible();
    
    // Deixar na mesma categoria (não selecionar)
    
    // Screenshot do dialog
    await page.screenshot({ path: 'tests/screenshots/04-copiar-dialog.png' });
    
    // Confirmar
    await page.click('text=Copiar');
    
    // Verificar mensagem de sucesso
    await expect(page.locator('text=Arquivo copiado')).toBeVisible({ timeout: 5000 });
    
    // Screenshot do resultado
    await page.screenshot({ path: 'tests/screenshots/04-copiar-sucesso.png' });
  });

  test('5. Deletar arquivo (soft delete)', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Hover sobre o primeiro arquivo
    const firstFile = await page.locator('.group').first();
    await firstFile.hover();
    
    // Clicar no botão Deletar (ícone Trash2)
    await page.click('button[title="Deletar"]');
    
    // Verificar se dialog de confirmação abriu
    await expect(page.locator('text=Deletar arquivo?')).toBeVisible();
    
    // Screenshot do dialog
    await page.screenshot({ path: 'tests/screenshots/05-deletar-dialog.png' });
    
    // Confirmar
    await page.click('text=Deletar');
    
    // Verificar mensagem de sucesso
    await expect(page.locator('text=deletado com sucesso')).toBeVisible({ timeout: 5000 });
    
    // Screenshot do resultado
    await page.screenshot({ path: 'tests/screenshots/05-deletar-sucesso.png' });
  });

  test('6. Preview de imagem', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Encontrar um arquivo de imagem
    const imageFile = await page.locator('.group').filter({ hasText: /\.(jpg|jpeg|png|gif)/i }).first();
    
    if (await imageFile.count() > 0) {
      await imageFile.hover();
      
      // Clicar no botão Visualizar (ícone Eye)
      await page.click('button[title="Visualizar"]');
      
      // Verificar se modal abriu
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
      
      // Aguardar imagem carregar
      await page.waitForTimeout(2000);
      
      // Screenshot do preview
      await page.screenshot({ path: 'tests/screenshots/06-preview-imagem.png' });
      
      // Testar zoom
      await page.click('button:has-text("Zoom In")');
      await page.waitForTimeout(500);
      
      // Screenshot com zoom
      await page.screenshot({ path: 'tests/screenshots/06-preview-zoom.png' });
      
      // Fechar modal
      await page.keyboard.press('Escape');
    } else {
      console.log('Nenhuma imagem encontrada para teste de preview');
    }
  });

  test('7. Botões de acesso às pastas', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Verificar se botões de pasta estão visíveis
    const localButton = await page.locator('text=Pasta Local');
    const driveButton = await page.locator('text=Google Drive');
    const qnapButton = await page.locator('text=QNAP');
    
    // Screenshot dos botões
    await page.screenshot({ path: 'tests/screenshots/07-botoes-pastas.png' });
    
    // Verificar tooltips (hover)
    await localButton.hover();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/07-tooltip-local.png' });
    
    await driveButton.hover();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/07-tooltip-drive.png' });
    
    await qnapButton.hover();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/07-tooltip-qnap.png' });
  });

  test('8. Sincronização Google Drive (status visual)', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Verificar se há ícones de status
    const syncIcons = await page.locator('svg').filter({ hasText: /CheckCircle|Clock|XCircle/ });
    
    // Screenshot do status
    await page.screenshot({ path: 'tests/screenshots/08-sync-status.png' });
    
    // Clicar no botão "Criar Pasta" se disponível (para trigger sync)
    const createFolderButton = await page.locator('text=Criar Pasta');
    if (await createFolderButton.isVisible()) {
      await createFolderButton.click();
      
      // Aguardar loading
      await page.waitForTimeout(2000);
      
      // Verificar se status mudou para "pending" ou "syncing"
      await page.screenshot({ path: 'tests/screenshots/08-sync-loading.png' });
      
      // Aguardar conclusão (máximo 10 segundos)
      await page.waitForTimeout(10000);
      
      // Screenshot do status final
      await page.screenshot({ path: 'tests/screenshots/08-sync-completo.png' });
    }
  });

  test('9. Verificar contagem total de arquivos', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Verificar se há contador de arquivos
    const fileCount = await page.locator('text=/\\d+ arquivo/i').first();
    await expect(fileCount).toBeVisible();
    
    // Screenshot
    await page.screenshot({ path: 'tests/screenshots/09-contagem-arquivos.png' });
  });

  test('10. Filtro por categoria', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Selecionar filtro de categoria
    await page.click('[role="combobox"]');
    
    // Screenshot do dropdown
    await page.screenshot({ path: 'tests/screenshots/10-filtro-categoria.png' });
    
    // Selecionar uma categoria específica
    await page.click('text=Referências');
    await page.waitForTimeout(1000);
    
    // Screenshot dos arquivos filtrados
    await page.screenshot({ path: 'tests/screenshots/10-arquivos-filtrados.png' });
  });

});

// Relatório HTML
test.afterAll(async () => {
  console.log('\n✅ Testes concluídos!');
  console.log('📸 Screenshots salvos em: tests/screenshots/');
  console.log('📊 Relatório HTML: playwright-report/index.html');
});

