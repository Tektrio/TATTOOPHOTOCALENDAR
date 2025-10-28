// Script do Photoshop para adicionar "Maximizar Compatibilidade" em PSDs
// Como usar:
// 1. Abrir o Photoshop
// 2. File → Scripts → Browse...
// 3. Selecionar este arquivo (process-psds.jsx)
// 4. Selecionar a pasta com os PSDs quando solicitado

#target photoshop

function processFolder() {
    // Solicitar pasta com os PSDs
    var folder = Folder.selectDialog("Selecione a pasta com os arquivos PSD");
    
    if (folder == null) {
        alert("Nenhuma pasta selecionada. Cancelando.");
        return;
    }
    
    // Encontrar todos os arquivos .psd
    var files = folder.getFiles("*.psd");
    
    if (files.length == 0) {
        alert("Nenhum arquivo PSD encontrado na pasta!");
        return;
    }
    
    alert("Encontrados " + files.length + " arquivos PSD.\n\nO processamento vai começar.\nNão feche o Photoshop até terminar!");
    
    var processed = 0;
    var errors = 0;
    
    // Processar cada arquivo
    for (var i = 0; i < files.length; i++) {
        try {
            // Abrir arquivo
            var doc = app.open(files[i]);
            
            // Configurar opções de salvamento
            var saveOptions = new PhotoshopSaveOptions();
            saveOptions.maximizeCompatibility = true; // ATIVAR compatibilidade máxima
            saveOptions.layers = true;
            saveOptions.embedColorProfile = true;
            
            // Salvar arquivo (sobrescrever)
            doc.save();
            doc.saveAs(files[i], saveOptions, true);
            
            // Fechar arquivo
            doc.close(SaveOptions.DONOTSAVECHANGES);
            
            processed++;
            
        } catch (e) {
            errors++;
            alert("Erro ao processar " + files[i].name + ":\n" + e.message);
        }
    }
    
    // Resultado final
    alert("✅ CONCLUÍDO!\n\n" +
          "Processados: " + processed + " arquivos\n" +
          "Erros: " + errors + " arquivos\n\n" +
          "Agora você pode fazer upload dos arquivos no sistema!");
}

// Executar
processFolder();

